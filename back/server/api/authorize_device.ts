import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const authorize_device = async (req: any, res: any): Promise<void> => {
  try {
    if (req.session.isReadOnlySuperadmin) {
      return res.status(401).end();
    }
    const deviceId = req.params.deviceId;
    await db.query(
      "UPDATE user_devices SET authorization_status='AUTHORIZED', revocation_date=null, authorization_code=null, auth_code_expiration_date=null WHERE id=$1 AND bank_id=$2",
      [deviceId, req.proxyParamsBankId],
    );
    res.status(200).end();
  } catch (e) {
    logError('authorize_device', e);
    res.status(400).end();
  }
};
