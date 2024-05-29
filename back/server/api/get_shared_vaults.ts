import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const get_shared_vaults = async (req: any, res: any): Promise<void> => {
  try {
    let search = req.query.search;
    if (!!search && typeof search !== 'string') return res.status(401).end();
    search = search?.toLowerCase();
    const isSearching = !!search;

    // COUNT SHARED VAULTS
    let sharedVaultsCount;
    if (isSearching) {
      const countReq = await db.query(
        `SELECT COUNT(sv.id)
      FROM shared_vaults AS sv
      LEFT JOIN shared_vault_recipients AS svr ON svr.shared_vault_id=sv.id
      LEFT JOIN users AS u ON svr.user_id=u.id
      WHERE u.email LIKE '%' || $1 || '%'
      AND sv.group_id=$2`,
        [search, req.proxyParamsGroupId],
      );
      sharedVaultsCount = parseInt(countReq.rows[0]?.count || 0, 10);
    } else {
      const countReq = await db.query('SELECT COUNT(id) FROM shared_vaults WHERE group_id=$1', [
        req.proxyParamsGroupId,
      ]);
      sharedVaultsCount = parseInt(countReq.rows[0]?.count || 0, 10);
    }

    // GET SHARED VAULTS
    const pageIndex = parseInt(req.query.pageIndex, 10) || 1;
    let pageOffset = pageIndex - 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    if (pageOffset * limit >= sharedVaultsCount) pageOffset = 0;

    const queryInputs: string[] = [
      limit.toString(),
      (pageOffset * limit).toString(),
      req.proxyParamsGroupId,
    ];
    if (isSearching) {
      queryInputs.push(search);
    }

    const dbRes = await db.query(
      `
      SELECT
        sv.id,
        sv.name,
        sv.nb_accounts,
        sv.nb_codes,
        sv.nb_accounts_strong,
        sv.nb_accounts_medium,
        sv.nb_accounts_weak,
        sv.nb_accounts_with_duplicated_password,
        sv.nb_accounts_with_no_password,
        sv.nb_accounts_red,
        sv.nb_accounts_orange,
        sv.nb_accounts_green,
        sv.content_details,
        (SELECT JSON_AGG(users_agg) FROM
          (SELECT
            u.id AS user_id,
            u.email,
            svr.is_manager,
            svr.created_at
            FROM shared_vault_recipients AS svr
            LEFT JOIN users AS u ON svr.user_id=u.id
            WHERE svr.shared_vault_id=sv.id
            ORDER BY svr.created_at ASC, u.email ASC
          ) AS users_agg
        ) AS users
      FROM shared_vaults AS sv
      WHERE sv.group_id=$3
      ${
        isSearching
          ? `AND
          (SELECT
            COUNT(*)
            FROM shared_vault_recipients AS svr2
            LEFT JOIN users AS u2 ON svr2.user_id=u2.id
            WHERE
              u2.email LIKE '%' || $4 || '%'
              AND svr2.shared_vault_id=sv.id
          ) > 0`
          : ''
      }
      ORDER BY sv.id desc, sv.name
      LIMIT $1
      OFFSET $2
    `,
      queryInputs,
    );
    res.status(200).send({ sharedVaults: dbRes.rows, sharedVaultsCount });
  } catch (e) {
    logError('get_shared_vaults', e);
    res.status(400).end();
  }
};
