import { db } from '../helpers/connection';
import { logError } from '../helpers/logger';

export const get_users = async (req: any, res: any): Promise<void> => {
  try {
    let search = req.query.search;
    if (!!search && typeof search !== 'string') return res.status(401).end();
    search = search?.toLowerCase();
    const isSearching = !!search;

    // COUNT USERS
    let userCount;
    if (isSearching) {
      const countUsersReq = await db.query('SELECT COUNT(id) FROM users WHERE email LIKE $1', [
        search + '%',
      ]);
      userCount = parseInt(countUsersReq.rows[0].count, 10);
    } else {
      const countUsersReq = await db.query('SELECT COUNT(id) FROM users');
      userCount = parseInt(countUsersReq.rows[0].count, 10);
    }

    // GET USERS
    const pageIndex = parseInt(req.query.pageIndex, 10) || 1;
    let pageOffset = pageIndex - 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    if (pageOffset * limit >= userCount) pageOffset = 0;

    const queryInputs: string[] = [limit.toString(), (pageOffset * limit).toString()];
    if (isSearching) {
      queryInputs.push(search + '%');
    }

    const usersRequest = await db.query(
      `SELECT
      u.id AS user_id,
      u.email AS email,
      length(u.encrypted_data) AS data_length,
      u.updated_at AS updated_at,
      (SELECT COUNT(id) FROM user_devices AS ud WHERE ud.user_id=u.id) AS nb_devices,
      (SELECT COUNT(id) FROM shared_account_users AS sau WHERE sau.user_id=u.id) AS nb_shared_items,
      (SELECT nb_codes FROM data_stats AS ds WHERE ds.user_id=u.id ORDER BY date DESC LIMIT 1) AS nb_codes,
      (SELECT nb_accounts FROM data_stats AS ds WHERE ds.user_id=u.id ORDER BY date DESC LIMIT 1) AS nb_accounts,
      (SELECT nb_accounts_weak  FROM data_stats AS ds WHERE ds.user_id=u.id ORDER BY date DESC LIMIT 1) AS nb_accounts_weak,
      (SELECT nb_accounts_medium  FROM data_stats AS ds WHERE ds.user_id=u.id ORDER BY date DESC LIMIT 1) AS nb_accounts_medium,
      (SELECT nb_accounts_strong  FROM data_stats AS ds WHERE ds.user_id=u.id ORDER BY date DESC LIMIT 1) AS nb_accounts_strong,
      (SELECT nb_accounts_red  FROM data_stats AS ds WHERE ds.user_id=u.id ORDER BY date DESC LIMIT 1) AS nb_accounts_red,
      (SELECT nb_accounts_orange  FROM data_stats AS ds WHERE ds.user_id=u.id ORDER BY date DESC LIMIT 1) AS nb_accounts_orange,
      (SELECT nb_accounts_green  FROM data_stats AS ds WHERE ds.user_id=u.id ORDER BY date DESC LIMIT 1) AS nb_accounts_green,
      (SELECT nb_accounts_with_duplicate_password FROM data_stats AS ds WHERE ds.user_id=u.id ORDER BY date DESC LIMIT 1) AS nb_accounts_with_duplicate_password
    FROM users AS u
    ${isSearching ? 'WHERE u.email LIKE $3' : ''}
    ORDER BY nb_accounts_with_duplicate_password DESC, nb_accounts_weak DESC, nb_accounts_medium DESC, u.email ASC
    LIMIT $1
    OFFSET $2
    `,
      queryInputs,
    );
    const users = usersRequest.rows.map((u) => ({
      ...u,
      nb_devices: parseInt(u.nb_devices, 10),
      nb_shared_items: parseInt(u.nb_shared_items, 10),
    }));

    res.status(200).send({ users, userCount });
  } catch (e) {
    logError(e);
    res.status(400).end();
  }
};
