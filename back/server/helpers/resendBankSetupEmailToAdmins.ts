import { buildEmail, getBestLanguage } from 'upsignon-mail';
import env from './env';
import { db } from './db';
import { getEmailConfig, getMailTransporter } from './mailTransporter';

export const resendBankSetupEmailToMe = async (req: any, bankId: number): Promise<void> => {
  const adminEmail = req.session?.adminEmail;
  if (!adminEmail || typeof adminEmail !== 'string') {
    throw new Error('Missing session admin email');
  }

  const settingsRes = await db.query(
    "SELECT value FROM settings WHERE key='PRO_SERVER_URL_CONFIG'",
  );
  if (settingsRes.rowCount === 0) {
    throw new Error('Missing PRO_SERVER_URL_CONFIG setting');
  }

  const bankRes = await db.query('SELECT public_id, settings FROM banks WHERE id=$1', [bankId]);
  if (bankRes.rowCount === 0) {
    throw new Error('Bank not found');
  }

  const { url } = settingsRes.rows[0].value;
  const bankSetupUrl = `${url}/${bankRes.rows[0].public_id}`;
  const consoleLink = `${env.FRONTEND_URL}/login.html`;
  const bankSettings = bankRes.rows[0].settings ?? {};
  const isTrial = !!bankSettings.IS_TESTING;

  let trialEndDate = bankSettings.TESTING_EXPIRATION_DATE
    ? new Date(bankSettings.TESTING_EXPIRATION_DATE)
    : null;
  if (isTrial && (!trialEndDate || Number.isNaN(trialEndDate.getTime()))) {
    trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 30);
    trialEndDate.setMilliseconds(0);
    trialEndDate.setSeconds(0);
    trialEndDate.setMinutes(0);
    trialEndDate.setHours(0);
  }

  const emailConfig = await getEmailConfig();
  const transporter = getMailTransporter(emailConfig, { debug: false });
  const locales = getBestLanguage(req.headers['accept-language']);

  const { subject, text, html } = isTrial
    ? await buildEmail({
        templateName: 'trialWelcome',
        locales,
        args: {
          activationLink: bankSetupUrl,
          consoleLink,
          trialEndDate: trialEndDate!,
        },
      })
    : await buildEmail({
        templateName: 'proBankOpening',
        locales,
        args: {
          bankSetupUrl,
          consoleLink,
          userEmail: adminEmail,
        },
      });

  await transporter.sendMail({
    from: `"UpSignOn" <${emailConfig.EMAIL_SENDING_ADDRESS}>`,
    to: adminEmail,
    subject,
    text,
    html,
  });
};
