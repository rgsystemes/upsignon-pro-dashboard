import { db } from '../helpers/connection';
import { getDaysArray } from '../helpers/dateArray';

export const get_usage_stats = async (req: any, res: any): Promise<void> => {
  try {
    const rawStats = await db.query(
      "SELECT SUM(1) AS nb_users, date_trunc('day', created_at) as day  FROM users GROUP BY day ORDER BY day ASC",
    );

    // Then get the continuous list of days
    const days = getDaysArray(rawStats.rows[0].day, new Date().toISOString());

    let lastStatIndex = 0;
    let lastNbUsers = 0;
    const usageStats = days.map((d) => {
      const row = rawStats.rows[lastStatIndex];
      if (row && row.day.toISOString() === d) {
        lastNbUsers += parseInt(row.nb_users, 10);
        lastStatIndex++;
      }
      return { day: d, nbUsers: lastNbUsers };
    });

    res.status(200).send(usageStats);
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};
