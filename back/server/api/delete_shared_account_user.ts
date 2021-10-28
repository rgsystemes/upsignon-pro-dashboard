import { db } from '../helpers/connection';
import { logError } from '../helpers/logger';

export const delete_shared_account_user = async (req: any, res: any): Promise<void> => {
  try {
    const sharedAccountUserId = req.params.sharedAccountUserId;
    await db.query(`DELETE FROM shared_account_users WHERE id=$1 AND group_id=$2`, [
      sharedAccountUserId,
      req.session.groupId,
    ]);
    res.status(200).end();
  } catch (e) {
    logError(e);
    res.status(400).end();
  }
};
