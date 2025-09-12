import { Request, Response } from 'express';
import { logError } from '../helpers/logger';
import { db } from '../helpers/db';
import { proxiedFetch } from '../helpers/xmlHttpRequest';

/// This route calls the upsignon-pro-server start-licence-pulling route

export const startPullLicences = async (req: Request, res: Response): Promise<void> => {
  try {
    const settingsRes = await db.query(
      "SELECT value FROM settings WHERE key='PRO_SERVER_URL_CONFIG'",
    );
    if (settingsRes.rowCount === 0) {
      res.sendStatus(400).end();
      return;
    }

    const { url } = settingsRes.rows[0].value;
    if (url) {
      await proxiedFetch(`${url}/start-licence-pulling`, {
        method: 'POST',
      });
    }
    res.status(200).end();
  } catch (e) {
    logError('startPullLicences', e);
    res.sendStatus(400);
  }
};
