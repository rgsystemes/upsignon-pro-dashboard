import { db } from '../helpers/connection';

export const delete_device = async (req: any, res: any): Promise<void> => {
  try {
    const deviceId = req.params.deviceId;
    await db.query('DELETE FROM user_devices WHERE id=$1', [deviceId]);
    res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};
