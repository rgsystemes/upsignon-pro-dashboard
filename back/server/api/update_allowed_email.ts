import { db } from '../helpers/connection';

export const update_allowed_email = async (req: any, res: any): Promise<void> => {
  try {
    await db.query(`UPDATE allowed_emails SET pattern=$1 WHERE id=$2`, [
      req.body.newPattern,
      req.body.allowedEmailId,
    ]);
    res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};
