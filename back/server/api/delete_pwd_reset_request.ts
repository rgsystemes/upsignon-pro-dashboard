import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const delete_pwd_reset_request = async (
  req: any,
  res: any,
  asSuperadmin: boolean,
): Promise<void> => {
  try {
    if (req.session.adminRole === 'restricted_superadmin') {
      res.status(401).json({ error: 'Not allowed for restricted superadmin' });
      return;
    }
    const requestId = req.params.requestId;
    await db.query(
      `DELETE FROM password_reset_request WHERE id=$1 ${asSuperadmin ? '' : 'AND bank_id=$2'}`,
      asSuperadmin ? [requestId] : [requestId, req.proxyParamsBankId],
    );
    res.status(200).end();
  } catch (e) {
    logError('delete_pwd_reset_request', e);
    res.status(400).end();
  }
};
