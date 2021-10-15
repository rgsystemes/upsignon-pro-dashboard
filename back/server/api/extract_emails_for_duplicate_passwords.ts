import { db } from '../helpers/connection';

export const extract_emails_for_duplicate_passwords = async (req: any, res: any): Promise<void> => {
  try {
    const nb = parseInt(req.query.minDuplicates, 10) || 1;
    const dbRes = await db.query(
      `SELECT email FROM users AS u
    WHERE (SELECT nb_accounts_with_duplicate_password FROM data_stats AS ds WHERE ds.user_id=u.id ORDER BY date DESC LIMIT 1) >= $1
  `,
      [nb],
    );
    res.status(200).send(dbRes.rows.map((u) => u.email));
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};
