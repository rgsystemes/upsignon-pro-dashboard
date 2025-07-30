import { db } from './db';
import env from './env';
import { logError } from './logger';

export const updateSessionAuthorizations = async (req: any, email: string): Promise<void> => {
  try {
    req.session.adminEmail = email;

    // Check Superadmin
    const adminRes = await db.query(
      `SELECT
        admins.is_superadmin,
        admins.is_read_only_superadmin,
        CASE WHEN admins.is_superadmin THEN null ELSE array_agg(admin_banks.bank_id) END AS groups
      FROM admins
      LEFT JOIN admin_banks ON admins.id=admin_banks.admin_id
      WHERE admins.email=$1
      GROUP BY admins.id`,
      [email],
    );
    if (adminRes.rowCount !== 0) {
      const isSuperadmin = adminRes.rows[0].is_superadmin;
      let isReadOnlySuperadmin = adminRes.rows[0].is_read_only_superadmin;
      if (
        !env.IS_PRODUCTION &&
        email === env.DEV_FALLBACK_ADMIN_EMAIL &&
        env.DEV_FALLBACK_ADMIN_READ_ONLY
      ) {
        isReadOnlySuperadmin = true;
      }
      req.session.isSuperadmin = isSuperadmin && !isReadOnlySuperadmin;
      req.session.isReadOnlySuperadmin = isReadOnlySuperadmin;
      req.session.groups = adminRes.rows[0].groups?.filter((g: any) => g != null);
    }
  } catch (e) {
    logError('updateSessionAuthorizations', e);
  }
};
