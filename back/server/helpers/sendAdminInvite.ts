import env from './env';
import { logError } from './logger';
import { getEmailConfig, getMailTransporter } from './mailTransporter';
import { buildEmail, getBestLanguage } from 'upsignon-mail';

export const ttlMinutes = 20;

export const buildAdminImportLink = (userId: string, token: string): string => {
  const baseUrl = encodeURIComponent(env.BACKEND_URL + '/login');
  const encodedToken = encodeURIComponent(token);
  return `${env.BACKEND_URL}/login.html?url=${baseUrl}&buttonId=signin&connectionToken=${encodedToken}&userId=${userId}`;
};

export const sendAdminInvite = async (
  email: string,
  userId: string,
  token: string,
  tokenExpiresAt: Date,
  acceptLanguage: string | undefined,
): Promise<void> => {
  try {
    const emailConfig = await getEmailConfig();
    const transporter = getMailTransporter(emailConfig, { debug: false });

    const link = buildAdminImportLink(userId, token);

    const { text, html, subject } = await buildEmail({
      templateName: 'proAdminInvitation',
      locales: getBestLanguage(acceptLanguage),
      args: {
        adminImportLink: link,
        loginPageLink: env.BACKEND_URL + '/login.html',
        expirationDate: tokenExpiresAt,
      },
    });

    await transporter.sendMail({
      from: emailConfig.EMAIL_SENDING_ADDRESS,
      to: email,
      subject,
      text,
      html,
    });
  } catch (e) {
    logError('sendAdminInvite', e);
  }
};
