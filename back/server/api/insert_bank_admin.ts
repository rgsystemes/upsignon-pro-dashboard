/* eslint-disable @typescript-eslint/no-var-requires */
import { v4 } from 'uuid';
import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const insert_bank_admin = async (req: any, res: any): Promise<void> => {
  try {
    if (req.session.adminRole === 'restricted_superadmin') {
      return res.status(401).end();
    }
    const email = req.body.newEmail;
    if (typeof email !== 'string') return res.status(401).end();

    const bankId = req.proxyParamsBankId;

    const selectRes = await db.query('SELECT id FROM admins WHERE email=$1', [email]);
    var id = '';
    if (selectRes.rows.length === 0) {
      // Send new invitation
      const newId = v4();
      const insertRes = await db.query(
        `INSERT INTO admins (id, email, admin_role) VALUES ($1, lower($2), 'admin') RETURNING id`,
        [newId, email],
      );
      id = insertRes.rows[0].id;
    } else {
      id = selectRes.rows[0].id;
    }

    await db.query(
      'INSERT INTO admin_banks (admin_id, bank_id) VALUES ($1,$2) ON CONFLICT (admin_id, bank_id) DO NOTHING',
      [id, bankId],
    );
    res.status(200).end();
  } catch (e) {
    logError('insert_bank_admin', e);
    res.status(400).end();
  }
};
