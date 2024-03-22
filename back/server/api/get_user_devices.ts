import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

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
      ud.os_family AS os_family,
      ud.os_version AS os_version,
      ud.revocation_date AS revocation_date,
      ud.app_version AS app_version,
      ud.install_type AS install_type,
      ud.last_sync_date AS last_sync_date,
      reset.id AS pwd_reset_id,
      reset.status AS pwd_reset_status,
      reset.created_at AS pwd_reset_created_at,
      reset.reset_token_expiration_date AS pwd_reset_token_expiration_date,
      (SELECT STRING_AGG(users.email,';') FROM user_devices AS udbis INNER JOIN users ON udbis.user_id=users.id WHERE udbis.device_unique_id=ud.device_unique_id AND udbis.id!=ud.id) AS shared_with
    FROM user_devices AS ud
    LEFT JOIN password_reset_request AS reset
      ON reset.device_id=ud.id
    WHERE user_id=$1
    AND ud.group_id=$2
    ORDER BY ud.created_at DESC
    `,
      [userId, req.proxyParamsGroupId],
    );
    res.status(200).send(userDevicesRequest.rows);
  } catch (e) {
    logError('get_user_devices', e);
    res.status(400).end();
  }
};
