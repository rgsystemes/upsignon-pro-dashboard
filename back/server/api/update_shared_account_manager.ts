import { db } from '../helpers/connection';
import { logError } from '../helpers/logger';

export const update_shared_account_manager = async (req: any, res: any): Promise<void> => {
  try {
    await db.query(`UPDATE shared_account_users SET is_manager=$1 WHERE id=$2`, [
      req.body.willBeManager,
      req.body.sharedAccountUserId,
    ]);
    res.status(200).end();
  } catch (e) {
    logError(e);
    res.status(400).end();
  }
};
