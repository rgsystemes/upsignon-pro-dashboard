import { db } from './connection';
import { logError } from './logger';

export const checkIsSuperAdmin = async (req: any, res: any): Promise<boolean> => {
  try {
    const adminEmail = req.session?.adminEmail;

    // Check Superadmin
    const isSuperadminRes = await db.query(
      'SELECT is_superadmin, group_id FROM admins WHERE admins.email=$1',
      [adminEmail],
    );
    const isSuperadmin = isSuperadminRes.rows[0]?.is_superadmin;
    // @ts-ignore
    req.session?.isSuperadmin = isSuperadmin;
    return isSuperadmin;
  } catch (e) {
    logError(e);
    return false;
  }
};
