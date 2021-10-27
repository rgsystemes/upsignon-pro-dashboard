import { db } from '../helpers/connection';
import { logError } from '../helpers/logger';

export const insert_group = async (req: any, res: any): Promise<void> => {
  try {
    const groupInsertRes = await db.query(`INSERT INTO groups (name) VALUES ($1) RETURNING id`, [
      req.body.name,
    ]);
    await db.query(`INSERT INTO settings (key, value, group_id) VALUES ($1, $2, $3)`, [
      'DISABLE_MANUAL_VALIDATION_FOR_PASSWORD_FORGOTTEN',
      false,
      groupInsertRes.rows[0].id,
    ]);
    res.status(200).end();
  } catch (e) {
    logError(e);
    res.status(400).end();
  }
};
