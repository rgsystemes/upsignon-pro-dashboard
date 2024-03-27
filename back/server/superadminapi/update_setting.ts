import { db } from '../helpers/db';
import { logError } from '../helpers/logger';
import { superadminSettingKeys } from '../helpers/superadminSettingKeys';

export const update_setting = async (req: any, res: any): Promise<void> => {
  try {
    if (!superadminSettingKeys.includes(req.body.key)) {
      logError(`Attempted to insert ${req.body.key} into settings.`);
      return res.status(400).end();
    }

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

    res.status(200).end();
  } catch (e) {
    logError('update_setting', e);
    res.status(400).end();
  }
};
