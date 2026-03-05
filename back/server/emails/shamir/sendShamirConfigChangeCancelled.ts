import { buildEmail, getBestLanguage } from 'upsignon-mail';
import { getAdminEmailsForBank } from '../../helpers/getAdminEmailsForBank';
import { getEmailConfig, getMailTransporter } from '../../helpers/mailTransporter';
import { logError } from '../../helpers/logger';
import { inputSanitizer } from '../../helpers/sanitizer';

type TShamirConfigChangeCancelled = {
  trustedPersonEmails: string[];
  supportEmail: string;
  bankId: number;
  bankName: string;
  shamirConfigName: string;
  creatorEmail: string;
  acceptLanguage: string | undefined;
};
export const sendShamirConfigChangeCancelledToTrustedPersonsCCAdmins = async ({
  trustedPersonEmails,
  supportEmail,
  bankId,
  bankName,
  shamirConfigName,
  creatorEmail,
  acceptLanguage,
}: TShamirConfigChangeCancelled): Promise<void> => {
  try {
    const emailConfig = await getEmailConfig();
    const transporter = getMailTransporter(emailConfig, { debug: false });

    // prevent HTML injections
    const safeBankName = inputSanitizer.cleanForHTMLInjections(bankName);
    const safeShamirConfigName = inputSanitizer.cleanForHTMLInjections(shamirConfigName);
    const safeCreatorEmail = inputSanitizer.cleanForHTMLInjections(creatorEmail);
    const safeTrustedPersonEmails = trustedPersonEmails.map(inputSanitizer.cleanForHTMLInjections);
    const safeSupportEmail = inputSanitizer.cleanForHTMLInjections(supportEmail);

    const adminEmails = await getAdminEmailsForBank(bankId);
    if (adminEmails.length === 0) return;

    const { html, text, subject } = await buildEmail({
      templateName: 'configChangeRequestCancelled',
      locales: getBestLanguage(acceptLanguage),
      args: {
        bankName: safeBankName,
        shamirConfigName: safeShamirConfigName,
        creatorEmail: safeCreatorEmail,
      },
    });

    await transporter.sendMail({
      from: emailConfig.EMAIL_SENDING_ADDRESS,
      to: safeTrustedPersonEmails,
      cc: adminEmails,
      replyTo: safeSupportEmail,
      subject: subject,
      text: text,
      html: html,
    });
  } catch (e) {
    logError('sendShamirConfigChangeCancelledToTrustedPersonsCCAdmins error:', e);
  }
};
