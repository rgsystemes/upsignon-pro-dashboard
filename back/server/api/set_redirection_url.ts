import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const setRedirectionUrl = async (req: any, res: any): Promise<void> => {
  try {
    if (req.session.adminRole === 'restricted_superadmin') {
      return res.status(401).end();
    }
    await db.query('UPDATE banks SET redirect_url=$1, stop_this_instance=$2 WHERE id=$3', [
      req.body.redirectionUrl,
      !!req.body.redirectionUrl,
      req.proxyParamsBankId,
    ]);
    res.status(200).end();
  } catch (e) {
    logError('setRedirectionUrl', e);
    res.status(400).end();
  }
};
