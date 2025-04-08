import { db } from './db';
import { logError } from './logger';

export const get_bank_url = async (req: any, res: any): Promise<void> => {
  try {
    const settingsRes = await db.query(
      "SELECT value FROM settings WHERE key='PRO_SERVER_URL_CONFIG'",
    );
    if (settingsRes.rowCount === 0) return res.status(200).send(null);

    const { url } = settingsRes.rows[0].value;
    // NB: settingsRes.rows[0].value because it used to contain also oidcAuthority, oidcClientId, oidcClientIdForAddons

    const bankRes = await db.query('SELECT public_id FROM groups WHERE id=$1', [
      req.proxyParamsGroupId,
    ]);
    const link = url + '/' + bankRes.rows[0].public_id;

    res.status(200).json({ url: link });
  } catch (e) {
    logError('get_bank_url', e);
    res.status(400).end();
  }
};
