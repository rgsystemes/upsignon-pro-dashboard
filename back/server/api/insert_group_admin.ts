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

    let adminId = null;
    const existingAdminRes = await db.query('SELECT id, password_hash FROM admins WHERE email=$1', [
      email,
    ]);
    if (existingAdminRes.rowCount && existingAdminRes.rowCount > 0) {
      adminId = existingAdminRes.rows[0].id;
    }

    // Send new invitation
    const token = v4();
    const tokenExpiresAt = new Date();
    const ttl = 24 * 3600 * 1000; // one day
    tokenExpiresAt.setTime(tokenExpiresAt.getTime() + ttl);
    if (!adminId) {
      adminId = v4();
      await db.query(
        `INSERT INTO admins (id, email, is_superadmin, token, token_expires_at) VALUES ($1, lower($2), $3, $4, $5)`,
        [adminId, email, false, token, tokenExpiresAt],
      );
    } else {
      await db.query(`UPDATE admins SET token=$1, token_expires_at=$2 WHERE id=$3`, [
        token,
        tokenExpiresAt,
        adminId,
      ]);
    }
    sendAdminInvite(email, token, tokenExpiresAt, null);

    await db.query('INSERT INTO admin_groups (admin_id, group_id) VALUES ($1,$2)', [
      adminId,
      groupId,
    ]);
    res.status(200).end();
  } catch (e) {
    logError('insert_group_admin', e);
    res.status(400).end();
  }
};
