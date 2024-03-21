import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const extract_emails_not_migrated_users = async (
  req: any,
  res: any,
  isSuperadmin: boolean,
): Promise<void> => {
  try {
    const dbRes = await db.query(
      `SELECT email FROM users AS u
        WHERE u.encrypted_data_2 IS NULL
        ${isSuperadmin ? '' : 'AND u.group_id=$1'}
      `,
      isSuperadmin ? [] : [req.proxyParamsGroupId],
    );
    res.status(200).send(dbRes.rows.map((u) => u.email));
  } catch (e) {
    logError('extract_emails_not_migrated_users', e);
    res.status(400).end();
  }
};
