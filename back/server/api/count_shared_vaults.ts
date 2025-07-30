import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const count_shared_vaults = async (req: any, res: any): Promise<void> => {
  try {
    const dbRes = await db.query('SELECT COUNT(id) AS count FROM shared_vaults WHERE group_id=$1', [
      req.proxyParamsBankId,
    ]);
    res.status(200).send(dbRes.rows[0].count);
  } catch (e) {
    logError('count_shared_vaults', e);
    res.status(400).end();
  }
};
