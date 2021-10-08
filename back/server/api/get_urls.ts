import { db } from '../helpers/connection';

export const get_urls = async (req: any, res: any): Promise<void> => {
  try {
    const dbRes = await db.query('SELECT * FROM url_list');
    res.status(200).send(dbRes.rows);
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};
