import { db } from '../helpers/db';
import { getDaysArray } from '../helpers/dateArray';
import { logError } from '../helpers/logger';

export const get_usage_stats = async (req: any, res: any, asSuperadmin: boolean): Promise<void> => {
  try {
    let rawStats: any = null;
    if (!asSuperadmin) {
      rawStats = await db.query(
        "SELECT SUM(1) AS nb_users, date_trunc('day', created_at) as day  FROM users WHERE bank_id=$1 GROUP BY day ORDER BY day ASC",
        [req.proxyParamsBankId],
      );
    } else {
      rawStats = await db.query(
        "SELECT SUM(1) AS nb_users, date_trunc('day', created_at) as day  FROM users GROUP BY day ORDER BY day ASC",
      );
    }

    if (rawStats.rowCount === 0) return res.status(200).send([]);

    // Then get the continuous list of days
    const days = getDaysArray(rawStats.rows[0].day);

    let lastStatIndex = 0;
    let lastNbUsers = 0;
    const usageStats = days.map((d) => {
      const row = rawStats.rows[lastStatIndex];
      if (row && row.day.toISOString().split('T')[0] === d) {
        lastNbUsers += parseInt(row.nb_users, 10);
        lastStatIndex++;
      }
      return { day: d, nbUsers: lastNbUsers };
    });

    res.status(200).send(usageStats);
  } catch (e) {
    logError('get_usage_stats', e);
    res.status(400).end();
  }
};
