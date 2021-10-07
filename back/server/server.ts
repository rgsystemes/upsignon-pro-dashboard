/* eslint-disable @typescript-eslint/no-var-requires */
import path from 'path';
require('dotenv').config({ path: path.join(__dirname, '../..', '.env') });

import express from 'express';
import { startServer } from './helpers/serverProcess';
import { logInfo } from './helpers/logger';

const app = express();

app.disable('x-powered-by');
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  logInfo(req.url);
  next();
});

app.use('/', express.static('../front/build'));
app.use('/users/', express.static('../front/build'));
app.use('/settings/', express.static('../front/build'));

if (module === require.main) {
  startServer(app, () => {});
}

module.exports = app;
