import { db } from '../../helpers/db';
import { logError } from '../../helpers/logger';

export const getNextShamirConfigIndex = async (req: any, res: any): Promise<void> => {
  try {
    const previousConfigs = await db.query(
      'SELECT COUNT(1) as count FROM shamir_configs WHERE bank_id=$1',
      [req.proxyParamsBankId],
    );
    return res
      .status(200)
      .json({ nextShamirConfigIndex: Number(previousConfigs.rows[0].count) + 1 });
  } catch (e) {
    logError('getNextShamirConfigIndex', e);
    res.status(400).end();
  }
};
