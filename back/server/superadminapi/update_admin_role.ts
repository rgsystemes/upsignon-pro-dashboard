import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const update_admin_role = async (req: any, res: any): Promise<void> => {
  try {
    if (req.session.isReadOnlySuperadmin) {
      res.status(401).json({ error: 'Not allowed for read only superadmin' });
      return;
    }
    if (!req.body.adminId) return res.status(401).end();

    const adminRole = req.body.adminRole;
    const isSuperadmin = 'superadmin' === adminRole;
    const isReadOnlySuperadmin = 'readOnlySuperadmin' === adminRole;

    await db.query(
      'UPDATE admins SET is_superadmin = $1, is_read_only_superadmin = $2 WHERE id=$3',
      [isSuperadmin, isReadOnlySuperadmin, req.body.adminId],
    );

    // DISCONNECT the target admin
    const targetAdmin = await db.query('SELECT email FROM admins WHERE id=$1', [req.body.adminId]);
    await db.query(`DELETE FROM admin_sessions WHERE session_data ->> 'adminEmail' = $1`, [
      targetAdmin.rows[0].email,
    ]);
    res.status(200).end();
  } catch (e) {
    logError('update_admin_role', e);
    res.status(400).end();
  }
};
