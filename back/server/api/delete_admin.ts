import { db } from '../helpers/connection';

export const delete_admin = async (req: any, res: any): Promise<void> => {
  try {
    const adminId = req.params.id;
    await db.query(`DELETE FROM admins WHERE id=$1`, [adminId]);
    // TODO remove his session too
    res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};
