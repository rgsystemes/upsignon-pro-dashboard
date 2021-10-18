import { db } from './connection';
import expressSession from 'express-session';

const oneHour = 3600; // seconds

export default class PostgreSQLStore extends expressSession.Store {
  constructor() {
    super();
    this.createTable();
    setInterval(this.dbCleanup, oneHour * 1000);
  }

  createTable = async (): Promise<void> => {
    try {
      await db.query(
        'CREATE TABLE IF NOT EXISTS admin_sessions (session_id VARCHAR PRIMARY KEY, session_data JSON NOT NULL, expiration_time TIMESTAMP(0) NOT NULL)',
      );
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  getTimestampSeconds = (date?: Date | number): number => {
    if (!date) {
      return Math.floor(Date.now() / 1000);
    }
    return Math.floor(new Date(date).getTime() / 1000);
  };

  dbCleanup = async (): Promise<void> => {
    const now = this.getTimestampSeconds();
    try {
      await db.query('DELETE FROM admin_sessions WHERE to_timestamp($1) > expiration_time', [now]);
    } catch (e) {}
  };
  get = async (
    sid: string,
    cb: (err?: any, session?: expressSession.SessionData | null) => void,
  ): Promise<void> => {
    const now = this.getTimestampSeconds();
    try {
      const res = await db.query(
        'SELECT session_data FROM admin_sessions WHERE session_id = $1::text AND to_timestamp($2) <= expiration_time',
        [sid, now],
      );
      if (res.rowCount === 0) {
        return cb();
      }
      return cb(null, JSON.parse(res.rows[0].session_data));
    } catch (e) {
      cb(e);
    }
  };

  set = async (
    sid: string,
    session: expressSession.Session,
    cb?: (err?: any) => void,
  ): Promise<void> => {
    const maxAge = session.cookie.maxAge ? Math.floor(session.cookie.maxAge / 1000) : oneHour;
    const now = this.getTimestampSeconds();
    const expiration_time = now + maxAge;
    try {
      await db.query(
        'INSERT INTO admin_sessions (session_id, session_data, expiration_time) VALUES ($1, $2, to_timestamp($3)) ON CONFLICT (session_id) DO UPDATE SET session_data=$2, expiration_time=to_timestamp($3)',
        [sid, JSON.stringify(session), expiration_time],
      );
      if (cb) cb();
    } catch (e) {
      if (cb) cb(e);
    }
  };
  destroy = async (sid: string, cb?: (err?: any) => void): Promise<void> => {
    try {
      await db.query('DELETE FROM admin_sessions WHERE session_id = $1', [sid]);
      if (cb) cb();
    } catch (e) {
      if (cb) cb(e);
    }
  };

  clear = async (cb?: (err?: any) => void): Promise<void> => {
    try {
      await db.query('TRUNCATE admin_sessions');
      if (cb) cb();
    } catch (e) {
      if (cb) cb(e);
    }
  };

  touch = async (
    sid: string,
    session: expressSession.Session,
    cb?: (err?: any) => void,
  ): Promise<void> => {
    if (session && session.cookie && session.cookie.expires) {
      const now = this.getTimestampSeconds();
      const cookieExpires = this.getTimestampSeconds(session.cookie.expires);
      try {
        await db.query(
          'UPDATE admin_sessions SET expiration_time=to_timestamp($1) WHERE session_id = $2 AND to_timestamp($3) <= expiration_time',
          [cookieExpires, sid, now],
        );
        if (cb) cb();
      } catch (e) {
        if (cb) cb(e);
      }
    } else {
      if (cb) cb();
    }
  };
}
