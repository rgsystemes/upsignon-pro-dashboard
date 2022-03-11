import env from './env';

export const redirectToDefaultPath = (req: any, res: any): void => {
  const defaultPath = req.session.isSuperadmin ? 'superadmin' : req.session.groups[0];

  if (env.IS_PRODUCTION) {
    res.redirect(303, env.SERVER_URL + '/' + defaultPath + '/');
  } else {
    res.redirect(303, `${req.protocol}://${req.headers.host?.replace(/\/$/, '')}/${defaultPath}/`);
  }
};
