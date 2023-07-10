import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const extract_emails_for_duplicate_passwords = async (req: any, res: any): Promise<void> => {
  try {
    const nb = parseInt(req.query.minDuplicates, 10) || 1;
    const dbRes = await db.query(
      `SELECT email FROM users AS u WHERE u.nb_accounts_with_duplicate_password >= $1 AND u.group_id=$2`,
      [nb, req.proxyParamsGroupId],
    );
    res.status(200).send(dbRes.rows.map((u) => u.email));
  } catch (e) {
    logError(e);
    res.status(400).end();
  }
};
