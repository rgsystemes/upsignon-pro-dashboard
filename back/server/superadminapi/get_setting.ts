import { db } from '../helpers/db';
import { logError } from '../helpers/logger';
import { superadminSettingKeys } from '../helpers/superadminSettingKeys';

export const get_setting = async (req: any, res: any): Promise<void> => {
  try {
    if (!superadminSettingKeys.includes(req.body.key)) {
      logError(`Attempted to request ${req.body.key} from settings.`);
      return res.status(400).end();
    }

    const dbRes = await db.query('SELECT value FROM settings WHERE key=$1', [req.body.key]);
    if (dbRes.rowCount === 1) {
      const result = { [req.body.key]: dbRes.rows[0].value };
      res.status(200).json(result);
    } else {
      res.status(200).json({});
    }
  } catch (e) {
    logError(e);
    res.status(400).end();
  }
};
