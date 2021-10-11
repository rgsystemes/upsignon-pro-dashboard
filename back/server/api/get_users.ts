import { db } from '../helpers/connection';

export const get_users = async (req: any, res: any): Promise<void> => {
  try {
    const search = req.query.search;
    const isSearching = !!search;

    // COUNT USERS
    let userCount;
    if (isSearching) {
      const countUsersReq = await db.query('SELECT COUNT(id) FROM users WHERE email LIKE $1', [
        search + '%',
      ]);
      userCount = parseInt(countUsersReq.rows[0].count);
    } else {
      const countUsersReq = await db.query('SELECT COUNT(id) FROM users');
      userCount = parseInt(countUsersReq.rows[0].count);
    }

    // GET USERS
    const pageIndex = parseInt(req.query.pageIndex) || 1;
    let pageOffset = pageIndex - 1;
    const limit = parseInt(req.query.limit) || 50;
    if (pageOffset * limit >= userCount) pageOffset = 0;

    const queryInputs: string[] = [limit.toString(), (pageOffset * limit).toString()];
    if (isSearching) {
      queryInputs.push(search + '%');
    }

    const usersRequest = await db.query(
      `
    SELECT
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
      (SELECT nb_accounts_with_duplicate_password FROM data_stats AS ds WHERE ds.user_id=u.id ORDER BY date DESC LIMIT 1) AS nb_accounts_with_duplicate_password
    FROM users AS u
    ${isSearching ? 'WHERE u.email LIKE $3' : ''}
    ORDER BY u.email
    LIMIT $1
    OFFSET $2
    `,
      queryInputs,
    );
    const users = usersRequest.rows.map((u) => ({
      ...u,
      nb_devices: parseInt(u.nb_devices),
      nb_shared_items: parseInt(u.nb_shared_items),
    }));

    res.status(200).send({ users, userCount });
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};
