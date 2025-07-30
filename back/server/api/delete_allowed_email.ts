import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const delete_allowed_email = async (req: any, res: any): Promise<void> => {
  try {
    if (req.session.isReadOnlySuperadmin) {
      return res.status(401).end();
    }
    const allowedEmailId = req.params.id;
    await db.query(`DELETE FROM allowed_emails WHERE id=$1 AND group_id=$2`, [
      allowedEmailId,
      req.proxyParamsBankId,
    ]);
    res.status(200).end();
  } catch (e) {
    logError('delete_allowed_email', e);
    res.status(400).end();
  }
};
