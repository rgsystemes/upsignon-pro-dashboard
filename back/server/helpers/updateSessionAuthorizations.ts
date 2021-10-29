import { db } from './connection';
import { logError } from './logger';

export const updateSessionAuthorizations = async (req: any, email: string): Promise<void> => {
  try {
    req.session.adminEmail = email;

    // Check Superadmin
    const adminRes = await db.query(
      'SELECT is_superadmin, group_id FROM admins WHERE admins.email=$1',
      [email],
    );
    if (adminRes.rowCount !== 0) {
      const isSuperadmin = adminRes.rows[0].is_superadmin;
      req.session.isSuperadmin = isSuperadmin;
      req.session.groupId = adminRes.rows[0].group_id;
    }
  } catch (e) {
    logError(e);
  }
};
