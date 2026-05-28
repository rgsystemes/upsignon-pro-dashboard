import { Request } from 'express';

export const logInfo = (...m: any[]): void => {
  console.log(new Date().toISOString().split('.')[0], ...m);
};

export const logError = (...m: any[]): void => {
  console.error(new Date().toISOString().split('.')[0], ...m);
};

const SENSITIVE_QUERY_PARAMS = new Set([
  'token',
  'access_token',
  'refresh_token',
  'id_token',
  'code',
  'auth_code',
  'connectiontoken',
  'vaultauthcode',
  'invitationauthcode',
  'synccode',
  'reset_token',
  'password',
  'secret',
  'client_secret',
  'api_key',
  'apikey',
  'key',
]);

export const sanitizeUrlForLogs = (req: Request): string => {
  try {
    const parsedUrl = new URL(req.originalUrl, `${req.protocol}://${req.headers.host}`);

    for (const key of Array.from(parsedUrl.searchParams.keys())) {
      if (SENSITIVE_QUERY_PARAMS.has(key.toLowerCase())) {
        parsedUrl.searchParams.set(key, '[REDACTED]');
      }
    }

    return `${parsedUrl.pathname}${parsedUrl.search}`;
  } catch {
    return `${req.protocol}://${req.headers.host}${req.originalUrl.split('?')[0]}`;
  }
};
