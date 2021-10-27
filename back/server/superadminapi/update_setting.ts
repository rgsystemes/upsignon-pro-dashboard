import { db } from '../helpers/connection';
import { logError } from '../helpers/logger';

const allowedKeys = ['DISABLE_MANUAL_VALIDATION_FOR_PASSWORD_FORGOTTEN', 'PRO_SERVER_URL_CONFIG'];

export const update_setting = async (req: any, res: any): Promise<void> => {
  try {
    if (!allowedKeys.includes(req.body.key)) {
      logError(`Attempted to insert ${req.body.key} into settings.`);
      return res.status(400).end();
    }
    if (!!req.body.groupId) {
      const updated = await db.query('UPDATE settings SET value=$1 WHERE key=$2 AND group_id=$3', [
        req.body.value,
        req.body.key,
        req.body.groupId,
      ]);
      if (updated.rowCount === 0) {
        await db.query('INSERT INTO settings (key, value, group_id) VALUES ($1, $2, $3)', [
          req.body.key,
          req.body.value,
          req.body.groupId,
        ]);
      }
    } else {
      const updated = await db.query('UPDATE settings SET value=$1 WHERE key=$2', [
        req.body.value,
        req.body.key,
      ]);
      if (updated.rowCount === 0) {
        await db.query('INSERT INTO settings (key, value) VALUES ($1, $2)', [
          req.body.key,
          req.body.value,
        ]);
      }
    }

    res.status(200).end();
  } catch (e) {
    logError(e);
    res.status(400).end();
  }
};
