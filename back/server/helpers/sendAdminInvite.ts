import nodemailer from 'nodemailer';

export const sendAdminInvite = async (
  email: string,
  token: string,
  tokenExpiresAt: Date,
  groupName: null | string,
): Promise<void> => {
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
Vous avez été invité à administrer${
      groupName ? ' la banque de coffres-forts ' + groupName : ''
    } UpSignOn PRO.
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
      groupName ? ' la banque de coffres-forts' + groupName : ''
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
};
