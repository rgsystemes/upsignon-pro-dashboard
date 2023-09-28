import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const get_urls = async (req: any, res: any): Promise<void> => {
  try {
    const dbRes = await db.query(
      'SELECT * FROM url_list WHERE group_id=$1 ORDER BY displayed_name ASC',
      [req.proxyParamsGroupId],
    );
    res.status(200).send(dbRes.rows);
  } catch (e) {
    logError("get_urls", e);
    res.status(400).end();
  }
};
