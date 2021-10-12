import { db } from '../helpers/connection';

export const extract_database = async (req: any, res: any): Promise<void> => {
  try {
    const dbRes = await db.query(`
    SELECT
      u.email,
      ud.device_unique_id AS device_uid,
      ud.device_name AS device_name,
      ud.authorization_status AS authorization_status,
      ud.device_type AS device_type,
      ud.os_version AS os_version,
      ud.app_version AS app_version,
      (SELECT date FROM usage_logs WHERE log_type='SESSION' AND device_id=ud.id ORDER BY date DESC LIMIT 1) AS last_session,
      length(u.encrypted_data) AS data_length,
      u.updated_at AS updated_at,
      (SELECT COUNT(id) FROM user_devices AS ud WHERE ud.user_id=u.id) AS nb_devices,
      (SELECT COUNT(id) FROM shared_account_users AS sau WHERE sau.user_id=u.id) AS nb_shared_items,
      (SELECT nb_codes FROM data_stats AS ds WHERE ds.user_id=u.id ORDER BY date DESC LIMIT 1) AS nb_codes,
      (SELECT nb_accounts FROM data_stats AS ds WHERE ds.user_id=u.id ORDER BY date DESC LIMIT 1) AS nb_accounts,
      (SELECT nb_accounts_weak  FROM data_stats AS ds WHERE ds.user_id=u.id ORDER BY date DESC LIMIT 1) AS nb_accounts_weak,
      (SELECT nb_accounts_medium  FROM data_stats AS ds WHERE ds.user_id=u.id ORDER BY date DESC LIMIT 1) AS nb_accounts_medium,
      (SELECT nb_accounts_strong  FROM data_stats AS ds WHERE ds.user_id=u.id ORDER BY date DESC LIMIT 1) AS nb_accounts_strong,
      (SELECT nb_accounts_with_duplicate_password FROM data_stats AS ds WHERE ds.user_id=u.id ORDER BY date DESC LIMIT 1) AS nb_accounts_with_duplicate_password
    FROM users AS u
    INNER JOIN user_devices AS ud ON ud.user_id=u.id
  `);

    let csvContent = '';
    if (dbRes.rowCount > 0) {
      csvContent += Object.keys(dbRes.rows[0]).join(';') + '\n';
      csvContent += dbRes.rows.map((r) => Object.values(r).join(';')).join('\n');
    }
    res.header('Content-Type', 'text/csv');
    res.attachment('upsignon-pro-stats.csv');
    res.send(csvContent);
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};
