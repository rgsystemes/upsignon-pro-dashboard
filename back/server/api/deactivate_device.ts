import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const deactivate_device = async (req: any, res: any): Promise<void> => {
  try {
    if (req.session.adminRole === 'restricted_superadmin') {
      return res.status(401).end();
    }
    const deviceId = req.params.deviceId;
    await db.query(
      "UPDATE user_devices SET authorization_status='REVOKED_BY_ADMIN', revocation_date=$1 WHERE id=$2 AND bank_id=$3",
      [new Date().toISOString(), deviceId, req.proxyParamsBankId],
    );
    res.status(200).end();
  } catch (e) {
    logError('deactivate_device', e);
    res.status(400).end();
  }
};
