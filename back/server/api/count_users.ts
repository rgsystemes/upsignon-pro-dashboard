import { db } from '../helpers/connection';
import { logError } from '../helpers/logger';

export const count_users = async (req: any, res: any): Promise<void> => {
  try {
    const dbRes = await db.query('SELECT COUNT(id) AS count FROM users WHERE group_id=$1', [
      req.session.groupId,
    ]);
    res.status(200).send(dbRes.rows[0].count);
  } catch (e) {
    logError(e);
    res.status(400).end();
  }
};
