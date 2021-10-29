import { db } from '../helpers/connection';
import { logError } from '../helpers/logger';

export const delete_shared_account = async (req: any, res: any): Promise<void> => {
  try {
    const sharedAccountId = req.params.sharedAccountId;
    await db.query(`DELETE FROM shared_accounts WHERE id=$1 AND group_id=$2`, [
      sharedAccountId,
      req.proxyParamsGroupId,
    ]);
    res.status(200).end();
  } catch (e) {
    logError(e);
    res.status(400).end();
  }
};
