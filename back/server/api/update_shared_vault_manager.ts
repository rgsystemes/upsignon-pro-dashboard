import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const update_shared_vault_manager = async (req: any, res: any): Promise<void> => {
  try {
    await db.query(`UPDATE shared_vault_recipients SET is_manager=$1 WHERE id=$2 AND group_id=$3`, [
      req.body.willBeManager,
      req.body.sharedVaultUserId,
      req.proxyParamsGroupId,
    ]);
    res.status(200).end();
  } catch (e) {
    logError(e);
    res.status(400).end();
  }
};
