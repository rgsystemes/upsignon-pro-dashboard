import { db } from './db';
import { logError } from './logger';
import { proxiedFetch } from './xmlHttpRequest';

export const forceProStatusUpdate = async () => {
  try {
    const settingsRes = await db.query(
      "SELECT value FROM settings WHERE key='PRO_SERVER_URL_CONFIG'",
    );
    if (settingsRes.rowCount === 0) {
      return;
    }

    const { url } = settingsRes.rows[0].value;
    if (url) {
      await proxiedFetch(`${url}/force-pro-status-update`, {
        method: 'POST',
      });
    }
  } catch (e) {
    logError('forceProStatusUpdate', e);
  }
};
