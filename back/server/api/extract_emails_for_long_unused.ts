import { db } from '../helpers/connection';

export const extract_emails_for_long_unused = async (req: any, res: any): Promise<void> => {
  try {
    const nbDays = parseInt(req.query.days) || 15;
    const dbRes = await db.query(`
    SELECT
      email,
      (SELECT date FROM usage_logs AS ul INNER JOIN user_devices AS ud ON ud.id=ul.device_id WHERE ud.user_id=u.id AND log_type='SESSION' ORDER BY date DESC LIMIT 1) AS last_session
    FROM users AS u
  `);
    res
      .status(200)
      .send(
        dbRes.rows.filter(
          (u: { email: string; last_session: number }) =>
            new Date(u.last_session).getTime() < Date.now() - nbDays * 24 * 3600 * 1000,
        ),
      );
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};
