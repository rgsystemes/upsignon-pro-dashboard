import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const insert_group = async (req: any, res: any): Promise<void> => {
  try {
    await db.query(`INSERT INTO groups (name) VALUES ($1)`, [req.body.name]);
    res.status(200).end();
  } catch (e) {
    logError(e);
    res.status(400).end();
  }
};
