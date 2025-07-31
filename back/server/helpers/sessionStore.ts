import { db } from './db';
import expressSession from 'express-session';
import { logError } from './logger';

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
      logError('sessionStore', 'createTable', e);
      throw e;
    }
  };

  getExpireDate = (maxAgeMillis?: number): Date => {
    const expireDate = new Date();
    expireDate.setTime(expireDate.getTime() + (maxAgeMillis || 3600000));
    return expireDate;
  };

  dbCleanup = async (): Promise<void> => {
    try {
      await db.query('DELETE FROM admin_sessions WHERE current_timestamp(0) > expiration_time');
    } catch (e) {
      logError('sessionStore', 'dbCleanup', e);
    }
  };
  get = async (
    sid: string,
    cb: (err?: any, session?: expressSession.SessionData | null) => void,
  ): Promise<void> => {
    try {
      const res = await db.query(
        'SELECT session_data FROM admin_sessions WHERE session_id = $1::text AND current_timestamp(0) <= expiration_time',
        [sid],
      );
      if (res.rowCount === 0) {
        return cb();
      }
      return cb(null, res.rows[0].session_data);
    } catch (e) {
      logError('sessionStore', 'get', e);
      cb(e);
    }
  };

  set = async (
    sid: string,
    sessionData: expressSession.Session,
    cb?: (err?: any) => void,
  ): Promise<void> => {
    const expires: Date =
      sessionData.cookie.expires || this.getExpireDate(sessionData.cookie.maxAge);
    try {
      await db.query(
        'INSERT INTO admin_sessions (session_id, session_data, expiration_time) VALUES ($1, $2, to_timestamp($3)) ON CONFLICT (session_id) DO UPDATE SET session_data=$2, expiration_time=to_timestamp($3)',
        [sid, JSON.stringify(sessionData), Math.trunc(expires.getTime() / 1000)],
      );
      if (cb) cb();
    } catch (e) {
      logError('sessionStore', 'set', e);
      if (cb) cb(e);
    }
  };
  destroy = async (sid: string, cb?: (err?: any) => void): Promise<void> => {
    try {
      await db.query('DELETE FROM admin_sessions WHERE session_id = $1', [sid]);
      if (cb) cb();
    } catch (e) {
      logError('sessionStore', 'destroy', e);
      if (cb) cb(e);
    }
  };

  clear = async (cb?: (err?: any) => void): Promise<void> => {
    try {
      await db.query('TRUNCATE admin_sessions');
      if (cb) cb();
    } catch (e) {
      logError('sessionStore', 'clear', e);
      if (cb) cb(e);
    }
  };

  touch = async (
    sid: string,
    sessionData: expressSession.Session,
    cb?: (err?: any) => void,
  ): Promise<void> => {
    const expires: Date =
      sessionData.cookie.expires || this.getExpireDate(sessionData.cookie.maxAge);
    try {
      await db.query(
        'UPDATE admin_sessions SET expiration_time=to_timestamp($1) WHERE session_id = $2',
        [Math.trunc(expires.getTime() / 1000), sid],
      );
      if (cb) cb();
    } catch (e) {
      logError('sessionStore', 'touch', e);
      if (cb) cb(e);
    }
  };
}

export const updateSessionAddBank = async (adminEmail: string, bankId: number): Promise<void> => {
  try {
    const prevSessionRes = await db.query(
      "SELECT session_data->>'banks' as banks FROM admin_sessions WHERE session_data ->> 'adminEmail' = $1",
      [adminEmail],
    );
    if (prevSessionRes.rows[0]) {
      const newBankList = [...(JSON.parse(prevSessionRes.rows[0].banks) ?? []), bankId];
      await db.query(
        `UPDATE admin_sessions
        SET session_data = jsonb_set(session_data, '{banks}', $2, true)
        WHERE session_data ->> 'adminEmail' = $1`,
        [adminEmail, JSON.stringify(newBankList)],
      );
    }
  } catch (e) {
    logError('sessionStore', 'updateSessionAddBank', e);
  }
};
export const updateSessionDropBank = async (adminEmail: string, bankId: number): Promise<void> => {
  try {
    const prevSessionRes = await db.query(
      "SELECT session_data->>'banks' as banks FROM admin_sessions WHERE session_data ->> 'adminEmail' = $1",
      [adminEmail],
    );
    if (prevSessionRes.rows[0]) {
      const newBankList = (JSON.parse(prevSessionRes.rows[0].banks) ?? []).filter(
        (b: number) => b != bankId,
      );
      await db.query(
        `UPDATE admin_sessions
        SET session_data = jsonb_set(session_data, '{banks}', $2)
        WHERE session_data ->> 'adminEmail' = $1`,
        [adminEmail, JSON.stringify(newBankList)],
      );
    }
  } catch (e) {
    logError('sessionStore', 'updateSessionDropBank', e);
  }
};
export const updateSessionRole = async (
  adminEmail: string,
  isSuperadmin: boolean,
  isReadOnlySuperadmin: boolean,
): Promise<void> => {
  try {
    await db.query(
      `UPDATE admin_sessions
       SET session_data = jsonb_set(
         jsonb_set(session_data, '{isSuperadmin}', $2),
         '{isReadOnlySuperadmin}', $3
       )
       WHERE session_data ->> 'adminEmail' = $1`,
      [adminEmail, JSON.stringify(isSuperadmin), JSON.stringify(isReadOnlySuperadmin)],
    );
  } catch (e) {
    logError('sessionStore', 'updateSessionRole', e);
  }
};

export const deleteSession = async (adminEmail: string): Promise<void> => {
  try {
    await db.query("DELETE FROM admin_sessions WHERE session_data ->> 'adminEmail' = $1", [
      adminEmail,
    ]);
  } catch (e) {
    logError('sessionStore', 'deleteSession', e);
  }
};
