import { db } from '../helpers/connection';

export const extract_emails_for_duplicate_passwords = async (req: any, res: any): Promise<void> => {
  try {
    const dbRes = await db.query(`
    SELECT
      email,
      (SELECT nb_accounts_with_duplicate_password FROM data_stats AS ds WHERE ds.user_id=u.id ORDER BY date DESC LIMIT 1) AS nb_accounts_with_duplicate_password
    FROM users AS u
  `);
    res
      .status(200)
      .send(
        dbRes.rows.filter(
          (u: { email: string; nb_accounts_with_duplicate_password: number }) =>
            u.nb_accounts_with_duplicate_password > 0,
        ),
      );
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};
