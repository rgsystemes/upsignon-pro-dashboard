import { db } from '../helpers/connection';
import { logError } from '../helpers/logger';

export const count_password_reset_requests = async (req: any, res: any): Promise<void> => {
  try {
    const dbRes = await db.query(
      "SELECT COUNT(id) AS count FROM password_reset_request WHERE status='PENDING_ADMIN_CHECK' AND group_id=$1",
      [req.proxyParamsGroupId],
    );
    res.status(200).send(dbRes.rows[0].count);
  } catch (e) {
    logError(e);
    res.status(400).end();
  }
};
