import { db } from '../helpers/connection';

export const get_admins = async (req: any, res: any): Promise<void> => {
  try {
    const dbRes = await db.query(
      'SELECT id, email, created_at FROM admins ORDER BY created_at ASC',
    );
    res.status(200).send(dbRes.rows);
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};
