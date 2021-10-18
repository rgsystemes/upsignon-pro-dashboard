/* eslint-disable @typescript-eslint/no-var-requires */
import { v4 } from 'uuid';
import nodemailer from 'nodemailer';
import { db } from '../helpers/connection';

export const inviteNewAdmin = async (email: string): Promise<void> => {
  const newId = v4();
  const token = v4();
  const tokenExpiresAt = new Date();
  const ttl = 24 * 3600 * 1000; // one day
  tokenExpiresAt.setTime(tokenExpiresAt.getTime() + ttl);
  await db.query(
    `INSERT INTO admins (id, email, token, token_expires_at) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO UPDATE SET token=$3, token_expires_at=$4`,
    [newId, email, token, tokenExpiresAt],
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

  const baseUrl = encodeURIComponent(process.env.SERVER_URL + '/login');
  const encodedToken = encodeURIComponent(token);
  const link = `upsignon://protocol/?url=${baseUrl}&buttonId=signin&connectionToken=${encodedToken}`;

  const expDate = tokenExpiresAt.toISOString().split('T')[0];
  const expTime = tokenExpiresAt.toISOString().split('T')[1].split('.')[0];

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Admnistration d'UpSignOn",
    text: `Bonjour,
Vous avez été invité à administrer UpSignOn PRO.
Téléchargez l'application UpSignOn sur cet appareil, créez ou importez votre espace PRO, puis cliquez sur ce lien pour devenir administrateur.

${link}

Attention, ce code expirera le ${expDate} à ${expTime}.

Bonne journée,
UpSignOn`,
    html: `<!DOCTYPE html>
<html><body>
<div>Bonjour,</div>
<div>Vous avez été invité à administrer UpSignOn PRO.</div>
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
};
