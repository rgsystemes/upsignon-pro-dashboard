import { db } from '../helpers/connection';

export const delete_shared_account_user = async (req: any, res: any): Promise<void> => {
  try {
    const sharedAccountUserId = req.params.sharedAccountUserId;
    await db.query(`DELETE FROM shared_account_users WHERE id=$1`, [sharedAccountUserId]);
    res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};
