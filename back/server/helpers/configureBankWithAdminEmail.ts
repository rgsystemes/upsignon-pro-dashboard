import { Response } from 'express';
import { db } from './db';
import env from './env';
import { getEmailConfig, getMailTransporter } from './mailTransporter';
import qrcode from 'qrcode-generator';
import { forceProStatusUpdate } from './forceProStatusUpdate';

export const configureBankWithAdminEmailAndSendMail = async (
  res: Response,
  adminEmail: string | null,
  validatedBody: {
    name: string;
    adminEmail: string | null;
    isTrial: boolean;
    salesEmail: string | null;
    resellerId: string | null;
  },
): Promise<void> => {
  const salesEmail = validatedBody.salesEmail || adminEmail;

  let newBankSettings = {};
  let expDate = null;
  if (validatedBody.isTrial) {
    expDate = new Date();
    expDate.setDate(expDate.getDate() + 30);
    expDate.setMilliseconds(0);
    expDate.setSeconds(0);
    expDate.setMinutes(0);
    expDate.setHours(0);
    newBankSettings = {
      IS_TESTING: true,
      TESTING_EXPIRATION_DATE: expDate,
      SALES_REP: salesEmail,
    };
  }
  const bankInsertRes = await db.query(
    'INSERT INTO banks (name, settings, reseller_id) VALUES ($1, $2, $3) RETURNING id, public_id',
    [validatedBody.name, newBankSettings, validatedBody.resellerId],
  );
  if (bankInsertRes.rowCount === 0) {
    res.status(500).end();
    return;
  }
  const insertedBank = bankInsertRes.rows[0];

  if (validatedBody.adminEmail) {
    // add allowed emails
    const emailPattern = '*@' + validatedBody.adminEmail.split('@')[1].trim().toLowerCase();
    await db.query('INSERT INTO allowed_emails (pattern, bank_id) VALUES (lower($1), $2)', [
      emailPattern,
      insertedBank.id,
    ]);

    // add bank admin
    const selectRes = await db.query('SELECT id FROM admins WHERE email=$1', [
      validatedBody.adminEmail,
    ]);
    var adminId = '';
    if (selectRes.rows.length === 0) {
      // Send new invitation
      const insertRes = await db.query(
        `INSERT INTO admins (id, email, admin_role) VALUES (gen_random_uuid(), lower($2), 'admin') RETURNING id`,
        [validatedBody.adminEmail],
      );
      adminId = insertRes.rows[0].id;
    } else {
      adminId = selectRes.rows[0].id;
    }

    await db.query(
      'INSERT INTO admin_banks (admin_id, bank_id) VALUES ($1,$2) ON CONFLICT (admin_id, bank_id) DO NOTHING',
      [adminId, insertedBank.id],
    );

    forceProStatusUpdate();
    /////////////////////
    // SEND EMAIL
    /////////////////////
    const settingsRes = await db.query(
      "SELECT value FROM settings WHERE key='PRO_SERVER_URL_CONFIG'",
    );
    if (settingsRes.rowCount === 0) {
      res.status(400).end();
      return;
    }
    const { url } = settingsRes.rows[0].value;
    const bankLink = `${url}/${insertedBank.public_id}`;
    const qr = qrcode(0, 'L');
    qr.addData(bankLink);
    qr.make();
    const size = 150;
    const nbPixels = qr.getModuleCount();
    const cellSize = Math.round(size / nbPixels);

    const adminLoginPage = `${env.FRONTEND_URL}/login.html`;

    const emailContent = validatedBody.isTrial
      ? getTrialEmail(bankLink, qr, expDate!, validatedBody.adminEmail, adminLoginPage, cellSize)
      : getNonTrialEmail(bankLink, qr, validatedBody.adminEmail, adminLoginPage, cellSize);

    const emailConfig = await getEmailConfig();
    const transporter = getMailTransporter(emailConfig, { debug: false });
    const useCc = salesEmail !== adminEmail && !!salesEmail;

    transporter.sendMail({
      from: `"UpSignOn" <${emailConfig.EMAIL_SENDING_ADDRESS}>`,
      to: validatedBody.adminEmail,
      cc: useCc ? [salesEmail!] : undefined,
      replyTo: salesEmail ?? undefined,
      subject: validatedBody.isTrial
        ? 'Ouverture de votre banque de test UpSignOn PRO'
        : 'Ouverture de votre banque UpSignOn PRO',
      text: emailContent.text,
      html: emailContent.html,
    });
  }

  res.status(200).end();
};

function getTrialEmail(
  bankLink: string,
  qr: QRCode,
  expDate: Date,
  adminEmail: string,
  adminLoginPage: string,
  qrCellSize: number,
): { text: string; html: string } {
  const text = `
Bonjour,
\n\n
Merci pour votre demande de test de notre coffre-fort de mots de passe UpSignOn PRO.
\n\n
Vous trouverez les instructions à suivre pour ouvrir vos coffres-forts sur ce lien : ${bankLink}
\n\n
Votre banque de coffres-forts sera bloquée automatiquement le ${expDate.toLocaleDateString()} à l’issue de votre période de test.
\n\n
Une fois votre coffre-fort créé, vous pourrez accéder à la console de supervision en saisissant votre adresse email [${adminEmail}](mailto:${adminEmail}) sur la page [${adminLoginPage}](${adminLoginPage}).
\n\n
N'hésitez pas à répondre à ce mail pour toute question.
\n\n
Cordialement,
\n\n
L'équipe RG System.
    `;
  const html = `
  <div style="font-family: Arial, sans-serif; font-size: 15px; color: #222;">
    <p>Bonjour,</p>
    <p>
      Merci pour votre demande de test de notre coffre-fort de mots de passe <b>UpSignOn PRO</b>.
    </p>
    <p>
      Vous trouverez les instructions à suivre pour ouvrir vos coffres-forts sur ce lien&nbsp;:
      <br>
      <a href="${bankLink}" target="_blank">${bankLink}</a>
    </p>
    <p>
      Ou de façon équivalente en scannant ce QR code&nbsp;:<br>
      <img src="${qr.createDataURL(qrCellSize, 0)}" alt="QR Code" style="margin: 12px 0;" />
    </p>
    <p>
      Votre banque de coffres-forts sera bloquée automatiquement le <b>${expDate.toLocaleDateString()}</b> à l’issue de votre période de test.
    </p>
    <p>
      Une fois votre coffre-fort créé, vous pourrez accéder à la console de supervision en saisissant votre adresse email
      <a href="mailto:${adminEmail}">${adminEmail}</a>
      sur la page
      <a href="${adminLoginPage}" target="_blank">${adminLoginPage}</a>.
    </p>
    <p>
      N'hésitez pas à répondre à ce mail pour toute question.
    </p>
    <p>
      Cordialement,<br>
      L'équipe RG System.
    </p>
  </div>
`;
  return { text, html };
}

function getNonTrialEmail(
  bankLink: string,
  qr: any,
  adminEmail: string,
  adminLoginPage: string,
  qrCellSize: number,
): { text: string; html: string } {
  const text = `
Bonjour,
\n\n
Merci d'avoir choisi notre solution UpSignOn PRO pour la gestion de vos mots de passe!
\n\n
Vous trouverez les instructions à suivre pour ouvrir vos coffres-forts sur ce lien : ${bankLink}
\n\n
Une fois votre coffre-fort créé, vous pourrez accéder à la console de supervision en saisissant votre adresse email [${adminEmail}](mailto:${adminEmail}) sur la page [${adminLoginPage}](${adminLoginPage}).
\n\n
N'hésitez pas à répondre à ce mail pour toute question.
\n\n
Cordialement,
\n\n
L'équipe RG System.
    `;
  const html = `
  <div style="font-family: Arial, sans-serif; font-size: 15px; color: #222;">
    <p>Bonjour,</p>
    <p>
      Merci d'avoir choisi notre solution UpSignOn PRO pour la gestion de vos mots de passe!
    </p>
    <p>
      Vous trouverez les instructions à suivre pour ouvrir vos coffres-forts sur ce lien&nbsp;:
      <br>
      <a href="${bankLink}" target="_blank">${bankLink}</a>
    </p>
    <p>
      Ou de façon équivalente en scannant ce QR code&nbsp;:<br>
      <img src="${qr.createDataURL(qrCellSize, 0)}" alt="QR Code" style="margin: 12px 0;" />
    </p>
    <p>
      Une fois votre coffre-fort créé, vous pourrez accéder à la console de supervision en saisissant votre adresse email
      <a href="mailto:${adminEmail}">${adminEmail}</a>
      sur la page
      <a href="${adminLoginPage}" target="_blank">${adminLoginPage}</a>.
    </p>
    <p>
      N'hésitez pas à répondre à ce mail pour toute question.
    </p>
    <p>
      Cordialement,<br>
      L'équipe RG System.
    </p>
  </div>
`;
  return { text, html };
}
