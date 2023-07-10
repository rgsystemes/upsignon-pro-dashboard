import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const delete_shared_vault_user = async (req: any, res: any): Promise<void> => {
  try {
    await db.query(`DELETE FROM shared_vault_recipients WHERE id=$1 AND group_id=$2`, [
      req.body.sharedVaultUserId,
      req.proxyParamsGroupId,
    ]);
    res.status(200).end();
  } catch (e) {
    logError(e);
    res.status(400).end();
  }
};
