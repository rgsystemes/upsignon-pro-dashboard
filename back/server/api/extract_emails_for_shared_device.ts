import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const extract_emails_for_shared_device = async (
  req: any,
  res: any,
  isSuperadmin: boolean,
): Promise<void> => {
  try {
    const dbRes = await db.query(
      `
    SELECT
      email
    FROM user_devices AS ud
    INNER JOIN users ON ud.user_id=users.id
    WHERE (SELECT COUNT(id) FROM user_devices WHERE device_unique_id=ud.device_unique_id)>1
    ${isSuperadmin ? '' : 'AND ud.group_id=$1'}
  `,
      isSuperadmin ? [] : [req.proxyParamsGroupId],
    );
    res.status(200).send(dbRes.rows.map((u) => u.email));
  } catch (e) {
    logError("extract_emails_for_shared_device", e);
    res.status(400).end();
  }
};
