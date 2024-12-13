import { v4 } from 'uuid';
import { db } from '../helpers/db';
import { logError } from '../helpers/logger';
import { inputSanitizer } from '../helpers/sanitizer';
import { sendAdminInvite, ttlMinutes } from '../helpers/sendAdminInvite';

export const getAdminInvite = async (req: any, res: any): Promise<void> => {
  try {
    const adminEmail = inputSanitizer.getLowerCaseString(req.body.adminEmail);
    if (!adminEmail) return res.status(400).end();
    const token = v4();
    const tokenExpiresAt = new Date();
    const ttl = ttlMinutes * 60 * 1000;
    tokenExpiresAt.setTime(tokenExpiresAt.getTime() + ttl);
    const dbRes = await db.query(
      'UPDATE admins SET token=$1, token_expires_at=$2 WHERE email=$3 RETURNING id',
      [token, tokenExpiresAt, adminEmail],
    );
    sendAdminInvite(adminEmail, token, tokenExpiresAt, null);
    if (dbRes.rowCount === 1) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(200).json({ success: false });
    }
  } catch (e) {
    logError('getAdminInvite', e);
    res.status(200).json({ success: false });
  }
};
