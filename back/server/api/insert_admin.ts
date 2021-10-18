import { db } from '../helpers/connection';
import { v4 } from 'uuid';

export const insert_admin = async (req: any, res: any): Promise<void> => {
  try {
    const newEmail = req.body.newEmail;
    await db.query(`INSERT INTO admins (id, email) VALUES ($1, $2)`, [v4(), newEmail]);
    res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};
