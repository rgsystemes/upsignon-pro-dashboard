import { v4 } from 'uuid';
import { db } from '../helpers/db';
import { logError } from '../helpers/logger';
import { inputSanitizer } from '../helpers/sanitizer';
import { sendAdminInvite, ttlMinutes } from '../helpers/sendAdminInvite';

export const getAdminInvite = async (req: any, res: any): Promise<void> => {
  try {
    const adminEmail = inputSanitizer.getLowerCaseString(req.body.adminEmail);
    if (!adminEmail) return res.status(400).end();
    const getRes = await db.query('SELECT id, token, token_expires_at FROM admins WHERE email=$1', [
      adminEmail,
    ]);

    // Process invite if admin exists (but don't reveal this in response)
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

    // Always return the same response to prevent enumeration
    return res.status(200).json({
      message: 'If an account exists with this email, an invite has been sent.',
    });
  } catch (e) {
    logError('getAdminInvite', e);
    // Same response on error to prevent timing attacks
    res.status(200).json({
      message: 'If an account exists with this email, an invite has been sent.',
    });
  }
};
