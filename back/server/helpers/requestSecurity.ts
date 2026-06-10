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

export const enforceTrustedOrigin = (req: Request, res: Response, next: NextFunction) => {
  if (SAFE_METHODS.has(req.method.toUpperCase())) {
    return next();
  }

  const originHeader = req.get('origin');
  if (originHeader) {
    const requestOrigin = originHeader.toLowerCase();
    if (!allowedOrigins.has(requestOrigin)) {
      return res.status(403).json({ message: 'Untrusted request origin' });
    }
    return next();
  }

  const refererHeader = req.get('referer');
  if (refererHeader) {
    const refererOrigin = getOriginFromUrl(refererHeader);
    if (!refererOrigin || !allowedOrigins.has(refererOrigin)) {
      return res.status(403).json({ message: 'Untrusted request origin' });
    }
  }

  return next();
};
