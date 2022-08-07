import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const delete_device = async (req: any, res: any): Promise<void> => {
  try {
    const deviceId = req.params.deviceId;
    await db.query('DELETE FROM user_devices WHERE id=$1 AND group_id=$2', [
      deviceId,
      req.proxyParamsGroupId,
    ]);
    res.status(200).end();
  } catch (e) {
    logError(e);
    res.status(400).end();
  }
};
