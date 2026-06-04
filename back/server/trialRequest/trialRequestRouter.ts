import { Router } from 'express';
import Joi from 'joi';
import { createHmac, timingSafeEqual } from 'crypto';
import env from '../helpers/env';
import { getEmailConfig, getMailTransporter } from '../helpers/mailTransporter';
import { logError } from '../helpers/logger';
import {
  configureBankWithAdminEmailAndSendMail,
  createTrialBank,
} from '../helpers/configureBankWithAdminEmail';
import {
  COMPANY_SIZE_HUBSPOT_MAPPING,
  DIRECT_ACTIVITY_HUBSPOT_MAPPING,
  SignedTrialPayload,
  submitHubspotTrialForm,
  TrialRequestBody,
} from './hubspotHelper';
import { db } from '../helpers/db';

const trialRequestRouter = Router();
const TRIAL_REQUEST_TOKEN_TTL_MS = 1000 * 60 * 60 * 24;

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

const buildConfirmHtmlPage = ({
  title,
  message,
  language,
  isSuccess,
}: {
  title: string;
  message: string;
  language: 'fr' | 'en';
  isSuccess: boolean;
}) => {
  const backToSiteLabel = language === 'en' ? 'Back to website' : 'Retour au site';
  const backToSiteUrl = 'https://upsignon.eu';
  const accentColor = isSuccess ? '#0f766e' : '#b91c1c';
  const badgeBg = isSuccess ? 'rgba(15, 118, 110, 0.12)' : 'rgba(185, 28, 28, 0.12)';
  const badgeLabel = isSuccess
    ? language === 'en'
      ? 'Success'
      : 'Succès'
    : language === 'en'
      ? 'Error'
      : 'Erreur';

  // Sanitize HTML in dynamic content to prevent XSS
  const escapeHtml = (text: string) => {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (char) => map[char]);
  };

  const safeTitle = escapeHtml(title);
  const safeMessage = escapeHtml(message);

  return `<!doctype html>
<html lang="${language}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${safeTitle}</title>
    <style>
      :root {
        --bg: #f5f7fb;
        --card: #ffffff;
        --text: #111827;
        --muted: #6b7280;
        --accent: ${accentColor};
        --badge-bg: ${badgeBg};
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 24px;
        font-family: Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background: radial-gradient(circle at top left, #ffffff 0%, var(--bg) 55%);
        color: var(--text);
      }
      .card {
        width: 100%;
        max-width: 640px;
        background: var(--card);
        border: 1px solid #e5e7eb;
        border-radius: 16px;
        padding: 28px;
        box-shadow: 0 10px 30px rgba(17, 24, 39, 0.08);
      }
      .badge {
        display: inline-block;
        margin-bottom: 14px;
        padding: 6px 10px;
        border-radius: 999px;
        background: var(--badge-bg);
        color: var(--accent);
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.02em;
        text-transform: uppercase;
      }
      h1 {
        margin: 0;
        font-size: clamp(1.4rem, 2.2vw, 1.9rem);
        line-height: 1.25;
      }
      p {
        margin: 14px 0 0;
        color: var(--muted);
        line-height: 1.6;
        font-size: 1rem;
      }
      .actions {
        margin-top: 22px;
      }
      .btn {
        display: inline-block;
        text-decoration: none;
        border-radius: 10px;
        border: 1px solid var(--accent);
        color: var(--accent);
        padding: 10px 16px;
        font-weight: 600;
      }
      .btn:hover {
        background: rgba(15, 23, 42, 0.03);
      }
    </style>
  </head>
  <body>
    <main class="card" role="main">
      <span class="badge">${badgeLabel}</span>
      <h1>${safeTitle}</h1>
      <p>${safeMessage}</p>
      <div class="actions">
        <a class="btn" href="${backToSiteUrl}">${backToSiteLabel}</a>
      </div>
    </main>
  </body>
</html>`;
};

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

const buildValidationEmailContent = (confirmLink: string, language: 'fr' | 'en') => {
  if (language === 'en') {
    return {
      subject: 'Please confirm your email address',
      text: `Thank you for your trial request. Please confirm your email address by clicking this link: ${confirmLink}`,
      html: `<p>Thank you for your trial request.</p><p>Please confirm your email address by clicking this link:</p><p><a href="${confirmLink}">Confirm my email address</a></p>`,
    };
  }

  return {
    subject: 'Merci de valider votre adresse email',
    text: `Merci pour votre demande d'essai. Merci de valider votre adresse email en cliquant sur ce lien : ${confirmLink}`,
    html: `<p>Merci pour votre demande d'essai.</p><p>Merci de valider votre adresse email en cliquant sur ce lien :</p><p><a href="${confirmLink}">Valider mon adresse email</a></p>`,
  };
};

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
  const confirmLink = `${env.BACKEND_URL}/trial-request/confirm?token=${encodeURIComponent(token)}&lang=${language}`;
  const content = buildValidationEmailContent(confirmLink, language);

  await transporter.sendMail({
    from: `"UpSignOn" <${emailConfig.EMAIL_SENDING_ADDRESS}>`,
    to: recipient,
    subject: content.subject,
    text: content.text,
    html: content.html,
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
        code: 'INVALID_EMAIL_DOMAIN',
        message: 'Please use a valid email address from your company or personal email provider.',
      });
    }

    const alreadyHasTrial = await db.query(`SELECT 1 FROM admins WHERE email = lower($1)`, [
      validatedBody.email,
    ]);
    if (alreadyHasTrial.rowCount && alreadyHasTrial.rowCount > 0) {
      return res.status(400).json({
        ok: false,
        code: 'ACCOUNT_ALREADY_EXISTS',
        message: 'An account already exists for this email address.',
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
    return res.status(400).json({ ok: false });
  }
});

trialRequestRouter.get('/confirm', async (req, res) => {
  const confirmRequest = async (): Promise<{
    title: string;
    message: string;
    status: 200 | 400 | 500;
    success: boolean;
    language: 'fr' | 'en';
  }> => {
    const requestedLanguage = req.query.lang === 'en' ? 'en' : 'fr';
    try {
      const token = req.query.token;
      if (!token || typeof token !== 'string') {
        switch (requestedLanguage) {
          case 'fr':
            return {
              title: 'Lien de validation invalide',
              message: 'Le lien de validation est manquant ou mal formé.',
              status: 400,
              success: false,
              language: 'fr',
            };
          case 'en':
            return {
              title: 'Invalid confirmation link',
              message: 'The confirmation link is missing or malformed.',
              status: 400,
              success: false,
              language: 'en',
            };
        }
      }

      const payload = verifySignedPayload(token);
      if (!payload) {
        switch (requestedLanguage) {
          case 'fr':
            return {
              title: 'Validation expiree',
              message:
                "Ce lien de validation est invalide ou a expiré. Merci de soumettre une nouvelle demande d'essai.",
              status: 400,
              success: false,
              language: 'fr',
            };
          case 'en':
            return {
              title: 'Confirmation expired',
              message:
                'This confirmation link is invalid or has expired. Please submit a new trial request.',
              status: 400,
              success: false,
              language: 'en',
            };
        }
      }

      await submitHubspotTrialForm(payload);
      await createTrialBank({
        bankName: payload.company.toUpperCase(),
        adminEmail: payload.email,
        resellerName: payload.activityType === 'msp' ? `${payload.company} (interne)` : null,
        lang: requestedLanguage,
      });

      switch (requestedLanguage) {
        case 'fr':
          return {
            title: 'Environnement de test créé',
            message:
              "Votre adresse email a bien été validée. Votre banque de test a été créée avec succès. Consultez vos emails pour les instructions de connexion et la suite de votre parcours d'onboarding.",
            status: 200,
            success: true,
            language: 'fr',
          };
        case 'en':
          return {
            title: 'Trial environment created',
            message:
              'Your email has been confirmed. Your trial bank has been created successfully. Check your emails for login instructions and next steps for your onboarding.',
            status: 200,
            success: true,
            language: 'en',
          };
      }
    } catch (error) {
      logError('trialRequestRouter GET /confirm', error);
      switch (requestedLanguage) {
        case 'fr':
          return {
            title: 'Erreur inattendue',
            message:
              'Une erreur est survenue lors du traitement de votre demande. Veuillez réessayer plus tard.',
            status: 500,
            success: false,
            language: 'fr',
          };
        case 'en':
          return {
            title: 'Unexpected error',
            message: 'An error occurred while processing your request. Please try again later.',
            status: 500,
            success: false,
            language: 'en',
          };
      }
    }
  };
  const { title, message, status, success, language } = await confirmRequest();
  return res
    .status(status)
    .type('html')
    .send(
      buildConfirmHtmlPage({
        title: title,
        message: message,
        language: language,
        isSuccess: success,
      }),
    );
});

export { trialRequestRouter };
