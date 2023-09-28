import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const extract_emails_for_windows_below_6_0_4 = async (
  req: any,
  res: any,
  isSuperadmin: boolean,
): Promise<void> => {
  try {
    const dbRes = await db.query(
      `SELECT DISTINCT(email) FROM users AS u
        INNER JOIN user_devices AS ud ON ud.user_id=u.id
        WHERE
          ud.authorization_status = 'AUTHORIZED'
          AND ud.device_type='Windows.Desktop'
          AND ud.app_version != '6.0.2'
          AND ud.app_version != '6.0.4'
        ${isSuperadmin ? '' : 'AND u.group_id=$2'}
      `,
      isSuperadmin ? [] : [req.proxyParamsGroupId],
    );
    res.status(200).send(dbRes.rows.map((u) => u.email));
  } catch (e) {
    logError("extract_emails_for_windows_below_6_0_4", e);
    res.status(400).end();
  }
};
