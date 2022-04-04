import env from './env';

export const redirectToDefaultPath = (req: any, res: any): void => {
  let defaultPath = '';
  if (req.session.isSuperadmin) {
    defaultPath = 'superadmin';
  } else if (!req.session.groups || req.session.groups.length === 0) {
    defaultPath = 'no-admin-bank.html';
  } else {
    defaultPath = req.session.groups[0];
  }

  if (env.IS_PRODUCTION) {
    res.redirect(303, env.SERVER_URL + '/' + defaultPath);
  } else {
    res.redirect(303, `${req.protocol}://${req.headers.host?.replace(/\/$/, '')}/${defaultPath}`);
  }
};
