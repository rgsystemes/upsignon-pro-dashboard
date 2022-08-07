import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const delete_group_admin = async (req: any, res: any): Promise<void> => {
  try {
    const adminId = req.params.id;
    const deletedAdmin = await db.query(
      `DELETE FROM admin_groups WHERE admin_id=$1 AND group_id=$2`,
      [adminId, req.proxyParamsGroupId],
    );
    // DISCONNECT
    deletedAdmin.rows.forEach(async (a) => {
      await db.query(
        `DELETE FROM admin_sessions WHERE session_data ->> 'adminEmail' = (SELECT email FROM admins WHERE id=$1)`,
        [a.email],
      );
    });
    res.status(200).end();
  } catch (e) {
    logError(e);
    res.status(400).end();
  }
};
