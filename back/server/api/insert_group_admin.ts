/* eslint-disable @typescript-eslint/no-var-requires */
import { v4 } from 'uuid';
import { db } from '../helpers/db';
import { logError } from '../helpers/logger';
import { sendAdminInvite } from '../helpers/sendAdminInvite';

export const insert_group_admin = async (req: any, res: any): Promise<void> => {
  try {
    const email = req.body.newEmail;
    if (typeof email !== 'string') return res.status(401).end();

    const groupId = req.proxyParamsGroupId;

    // Send new invitation
    const newId = v4();
    const token = v4();
    const tokenExpiresAt = new Date();
    const ttl = 24 * 3600 * 1000; // one day
    tokenExpiresAt.setTime(tokenExpiresAt.getTime() + ttl);
    const insertRes = await db.query(
      `INSERT INTO admins (id, email, is_superadmin, token, token_expires_at) VALUES ($1, lower($2), $3, $4, $5) ON CONFLICT (email) DO UPDATE SET token=$4, token_expires_at=$5 RETURNING id`,
      [newId, email, false, token, tokenExpiresAt],
    );
    const groupRes = await db.query('select name from groups where id=$1', [groupId]);
    sendAdminInvite(email, token, tokenExpiresAt, groupRes.rows[0].name);

    await db.query(
      'INSERT INTO admin_groups (admin_id, group_id) VALUES ($1,$2) ON CONFLICT (admin_id, group_id) DO NOTHING',
      [insertRes.rows[0].id, groupId],
    );
    res.status(200).end();
  } catch (e) {
    logError('insert_group_admin', e);
    res.status(400).end();
  }
};
