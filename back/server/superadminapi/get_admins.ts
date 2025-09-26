import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const get_admins = async (req: any, res: any): Promise<void> => {
  try {
    const dbRes = await db.query(
      `SELECT
        admins.id,
        admins.email,
        admins.created_at,
        admins.admin_role,
        admins.reseller_id,
        CASE WHEN admins.admin_role != 'admin' THEN null ELSE array_agg(json_build_object('id', admin_banks.bank_id, 'name', banks.name, 'reseller_id', banks.reseller_id, 'reseller_name', resellers.name)) END AS banks
      FROM admins
      LEFT JOIN admin_banks ON admins.id=admin_banks.admin_id
      LEFT JOIN banks ON admin_banks.bank_id=banks.id
      LEFT JOIN resellers ON resellers.id=banks.reseller_id
      GROUP BY admins.id
      ORDER BY admins.admin_role, admins.created_at ASC`,
    );
    res.status(200).send(
      dbRes.rows.map((a) => ({
        ...a,
        adminRole: a.admin_role,
        banks: a.banks?.filter((g: any) => g.id !== null),
      })),
    );
  } catch (e) {
    logError('get_admins', e);
    res.status(400).end();
  }
};
