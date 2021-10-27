import { db } from '../helpers/connection';
import { logError } from '../helpers/logger';

export const delete_group = async (req: any, res: any): Promise<void> => {
  try {
    await db.query(`DELETE FROM groups WHERE id=$1`, [req.params.id]);
    res.status(200).end();
  } catch (e) {
    logError(e);
    res.status(400).end();
  }
};
