import { db } from '../helpers/connection';
import { logError } from '../helpers/logger';
import bcrypt from 'bcrypt';
import { updateSessionAuthorizations } from '../helpers/updateSessionAuthorizations';
import { redirectToDefaultPath } from '../helpers/redirectToDefaultPath';

export const manualConnect = async (req: any, res: any): Promise<void> => {
  try {
    let email = req.body.email;
    const pwd = req.body.pwd;
    if (!email || typeof email !== 'string' || !pwd) return res.status(401).end();
    email = email.toLowerCase();
    let dbRes;
    try {
      dbRes = await db.query('SELECT password_hash FROM admins WHERE email=$1', [email]);
    } catch {}
    if (!dbRes || dbRes.rowCount === 0) {
      try {
        dbRes = await db.query('SELECT password_hash FROM admins WHERE id=$1', [email]);
      } catch {}
      if (!dbRes || dbRes.rowCount === 0) {
        return res.status(401).end();
      }
    }
    const isOk: boolean = await bcrypt.compare(pwd, dbRes.rows[0].password_hash);
    console.log('checking password', isOk);
    if (!isOk) return res.status(401).end();

    await updateSessionAuthorizations(req, email);
    redirectToDefaultPath(req, res);
  } catch (e) {
    logError(e);
    res.status(400).end();
  }
};
