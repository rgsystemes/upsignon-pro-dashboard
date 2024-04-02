import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const get_group_entra_config = async (req: any, res: any): Promise<void> => {
  try {
    const dbRes = await db.query(`SELECT ms_entra_config FROM groups WHERE id=$1`, [
      req.proxyParamsGroupId,
    ]);
    res.status(200).send(dbRes.rows[0].ms_entra_config);
  } catch (e) {
    logError('get_group_entra_config', e);
    res.status(400).end();
  }
};
