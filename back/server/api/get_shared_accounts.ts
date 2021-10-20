import { db } from '../helpers/connection';
import { logError } from '../helpers/logger';

export const get_shared_accounts = async (req: any, res: any): Promise<void> => {
  try {
    let search = req.query.search;
    if (!!search && typeof search !== 'string') return res.status(401).end();
    search = search?.toLowerCase();
    const isSearching = !!search;

    // COUNT SHARED ACCOUNTS
    let sharedAccountsCount;
    if (isSearching) {
      const countReq = await db.query(
        `SELECT COUNT(sa.id)
      FROM shared_accounts AS sa
      LEFT JOIN shared_account_users AS sau ON sau.shared_account_id=sa.id
      LEFT JOIN users AS u ON sau.user_id=u.id
      WHERE u.email LIKE $1`,
        [search + '%'],
      );
      sharedAccountsCount = parseInt(countReq.rows[0].count, 10);
    } else {
      const countReq = await db.query('SELECT COUNT(id) FROM shared_accounts');
      sharedAccountsCount = parseInt(countReq.rows[0].count, 10);
    }

    // GET SHARED ACCOUNTS
    const pageIndex = parseInt(req.query.pageIndex, 10) || 1;
    let pageOffset = pageIndex - 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    if (pageOffset * limit >= sharedAccountsCount) pageOffset = 0;

    const queryInputs: string[] = [limit.toString(), (pageOffset * limit).toString()];
    if (isSearching) {
      queryInputs.push(search + '%');
    }

    const dbRes = await db.query(
      `
      SELECT
        sa.id,
        sa.url,
        sa.name,
        sa.login,
        sa.type,
        (SELECT JSON_AGG(users_agg) FROM
          (SELECT
            u.email,
            sau.is_manager,
            sau.created_at,
            sau.id AS shared_account_user_id
            FROM shared_account_users AS sau
            LEFT JOIN users AS u ON sau.user_id=u.id
            WHERE sau.shared_account_id=sa.id
            ORDER BY sau.created_at ASC, u.email ASC
          ) AS users_agg
        ) AS users
      FROM shared_accounts AS sa
      ${
        isSearching
          ? `WHERE
          (SELECT
            COUNT(sau2.id)
            FROM shared_account_users AS sau2
            LEFT JOIN users AS u2 ON sau2.user_id=u2.id
            WHERE
              u2.email LIKE $3
              AND sau2.shared_account_id=sa.id
          ) > 0`
          : ''
      }
      ORDER BY sa.name
      LIMIT $1
      OFFSET $2
    `,
      queryInputs,
    );
    res.status(200).send({ sharedAccounts: dbRes.rows, sharedAccountsCount });
  } catch (e) {
    logError(e);
    res.status(400).end();
  }
};
