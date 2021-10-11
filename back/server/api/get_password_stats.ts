import { db } from '../helpers/connection';

export const get_password_stats = async (req: any, res: any): Promise<void> => {
  try {
    const dbRes = await db.query(
      `SELECT
        SUM(nb_weak) AS nb_weak,
        SUM(nb_medium) AS nb_medium,
        SUM(nb_strong) AS nb_strong,
        SUM(nb_duplicates) AS nb_duplicates
      FROM (
        SELECT
          (SELECT nb_accounts_weak FROM data_stats WHERE user_id=u.id ORDER BY date DESC LIMIT 1) AS nb_weak,
          (SELECT nb_accounts_medium FROM data_stats WHERE user_id=u.id ORDER BY date DESC LIMIT 1) AS nb_medium,
          (SELECT nb_accounts_strong FROM data_stats WHERE user_id=u.id ORDER BY date DESC LIMIT 1) AS nb_strong,
          (SELECT nb_accounts_with_duplicate_password FROM data_stats WHERE user_id=u.id ORDER BY date DESC LIMIT 1) AS nb_duplicates
        FROM users AS u
      ) AS stats`,
    );
    res.status(200).send(dbRes.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};
