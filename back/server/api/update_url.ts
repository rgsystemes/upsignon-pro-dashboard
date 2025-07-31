import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const update_url = async (req: any, res: any): Promise<void> => {
  try {
    if (req.session.adminRole === 'restricted_superadmin') {
      return res.status(401).end();
    }
    const { id, displayedName, signinUrl, usesBasicAuth } = req.body;
    if (!id) return res.status(400).end();
    if (displayedName != null) {
      await db.query(`UPDATE url_list SET displayed_name=$1 WHERE id=$2 AND bank_id=$3`, [
        displayedName,
        id,
        req.proxyParamsBankId,
      ]);
    }
    if (signinUrl != null) {
      await db.query(`UPDATE url_list SET signin_url=$1 WHERE id=$2 AND bank_id=$3`, [
        signinUrl,
        id,
        req.proxyParamsBankId,
      ]);
    }
    if (usesBasicAuth != null) {
      await db.query(`UPDATE url_list SET uses_basic_auth=$1 WHERE id=$2 AND bank_id=$3`, [
        usesBasicAuth,
        id,
        req.proxyParamsBankId,
      ]);
    }
    res.status(200).end();
  } catch (e) {
    logError('update_url', e);
    res.status(400).end();
  }
};
