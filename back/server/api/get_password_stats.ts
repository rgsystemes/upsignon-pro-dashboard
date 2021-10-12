import { db } from '../helpers/connection';

const getDaysArray = (startDay: string, endDay: string): string[] => {
  const current = new Date(startDay);
  const end = new Date(endDay);
  const res = [current.toLocaleDateString()];
  while (current.getTime() < end.getTime()) {
    current.setDate(current.getDate() + 1);
    res.push(current.toLocaleDateString());
  }
  return res;
};

export const get_password_stats = async (req: any, res: any): Promise<void> => {
  try {
    // const dbRes = await db.query(
    //   `SELECT
    //     SUM(nb_weak) AS nb_weak,
    //     SUM(nb_medium) AS nb_medium,
    //     SUM(nb_strong) AS nb_strong,
    //     SUM(nb_duplicates) AS nb_duplicates
    //   FROM (
    //     SELECT
    //       (SELECT nb_accounts_weak FROM data_stats WHERE user_id=u.id ORDER BY date DESC LIMIT 1) AS nb_weak,
    //       (SELECT nb_accounts_medium FROM data_stats WHERE user_id=u.id ORDER BY date DESC LIMIT 1) AS nb_medium,
    //       (SELECT nb_accounts_strong FROM data_stats WHERE user_id=u.id ORDER BY date DESC LIMIT 1) AS nb_strong,
    //       (SELECT nb_accounts_with_duplicate_password FROM data_stats WHERE user_id=u.id ORDER BY date DESC LIMIT 1) AS nb_duplicates
    //     FROM users AS u
    //   ) AS stats`,
    // );
    // Clean data_stats to make there is at most one line per user per day
    await db.query(
      "DELETE FROM data_stats as ds1 USING data_stats as ds2 WHERE ds1.user_id=ds2.user_id AND date_trunc('day',ds1.date)=date_trunc('day', ds2.date) AND ds1.date<ds2.date;",
    );
    const rawStats = await db.query(
      "SELECT user_id, date_trunc('day', date) as day, nb_accounts, nb_codes, nb_accounts_strong, nb_accounts_medium, nb_accounts_weak, nb_accounts_with_duplicate_password FROM data_stats ORDER BY day ASC",
    );

    /*
     * First get chartDataPerUserPerDay = {
     *  [userId]: {
     *    [day]: stats
     *  }
     * }
     */
    const chartDataPerUserPerDay: any = {};
    rawStats.rows.forEach((r) => {
      if (!chartDataPerUserPerDay[r.userId]) {
        chartDataPerUserPerDay[r.userId] = {};
      }
      chartDataPerUserPerDay[r.userId][new Date(r.day).toLocaleDateString()] = r;
    });

    // Then get the continuous list of days
    const days = getDaysArray(rawStats.rows[0].day, rawStats.rows[rawStats.rowCount - 1].day);

    // Init chart data object
    const chartDataObjet: any = {};
    days.forEach((d) => {
      chartDataObjet[d] = {
        day: d,
        nbAccounts: 0,
        nbCodes: 0,
        nbAccountsStrong: 0,
        nbAccountsMedium: 0,
        nbAccountsWeak: 0,
        nbDuplicatePasswords: 0,
      };
    });

    // Then map each day to its stats
    const userList = Object.keys(chartDataPerUserPerDay);
    userList.forEach((u) => {
      let lastKnownStats: any = null;
      const userStats = chartDataPerUserPerDay[u];
      days.forEach((d) => {
        if (userStats[d]) {
          lastKnownStats = userStats[d];
        }
        chartDataObjet[d].nbAccounts += lastKnownStats?.nb_accounts || 0;
        chartDataObjet[d].nbCodes += lastKnownStats?.nb_codes || 0;
        chartDataObjet[d].nbAccountsStrong += lastKnownStats?.nb_accounts_strong || 0;
        chartDataObjet[d].nbAccountsMedium += lastKnownStats?.nb_accounts_medium || 0;
        chartDataObjet[d].nbAccountsWeak += lastKnownStats?.nb_accounts_weak || 0;
        chartDataObjet[d].nbDuplicatePasswords += lastKnownStats?.nb_accounts_duplicates || 0;
      });
    });

    const result = Object.values(chartDataObjet);
    res.status(200).send(result);
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};
