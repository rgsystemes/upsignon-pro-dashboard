import env from './env';
import { logError } from './logger';
import { getEmailConfig, getMailTransporter } from './mailTransporter';

export const ttlMinutes = 20;
export const sendAdminInvite = async (
  email: string,
  token: string,
  tokenExpiresAt: Date,
  bankName: null | string,
): Promise<void> => {
  try {
    const emailConfig = await getEmailConfig();
    const transporter = getMailTransporter(emailConfig, { debug: false });

    const baseUrl = encodeURIComponent(env.BACKEND_URL + '/login');
    const encodedToken = encodeURIComponent(token);
    const link = `${env.BACKEND_URL}/login.html?url=${baseUrl}&buttonId=signin&connectionToken=${encodedToken}`;

    const expDate = tokenExpiresAt.toLocaleDateString('fr');

    await transporter.sendMail({
      from: emailConfig.EMAIL_SENDING_ADDRESS,
      to: email,
      subject: "Administration d'UpSignOn",
      text: `Bonjour,
    Vous avez été invité à administrer${
      bankName ? ' la banque de coffres-forts ' + bankName : ''
    } UpSignOn PRO.

    Vous pouvez ignorer cet email si vous avez déjà accès à la console d'administration pour une autre banque de coffre-fort.
Prérequis :
1. Avoir téléchargé l'application UpSignOn sur cet appareil (voir https://upsignon.eu/download).
2. Avoir créé ou importé votre coffre-fort PRO en utilisant le lien de configuration fourni par un autre administrateur.

Pour accéder à votre console de supervision, cliquez sur ce lien. Attention, ce lien ne fonctionne que si l'application est installée. Par ailleurs, il expirera dans ${ttlMinutes} minutes.
${link}

Si ce lien a expiré, vous pouvez le regénérer depuis la page ${env.BACKEND_URL + '/login.html'}.
Bonne journée,
UpSignOn`,
      html: `<!DOCTYPE html>
    <html><body>
<div>Bonjour,</div>
<div>Vous avez été invité à administrer${
        bankName ? ' la banque de coffres-forts' + bankName : ''
      } UpSignOn PRO.</div>
<div>Vous pouvez ignorer cet email si vous avez déjà accès à la console d'administration pour une autre banque de coffre-fort.</div>
<div>Prérequis :</div>
<div>1. Avoir téléchargé l'application UpSignOn sur cet appareil (voir <a href="https://upsignon.eu/download">cette page</a>).</div>
<div>2. Avoir créé ou importé votre coffre-fort PRO en utilisant le lien de configuration fourni par un autre administrateur.</div>
<br/>
<div>
<div>Pour accéder à votre console de supervision, cliquez sur ce lien. Attention, ce lien ne fonctionne que si l'application est installée. Par ailleurs, il expirera dans ${ttlMinutes} minutes.
<br/>
<a href="${link}">${link}</a>
<br/>
<div>Si ce lien a expiré, vous pouvez le regénérer depuis la page ${env.BACKEND_URL + '/login.html'}.</div>
</div>
<br/>
<div>Bonne journée,</div>
<div>UpSignOn</div>
</body></html>`,
    });
  } catch (e) {
    logError('sendAdminInvite', e);
  }
};
