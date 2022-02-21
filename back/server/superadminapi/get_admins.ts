import { db } from '../helpers/connection';
import { logError } from '../helpers/logger';

export const get_admins = async (req: any, res: any): Promise<void> => {
  try {
    const dbRes = await db.query(
      `SELECT
        admins.id,
        admins.email,
        admins.created_at,
        admins.is_superadmin,
        CASE WHEN admins.is_superadmin THEN null ELSE array_agg(json_build_object('id', admin_groups.group_id, 'name', groups.name)) END AS groups
      FROM admins
      LEFT JOIN admin_groups ON admins.id=admin_groups.admin_id
      LEFT JOIN groups ON admin_groups.group_id=groups.id
      GROUP BY admins.id
      ORDER BY admins.is_superadmin DESC, admins.created_at ASC`,
    );
    res.status(200).send(
      dbRes.rows.map((a) => ({
        ...a,
        groups: a.groups?.filter((g: any) => g.id !== null),
      })),
    );
  } catch (e) {
    logError(e);
    res.status(400).end();
  }
};
