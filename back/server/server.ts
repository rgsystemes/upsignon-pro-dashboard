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
  if (!adminEmail && !isLoginRoute) {
    try {
      if (req.method !== 'GET') {
        res.status(401).end();
      } else {
        res.status(401).sendFile('./login/loginPage.html', {
          root: path.join(__dirname, '../server'),
          dotfiles: 'deny',
        });
      }
    } catch (e) {
      logError(e);
      res.status(404).end();
    }
  } else {
    next();
  }
});

app.use('/', express.static('../front/build'));
app.use('/users/', express.static('../front/build'));
app.use('/shared_devices/', express.static('../front/build'));
app.use('/shared_accounts/', express.static('../front/build'));
app.use('/settings/', express.static('../front/build'));

app.use('/api/', apiRouter);
app.use('/login/', loginRouter);

if (module === require.main) {
  startServer(app, () => {});
}

module.exports = app;
