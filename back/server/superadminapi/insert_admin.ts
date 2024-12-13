/* eslint-disable @typescript-eslint/no-var-requires */
import { v4 } from 'uuid';
import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const insert_admin = async (req: any, res: any): Promise<void> => {
  try {
    const email = req.body.newEmail;
    if (typeof email !== 'string') return res.status(401).end();

    const isSuperadmin = req.body.isSuperadmin;

    const newId = v4();
    await db.query(
      `INSERT INTO admins (id, email, is_superadmin) VALUES ($1, lower($2), $3) ON CONFLICT (email) DO UPDATE SET is_superadmin=$3`,
      [newId, email, isSuperadmin],
    );
    res.status(200).end();
  } catch (e) {
    logError('insert_admin', e);
    res.status(400).end();
  }
};
