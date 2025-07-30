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
        WHERE (SELECT AGE(last_sync_date)
          FROM user_devices AS ud
          WHERE ud.user_id=u.id ORDER BY last_sync_date DESC NULLS LAST LIMIT 1) > interval '$1 days'
        ${isSuperadmin ? '' : 'AND u.bank_id=$2'}
      `,
      isSuperadmin ? [nbDays] : [nbDays, req.proxyParamsBankId],
    );
    res.status(200).send(dbRes.rows.map((u) => u.email));
  } catch (e) {
    logError('extract_emails_for_long_unused', e);
    res.status(400).end();
  }
};
