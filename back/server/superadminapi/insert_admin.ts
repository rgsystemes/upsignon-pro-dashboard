/* eslint-disable @typescript-eslint/no-var-requires */
import { v4 } from 'uuid';
import nodemailer from 'nodemailer';
import { db } from '../helpers/connection';
import { logError } from '../helpers/logger';

export const insert_admin = async (req: any, res: any): Promise<void> => {
  try {
    const email = req.body.newEmail;
    if (typeof email !== 'string') return res.status(401).end();

    const groupId = req.body.groupId;

    const newId = v4();
    const token = v4();
    const tokenExpiresAt = new Date();
    const ttl = 24 * 3600 * 1000; // one day
    tokenExpiresAt.setTime(tokenExpiresAt.getTime() + ttl);
    let groupName = null;
    if (groupId) {
      const groupRes = await db.query('SELECT name FROM groups WHERE id=$1', [groupId]);
      if (groupRes.rowCount === 0) throw new Error('bad_group');
      groupName = groupRes.rows[0].name;
      await db.query(
        `INSERT INTO admins (id, email, is_superadmin, token, token_expires_at, group_id) VALUES ($1, lower($2), false, $3, $4, $5) ON CONFLICT (email) DO UPDATE SET token=$3, token_expires_at=$4`,
        [newId, email, token, tokenExpiresAt, groupId],
      );
    } else {
      await db.query(
        `INSERT INTO admins (id, email, is_superadmin, token, token_expires_at) VALUES ($1, lower($2), true, $3, $4) ON CONFLICT (email) DO UPDATE SET token=$3, token_expires_at=$4, is_superadmin=true`,
        [newId, email, token, tokenExpiresAt],
      );
    }

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
      subject: "Admnistration d'UpSignOn",
      text: `Bonjour,
  Vous avez été invité à administrer${groupName ? 'le groupe ' + groupName : ''} UpSignOn PRO.
  Téléchargez l'application UpSignOn sur cet appareil, créez ou importez votre espace PRO, puis cliquez sur ce lien pour devenir administrateur.

  ${link}

  Attention, ce code expirera le ${expDate} à ${expTime}.

  Bonne journée,
  UpSignOn`,
      html: `<!DOCTYPE html>
  <html><body>
  <div>Bonjour,</div>
  <div>Vous avez été invité à administrer${
    groupName ? 'le groupe ' + groupName : ''
  } UpSignOn PRO.</div>
  <div>Téléchargez l'application UpSignOn sur cet appareil, créez ou importez votre espace PRO, puis cliquez sur ce lien pour devenir administrateur.</div>
  <br/>
  <a href="${link}">${link}</a>
  <br/>
  <br/>
  <div>Attention, ce code expirera le ${expDate} à ${expTime}.</div>
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
