import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const get_bank_admins = async (req: any, res: any): Promise<void> => {
  try {
    const dbRes = await db.query(
      `SELECT
        admins.id,
        admins.email,
        admins.created_at
      FROM admins
      LEFT JOIN admin_banks ON admins.id=admin_banks.admin_id
      WHERE admin_banks.bank_id = $1
      ORDER BY admins.created_at ASC`,
      [req.proxyParamsBankId],
    );
    res.status(200).send(dbRes.rows);
  } catch (e) {
    logError('get_bank_admins', e);
    res.status(400).end();
  }
};
