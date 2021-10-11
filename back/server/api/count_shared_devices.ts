import { db } from '../helpers/connection';

export const count_shared_devices = async (req: any, res: any): Promise<void> => {
  try {
    const dbRes = await db.query(`
    SELECT
      COUNT(DISTINCT ud.device_unique_id) as count
    FROM user_devices AS ud
    WHERE (SELECT COUNT(id) FROM user_devices WHERE device_unique_id=ud.device_unique_id)>1
  `);
    res.status(200).send(dbRes.rows[0].count);
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};
