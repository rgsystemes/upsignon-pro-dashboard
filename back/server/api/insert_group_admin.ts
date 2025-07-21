/* eslint-disable @typescript-eslint/no-var-requires */
import { v4 } from 'uuid';
import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const insert_group_admin = async (req: any, res: any): Promise<void> => {
  try {
    if (req.session.isReadOnlySuperadmin) {
      return res.status(401).end();
    }
    const email = req.body.newEmail;
    if (typeof email !== 'string') return res.status(401).end();

    const groupId = req.proxyParamsGroupId;

    const selectRes = await db.query('SELECT id FROM admins WHERE email=$1', [email]);
    var id = '';
    if (selectRes.rows.length === 0) {
      // Send new invitation
      const newId = v4();
      const insertRes = await db.query(
        `INSERT INTO admins (id, email, is_superadmin) VALUES ($1, lower($2), $3) RETURNING id`,
        [newId, email, false],
      );
      id = insertRes.rows[0].id;
    } else {
      id = selectRes.rows[0].id;
    }

    await db.query(
      'INSERT INTO admin_groups (admin_id, group_id) VALUES ($1,$2) ON CONFLICT (admin_id, group_id) DO NOTHING',
      [id, groupId],
    );
    res.status(200).end();
  } catch (e) {
    logError('insert_group_admin', e);
    res.status(400).end();
  }
};
