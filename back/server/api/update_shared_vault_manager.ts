import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const update_shared_vault_manager = async (req: any, res: any): Promise<void> => {
  try {
    await db.query(`UPDATE shared_vault_recipients SET is_manager=$1 WHERE user_id=$2 AND shared_vault_id=$3 AND group_id=$4`, [
      req.body.willBeManager,
      req.body.userId,
      req.body.sharedVaultId,
      req.proxyParamsGroupId,
    ]);
    res.status(200).end();
  } catch (e) {
    logError("update_shared_vault_manager", e);
    res.status(400).end();
  }
};
