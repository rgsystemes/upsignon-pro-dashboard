import { randomBytes, timingSafeEqual } from 'crypto';
import { Request, Response, NextFunction } from 'express';

const CSRF_HEADER_NAME = 'x-csrf-token';
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

const buildBreachPadding = (): string => {
  // Randomized response length makes compression-based length probing harder.
  const padLength = 16 + Math.floor(Math.random() * 49);
  return randomBytes(padLength).toString('hex');
};

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
  const session = req.session;

  if (!session || typeof session.save !== 'function') {
    return res.status(500).json({ message: 'Failed to persist CSRF token' });
  }

  const csrfToken = getOrCreateCsrfToken(req);

  return session.save((error: unknown) => {
    if (error) {
      return res.status(500).json({ message: 'Failed to persist CSRF token' });
    }

    res.setHeader('Cache-Control', 'no-store, no-transform');
    res.setHeader('Pragma', 'no-cache');
    // ideally, this route is not compressed at all, but in case it is, the random padding makes BREACH attacks harder
    return res.status(200).json({ csrfToken, _pad: buildBreachPadding() });
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
