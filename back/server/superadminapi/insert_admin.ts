/* eslint-disable @typescript-eslint/no-var-requires */
import { v4 } from 'uuid';
import nodemailer from 'nodemailer';
import { db } from '../helpers/connection';
import { logError } from '../helpers/logger';

export const insert_admin = async (req: any, res: any): Promise<void> => {
  try {
    const email = req.body.newEmail;
    if (typeof email !== 'string') return res.status(401).end();

    const isSuperadmin = req.body.isSuperadmin;

    const newId = v4();
    const token = v4();
    const tokenExpiresAt = new Date();
    const ttl = 24 * 3600 * 1000; // one day
    tokenExpiresAt.setTime(tokenExpiresAt.getTime() + ttl);
    const groupName = null;
    await db.query(
      `INSERT INTO admins (id, email, is_superadmin, token, token_expires_at) VALUES ($1, lower($2), $3, $4, $5) ON CONFLICT (email) DO UPDATE SET token=$4, token_expires_at=$5, is_superadmin=$3`,
      [newId, email, isSuperadmin, token, tokenExpiresAt],
    );

    const transportOptions = {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: parseInt(process.env.EMAIL_PORT || '587') === 465,
    };
    if (process.env.EMAIL_PASS) {
      // @ts-ignore
      transportOptions.auth = {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      };
    }
    // @ts-ignore
    const transporter = nodemailer.createTransport(transportOptions);
    const baseUrl = encodeURIComponent(process.env.SERVER_URL?.replace(/\/$/, '') + '/login');
    const encodedToken = encodeURIComponent(token);
    const link = `upsignon://protocol/?url=${baseUrl}&buttonId=signin&connectionToken=${encodedToken}`;

    const expDate = tokenExpiresAt.toISOString().split('T')[0];
    const expTime = tokenExpiresAt.toISOString().split('T')[1].split('.')[0];

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Administration d'UpSignOn",
      text: `Bonjour,
  Vous avez été invité à administrer${groupName ? ' le groupe' + groupName : ''} UpSignOn PRO.
  1. Téléchargez l'application UpSignOn sur cet appareil (voir https://upsignon.eu/download).
  2. Créez ou importez votre espace PRO en utilisant le lien de configuration fourni par un autre administrateur.
  3. Cliquez sur ce lien pour devenir administrateur. Attention, ce lien ne fonctionne que si l'application est installée. Par ailleurs, il expirera le ${expDate} à ${expTime}.
      ${link}

  Bonne journée,
  UpSignOn`,
      html: `<!DOCTYPE html>
  <html><body>
  <div>Bonjour,</div>
  <div>Vous avez été invité à administrer${
    groupName ? ' le groupe' + groupName : ''
  } UpSignOn PRO.</div>
  <div>1. Téléchargez l'application UpSignOn sur cet appareil (voir <a href="https://upsignon.eu/download">cette page</a>).</div>
  <div>2. Créez ou importez votre espace PRO en utilisant le lien de configuration fourni par un autre administrateur.</div>
  <div>3. Cliquez sur ce lien pour devenir administrateur. Attention, ce lien ne fonctionne que si l'application est installée. Par ailleurs, il expirera le ${expDate} à ${expTime}.
    <br/>
    <a href="${link}">${link}</a>
  </div>
  <br/>
  <div>Bonne journée,</div>
  <div>UpSignOn</div>
  </body></html>`,
    });

    res.status(200).end();
  } catch (e) {
    logError(e);
    res.status(400).end();
  }
};
