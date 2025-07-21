import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const delete_device = async (req: any, res: any): Promise<void> => {
  try {
    if (req.session.isReadOnlySuperadmin) {
      return res.status(401).end();
    }
    const deviceId = req.params.deviceId;
    await db.query('DELETE FROM user_devices WHERE id=$1 AND group_id=$2', [
      deviceId,
      req.proxyParamsGroupId,
    ]);
    res.status(200).end();
  } catch (e) {
    logError('delete_device', e);
    res.status(400).end();
  }
};
