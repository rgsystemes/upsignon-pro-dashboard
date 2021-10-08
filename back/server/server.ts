/* eslint-disable @typescript-eslint/no-var-requires */
import path from 'path';
require('dotenv').config({ path: path.join(__dirname, '../..', '.env') });

import express from 'express';
import { startServer } from './helpers/serverProcess';
import { logInfo } from './helpers/logger';
import { apiRouter } from './api/apiRouter';
import env from './helpers/env';

const app = express();

app.disable('x-powered-by');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  logInfo(req.method, req.url);
  if (!env.IS_PRODUCTION) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
  next();
});

app.use('/', express.static('../front/build'));
app.use('/users/', express.static('../front/build'));
app.use('/settings/', express.static('../front/build'));

app.use('/api/', apiRouter);

if (module === require.main) {
  startServer(app, () => {});
}

module.exports = app;
