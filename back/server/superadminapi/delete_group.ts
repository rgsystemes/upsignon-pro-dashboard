import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const delete_group = async (req: any, res: any): Promise<void> => {
  try {
    if (req.session.isReadOnlySuperadmin) {
      res.status(401).json({ error: 'Not allowed for read only superadmin' });
      return;
    }
    await db.query(`DELETE FROM banks WHERE id=$1`, [req.params.id]);
    res.status(200).end();
  } catch (e) {
    logError('delete_group', e);
    res.status(400).end();
  }
};
