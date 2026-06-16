import { NextFunction, Request, Response } from 'express';
import env from './env';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

const getOriginFromUrl = (urlValue: string): string | null => {
  try {
    return new URL(urlValue).origin.toLowerCase();
  } catch {
    return null;
  }
};

const allowedOrigins = new Set(
  [env.FRONTEND_URL, env.BACKEND_URL]
    .map((value) => (value ? getOriginFromUrl(value) : null))
    .filter((origin): origin is string => Boolean(origin)),
);

export const isTrustedOrigin = (originHeader: string, route: string): boolean => {
  const normalizedOrigin = originHeader.toLowerCase();

  if (allowedOrigins.has(normalizedOrigin)) {
    return true;
  }

  if (normalizedOrigin == 'https://upsignon.eu' && route.startsWith('/trial-request')) {
    return true;
  }

  return false;
};

export const enforceTrustedOrigin = (req: Request, res: Response, next: NextFunction) => {
  if (SAFE_METHODS.has(req.method.toUpperCase())) {
    return next();
  }

  const originHeader = req.get('origin');
  if (originHeader) {
    if (!isTrustedOrigin(originHeader, req.path)) {
      return res.status(403).json({ message: 'Untrusted request origin' });
    }
    return next();
  }

  const refererHeader = req.get('referer');
  if (refererHeader) {
    const refererOrigin = getOriginFromUrl(refererHeader);
    if (!refererOrigin || !isTrustedOrigin(refererOrigin, req.path)) {
      return res.status(403).json({ message: 'Untrusted request origin' });
    }
  }

  return next();
};
