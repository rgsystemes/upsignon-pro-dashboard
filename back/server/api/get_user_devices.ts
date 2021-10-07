import { db } from '../helpers/connection';

export const get_user_devices = async (req: any, res: any): Promise<void> => {
  try {
    const userId = req.params.userId;
    const userDevicesRequest = await db.query(
      `
    SELECT
      ud.id AS id,
      ud.device_name AS device_name,
      ud.authorization_status AS authorization_status,
      ud.device_type AS device_type,
      ud.os_version AS os_version,
      ud.revocation_date AS revocation_date,
      ud.app_version AS app_version,
      (SELECT date FROM usage_logs WHERE log_type='SESSION' AND device_id=ud.id ORDER BY date DESC LIMIT 1) AS last_session,
      reset.id AS pwd_reset_id,
      reset.status AS pwd_reset_status,
      reset.created_at AS pwd_reset_created_at,
      reset.reset_token_expiration_date AS pwd_reset_token_expiration_date
    FROM user_devices AS ud
    LEFT JOIN password_reset_request AS reset
      ON reset.device_id=ud.id
    WHERE user_id=$1
    ORDER BY ud.created_at DESC
    `,
      [userId],
    );
    res.status(200).send(userDevicesRequest.rows);
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};
