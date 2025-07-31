/* eslint-disable @typescript-eslint/no-var-requires */
import { v4 } from 'uuid';
import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const insert_admin = async (req: any, res: any): Promise<void> => {
  try {
    if (req.session.adminRole !== 'superadmin') {
      res.status(401).json({ error: 'Not allowed for restricted superadmin' });
      return;
    }
    const email = req.body.newEmail;
    if (typeof email !== 'string') return res.status(401).end();

    const adminRole = req.body.adminRole;

    const newId = v4();
    await db.query(
      `INSERT INTO admins (id, email, admin_role) VALUES ($1, lower($2), $3) ON CONFLICT (email) DO UPDATE SET admin_role=$3`,
      [newId, email, adminRole],
    );
    res.status(200).end();
  } catch (e) {
    logError('insert_admin', e);
    res.status(400).end();
  }
};
