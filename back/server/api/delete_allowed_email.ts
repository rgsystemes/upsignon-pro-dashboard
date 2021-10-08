import { db } from '../helpers/connection';

export const delete_allowed_email = async (req: any, res: any): Promise<void> => {
  try {
    const allowedEmailId = req.params.id;
    await db.query(`DELETE FROM allowed_emails WHERE id=$1`, [allowedEmailId]);
    res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};
