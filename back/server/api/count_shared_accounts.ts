import { db } from '../helpers/connection';
import { logError } from '../helpers/logger';

export const count_shared_accounts = async (req: any, res: any): Promise<void> => {
  try {
    const dbRes = await db.query('SELECT COUNT(id) AS count FROM shared_accounts');
    res.status(200).send(dbRes.rows[0].count);
  } catch (e) {
    logError(e);
    res.status(400).end();
  }
};
