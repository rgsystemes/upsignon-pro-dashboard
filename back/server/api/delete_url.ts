import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const delete_url = async (req: any, res: any): Promise<void> => {
  try {
    const urlId = req.params.id;
    await db.query(`DELETE FROM url_list WHERE id=$1 AND group_id=$2`, [
      urlId,
      req.proxyParamsGroupId,
    ]);
    res.status(200).end();
  } catch (e) {
    logError(e);
    res.status(400).end();
  }
};
