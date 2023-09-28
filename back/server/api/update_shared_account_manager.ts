import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const update_shared_account_manager = async (req: any, res: any): Promise<void> => {
  try {
    if (req.body.userId && req.body.sharedFolderId) {
      await db.query(
        `UPDATE shared_account_users AS sau SET is_manager=$1 FROM shared_accounts AS sa WHERE sa.id=sau.shared_account_id AND sa.shared_folder_id=$2 AND user_id=$3 AND sau.group_id=$4`,
        [req.body.willBeManager, req.body.sharedFolderId, req.body.userId, req.proxyParamsGroupId],
      );
    } else {
      await db.query(`UPDATE shared_account_users SET is_manager=$1 WHERE id=$2 AND group_id=$3`, [
        req.body.willBeManager,
        req.body.sharedAccountUserId,
        req.proxyParamsGroupId,
      ]);
    }
    res.status(200).end();
  } catch (e) {
    logError("update_shared_account_manager", e);
    res.status(400).end();
  }
};
