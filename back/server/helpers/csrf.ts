import { randomBytes, timingSafeEqual } from 'crypto';
import { Request, Response, NextFunction } from 'express';

const CSRF_HEADER_NAME = 'x-csrf-token';
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

const getOrCreateCsrfToken = (req: Request): string => {
  if (!req.session.csrfToken) {
    req.session.csrfToken = randomBytes(32).toString('hex');
  }
  return req.session.csrfToken;
};

export const rotateCsrfToken = (req: Request): string => {
  req.session.csrfToken = randomBytes(32).toString('hex');
  return req.session.csrfToken;
};

export const clearCsrfToken = (req: Request): void => {
  if (req.session) {
    delete req.session.csrfToken;
  }
};

const tokenMatches = (expectedToken: string, receivedToken: string): boolean => {
  const expectedBuffer = Buffer.from(expectedToken);
  const receivedBuffer = Buffer.from(receivedToken);
  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }
  return timingSafeEqual(expectedBuffer, receivedBuffer);
};

export const sendCsrfToken = (req: Request, res: Response) => {
  const csrfToken = getOrCreateCsrfToken(req);
  const session = req.session;

  if (!session || typeof session.save !== 'function') {
    return res.status(500).json({ message: 'Failed to persist CSRF token' });
  }

  return session.save((error: unknown) => {
    if (error) {
      return res.status(500).json({ message: 'Failed to persist CSRF token' });
    }

    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Pragma', 'no-cache');
    return res.status(200).json({ csrfToken });
  });
};

export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  if (SAFE_METHODS.has(req.method.toUpperCase())) {
    return next();
  }

  const sessionToken = req.session?.csrfToken;
  const requestToken = req.get(CSRF_HEADER_NAME);
  if (!sessionToken || !requestToken || !tokenMatches(sessionToken, requestToken)) {
    return res.status(403).json({ message: 'Invalid CSRF token' });
  }

  return next();
};
