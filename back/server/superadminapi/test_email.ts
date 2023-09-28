import { cleanForHTMLInjections } from '../helpers/cleanHTMLInjections';
import { logError } from '../helpers/logger';
import { getEmailConfig, getMailTransporter } from '../helpers/mailTransporter';

export const test_email = async (req: any, res: any): Promise<void> => {
  try {
    const userEmail = req.query.email;
    if (!userEmail) return res.status(400).end();

    const emailConfig = await getEmailConfig();
    const transporter = getMailTransporter(emailConfig, { debug: false });

    // prevent HTML injections
    const safeEmailAddress = cleanForHTMLInjections(userEmail);

    await transporter.sendMail({
      from: emailConfig.EMAIL_SENDING_ADDRESS,
      to: safeEmailAddress,
      subject: 'Test',
      text: `Bonjour,\nL'envoi de mail depuis votre serveur UpSignOn PRO fonctionne correctement :)`,
    });
    // Return res
    return res.status(200).end();
  } catch (e) {
    logError('ERROR sending test email:', e);
    res.status(400).send();
  }
};
