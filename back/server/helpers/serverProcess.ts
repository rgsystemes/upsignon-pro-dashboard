import env from './env';
import { db } from './db';
import https from 'https';
import fs from 'fs';
import { logInfo } from './logger';
import { setupMSGraph } from './init_ms_graph';
import { setupProxyAgent } from './proxyAgent';

setupProxyAgent();

export const startServer = (app: any, then: any): void => {
  setupMSGraph();
  if (env.LOCALHOST_SSL_CERTIFICATE_KEY_PATH && env.LOCALHOST_SSL_CERTIFICATE_CRT_PATH) {
    const options = {
      key: fs.readFileSync(env.LOCALHOST_SSL_CERTIFICATE_KEY_PATH),
      cert: fs.readFileSync(env.LOCALHOST_SSL_CERTIFICATE_CRT_PATH),
    };
    const server = https.createServer(options, app).listen(env.SERVER_PORT, () => {
      logInfo(
        `${process.env.NODE_ENV === 'production' ? 'Production' : 'Dev'} HTTPS server listening`,
        server.address(),
      );
      then();
    });
    listenForGracefulShutdown(server);
  } else {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const server = app.listen(env.SERVER_PORT, () => {
      logInfo(
        `${process.env.NODE_ENV === 'production' ? 'Production' : 'Dev'} HTTP server listening`,
        server.address(),
      );
    });
    listenForGracefulShutdown(server);
  }
};

const listenForGracefulShutdown = (server: any) => {
  process.on('SIGINT', () => {
    server.close(() => {
      logInfo('Graceful shutdown');
      db.gracefulShutdown().then(() => {
        process.exit();
      });
    });
  });
};
