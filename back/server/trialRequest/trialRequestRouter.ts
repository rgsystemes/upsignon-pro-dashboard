import { Router } from 'express';
import Joi from 'joi';
import { createHash, createHmac, timingSafeEqual } from 'crypto';
import { buildEmail, getBestLanguage } from 'upsignon-mail';
import env from '../helpers/env';
import { getEmailConfig, getMailTransporter } from '../helpers/mailTransporter';
import { logError } from '../helpers/logger';
import { createTrialBank } from '../helpers/configureBankWithAdminEmail';
import {
  COMPANY_SIZE_HUBSPOT_MAPPING,
  DIRECT_ACTIVITY_HUBSPOT_MAPPING,
  SignedTrialPayload,
  submitHubspotTrialForm,
  TrialRequestBody,
} from './hubspotHelper';
import { db } from '../helpers/db';
import {
  claimConfirmationToken,
  ensureConfirmationTable,
  markConfirmationCompleted,
  releaseConfirmationClaim,
} from './emailValidation';
import { csrfProtection } from '../helpers/csrf';
import { allowedTrialRequestOriginRegexp } from '../helpers/requestSecurity';

export const trialRequestRouter = Router();

export const trialRequestCorsMiddleware = (req: any, res: any, next: any) => {
  if (allowedTrialRequestOriginRegexp.test(req.headers.origin)) {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
  }
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-CSRF-Token');
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,POST,OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
};
const TRIAL_REQUEST_TOKEN_TTL_MS = 1000 * 60 * 60 * 24;
const TRIAL_REQUEST_ERROR_CODES = {
  INVALID_EMAIL_DOMAIN: 'INVALID_EMAIL_DOMAIN',
  ACCOUNT_ALREADY_EXISTS: 'ACCOUNT_ALREADY_EXISTS',
  SUBMIT_FAILED: 'TRIAL_REQUEST_SUBMIT_FAILED',
} as const;

const TRIAL_CONFIRM_CODES = {
  INVALID_CONFIRM_LINK: 'INVALID_CONFIRM_LINK',
  EXPIRED_CONFIRM_LINK: 'EXPIRED_CONFIRM_LINK',
  TRIAL_ALREADY_CONFIRMED: 'TRIAL_ALREADY_CONFIRMED',
  TRIAL_CREATED: 'TRIAL_CREATED',
  CONFIRM_UNEXPECTED_ERROR: 'CONFIRM_UNEXPECTED_ERROR',
} as const;

type TrialConfirmCode = (typeof TRIAL_CONFIRM_CODES)[keyof typeof TRIAL_CONFIRM_CODES];

type TrialConfirmResponse = {
  code: TrialConfirmCode;
  status: 200 | 400 | 500;
  success: boolean;
};

const TRIAL_CONFIRM_TRANSLATIONS: Record<
  'fr' | 'en',
  Record<TrialConfirmCode, { status: 200 | 400 | 500; success: boolean }>
> = {
  fr: {
    INVALID_CONFIRM_LINK: {
      status: 400,
      success: false,
    },
    EXPIRED_CONFIRM_LINK: {
      status: 400,
      success: false,
    },
    TRIAL_ALREADY_CONFIRMED: {
      status: 200,
      success: true,
    },
    TRIAL_CREATED: {
      status: 200,
      success: true,
    },
    CONFIRM_UNEXPECTED_ERROR: {
      status: 500,
      success: false,
    },
  },
  en: {
    INVALID_CONFIRM_LINK: {
      status: 400,
      success: false,
    },
    EXPIRED_CONFIRM_LINK: {
      status: 400,
      success: false,
    },
    TRIAL_ALREADY_CONFIRMED: {
      status: 200,
      success: true,
    },
    TRIAL_CREATED: {
      status: 200,
      success: true,
    },
    CONFIRM_UNEXPECTED_ERROR: {
      status: 500,
      success: false,
    },
  },
};

const buildConfirmResponse = (
  code: TrialConfirmCode,
  language: 'fr' | 'en',
): TrialConfirmResponse => {
  const translated = TRIAL_CONFIRM_TRANSLATIONS[language][code];
  return {
    code,
    status: translated.status,
    success: translated.success,
  };
};

// List of common disposable email domains to reject
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'mailinator.com',
  'temp-mail.org',
  '10minutemail.com',
  'tempmail.com',
  'throwaway.email',
  'guerrillamail.com',
  'yopmail.com',
  'maildrop.cc',
  'mailnesia.com',
  'trashmail.com',
  'fakeinbox.com',
  'min.email',
  'maildrop.cc',
  'spam4.me',
  'sharklasers.com',
]);

const getSigningSecret = (): string => {
  if (!env.SESSION_SECRET) {
    throw new Error('SESSION_SECRET is required to sign trial request tokens');
  }
  return env.SESSION_SECRET;
};

const signPayload = (payload: SignedTrialPayload): string => {
  const tokenPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = createHmac('sha256', getSigningSecret())
    .update(tokenPayload)
    .digest('base64url');
  return `${tokenPayload}.${signature}`;
};

const verifySignedPayload = (token: string): SignedTrialPayload | null => {
  try {
    const [tokenPayload, signature] = token.split('.');
    if (!tokenPayload || !signature) {
      return null;
    }

    const expectedSignature = createHmac('sha256', getSigningSecret())
      .update(tokenPayload)
      .digest('base64url');

    const signatureIsValid = timingSafeEqual(
      Buffer.from(signature, 'utf8'),
      Buffer.from(expectedSignature, 'utf8'),
    );

    if (!signatureIsValid) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(tokenPayload, 'base64url').toString('utf8'));
    if (!payload?.expiresAt || Date.now() > payload.expiresAt) {
      return null;
    }

    return payload as SignedTrialPayload;
  } catch {
    return null;
  }
};

const hashToken = (token: string): string => createHash('sha256').update(token).digest('hex');

const sendTrialValidationEmail = async ({
  recipient,
  language,
  token,
}: {
  recipient: string;
  language: 'fr' | 'en';
  token: string;
}) => {
  const emailConfig = await getEmailConfig();
  const transporter = getMailTransporter(emailConfig, { debug: false });
  const emailValidationLink = `${env.FRONTEND_URL}/trial-request-confirm?token=${encodeURIComponent(token)}&lang=${language}`;
  const { html, text, subject } = await buildEmail({
    templateName: 'trialEmailValidation',
    locales: getBestLanguage(language),
    args: {
      emailValidationLink,
    },
  });

  await transporter.sendMail({
    from: emailConfig.EMAIL_SENDING_ADDRESS,
    to: recipient,
    subject,
    text,
    html,
  });
};

trialRequestRouter.post('/submit', async (req, res) => {
  try {
    const validatedBody = Joi.attempt(
      req.body,
      Joi.object({
        language: Joi.string().valid('fr', 'en').required(),
        activityType: Joi.string().valid('msp', 'enterprise').required(),
        firstname: Joi.string().trim().min(1).max(120).required(),
        lastname: Joi.string().trim().min(1).max(120).required(),
        email: Joi.string().trim().lowercase().email().required(),
        phone: Joi.string().trim().min(1).max(120).required(),
        company: Joi.string().trim().min(2).max(120).required(),
        zip: Joi.string().trim().min(1).max(32).required(),
        businessSector: Joi.when('activityType', {
          is: 'enterprise',
          then: Joi.string()
            .valid(...Object.keys(DIRECT_ACTIVITY_HUBSPOT_MAPPING))
            .required(),
          otherwise: Joi.string().allow('', null),
        }),
        employeeCount: Joi.string()
          .valid(...Object.keys(COMPANY_SIZE_HUBSPOT_MAPPING))
          .allow('', null),
        marketingConsent: Joi.boolean().required(),
        privacyConsent: Joi.boolean().valid(true).required(),
        hutk: Joi.string().allow('', null),
      }),
    ) as TrialRequestBody;

    // Check for disposable email domains
    const emailDomain = validatedBody.email.split('@')[1];
    if (emailDomain && DISPOSABLE_EMAIL_DOMAINS.has(emailDomain)) {
      return res.status(400).json({
        ok: false,
        code: TRIAL_REQUEST_ERROR_CODES.INVALID_EMAIL_DOMAIN,
      });
    }

    const alreadyHasTrial = await db.query(`SELECT 1 FROM admins WHERE email = lower($1)`, [
      validatedBody.email,
    ]);
    if (alreadyHasTrial.rowCount && alreadyHasTrial.rowCount > 0) {
      return res.status(400).json({
        ok: false,
        code: TRIAL_REQUEST_ERROR_CODES.ACCOUNT_ALREADY_EXISTS,
      });
    }

    const now = Date.now();
    const payload: SignedTrialPayload = {
      ...validatedBody,
      issuedAt: now,
      expiresAt: now + TRIAL_REQUEST_TOKEN_TTL_MS,
      ipAddress: req.ip,
    };

    const signedToken = signPayload(payload);

    await sendTrialValidationEmail({
      recipient: payload.email,
      language: payload.language,
      token: signedToken,
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    logError('trialRequestRouter POST /submit', error);
    return res.status(400).json({
      ok: false,
      code: TRIAL_REQUEST_ERROR_CODES.SUBMIT_FAILED,
    });
  }
});

const confirmRequest = async ({
  token,
  requestedLanguage,
}: {
  token: string;
  requestedLanguage: 'fr' | 'en';
}): Promise<TrialConfirmResponse> => {
  let tokenHash: string | null = null;
  let tokenWasClaimed = false;

  try {
    const payload = verifySignedPayload(token);
    if (!payload) {
      return buildConfirmResponse(TRIAL_CONFIRM_CODES.EXPIRED_CONFIRM_LINK, requestedLanguage);
    }

    await ensureConfirmationTable();
    tokenHash = hashToken(token);
    tokenWasClaimed = await claimConfirmationToken(tokenHash);

    if (!tokenWasClaimed) {
      return buildConfirmResponse(TRIAL_CONFIRM_CODES.TRIAL_ALREADY_CONFIRMED, requestedLanguage);
    }

    await submitHubspotTrialForm(payload);
    await createTrialBank({
      bankName: payload.company.toUpperCase(),
      adminEmail: payload.email,
      resellerName: payload.activityType === 'msp' ? `${payload.company} (interne)` : null,
      lang: requestedLanguage,
    });

    await markConfirmationCompleted(tokenHash);
    return buildConfirmResponse(TRIAL_CONFIRM_CODES.TRIAL_CREATED, requestedLanguage);
  } catch (error) {
    if (tokenWasClaimed && tokenHash) {
      try {
        await releaseConfirmationClaim(tokenHash);
      } catch (cleanupError) {
        logError('trialRequestRouter POST /confirm-status cleanup', cleanupError);
      }
    }
    logError('trialRequestRouter POST /confirm-status', error);
    return buildConfirmResponse(TRIAL_CONFIRM_CODES.CONFIRM_UNEXPECTED_ERROR, requestedLanguage);
  }
};

trialRequestRouter.post('/confirm-status', csrfProtection, async (req, res) => {
  try {
    const requestedLanguage = req.body?.lang === 'en' ? 'en' : 'fr';
    const safeBody = Joi.attempt(
      req.body,
      Joi.object({
        token: Joi.string().trim().required(),
        lang: Joi.string().valid('fr', 'en').optional(),
      }),
    ) as { token: string; lang?: 'fr' | 'en' };

    const { status, success, code } = await confirmRequest({
      token: safeBody.token,
      requestedLanguage,
    });

    return res.status(status).json({ ok: success, code });
  } catch {
    const requestedLanguage = req.body?.lang === 'en' ? 'en' : 'fr';
    const response = buildConfirmResponse(
      TRIAL_CONFIRM_CODES.INVALID_CONFIRM_LINK,
      requestedLanguage,
    );
    return res.status(response.status).json({ ok: response.success, code: response.code });
  }
});
