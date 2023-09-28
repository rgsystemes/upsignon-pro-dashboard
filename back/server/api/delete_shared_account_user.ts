import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const delete_shared_account_user = async (req: any, res: any): Promise<void> => {
  try {
    if (req.body.userId && req.body.sharedFolderId) {
      await db.query(
        `DELETE FROM shared_account_users AS sau USING shared_accounts AS sa WHERE sau.shared_account_id=sa.id AND sa.shared_folder_id=$1 AND sau.user_id=$2 AND sau.group_id=$3`,
        [req.body.sharedFolderId, req.body.userId, req.proxyParamsGroupId],
      );
    } else {
      await db.query(`DELETE FROM shared_account_users WHERE id=$1 AND group_id=$2`, [
        req.body.sharedAccountUserId,
        req.proxyParamsGroupId,
      ]);
    }
    res.status(200).end();
  } catch (e) {
    logError("delete_shared_account_user", e);
    res.status(400).end();
  }
};
