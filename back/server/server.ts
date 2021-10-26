/* eslint-disable @typescript-eslint/no-var-requires */
import path from 'path';
require('dotenv').config({ path: path.join(__dirname, '../.env') });

import express from 'express';
import { startServer } from './helpers/serverProcess';
import { logError, logInfo } from './helpers/logger';
import { apiRouter } from './api/apiRouter';
import env from './helpers/env';
import expressSession from 'express-session';
import SessionStore from './helpers/sessionStore';
import { loginRouter } from './login/loginRouter';
import { get_available_groups } from './helpers/get_available_groups';
import { get_group_id } from './helpers/get_group_id';

const app = express();

// Set express trust-proxy so that secure sessions cookies can work
app.set('trust proxy', 1);
app.disable('x-powered-by');

// Configure sessions
app.use(
  expressSession({
    cookie: {
      path: '/',
      httpOnly: true,
      secure: env.IS_PRODUCTION,
      maxAge: 3600000, // one hour
      sameSite: 'strict',
    },
    name: 'upsignon_dashboard_session',
    // @ts-ignore
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    unset: 'destroy',
    store: new SessionStore(),
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// serve static files here (before the logger)
app.use('/', express.static('../front/build'));

app.use((req, res, next) => {
  // @ts-ignore
  const adminEmail = req.session?.adminEmail;
  logInfo(adminEmail || 'unconnected user', req.method, req.url);
  if (!env.IS_PRODUCTION) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }

  // Check Auth
  const isLoginRoute = req.url.startsWith('/login');
  if (env.IS_PRODUCTION && !adminEmail && !isLoginRoute) {
    try {
      if (req.method !== 'GET') {
        return res.status(401).end();
      } else {
        return res.status(401).sendFile('./login/loginPage.html', {
          root: path.join(__dirname, '../server'),
          dotfiles: 'deny',
        });
      }
    } catch (e) {
      logError(e);
      return res.status(404).end();
    }
  } else {
    next();
  }
});

app.use('/login/', loginRouter);
app.use('/get_available_groups', get_available_groups);

// GROUP ROUTING

app.use('/:group/', express.static('../front/build'));
app.use('/:group/users/', express.static('../front/build'));
app.use('/:group/shared_devices/', express.static('../front/build'));
app.use('/:group/shared_accounts/', express.static('../front/build'));
app.use('/:group/settings/', express.static('../front/build'));

app.use('/:group/api/', async (req, res, next) => {
  req.url = req.url.replace(`/${req.params.group}/`, '');

  // GROUP AUTHORIZATION
  // @ts-ignore
  const groupId = await get_group_id(req.session?.adminEmail, req.params.group);
  if (env.IS_PRODUCTION && groupId == null) {
    return res.status(401).end();
  }
  // @ts-ignore
  req.upsignonProGroupId = groupId;
  return apiRouter(req, res, next);
});

// START
if (module === require.main) {
  startServer(app, () => {});
}

module.exports = app;
