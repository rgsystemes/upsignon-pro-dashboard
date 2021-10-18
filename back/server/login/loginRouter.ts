import express from 'express';
import bcrypt from 'bcrypt';
import { db } from '../helpers/connection';
import { v4 as uuidv4 } from 'uuid';
import env from '../helpers/env';

export const loginRouter = express.Router();

// UPSIGNON config
const CONFIG_VERSION = '1';
const config = {
  version: CONFIG_VERSION,
  legalTerms: [],
  fields: [{ type: 'email', key: 'email1', mandatory: true }],
};

const buttonConfigs = {
  connect: {
    fields: [{ type: 'email', key: 'email1', mandatory: true }],
    forceFormDisplay: false,
    generalConfigVersion: CONFIG_VERSION,
  },
};

/* HELPERS */

const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 10);
};

const passwordIsOk = async (password: string, passwordHash: string): Promise<boolean> => {
  return await bcrypt.compare(password, passwordHash);
};

const isTokenExpired = (created_at: Date) => {
  const expirationTime = 60 * 1000; // 1 minute
  return created_at.getTime() < new Date().getTime() - expirationTime;
};

const checkPassword = async (userId: string, password: string): Promise<boolean> => {
  try {
    if (!password) return false;
    let dbRes;
    try {
      dbRes = await db.query('SELECT password_hash FROM admins WHERE id=$1', [userId]);
    } catch {}
    if (!dbRes || dbRes.rowCount === 0) return false;
    const isOk: boolean = await passwordIsOk(password, dbRes.rows[0].password_hash);
    return isOk;
  } catch {
    return false;
  }
};

/* ROUTER */

loginRouter.get('/config', async (req, res) => {
  try {
    return res.status(200).json(config);
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

loginRouter.get('/button-config', async (req, res) => {
  try {
    const buttonId = req.query.buttonId;
    // @ts-ignore
    const buttonConfig = buttonConfigs[buttonId];
    if (!buttonConfig) {
      return res.status(404).end();
    }
    return res.status(200).json(buttonConfig);
  } catch (e) {
    console.error(e);
    res.status(404).end();
  }
});

loginRouter.post('/connect', async (req, res) => {
  try {
    const password = req.body.password;
    const id = req.body.userId;
    const buttonId = req.body.buttonId;
    if (!id) return res.status(401).end();
    if (!password) return res.status(401).end();

    const isOk = await checkPassword(id, password);
    if (!isOk) return res.status(401).end();

    const connectionToken = uuidv4();
    try {
      await db.query('UPDATE admins SET token=$1, token_created_at=$2 WHERE id=$3', [
        connectionToken,
        new Date(),
        id,
      ]);
    } catch {
      return res.status(400).end();
    }
    let redirectionUri;
    if (env.IS_PRODUCTION) {
      switch (buttonId) {
        default:
          redirectionUri = env.SERVER_URL + '/login/redirection/';
      }
    } else {
      redirectionUri = `${req.protocol}://${req.headers.host}/login/redirection/`;
    }
    res.status(200).json({ connectionToken, redirectionUri });
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

loginRouter.post('/create-account', async (req, res) => {
  try {
    const password = req.body.password;
    if (!password) return res.status(400).end();

    const data = req.body.data || [];
    const emailObject = data.find((d: any) => d.key === 'email1');
    const emailValue = emailObject?.value?.address;
    if (!emailValue) return res.status(403).json({ message: "L'adresse email est vide." });
    const authorizedAdmin = await db.query(
      'SELECT id FROM admins WHERE email=$1 AND password_hash is null',
      [emailValue],
    );

    if (authorizedAdmin.rowCount === 0) {
      return res.status(403).json({ message: "Cet email n'est pas autorisé." });
    }
    const id = authorizedAdmin.rows[0].id;

    const hash = await hashPassword(password);
    await db.query('UPDATE admins SET password_hash=$1 WHERE id=$2', [hash, id]);
    res.status(200).json({ userId: id });
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

loginRouter.post('/export-account', async (req: any, res: any) => {
  try {
    const password = req.body.currentPassword;
    const login = req.body.currentLogin;
    const connectionToken = req.body.connectionToken;
    const newPassword = req.body.newPassword;
    if (!newPassword) return res.status(400).end();
    if ((!login || !password) && !connectionToken) return res.status(400).end();
    if (!!login && !!password && !!connectionToken) return res.status(400).end();

    let userId;
    let userData;
    if (!!login && !!password) {
      let dbRes;
      try {
        dbRes = await db.query('SELECT id, email, password_hash FROM admins WHERE email=$1', [
          login,
        ]);
      } catch {}
      if (!dbRes || dbRes.rowCount === 0) return res.status(401).end();
      const isPasswordOK = await passwordIsOk(password, dbRes.rows[0].password_hash);
      if (!isPasswordOK) return res.status(401).end();
      userId = dbRes.rows[0].id;
      userData = [{ type: 'email', key: 'email1', value: { address: login, isValidated: true } }];
    } else {
      const [id, token] = connectionToken.split(':');
      if (!id || !token) return res.status(401).end();
      let currentRes;
      try {
        currentRes = await db.query(
          'SELECT email, token_created_at FROM admins WHERE id=$1 AND token=$2',
          [id, token],
        );
      } catch {}
      if (!currentRes || currentRes.rowCount === 0) return res.status(401).end();
      // do not check for token expired during the export step.
      // if(isTokenExpired(currentRes.rows[0].token_created_at)) return res.status(401).end();
      await db.query('UPDATE admins SET token=null, token_created_at=null WHERE id=$1', [id]);
      userId = id;
      userData = [
        {
          type: 'email',
          key: 'email1',
          value: { address: currentRes.rows[0].email, isValidated: true },
        },
      ];
    }
    const hash = await hashPassword(newPassword);
    await db.query('UPDATE admins SET password_hash=$1 WHERE id=$2', [hash, userId]);
    res.status(200).json({ userId, userData });
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

loginRouter.get('/redirection/', async (req: any, res: any) => {
  try {
    const userId = req.query.userId;
    const connectionToken = req.query.connectionToken;
    if (!userId || !connectionToken) return res.status(404).end();
    let dbRes;
    try {
      dbRes = await db.query(
        'SELECT email, token_created_at FROM admins WHERE id=$1 AND token=$2',
        [userId, connectionToken],
      );
    } catch {}
    if (!dbRes || dbRes.rowCount !== 1) return res.status(401).send('CONNECTION ERROR'); // TODO ERROR PAGE
    if (isTokenExpired(dbRes.rows[0].token_created_at))
      return res.status(401).send('CONNECTION ERROR'); // TODO ERROR PAGE
    await db.query('UPDATE admins SET token=null, token_created_at=null WHERE id=$1 ', [userId]);

    req.session.adminEmail = dbRes.rows[0].email;
    if (env.IS_PRODUCTION) {
      res.redirect(303, env.SERVER_URL);
    } else {
      res.redirect(303, `${req.protocol}://${req.headers.host}`);
    }
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

loginRouter.post('/update-password', async (req, res) => {
  try {
    const password = req.body.password;
    const newPassword = req.body.newPassword;
    const id = req.body.userId;
    if (!id || !newPassword) return res.status(400).end();

    const isOk = await checkPassword(id, password);
    if (isOk) {
      const newPasswordHash = await hashPassword(newPassword);
      await db.query('UPDATE admins SET password_hash=$1 WHERE id=$2', [newPasswordHash, id]);
      res.status(200).end();
    } else {
      const isNewPasswordOK = await checkPassword(id, newPassword);
      if (isNewPasswordOK) return res.status(200).end();
      return res.status(401).end();
    }
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

loginRouter.post('/update-data', async (req, res) => {
  return res
    .status(403)
    .send({ message: 'Vous ne pouvez pas modifier votre adresse email pour ce compte.' });
});

loginRouter.post('/delete-account-and-data', async (req, res) => {
  try {
    const password = req.body.password;
    const id = req.body.userId;
    if (!id) return res.status(400).end();
    if (!password) return res.status(401).end();
    let dbRes;
    try {
      dbRes = await db.query('SELECT password_hash FROM admins WHERE id=$1', [id]);
    } catch {}
    if (!dbRes || dbRes.rowCount === 0) return res.status(200).json({ deletionStatus: 'DONE' });
    const isOk: boolean = await passwordIsOk(password, dbRes.rows[0].password_hash);
    if (!isOk) return res.status(401).end();
    await db.query('DELETE FROM admins WHERE id=$1', [id]);
    res.status(200).json({ deletionStatus: 'DONE' });
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});
