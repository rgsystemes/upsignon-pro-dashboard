import { v4 } from 'uuid';
import { db } from '../helpers/db';
import { logError } from '../helpers/logger';
import { getEmailConfig, getMailTransporter } from '../helpers/mailTransporter';
import { buildEmail, getBestLanguage } from 'upsignon-mail';

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

    const { html, text, subject } = await buildEmail({
      templateName: 'resetPassword',
      locales: getBestLanguage(req.headers['accept-language']),
      args: {
        deviceName,
        code: requestToken,
        expirationDate,
      },
    });

    await transporter.sendMail({
      from: emailConfig.EMAIL_SENDING_ADDRESS,
      to: emailAddress,
      subject,
      text,
      html,
    });
    res.status(200).end();
  } catch (e) {
    logError('grant_pwd_reset_request', e);
    res.status(400).end();
  }
};
