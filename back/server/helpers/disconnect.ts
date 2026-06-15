import env from './env';
import { logError } from './logger';

export const disconnect = async (req: any, res: any): Promise<void> => {
  try {
    delete req.session?.csrfToken;
    req.session.destroy((error?: Error) => {
      if (error) {
        logError('disconnect', error);
        return res.status(400).end();
      }
      res.clearCookie('upsignon_dashboard_session', {
        path: '/',
        httpOnly: true,
        secure: env.IS_PRODUCTION,
        sameSite: env.IS_PRODUCTION ? 'strict' : 'lax',
      });
      return res.status(200).end();
    });
  } catch (e) {
    logError('disconnect', e);
    res.status(400).end();
  }
};
