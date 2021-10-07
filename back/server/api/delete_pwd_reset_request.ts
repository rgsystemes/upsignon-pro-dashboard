import { db } from '../helpers/connection';

export const delete_pwd_reset_request = async (req: any, res: any): Promise<void> => {
  try {
    const requestId = req.params.requestId;
    await db.query(`DELETE FROM password_reset_request WHERE id=$1`, [requestId]);
    res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};
