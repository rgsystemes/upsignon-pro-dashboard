import { db } from '../helpers/connection';
import { logError } from '../helpers/logger';

export const extract_emails_for_long_unused = async (req: any, res: any): Promise<void> => {
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
          WHERE ud.user_id=u.id AND log_type='SESSION' ORDER BY date DESC LIMIT 1) > interval '${nbDays} days'
        AND u.group_id=$1
      `,
      [req.proxyParamsGroupId],
    );
    res.status(200).send(dbRes.rows.map((u) => u.email));
  } catch (e) {
    logError(e);
    res.status(400).end();
  }
};
