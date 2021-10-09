import { db } from '../helpers/connection';

export const delete_shared_account = async (req: any, res: any): Promise<void> => {
  try {
    const sharedAccountId = req.params.sharedAccountId;
    await db.query(`DELETE FROM shared_accounts WHERE id=$1`, [sharedAccountId]);
    res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};
