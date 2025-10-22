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
    if (getRes.rowCount == 0) {
      return res.status(200).json({ success: false });
    }
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
      const dbRes = await db.query(
        'UPDATE admins SET token=$1, token_expires_at=$2 WHERE email=$3 RETURNING id',
        [token, tokenExpiresAt, adminEmail],
      );
    } else {
      token = getRes.rows[0].token;
      tokenExpiresAt = getRes.rows[0].token_expires_at;
    }
    sendAdminInvite(adminEmail, admRes.id, token, tokenExpiresAt, null);
    return res.status(200).json({ success: true });
  } catch (e) {
    logError('getAdminInvite', e);
    res.status(200).json({ success: false });
  }
};
