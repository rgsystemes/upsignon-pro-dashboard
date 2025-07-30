import { getDaysArray } from '../helpers/dateArray';
import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const get_password_stats = async (
  req: any,
  res: any,
  asSuperadmin: boolean,
): Promise<void> => {
  // We make the hypothesis that if there is a stat for one user / shared vault for one day,
  // then for that day, all the stats would have been computed too.
  // Trying to fill in missing values ends up in showing values that do not go down when a use or shared vault is removed
  try {
    let rawStats: any = null;
    if (!asSuperadmin) {
      rawStats = await db.query(
        `SELECT
        date_trunc('day', date) as day,
        nb_accounts,
        nb_codes,
        nb_accounts_strong,
        nb_accounts_medium,
        nb_accounts_weak,
        nb_accounts_with_no_password,
        nb_accounts_with_duplicated_password,
        nb_accounts_red,
        nb_accounts_orange,
        nb_accounts_green
        FROM pwd_stats_evolution WHERE bank_id=$1 ORDER BY day ASC`,
        [req.proxyParamsBankId],
      );
    } else {
      rawStats = await db.query(
        `SELECT
        date_trunc('day', date) as day,
        SUM(nb_accounts) AS nb_accounts,
        SUM(nb_codes) AS nb_codes,
        SUM(nb_accounts_strong) AS nb_accounts_strong,
        SUM(nb_accounts_medium) AS nb_accounts_medium,
        SUM(nb_accounts_weak) AS nb_accounts_weak,
        SUM(nb_accounts_with_no_password) AS nb_accounts_with_no_password,
        SUM(nb_accounts_with_duplicated_password) AS nb_accounts_with_duplicated_password,
        SUM(nb_accounts_red) AS nb_accounts_red,
        SUM(nb_accounts_orange) AS nb_accounts_orange,
        SUM(nb_accounts_green) AS nb_accounts_green
        FROM pwd_stats_evolution GROUP BY day ORDER BY day ASC`,
      );
    }

    if (rawStats.rowCount === 0) {
      return res.status(204).end();
    }

    // Then get the continuous list of days to make sure the graph shows one point per day (otherwise the graph will be shrinked)
    const days = getDaysArray(rawStats.rows[0].day);

    let lastStatIndex = 0;
    let lastValueUsed = {
      day: rawStats.rows[0].day,
      nbAccounts: 0,
      nbCodes: 0,
      nbAccountsStrong: 0,
      nbAccountsMedium: 0,
      nbAccountsWeak: 0,
      nbAccountsWithNoPassword: 0,
      nbDuplicatePasswords: 0,
      nbAccountsGreen: 0,
      nbAccountsOrange: 0,
      nbAccountsRed: 0,
    };
    const graph = days.map((d) => {
      const row = rawStats.rows[lastStatIndex];
      if (row && row.day.toISOString().split('T')[0] === d) {
        lastValueUsed = {
          day: row.day,
          nbAccounts: row.nb_accounts,
          nbCodes: row.nb_codes,
          nbAccountsStrong: row.nb_accounts_strong,
          nbAccountsMedium: row.nb_accounts_medium,
          nbAccountsWeak: row.nb_accounts_weak,
          nbAccountsWithNoPassword: row.nb_accounts_with_no_password,
          nbDuplicatePasswords: row.nb_accounts_with_duplicated_password,
          nbAccountsGreen: row.nb_accounts_green,
          nbAccountsOrange: row.nb_accounts_orange,
          nbAccountsRed: row.nb_accounts_red,
        };
        lastStatIndex++;
      }
      return lastValueUsed;
    });

    res.status(200).send(graph);
  } catch (e) {
    logError('get_password_stats', e);
    res.status(400).end();
  }
};
