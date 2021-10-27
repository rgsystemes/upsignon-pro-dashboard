import { db } from '../helpers/connection';
import { logError } from '../helpers/logger';

export const get_superadmins = async (req: any, res: any): Promise<void> => {
  try {
    const dbRes = await db.query(
      'SELECT id, email, created_at FROM admins WHERE is_superadmin = true ORDER BY created_at ASC',
    );
    res.status(200).send(dbRes.rows);
  } catch (e) {
    logError(e);
    res.status(400).end();
  }
};
