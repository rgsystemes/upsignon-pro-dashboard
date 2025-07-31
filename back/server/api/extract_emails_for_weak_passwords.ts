import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const extract_emails_for_weak_passwords = async (
  req: any,
  res: any,
  isSuperadminPage: boolean,
): Promise<void> => {
  try {
    const nb = parseInt(req.query.minWeak, 10) || 1;
    const dbRes = await db.query(
      `SELECT email FROM users WHERE nb_accounts_weak >= $1 ${
        isSuperadminPage ? '' : 'AND bank_id=$2'
      }`,
      isSuperadminPage ? [nb] : [nb, req.proxyParamsBankId],
    );
    res.status(200).send(dbRes.rows.map((u) => u.email));
  } catch (e) {
    logError('extract_emails_for_weak_passwords', e);
    res.status(400).end();
  }
};
