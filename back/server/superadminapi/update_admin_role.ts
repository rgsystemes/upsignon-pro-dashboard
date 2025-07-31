import { AdminRoles } from '../helpers/adminRoles';
import { db } from '../helpers/db';
import { logError } from '../helpers/logger';
import { updateSessionRole } from '../helpers/sessionStore';

export const update_admin_role = async (req: any, res: any): Promise<void> => {
  try {
    if (req.session.adminRole !== 'superadmin') {
      res.status(401).json({ error: 'Not allowed for restricted superadmin' });
      return;
    }
    if (!req.body.adminId) return res.status(401).end();

    const adminRole: AdminRoles = req.body.adminRole;

    await db.query('UPDATE admins SET admin_role = $1 WHERE id=$2', [adminRole, req.body.adminId]);

    // DISCONNECT the target admin
    const targetAdmin = await db.query('SELECT email FROM admins WHERE id=$1', [req.body.adminId]);
    await updateSessionRole(targetAdmin.rows[0].email, adminRole);
    res.status(200).end();
  } catch (e) {
    logError('update_admin_role', e);
    res.status(400).end();
  }
};
