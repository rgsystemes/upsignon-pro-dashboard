/* eslint-disable @typescript-eslint/no-var-requires */
import path from 'path';
require('dotenv').config({ path: path.join(__dirname, '../.env') });

import express from 'express';
import { startServer } from './helpers/serverProcess';
import { logInfo } from './helpers/logger';
import { apiRouter } from './api/apiRouter';
import env from './helpers/env';
import expressSession from 'express-session';
import SessionStore from './helpers/sessionStore';
import { loginRouter } from './login/loginRouter';
import { get_available_groups } from './helpers/get_available_groups';
import { superadminApiRouter } from './superadminapi/superadminApiRouter';
import { get_server_url } from './helpers/get_server_url';
import { disconnect } from './helpers/disconnect';
import { updateSessionAuthorizations } from './helpers/updateSessionAuthorizations';
import { manualConnect } from './login/manualConnect';

const frontBuildDir = path.join(__dirname, '../../front/build');

const app = express();

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
      maxAge: 3600000, // one hour
      sameSite: env.IS_PRODUCTION ? 'strict' : 'lax',
    },
    name: 'upsignon_dashboard_session',
    // @ts-ignore
    secret: env.SESSION_SECRET,
    resave: false,
    rolling: false,
    saveUninitialized: false,
    unset: 'destroy',
    store: new SessionStore(),
  }),
);

// DEV MODE
if (!env.IS_PRODUCTION) {
  app.use(async (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    try {
      await updateSessionAuthorizations(
        req,
        // @ts-ignore
        env.DEV_FALLBACK_ADMIN_URL,
      );
      next();
    } catch (e) {
      res.send(444).end();
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
app.post('/manualConnect', manualConnect);
app.use('/login/', loginRouter);

// CHECK SESSION VALIDITY
app.use((req, res, next) => {
  const isLoginRoute = req.url.startsWith('/login');
  // @ts-ignore
  if (!req.session.adminEmail && !isLoginRoute) {
    if (req.method !== 'GET') {
      res.status(401).end();
    } else {
      if (env.IS_PRODUCTION) {
        res.redirect(303, env.SERVER_URL + '/login.html');
      } else {
        res.redirect(303, `${req.protocol}://${req.headers.host?.replace(/\/$/, '')}/login.html`);
      }
    }
  } else {
    next();
  }
});

// ALL ROUTES BELOW ARE ONLY ACCESSIBLE WITH A VALID SESSION

// ROUTES THAT ARE AVAILABLE TO BOTH GROUP ADMINS AND SUPERADMINS
app.get('/get_available_groups', get_available_groups);
app.get('/server_url', get_server_url);
app.use('/disconnect/', disconnect);

app.use('/superadmin/api/', superadminApiRouter);
app.use('/:groupId/api/', (req, res, next) => {
  const groupId = req.params.groupId;
  // @ts-ignore
  req.proxyParamsGroupId = parseInt(groupId);
  return apiRouter(req, res, next);
});

app.use(
  [
    '/superadmin/password_reset_requests/',
    '/superadmin/settings/',
    '/superadmin/',
    '/:groupId/users/',
    '/:groupId/shared_devices/',
    '/:groupId/shared_accounts/',
    '/:groupId/password_reset_requests/',
    '/:groupId/settings/',
    '/:groupId/', // BEWARE ! this route would match any other route => keep it at the end !
  ],
  express.static(frontBuildDir),
);

// START
if (module === require.main) {
  startServer(app, () => {});
}

module.exports = app;
