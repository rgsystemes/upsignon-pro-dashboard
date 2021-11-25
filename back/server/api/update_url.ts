import { db } from '../helpers/connection';
import { logError } from '../helpers/logger';

export const update_url = async (req: any, res: any): Promise<void> => {
  try {
    const { id, displayedName, signinUrl, passwordChangeUrl } = req.body;
    if (!id) return res.status(400).end();
    if (displayedName != null) {
      await db.query(`UPDATE url_list SET displayed_name=$1 WHERE id=$2 AND group_id=$3`, [
        displayedName,
        id,
        req.proxyParamsGroupId,
      ]);
    }
    if (signinUrl != null) {
      await db.query(`UPDATE url_list SET signin_url=$1 WHERE id=$2 AND group_id=$3`, [
        signinUrl,
        id,
        req.proxyParamsGroupId,
      ]);
    }
    if (passwordChangeUrl != null) {
      await db.query(`UPDATE url_list SET password_change_url=$1 WHERE id=$2 AND group_id=$3`, [
        passwordChangeUrl,
        id,
        req.proxyParamsGroupId,
      ]);
    }
    res.status(200).end();
  } catch (e) {
    logError(e);
    res.status(400).end();
  }
};
