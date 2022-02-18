import { v4 } from 'uuid';
import nodemailer from 'nodemailer';
import { db } from '../helpers/connection';
import env from '../helpers/env';
import { logError } from '../helpers/logger';

export const grant_pwd_reset_request = async (
  req: any,
  res: any,
  asSuperadmin: boolean,
): Promise<void> => {
  try {
    const requestId = req.params.requestId;
    const expDuration = 10 * 60 * 1000; // 10 minutes
    const expDate = Date.now() + expDuration;
    const date = new Date();
    date.setTime(expDate);
    const expirationDate = date.toISOString();
    const requestToken = v4().substring(0, 8);
    await db.query(
      `UPDATE password_reset_request SET status='ADMIN_AUTHORIZED', reset_token=$1, reset_token_expiration_date=$2 WHERE id=$3 ${
        asSuperadmin ? '' : 'AND group_id=$4'
      }`,
      asSuperadmin
        ? [requestToken, expirationDate, requestId]
        : [requestToken, expirationDate, requestId, req.proxyParamsGroupId],
    );
    const userReq = await db.query(
      `SELECT u.email, ud.device_name FROM users AS u INNER JOIN user_devices AS ud ON u.id=ud.user_id INNER JOIN password_reset_request AS prr ON prr.device_id=ud.id WHERE prr.id=$1 ${
        asSuperadmin ? '' : 'AND group_id=$2'
      }`,
      asSuperadmin ? [requestId] : [requestId, req.proxyParamsGroupId],
    );
    const emailAddress = userReq.rows[0].email;
    const deviceName = userReq.rows[0].device_name;
    const transportOptions = {
      host: env.EMAIL_HOST,
      port: env.EMAIL_PORT,
      secure: env.EMAIL_PORT === 465,
    };
    if (env.EMAIL_PASS) {
      // @ts-ignore
      transportOptions.auth = {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASS,
      };
    }
    const transporter = nodemailer.createTransport(transportOptions);
    const expirationTime = `${date.getHours()}:${date
      .getMinutes()
      .toLocaleString(undefined, { minimumIntegerDigits: 2 })}`;
    await transporter.sendMail({
      from: env.EMAIL_USER,
      to: emailAddress,
      subject: 'Réinitialisation de votre mot de passe UpSignOn PRO',
      text: `Bonjour,\nVous avez effectué une demande de réinitialisation de votre mot de passe depuis votre appareil "${deviceName}".\n\nPour réinitiliaser votre mot de passe UpSignOn PRO, saisissez le code suivant.\n\n${requestToken}\n\nAttention, ce code n'est valide que pour l'appareil "${deviceName}" et expirera à ${expirationTime}.\n\nBonne journée,\nUpSignOn`,
    });
    res.status(200).end();
  } catch (e) {
    logError(e);
    res.status(400).end();
  }
};
