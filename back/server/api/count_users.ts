import { db } from '../helpers/connection';

export const count_users = async (req: any, res: any): Promise<void> => {
  try {
    const dbRes = await db.query('SELECT COUNT(id) AS count FROM users');
    res.status(200).send(dbRes.rows[0].count);
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};
