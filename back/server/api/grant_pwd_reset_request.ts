import { v4 } from 'uuid';
import { db } from '../helpers/db';
import { logError } from '../helpers/logger';
import { getEmailConfig, getMailTransporter } from '../helpers/mailTransporter';

export const grant_pwd_reset_request = async (
  req: any,
  res: any,
  asSuperadmin: boolean,
): Promise<void> => {
  try {
    if (req.session.adminRole === 'restricted_superadmin') {
      res.status(401).json({ error: 'Not allowed for restricted superadmin' });
      return;
    }
    const adminEmail = req.session?.adminEmail;
    const requestId = req.params.requestId;
    const expDuration = 60 * 60 * 1000; //  1 hour
    const expDate = Date.now() + expDuration;
    const date = new Date();
    date.setTime(expDate);
    const expirationDate = date.toISOString();
    const requestToken = v4().substring(0, 8);
    await db.query(
      `UPDATE password_reset_request SET status='ADMIN_AUTHORIZED', reset_token=$1, reset_token_expiration_date=$2, granted_by=$3 WHERE id=$4 ${
        asSuperadmin ? '' : 'AND bank_id=$5'
      }`,
      asSuperadmin
        ? [requestToken, expirationDate, adminEmail, requestId]
        : [requestToken, expirationDate, adminEmail, requestId, req.proxyParamsBankId],
    );
    const userReq = await db.query(
      `SELECT u.email, ud.device_name FROM users AS u INNER JOIN user_devices AS ud ON u.id=ud.user_id INNER JOIN password_reset_request AS prr ON prr.device_id=ud.id WHERE prr.id=$1 ${
        asSuperadmin ? '' : 'AND u.bank_id=$2'
      }`,
      asSuperadmin ? [requestId] : [requestId, req.proxyParamsBankId],
    );
    const emailAddress = userReq.rows[0].email;
    const deviceName = userReq.rows[0].device_name;

    const emailConfig = await getEmailConfig();
    const transporter = getMailTransporter(emailConfig, { debug: false });

    const expirationTime = date.toLocaleTimeString().split(':').slice(0, 2).join(':');
    await transporter.sendMail({
      from: emailConfig.EMAIL_SENDING_ADDRESS,
      to: emailAddress,
      subject: 'UpSignOn: mot de passe oublié',
      text: `Bonjour,\nVous avez effectué une demande de réinitialisation de votre mot de passe depuis votre appareil "${deviceName}".\n\nPour réinitiliaser votre mot de passe UpSignOn PRO, saisissez le code suivant :\n\n${requestToken}\n\nAttention, ce code n'est valide que pour l'appareil "${deviceName}" et expirera à ${expirationTime}.\n\nBonne journée,\nUpSignOn`,
      html: `<body><p>Bonjour,</p><p>Vous avez effectué une demande de réinitialisation de votre mot de passe depuis votre appareil "${deviceName}".</p><p>Pour réinitiliaser votre mot de passe UpSignOn PRO, saisissez le code suivant :</p><p style="font-family:monospace;font-size: 20px; font-weight: bold; margin: 20px 0;">${requestToken}</p><p>Attention, ce code n'est valide que pour l'appareil "${deviceName}" et expirera à ${expirationTime}.</p><p>Bonne journée,<br/>UpSignOn</p></body>`,
    });
    res.status(200).end();
  } catch (e) {
    logError('grant_pwd_reset_request', e);
    res.status(400).end();
  }
};
