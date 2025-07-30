import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const count_password_reset_requests = async (
  req: any,
  res: any,
  asSuperadmin: boolean,
): Promise<void> => {
  try {
    if (asSuperadmin) {
      const dbRes = await db.query(
        "SELECT COUNT(id) AS count FROM password_reset_request WHERE status='PENDING_ADMIN_CHECK'",
      );
      res.status(200).send(dbRes.rows[0]?.count || 0);
    } else {
      const dbRes = await db.query(
        "SELECT COUNT(id) AS count FROM password_reset_request WHERE status='PENDING_ADMIN_CHECK' AND bank_id=$1",
        [req.proxyParamsBankId],
      );
      res.status(200).send(dbRes.rows[0]?.count || 0);
    }
  } catch (e) {
    logError('count_password_reset_requests', e);
    res.status(400).end();
  }
};
