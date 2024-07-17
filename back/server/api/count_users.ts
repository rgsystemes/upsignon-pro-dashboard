import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const count_users = async (req: any, res: any): Promise<void> => {
  try {
    const dbRes = await db.query('SELECT COUNT(id) AS count FROM users WHERE group_id=$1', [
      req.proxyParamsGroupId,
    ]);
    res.status(200).send({ allUsersCount: dbRes.rows[0].count });
  } catch (e) {
    logError('count_users', e);
    res.status(400).end();
  }
};
