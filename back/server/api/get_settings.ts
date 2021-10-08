import { db } from '../helpers/connection';

export const get_settings = async (req: any, res: any): Promise<void> => {
  try {
    const settingsReq = await db.query('SELECT key, value FROM settings');
    const settingsRes: any = {};
    settingsReq.rows.forEach((s) => {
      settingsRes[s.key] = s.value;
    });
    res.status(200).send(settingsRes);
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};
