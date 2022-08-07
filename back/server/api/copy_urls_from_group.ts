import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const copy_urls_from_group = async (req: any, res: any): Promise<void> => {
  try {
    if (!req.session.isSuperadmin) {
      return res.status(401).end();
    }
    const dbRes = await db.query(
      `INSERT INTO url_list (displayed_name, signin_url, password_change_url, uses_basic_auth, group_id) SELECT displayed_name, signin_url, password_change_url, uses_basic_auth, $1 AS group_id FROM url_list WHERE url_list.group_id = $2`,
      [req.proxyParamsGroupId, req.body.fromGroup],
    );
    res.status(200).send({ nbAdded: dbRes.rowCount });
  } catch (e) {
    logError(e);
    res.status(400).end();
  }
};
