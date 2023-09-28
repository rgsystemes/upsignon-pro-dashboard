import { db } from './db';
import { logError } from './logger';

export const updateSessionAuthorizations = async (req: any, email: string): Promise<void> => {
  try {
    req.session.adminEmail = email;

    // Check Superadmin
    const adminRes = await db.query(
      `SELECT
        admins.is_superadmin,
        CASE WHEN admins.is_superadmin THEN null ELSE array_agg(admin_groups.group_id) END AS groups
      FROM admins
      LEFT JOIN admin_groups ON admins.id=admin_groups.admin_id
      WHERE admins.email=$1
      GROUP BY admins.id`,
      [email],
    );
    if (adminRes.rowCount !== 0) {
      const isSuperadmin = adminRes.rows[0].is_superadmin;
      req.session.isSuperadmin = isSuperadmin;
      req.session.groups = adminRes.rows[0].groups?.filter((g: any) => g != null);
    }
  } catch (e) {
    logError("updateSessionAuthorizations", e);
  }
};
