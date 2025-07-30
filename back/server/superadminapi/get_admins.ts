import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const get_admins = async (req: any, res: any): Promise<void> => {
  try {
    const dbRes = await db.query(
      `SELECT
        admins.id,
        admins.email,
        admins.created_at,
        admins.is_superadmin,
        admins.is_read_only_superadmin,
        CASE WHEN admins.is_superadmin THEN null ELSE array_agg(json_build_object('id', admin_banks.bank_id, 'name', banks.name)) END AS banks
      FROM admins
      LEFT JOIN admin_banks ON admins.id=admin_banks.admin_id
      LEFT JOIN banks ON admin_banks.bank_id=banks.id
      GROUP BY admins.id
      ORDER BY admins.is_superadmin DESC, admins.is_read_only_superadmin DESC, admins.created_at ASC`,
    );
    res.status(200).send(
      dbRes.rows.map((a) => ({
        ...a,
        adminRole: a.is_read_only_superadmin
          ? 'readOnlySuperadmin'
          : a.is_superadmin
            ? 'superadmin'
            : 'admin',
        banks: a.banks?.filter((g: any) => g.id !== null),
      })),
    );
  } catch (e) {
    logError('get_admins', e);
    res.status(400).end();
  }
};
