import env from './env';
import { logInfo } from './logger';

export const redirectToDefaultPath = (req: any, res: any): void => {
  logInfo('redirectToDefaultPath', req.method, req.originalUrl);
  let defaultPath = '';
  if (req.session.isSuperadmin || req.session.isReadOnlySuperadmin) {
    defaultPath = 'superadmin/'; // Keep trailing '/' for cases where dashboard url has a path !
  } else if (!req.session.groups || req.session.groups.length === 0) {
    defaultPath = 'no-admin-bank.html';
  } else {
    defaultPath = req.session.groups[0] + '/'; // Keep trailing '/' for cases where dashboard url has a path !
  }

  res.redirect(303, env.FRONTEND_URL + '/' + defaultPath);
};
