import { db } from '../helpers/connection';
import { logError } from '../helpers/logger';

export const delete_allowed_email = async (req: any, res: any): Promise<void> => {
  try {
    const allowedEmailId = req.params.id;
    await db.query(`DELETE FROM allowed_emails WHERE id=$1 AND group_id=$2`, [
      allowedEmailId,
      req.proxyParamsGroupId,
    ]);
    res.status(200).end();
  } catch (e) {
    logError(e);
    res.status(400).end();
  }
};
