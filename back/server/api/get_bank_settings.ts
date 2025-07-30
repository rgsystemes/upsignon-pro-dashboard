import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const get_bank_settings = async (req: any, res: any): Promise<void> => {
  try {
    const dbRes = await db.query(`SELECT name, settings FROM banks WHERE id=$1`, [
      req.proxyParamsBankId,
    ]);
    res.status(200).send(dbRes.rows[0]);
  } catch (e) {
    logError('get_bank_settings', e);
    res.status(400).end();
  }
};
