import { db } from '../helpers/connection';
import { logError } from '../helpers/logger';

export const get_groups = async (req: any, res: any): Promise<void> => {
  try {
    const dbRes = await db.query(
      `SELECT
        groups.id,
        groups.name,
        (SELECT count(users.id) FROM users WHERE group_id=groups.id) AS nb_users,
        (SELECT value FROM settings WHERE key='DISABLE_MANUAL_VALIDATION_FOR_PASSWORD_FORGOTTEN' AND group_id=groups.id) AS disable_manual_pwd_reset_validation
      FROM groups ORDER BY name ASC`,
    );
    res.status(200).send(dbRes.rows);
  } catch (e) {
    logError(e);
    res.status(400).end();
  }
};
