import { db } from '../helpers/db';
import { getDaysArray } from '../helpers/dateArray';
import { logError } from '../helpers/logger';

export const get_password_stats = async (
  req: any,
  res: any,
  asSuperadmin: boolean,
): Promise<void> => {
  try {
    let rawStats: any = null;
    if (!asSuperadmin) {
      rawStats = await db.query(
        "SELECT user_id, shared_vault_id, date_trunc('day', date) as day, nb_accounts, nb_codes, nb_accounts_strong, nb_accounts_medium, nb_accounts_weak, nb_accounts_with_no_password, nb_accounts_with_duplicated_password, nb_accounts_red, nb_accounts_orange, nb_accounts_green FROM data_stats WHERE group_id=$1 ORDER BY day ASC",
        [req.proxyParamsGroupId],
      );
    } else {
      rawStats = await db.query(
        "SELECT user_id, shared_vault_id, date_trunc('day', date) as day, nb_accounts, nb_codes, nb_accounts_strong, nb_accounts_medium, nb_accounts_weak, nb_accounts_with_no_password, nb_accounts_with_duplicated_password, nb_accounts_red, nb_accounts_orange, nb_accounts_green FROM data_stats ORDER BY day ASC",
      );
    }

    if (rawStats.rowCount === 0) {
      return res.status(400).end();
    }

    /*
     * First get chartDataPerVaultPerDay = {
     *  [userId]: {
     *    [day]: stats
     *  }
     * }
     */
    const chartDataPerVaultPerDay: any = {};
    rawStats.rows.forEach((r: any) => {
      if(r.user_id) {
        if (!chartDataPerVaultPerDay['v'+r.user_id]) {
          chartDataPerVaultPerDay['v'+r.user_id] = {};
        }
        chartDataPerVaultPerDay['v'+r.user_id][r.day.toISOString()] = r;
      } else {
        if (!chartDataPerVaultPerDay['sv'+r.shared_vault_id]) {
          chartDataPerVaultPerDay['sv'+r.shared_vault_id] = {};
        }
        chartDataPerVaultPerDay['sv'+r.shared_vault_id][r.day.toISOString()] = r;

      }
    });

    // Then get the continuous list of days
    const days = getDaysArray(rawStats.rows[0].day, new Date().toISOString()).map((d) => d);

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
        nbAccountsWithNoPassword: 0,
        nbDuplicatePasswords: 0,
        nbAccountsGreen: 0,
        nbAccountsOrange: 0,
        nbAccountsRed: 0,
      };
    });

    // Then map each day to its stats
    const vaultList = Object.keys(chartDataPerVaultPerDay);
    vaultList.forEach((u) => {
      let lastKnownStats: any = null;
      const userStats = chartDataPerVaultPerDay[u];
      days.forEach((d) => {
        if (userStats[d]) {
          lastKnownStats = userStats[d];
        }
        chartDataObjet[d].nbCodes += lastKnownStats?.nb_codes || 0;
        chartDataObjet[d].nbAccountsStrong += lastKnownStats?.nb_accounts_strong || 0;
        chartDataObjet[d].nbAccountsMedium += lastKnownStats?.nb_accounts_medium || 0;
        chartDataObjet[d].nbAccountsWeak += lastKnownStats?.nb_accounts_weak || 0;
        chartDataObjet[d].nbAccountsWithNoPassword +=
          lastKnownStats?.nb_accounts_with_no_password || 0;
        chartDataObjet[d].nbAccounts += lastKnownStats?.nb_accounts || 0;
        chartDataObjet[d].nbDuplicatePasswords +=
          lastKnownStats?.nb_accounts_with_duplicated_password || 0;
        chartDataObjet[d].nbAccountsGreen += lastKnownStats?.nb_accounts_green || 0;
        chartDataObjet[d].nbAccountsOrange += lastKnownStats?.nb_accounts_orange || 0;
        chartDataObjet[d].nbAccountsRed += lastKnownStats?.nb_accounts_red || 0;
      });
    });

    const result = Object.values(chartDataObjet);
    res.status(200).send(result);
  } catch (e) {
    logError(e);
    res.status(400).end();
  }
};
