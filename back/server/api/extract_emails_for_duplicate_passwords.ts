import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const extract_emails_for_duplicate_passwords = async (req: any, res: any, isSuperadmin: boolean): Promise<void> => {
  try {
    const nb = parseInt(req.query.minDuplicates, 10) || 1;
    const dbRes = await db.query(
      `SELECT email FROM users AS u WHERE (SELECT nb_accounts_with_duplicated_password FROM data_stats AS ds WHERE ds.user_id=u.id ORDER BY date DESC LIMIT 1) >= $1 ${isSuperadmin ? '':'AND u.group_id=$2'}`,
      isSuperadmin ? [nb]: [nb, req.proxyParamsGroupId],
    );
    res.status(200).send(dbRes.rows.map((u) => u.email));
  } catch (e) {
    logError(e);
    res.status(400).end();
  }
};
