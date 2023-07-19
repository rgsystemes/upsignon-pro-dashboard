import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const delete_shared_vault_user = async (req: any, res: any): Promise<void> => {
  try {
    await db.query(`DELETE FROM shared_vault_recipients WHERE user_id=$1 AND shared_vault_id=$2 AND group_id=$3`, [
      req.body.userId,
      req.body.sharedVaultId,
      req.proxyParamsGroupId,
    ]);
    res.status(200).end();
  } catch (e) {
    logError(e);
    res.status(400).end();
  }
};
