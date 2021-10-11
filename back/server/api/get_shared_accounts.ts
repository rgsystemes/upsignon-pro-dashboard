import { db } from '../helpers/connection';

export const get_shared_accounts = async (req: any, res: any): Promise<void> => {
  try {
    const dbRes = await db.query(`
      SELECT
        sa.id,
        sa.url,
        sa.name,
        sa.login,
        sa.type,
        sau.created_at,
        sau.is_manager,
        u.email,
        sau.id AS shared_account_user_id
      FROM shared_accounts AS sa
      LEFT JOIN shared_account_users AS sau ON sau.shared_account_id=sa.id
      LEFT JOIN users AS u ON sau.user_id=u.id
      ORDER BY sa.name
    `);
    res.status(200).send(dbRes.rows);
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};
