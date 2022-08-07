/* eslint-disable @typescript-eslint/no-var-requires */
import { v4 } from 'uuid';
import { db } from '../helpers/db';
import { logError } from '../helpers/logger';
import { sendAdminInvite } from '../helpers/sendAdminInvite';

export const insert_admin = async (req: any, res: any): Promise<void> => {
  try {
    const email = req.body.newEmail;
    if (typeof email !== 'string') return res.status(401).end();

    const isSuperadmin = req.body.isSuperadmin;

    const newId = v4();
    const token = v4();
    const tokenExpiresAt = new Date();
    const ttl = 24 * 3600 * 1000; // one day
    tokenExpiresAt.setTime(tokenExpiresAt.getTime() + ttl);
    await db.query(
      `INSERT INTO admins (id, email, is_superadmin, token, token_expires_at) VALUES ($1, lower($2), $3, $4, $5) ON CONFLICT (email) DO UPDATE SET token=$4, token_expires_at=$5, is_superadmin=$3`,
      [newId, email, isSuperadmin, token, tokenExpiresAt],
    );
    sendAdminInvite(email, token, tokenExpiresAt, null);
    res.status(200).end();
  } catch (e) {
    logError(e);
    res.status(400).end();
  }
};
