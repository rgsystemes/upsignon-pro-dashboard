import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const update_admin_bank = async (req: any, res: any): Promise<void> => {
  try {
    if (req.session.isReadOnlySuperadmin) {
      res.status(401).json({ error: 'Not allowed for read only superadmin' });
      return;
    }
    if (!req.body.adminId) return res.status(401).end();

    if (req.body.willBelongToGroup) {
      await db.query('INSERT INTO admin_banks(admin_id, bank_id) VALUES ($1,$2)', [
        req.body.adminId,
        req.body.bankId,
      ]);
    } else {
      await db.query('DELETE FROM admin_banks WHERE admin_id=$1 AND bank_id=$2', [
        req.body.adminId,
        req.body.bankId,
      ]);
    }
    // DISCONNECT the target admin
    const targetAdmin = await db.query('SELECT email FROM admins WHERE id=$1', [req.body.adminId]);
    await db.query(`DELETE FROM admin_sessions WHERE session_data ->> 'adminEmail' = $1`, [
      targetAdmin.rows[0].email,
    ]);
    res.status(200).end();
  } catch (e) {
    logError('update_admin_bank', e);
    res.status(400).end();
  }
};
