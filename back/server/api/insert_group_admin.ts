/* eslint-disable @typescript-eslint/no-var-requires */
import { v4 } from 'uuid';
import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const insert_group_admin = async (req: any, res: any): Promise<void> => {
  try {
    const email = req.body.newEmail;
    if (typeof email !== 'string') return res.status(401).end();

    const groupId = req.proxyParamsGroupId;

    // Send new invitation
    const newId = v4();
    const insertRes = await db.query(
      `INSERT INTO admins (id, email, is_superadmin) VALUES ($1, lower($2), $3) ON CONFLICT (email) DO NOTHING RETURNING id`,
      [newId, email, false],
    );

    if (insertRes.rowCount === 1) {
      await db.query(
        'INSERT INTO admin_groups (admin_id, group_id) VALUES ($1,$2) ON CONFLICT (admin_id, group_id) DO NOTHING',
        [insertRes.rows[0].id, groupId],
      );
    }
    res.status(200).end();
  } catch (e) {
    logError('insert_group_admin', e);
    res.status(400).end();
  }
};
