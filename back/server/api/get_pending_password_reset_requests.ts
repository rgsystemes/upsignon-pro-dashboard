import { db } from '../helpers/connection';
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
      reset.id AS pwd_reset_id,
      reset.created_at AS pwd_reset_created_at,
      (SELECT STRING_AGG(users.email,';') FROM user_devices AS udbis INNER JOIN users ON udbis.user_id=users.id WHERE udbis.device_unique_id=ud.device_unique_id AND udbis.id!=ud.id) AS shared_with
    FROM password_reset_request AS reset
    INNER JOIN user_devices AS ud ON reset.device_id=ud.id
    INNER JOIN users AS u ON ud.user_id=u.id
    INNER JOIN groups ON u.group_id=groups.id
    WHERE reset.status='PENDING_ADMIN_CHECK'
    ${asSuperadmin ? '' : 'AND reset.group_id=$1'}
    ORDER BY ud.created_at DESC
    `,
      asSuperadmin ? [] : [req.proxyParamsGroupId],
    );
    res.status(200).send(userDevicesRequest.rows);
  } catch (e) {
    logError(e);
    res.status(400).end();
  }
};
