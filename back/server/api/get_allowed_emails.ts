import { db } from '../helpers/connection';

export const get_allowed_emails = async (req: any, res: any): Promise<void> => {
  try {
    const dbRes = await db.query('SELECT id, pattern FROM allowed_emails');
    res.status(200).send(dbRes.rows);
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};
