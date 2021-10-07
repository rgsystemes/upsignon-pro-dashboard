import { db } from '../helpers/connection';

export const authorize_device = async (req: any, res: any): Promise<void> => {
  try {
    const deviceId = req.params.deviceId;
    await db.query(
      "UPDATE user_devices SET authorization_status='AUTHORIZED', revocation_date=null, authorization_code=null, auth_code_expiration_date=null WHERE id=$1",
      [deviceId],
    );
    res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};
