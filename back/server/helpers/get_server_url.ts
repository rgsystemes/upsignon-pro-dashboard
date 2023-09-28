import { db } from './db';
import { logError } from './logger';

export const get_server_url = async (req: any, res: any): Promise<void> => {
  try {
    const settingsRes = await db.query(
      "SELECT value FROM settings WHERE key='PRO_SERVER_URL_CONFIG'",
    );
    if (settingsRes.rowCount === 0) return res.status(200).send(null);
    res.status(200).send(settingsRes.rows[0].value);
  } catch (e) {
    logError("get_server_url", e);
    res.status(400).end();
  }
};
