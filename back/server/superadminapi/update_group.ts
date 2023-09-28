import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const update_group = async (req: any, res: any): Promise<void> => {
  try {
    if (req.body.name && typeof req.body.name === 'string') {
      await db.query(`UPDATE groups SET name=$1 WHERE id=$2`, [req.body.name, req.body.id]);
    }
    if (req.body.settings && typeof req.body.settings === 'string') {
      await db.query(`UPDATE groups SET settings=$1 WHERE id=$2`, [req.body.settings, req.body.id]);
    }
    if (req.body.nb_licences_sold && typeof req.body.nb_licences_sold === 'number') {
      await db.query(`UPDATE groups SET nb_licences_sold=$1 WHERE id=$2`, [
        req.body.nb_licences_sold,
        req.body.id,
      ]);
    }
    res.status(200).end();
  } catch (e) {
    logError("update_group", e);
    res.status(400).end();
  }
};
