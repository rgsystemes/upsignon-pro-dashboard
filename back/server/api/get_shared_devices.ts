import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const get_shared_devices = async (req: any, res: any): Promise<void> => {
  try {
    const dbRes = await db.query(
      `
    SELECT
      ud.device_unique_id AS unique_id,
      ud.device_name AS name,
      ud.authorization_status AS authorization_status,
      ud.device_type AS type,
      ud.revocation_date AS revocation_date,
      ud.created_at AS created_at,
      u.email AS email,
      ud.last_sync_date AS last_session
    FROM user_devices AS ud
      INNER JOIN users AS u ON u.id=ud.user_id
    WHERE (SELECT COUNT(id) FROM user_devices WHERE device_unique_id=ud.device_unique_id)>1
    AND ud.group_id=$1
    ORDER BY ud.device_unique_id
  `,
      [req.proxyParamsGroupId],
    );
    res.status(200).send(dbRes.rows);
  } catch (e) {
    logError('get_shared_devices', e);
    res.status(400).end();
  }
};
