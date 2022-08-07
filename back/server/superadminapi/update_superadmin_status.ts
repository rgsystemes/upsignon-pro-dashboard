import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const update_superadmin_status = async (req: any, res: any): Promise<void> => {
  try {
    if (!req.body.adminId) return res.status(401).end();

    await db.query('UPDATE admins SET is_superadmin = $1 WHERE id=$2', [
      req.body.willBeSuperadmin,
      req.body.adminId,
    ]);

    if (req.body.willBeSuperadmin) {
      await db.query('DELETE FROM admin_groups WHERE admin_id=$1', [req.body.adminId]);
    }
    // DISCONNECT the target admin
    const targetAdmin = await db.query('SELECT email FROM admins WHERE id=$1', [req.body.adminId]);
    await db.query(`DELETE FROM admin_sessions WHERE session_data ->> 'adminEmail' = $1`, [
      targetAdmin.rows[0].email,
    ]);
    res.status(200).end();
  } catch (e) {
    logError(e);
    res.status(400).end();
  }
};
