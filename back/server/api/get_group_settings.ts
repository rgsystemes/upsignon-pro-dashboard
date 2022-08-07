import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const get_group_settings = async (req: any, res: any): Promise<void> => {
  try {
    const dbRes = await db.query(`SELECT name, settings FROM groups WHERE id=$1`, [
      req.proxyParamsGroupId,
    ]);
    res.status(200).send(dbRes.rows[0]);
  } catch (e) {
    logError(e);
    res.status(400).end();
  }
};
