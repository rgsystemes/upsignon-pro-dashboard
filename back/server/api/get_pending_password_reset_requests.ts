import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const get_pending_password_reset_requests = async (
  req: any,
  res: any,
  asSuperadmin: boolean,
): Promise<void> => {
  try {
    const userDevicesRequest = await db.query(
      `SELECT
      groups.name AS group_name,
      u.email,
      ud.device_name,
      ud.device_type AS device_type,
      prr.status AS status,
      prr.id AS pwd_reset_id,
      prr.reset_token AS pwd_reset_token,
      prr.created_at AS pwd_reset_created_at,
      (SELECT STRING_AGG(users.email,';') FROM user_devices AS udbis INNER JOIN users ON udbis.user_id=users.id WHERE udbis.device_unique_id=ud.device_unique_id AND udbis.id!=ud.id) AS shared_with
    FROM password_reset_request AS prr
    INNER JOIN user_devices AS ud ON prr.device_id=ud.id
    INNER JOIN users AS u ON ud.user_id=u.id
    INNER JOIN groups ON u.group_id=groups.id
    ${asSuperadmin ? '' : 'WHERE prr.group_id=$1'}
    ORDER BY prr.created_at DESC
    `,
      asSuperadmin ? [] : [req.proxyParamsGroupId],
    );
    res.status(200).send(userDevicesRequest.rows);
  } catch (e) {
    logError('get_pending_password_reset_requests', e);
    res.status(400).end();
  }
};
