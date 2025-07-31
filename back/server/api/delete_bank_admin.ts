import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const delete_bank_admin = async (req: any, res: any): Promise<void> => {
  try {
    if (req.session.adminRole === 'restricted_superadmin') {
      return res.status(401).end();
    }
    const adminId = req.params.id;
    const deletedAdmin = await db.query(
      `DELETE FROM admin_banks WHERE admin_id=$1 AND bank_id=$2`,
      [adminId, req.proxyParamsBankId],
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
    logError('delete_bank_admin', e);
    res.status(400).end();
  }
};
