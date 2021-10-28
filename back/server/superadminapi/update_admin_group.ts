import { db } from '../helpers/connection';
import { logError } from '../helpers/logger';

export const update_admin_group = async (req: any, res: any): Promise<void> => {
  try {
    if (!req.body.adminId) return res.status(401).end();

    const isSuperadmin = parseInt(req.body.groupId) != req.body.groupId;
    const groupId = req.body.groupId || null;

    const updateRes = await db.query(
      'UPDATE admins SET group_id=$1, is_superadmin=$2 WHERE id=$3 RETURNING email',
      [groupId, isSuperadmin, req.body.adminId],
    );
    // DISCONNECT
    updateRes.rows.forEach(async (a) => {
      await db.query(`DELETE FROM admin_sessions WHERE session_data ->> 'adminEmail' = $1`, [
        a.email,
      ]);
    });
    res.status(200).end();
  } catch (e) {
    logError(e);
    res.status(400).end();
  }
};
