import { db } from '../helpers/connection';
import { logError } from '../helpers/logger';

export const get_server_url = async (req: any, res: any): Promise<void> => {
  try {
    const settingsReq = await db.query('SELECT key, value FROM settings');
    const settingsRes: any = {};
    settingsReq.rows.forEach((s) => {
      settingsRes[s.key] = s.value;
    });
    res.status(200).send(settingsRes);
  } catch (e) {
    logError(e);
    res.status(400).end();
  }
};
