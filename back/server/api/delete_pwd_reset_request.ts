import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const delete_pwd_reset_request = async (
  req: any,
  res: any,
  asSuperadmin: boolean,
): Promise<void> => {
  try {
    const requestId = req.params.requestId;
    await db.query(
      `DELETE FROM password_reset_request WHERE id=$1 ${asSuperadmin ? '' : 'AND group_id=$2'}`,
      asSuperadmin ? [requestId] : [requestId, req.proxyParamsGroupId],
    );
    res.status(200).end();
  } catch (e) {
    logError("delete_pwd_reset_request", e);
    res.status(400).end();
  }
};
