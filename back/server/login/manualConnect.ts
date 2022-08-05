import { db } from '../helpers/connection';
import { logError } from '../helpers/logger';
import { redirectToDefaultPath } from '../helpers/redirectToDefaultPath';

export const manualConnect = async (req: any, res: any): Promise<void> => {
  try {
    const token = req.query.token;
    if (!token || typeof token !== 'string') return res.status(401).end();
    const dbRes = await db.query(
      'SELECT token FROM temporary_admins WHERE token=$1 AND current_timestamp(0) < expiration_time',
      [token],
    );

    await db.query(
      'DELETE FROM temporary_admins WHERE current_timestamp(0) > expiration_time OR token=$1',
      [token],
    );

    if (dbRes.rowCount === 1) {
      req.session.adminEmail = 'temporaryAdmin';
      req.session.isSuperadmin = true;
      redirectToDefaultPath(req, res);
    } else {
      return res.status(400).send('Token expired.');
    }
  } catch (e) {
    logError(e);
    res.status(400).end();
  }
};
