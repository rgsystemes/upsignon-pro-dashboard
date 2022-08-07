import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const update_admin_group = async (req: any, res: any): Promise<void> => {
  try {
    if (!req.body.adminId) return res.status(401).end();

    if (req.body.willBelongToGroup) {
      await db.query('INSERT INTO admin_groups(admin_id, group_id) VALUES ($1,$2)', [
        req.body.adminId,
        req.body.groupId,
      ]);
    } else {
      await db.query('DELETE FROM admin_groups WHERE admin_id=$1 AND group_id=$2', [
        req.body.adminId,
        req.body.groupId,
      ]);
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
