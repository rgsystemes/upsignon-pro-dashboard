import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const extract_emails_msi_install = async (
  req: any,
  res: any,
  isSuperadmin: boolean,
): Promise<void> => {
  try {
    const dbRes = await db.query(
      `SELECT email FROM users AS u
        INNER JOIN user_devices AS ud ON ud.user_id=u.id
        WHERE ud.install_type='msi'
        ${isSuperadmin ? '' : 'AND u.group_id=$1'}
      `,
      isSuperadmin ? [] : [req.proxyParamsGroupId],
    );
    res.status(200).send(dbRes.rows.map((u) => u.email));
  } catch (e) {
    logError('extract_emails_msi_install', e);
    res.status(400).end();
  }
};
