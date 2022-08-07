import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const update_group = async (req: any, res: any): Promise<void> => {
  try {
    if (req.body.name) {
      await db.query(`UPDATE groups SET name=$1 WHERE id=$2`, [req.body.name, req.body.id]);
    }
    if (req.body.settings) {
      await db.query(`UPDATE groups SET settings=$1 WHERE id=$2`, [req.body.settings, req.body.id]);
    }
    res.status(200).end();
  } catch (e) {
    logError(e);
    res.status(400).end();
  }
};
