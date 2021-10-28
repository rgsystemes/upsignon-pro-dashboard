import { db } from '../helpers/connection';
import { logError } from '../helpers/logger';

export const extract_emails_for_shared_device = async (req: any, res: any): Promise<void> => {
  try {
    const dbRes = await db.query(
      `
    SELECT
      email
    FROM user_devices AS ud
    INNER JOIN users ON ud.user_id=users.id
    WHERE (SELECT COUNT(id) FROM user_devices WHERE device_unique_id=ud.device_unique_id)>1
    AND ud.group_id=$1
  `,
      [req.session.groupId],
    );
    res.status(200).send(dbRes.rows.map((u) => u.email));
  } catch (e) {
    logError(e);
    res.status(400).end();
  }
};
