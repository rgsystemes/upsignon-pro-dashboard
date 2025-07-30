import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const delete_url = async (req: any, res: any): Promise<void> => {
  try {
    if (req.session.isReadOnlySuperadmin) {
      return res.status(401).end();
    }
    const urlId = req.params.id;
    await db.query(`DELETE FROM url_list WHERE id=$1 AND group_id=$2`, [
      urlId,
      req.proxyParamsBankId,
    ]);
    res.status(200).end();
  } catch (e) {
    logError('delete_url', e);
    res.status(400).end();
  }
};
