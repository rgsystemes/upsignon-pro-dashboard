import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const extract_emails_for_duplicate_passwords = async (
  req: any,
  res: any,
  isSuperadmin: boolean,
): Promise<void> => {
  try {
    const nb = parseInt(req.query.minDuplicates, 10) || 1;
    const dbRes = await db.query(
      `SELECT email FROM users WHERE nb_accounts_with_duplicated_password >= $1 ${isSuperadmin ? '' : 'AND group_id=$2'}`,
      isSuperadmin ? [nb] : [nb, req.proxyParamsGroupId],
    );
    res.status(200).send(dbRes.rows.map((u) => u.email));
  } catch (e) {
    logError('extract_emails_for_duplicate_passwords', e);
    res.status(400).end();
  }
};
