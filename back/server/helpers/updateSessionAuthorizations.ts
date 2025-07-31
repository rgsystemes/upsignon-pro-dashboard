import { db } from './db';
import env from './env';
import { logError } from './logger';

export const updateSessionAuthorizations = async (req: any, email: string): Promise<void> => {
  try {
    req.session.adminEmail = email;

    // Check Superadmin
    const adminRes = await db.query(
      `SELECT
        admins.admin_role,
        CASE WHEN admins.admin_role != 'admin' THEN null ELSE array_agg(admin_banks.bank_id) END AS banks
      FROM admins
      LEFT JOIN admin_banks ON admins.id=admin_banks.admin_id
      WHERE admins.email=$1
      GROUP BY admins.id`,
      [email],
    );
    if (adminRes.rowCount !== 0) {
      if (!env.IS_PRODUCTION && email === env.DEV_FALLBACK_ADMIN_EMAIL) {
        req.session.adminRole = env.DEV_FALLBACK_ADMIN_RESTRICTED
          ? 'restricted_superadmin'
          : 'superadmin';
      } else {
        req.session.adminRole = adminRes.rows[0].admin_role;
      }
      req.session.banks = adminRes.rows[0].banks?.filter((g: any) => g != null) ?? [];
    }
  } catch (e) {
    logError('updateSessionAuthorizations', e);
  }
};
