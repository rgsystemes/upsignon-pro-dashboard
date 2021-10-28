import { db } from '../helpers/connection';
import { logError } from '../helpers/logger';

export const get_admins = async (req: any, res: any): Promise<void> => {
  try {
    const dbRes = await db.query(
      'SELECT id, email, created_at, group_id FROM admins ORDER BY created_at ASC',
    );
    res.status(200).send(dbRes.rows);
  } catch (e) {
    logError(e);
    res.status(400).end();
  }
};
