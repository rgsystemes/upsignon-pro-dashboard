import { db } from '../helpers/connection';
import { logError } from '../helpers/logger';

export const get_urls = async (req: any, res: any): Promise<void> => {
  try {
    const dbRes = await db.query('SELECT * FROM url_list ORDER BY displayed_name');
    res.status(200).send(dbRes.rows);
  } catch (e) {
    logError(e);
    res.status(400).end();
  }
};
