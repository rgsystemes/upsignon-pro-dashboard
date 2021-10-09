import { db } from '../helpers/connection';

export const get_shared_devices = async (req: any, res: any): Promise<void> => {
  try {
    const dbRes = await db.query(`
    SELECT
      ud.device_unique_id AS unique_id,
      ud.device_name AS name,
      ud.authorization_status AS authorization_status,
      ud.device_type AS type,
      ud.revocation_date AS revocation_date,
      ud.created_at AS created_at,
      u.email AS email,
      (SELECT date FROM usage_logs WHERE device_id=ud.id ORDER BY date DESC LIMIT 1) AS last_session
      FROM user_devices AS ud
      INNER JOIN users AS u ON u.id=ud.user_id
      INNER JOIN user_devices AS udbis ON ud.device_unique_id=udbis.device_unique_id AND ud.id!=udbis.id
  `);
    res.status(200).send(dbRes.rows);
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};
