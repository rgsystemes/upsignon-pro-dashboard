/* eslint-disable @typescript-eslint/no-var-requires */
import path from 'path';
require('dotenv').config({ path: path.join(__dirname, '../.env') });

import express from 'express';
import { startServer } from './helpers/serverProcess';
import { logInfo } from './helpers/logger';
import { apiRouter } from './api/apiRouter';
import env from './helpers/env';
import expressSession from 'express-session';
import { PostgreSQLStore } from './helpers/sessionStore';
import { loginRouter } from './login/loginRouter';
import { get_available_banks } from './helpers/get_available_banks';
import { superadminApiRouter } from './superadminapi/superadminApiRouter';
import { get_server_url } from './helpers/get_server_url';
import { disconnect } from './helpers/disconnect';
import { recomputeSessionAuthorizationsForAdminByEmail } from './helpers/updateSessionAuthorizations';
import { manualConnect } from './login/manualConnect';
import { replacePublicUrlInFront } from './helpers/replacePublicUrlInFront';
import { getAdminInvite } from './login/get_admin_invite';

const frontBuildDir = path.join(__dirname, '../../front/build');
replacePublicUrlInFront(frontBuildDir);

const app = express();
app.use((req, res, next) => {
  // this is a fix for proxies setting x-forwarded-proto in caps
  try {
    req.headers['x-forwarded-proto'] = (req.headers['x-forwarded-proto'] as string)?.toLowerCase();
  } catch {}
  next();
});
// Set express trust-proxy so that secure sessions cookies can work
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// SESSIONS
app.use(
  expressSession({
    cookie: {
      path: '/',
      httpOnly: true,
      secure: env.IS_PRODUCTION,
      maxAge: 1800000, // half an hour
      sameSite: env.IS_PRODUCTION ? 'strict' : 'lax',
    },
    name: 'upsignon_dashboard_session',
    // @ts-ignore
    secret: env.SESSION_SECRET,
    resave: false,
    rolling: true,
    saveUninitialized: false,
    unset: 'destroy',
    store: new PostgreSQLStore(),
  }),
);

// DEV MODE
if (!env.IS_PRODUCTION) {
  app.use(async (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    try {
      await recomputeSessionAuthorizationsForAdminByEmail(
        // @ts-ignore
        env.DEV_FALLBACK_ADMIN_EMAIL,
        req,
      );
      next();
    } catch (e) {
      console.error(e);
      res.sendStatus(444).end();
    }
  });
}

// LOGS
app.use((req, res, next) => {
  // @ts-ignore
  const adminEmail = req.session?.adminEmail;
  logInfo(adminEmail || 'unconnected user', req.method, req.url);
  next();
});

// PUBLIC ROUTES WITH NO SESSION NEEDED
app.use('/', express.static(frontBuildDir));

app.get('/login.html', (req, res) => {
  res.status(200).sendFile('login.html', {
    root: path.resolve(frontBuildDir),
    dotfiles: 'deny',
  });
});
app.get('/no-admin-bank.html', (req, res) => {
  res.status(200).sendFile('no-admin-bank.html', {
    root: path.resolve(frontBuildDir),
    dotfiles: 'deny',
  });
});
app.get('/manualConnect', manualConnect);
app.use('/login/', loginRouter);
app.post('/get_admin_invite', getAdminInvite);

// CHECK SESSION VALIDITY
app.use((req, res, next) => {
  const isLoginRoute = req.url.startsWith('/login');
  // @ts-ignore
  if (!req.session.adminEmail && !isLoginRoute) {
    if (req.method !== 'GET') {
      res.status(401).end();
    } else {
      logInfo('session check failed, redirecting to login page');
      res.redirect(303, env.BACKEND_URL + '/login.html');
    }
  } else {
    next();
  }
});

// ALL ROUTES BELOW ARE ONLY ACCESSIBLE WITH A VALID SESSION

// ROUTES THAT ARE AVAILABLE TO BOTH BANK ADMINS AND SUPERADMINS
app.get('/get_available_banks', get_available_banks);
app.get('/server_url', get_server_url);
app.use('/disconnect/', disconnect);

app.use('/superadmin/api/', superadminApiRouter);
app.use('/:bankId/api/', (req, res, next) => {
  const bankId = req.params.bankId;
  // @ts-ignore
  req.proxyParamsBankId = parseInt(bankId);
  return apiRouter(req, res, next);
});

app.use(
  [
    '/superadmin/password_reset_requests/',
    '/superadmin/other/',
    '/superadmin/settings/',
    '/superadmin/licences/',
    '/superadmin/',
    '/:bankId/users/',
    '/:bankId/shared_devices/',
    '/:bankId/shared_vaults/',
    '/:bankId/password_reset_requests/',
    '/:bankId/settings/',
    '/:bankId/other/',
    '/:bankId/licences/',
    '/:bankId/', // BEWARE ! this route would match any other route => keep it at the end !
  ],
  express.static(frontBuildDir),
);

// START
if (module === require.main) {
  startServer(app, () => {});
}

module.exports = app;
