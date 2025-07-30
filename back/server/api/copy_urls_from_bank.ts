import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const copy_urls_from_bank = async (req: any, res: any): Promise<void> => {
  try {
    if (req.session.isReadOnlySuperadmin) {
      return res.status(401).end();
    }
    const dbRes = await db.query(
      `INSERT INTO url_list (displayed_name, signin_url, uses_basic_auth, bank_id) SELECT displayed_name, signin_url, uses_basic_auth, $1 AS bank_id FROM url_list WHERE url_list.bank_id = $2`,
      [req.proxyParamsBankId, req.body.fromGroup],
    );
    res.status(200).send({ nbAdded: dbRes.rowCount });
  } catch (e) {
    logError('copy_urls_from_bank', e);
    res.status(400).end();
  }
};
