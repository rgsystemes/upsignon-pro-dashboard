import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const extract_emails_for_long_unused = async (
  req: any,
  res: any,
  isSuperadmin: boolean,
): Promise<void> => {
  try {
    let nbDays = parseInt(req.query.unusedDays, 10);
    // SECURITY CHECK
    if (nbDays != req.query.unusedDays) {
      // THAT'S IMPORTANT
      nbDays = 15;
    }
    const dbRes = await db.query(
      `SELECT email FROM users AS u
        WHERE (SELECT AGE(date)
          FROM usage_logs AS ul
          INNER JOIN user_devices AS ud ON ud.id=ul.device_id
          WHERE ud.user_id=u.id AND log_type='SESSION' AND ul.group_id=1 ORDER BY date DESC LIMIT 1) > interval '$1 days'
        ${isSuperadmin ? '' : 'AND u.group_id=$2'}
      `,
      isSuperadmin ? [nbDays] : [nbDays, req.proxyParamsGroupId],
    );
    res.status(200).send(dbRes.rows.map((u) => u.email));
  } catch (e) {
    logError("extract_emails_for_long_unused", e);
    res.status(400).end();
  }
};
