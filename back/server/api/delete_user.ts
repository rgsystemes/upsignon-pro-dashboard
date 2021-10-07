import { db } from '../helpers/connection';

export const delete_user = async (req: any, res: any): Promise<void> => {
  try {
    const userId = req.params.userId;
    await db.query(`DELETE FROM users WHERE id=$1`, [userId]);
    res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};
