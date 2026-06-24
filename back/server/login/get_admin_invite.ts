import rateLimit from 'express-rate-limit';
import { v4 } from 'uuid';
import { db } from '../helpers/db';
import { logError } from '../helpers/logger';
import { inputSanitizer } from '../helpers/sanitizer';
import { sendAdminInvite, ttlMinutes } from '../helpers/sendAdminInvite';
import { Request, Response } from 'express';
import {
  hasAdminEmailInBank,
  hasAdminEmailInReseller,
  hasResellerOwnership,
} from '../resellerApi/helpers/securityChecks';

export const sendAdminInviteAuthenticated = async (req: any, res: any): Promise<void> => {
  return handleAdminInvite(req, res, true);
};
export const sendAdminInviteUnauthenticated = async (req: any, res: any): Promise<void> => {
  // Always return the same response to prevent enumeration
  // and do it before processing the request to prevent timing attacks
  res.status(200).json({
    message: 'If an account exists with this email, an invite has been sent.',
  });
  return handleAdminInvite(req, res, false);
};

const INVITE_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const INVITE_RATE_LIMIT_MAX = 5;

export const inviteRateLimiter = rateLimit({
  identifier: 'handleAdminInvite',
  keyGenerator: (req) => {
    const adminEmail = inputSanitizer.getLowerCaseString(req.body.adminEmail);
    return adminEmail || '_';
  },
  windowMs: INVITE_RATE_LIMIT_WINDOW_MS,
  limit: INVITE_RATE_LIMIT_MAX,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    message: 'Too many invite requests, please try again later.',
  },
});

const handleAdminInvite = async (
  req: Request,
  res: Response,
  isAuthenticated: boolean,
): Promise<void> => {
  try {
    const adminEmail = inputSanitizer.getLowerCaseString(req.body.adminEmail);
    if (!adminEmail) {
      if (isAuthenticated) {
        res.status(400).json({ success: false, message: 'Missing adminEmail' });
      }
      return;
    }

    if (
      // @ts-ignore
      req.session.adminRole !== 'superadmin' &&
      isAuthenticated
    ) {
      // @ts-ignore
      if (req.proxyParamsResellerId) {
        const isOwner = await hasResellerOwnership(
          req,
          // @ts-ignore
          req.proxyParamsResellerId,
        );
        if (!isOwner) {
          res.sendStatus(401);
          return;
        }

        const isAdminInReseller = await hasAdminEmailInReseller(
          adminEmail,
          // @ts-ignore
          req.proxyParamsResellerId,
        );
        if (!isAdminInReseller) {
          res.sendStatus(401);
          return;
        }
      } else if (
        // @ts-ignore
        req.proxyParamsBankId
      ) {
        // @ts-ignore
        if (!req.session.banks?.includes(req.proxyParamsBankId)) {
          res.sendStatus(401);
          return;
        }

        const isAdminInBank = await hasAdminEmailInBank(
          adminEmail,
          // @ts-ignore
          req.proxyParamsBankId,
        );
        if (!isAdminInBank) {
          res.sendStatus(401);
          return;
        }
      } else {
        res.sendStatus(401);
        return;
      }
    }

    const getRes = await db.query('SELECT id, token, token_expires_at FROM admins WHERE email=$1', [
      adminEmail,
    ]);

    // Process invite if admin exists
    if (getRes.rowCount && getRes.rowCount > 0) {
      let admRes = getRes.rows[0];
      let token, tokenExpiresAt;
      if (
        !admRes.token ||
        !admRes.token_expires_at ||
        admRes.token_expires_at.getTime() < Date.now()
      ) {
        token = v4();
        tokenExpiresAt = new Date();
        const ttl = ttlMinutes * 60 * 1000;
        tokenExpiresAt.setTime(tokenExpiresAt.getTime() + ttl);
        await db.query(
          'UPDATE admins SET token=$1, token_expires_at=$2 WHERE email=$3 RETURNING id',
          [token, tokenExpiresAt, adminEmail],
        );
      } else {
        token = admRes.token;
        tokenExpiresAt = admRes.token_expires_at;
      }
      sendAdminInvite(adminEmail, admRes.id, token, tokenExpiresAt, req.headers['accept-language']);
    }

    if (isAuthenticated) {
      res.status(200).json({
        success: true,
      });
    }
  } catch (e) {
    logError('handleAdminInvite', e);
    if (isAuthenticated) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
};
