import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const extract_database = async (
  req: any,
  res: any,
  isSuperadmin: boolean,
): Promise<void> => {
  try {
    const queryString = `
    SELECT
      u.email,
      ${isSuperadmin ? 'g.name AS bank_name,' : ''}
      ud.device_unique_id AS device_uid,
      ud.device_name AS device_name,
      ud.authorization_status AS authorization_status,
      ud.device_type AS device_type,
      ud.os_family AS os_family,
      ud.os_version AS os_version,
      ud.app_version AS app_version,
      ud.install_type AS install_type,
      ud.last_sync_date AS last_sync_date,
      length(u.encrypted_data_2) AS data2_length,
      u.updated_at AS updated_at,
      (SELECT COUNT(ud.id) FROM user_devices AS ud WHERE ud.user_id=u.id) AS nb_devices,
      (SELECT COUNT(*) FROM shared_vault_recipients AS sau WHERE sau.user_id=u.id) AS nb_shared_vaults,
      u.nb_codes AS nb_codes,
      u.nb_accounts AS nb_accounts,
      u.nb_accounts_weak AS nb_accounts_weak,
      u.nb_accounts_medium AS nb_accounts_medium,
      u.nb_accounts_strong AS nb_accounts_strong,
      u.nb_accounts_red AS nb_accounts_red,
      u.nb_accounts_orange AS nb_accounts_orange,
      u.nb_accounts_green AS nb_accounts_green,
      u.nb_accounts_with_duplicated_password AS nb_accounts_with_duplicated_password,
      u.nb_accounts_with_no_password AS nb_accounts_with_no_password
    FROM users AS u
    INNER JOIN user_devices AS ud ON ud.user_id=u.id
    ${isSuperadmin ? 'INNER JOIN groups AS g ON u.group_id=g.id' : ''}
    ${isSuperadmin ? '' : 'WHERE u.group_id=$1'}
    ORDER BY u.email ASC, ud.created_at DESC
  `;
    console.log(queryString);
    const dbRes = await db.query(queryString, isSuperadmin ? [] : [req.proxyParamsGroupId]);

    let csvContent = '';
    if (dbRes.rowCount && dbRes.rowCount > 0) {
      csvContent += Object.keys(dbRes.rows[0]).join(';') + '\n';
      csvContent += dbRes.rows.map((r) => Object.values(r).join(';')).join('\n');
    }
    res.header('Content-Type', 'text/csv');
    const d = new Date().toISOString().split('T')[0];
    res.attachment(`upsignon-pro-stats-${d}.csv`);
    res.send(csvContent);
  } catch (e) {
    logError('extract_database', e);
    res.status(400).end();
  }
};
