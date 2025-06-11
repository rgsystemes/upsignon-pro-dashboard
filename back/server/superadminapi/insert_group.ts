import Joi from 'joi';
import { db } from '../helpers/db';
import { logError } from '../helpers/logger';
import { v4 } from 'uuid';
import { getEmailConfig, getMailTransporter } from '../helpers/mailTransporter';
import env from '../helpers/env';
import qrcode from 'qrcode-generator';

export const insert_group = async (req: any, res: any): Promise<void> => {
  try {
    const validatedBody: {
      name: string;
      adminEmail: string;
      isTrial: boolean;
      salesEmail: string;
    } = Joi.attempt(
      req.body,
      Joi.object({
        name: Joi.string()
          .required()
          .pattern(/^\w{2,50}$/),
        adminEmail: Joi.string().email().required(),
        isTrial: Joi.boolean(),
        salesEmail: Joi.string().email(),
      }),
    );
    let newBankSettings = {};
    let expDate = null;
    if (validatedBody.isTrial) {
      expDate = new Date();
      expDate.setDate(expDate.getDate() + 30);
      expDate.setMilliseconds(0);
      expDate.setSeconds(0);
      expDate.setMinutes(0);
      expDate.setHours(0);
      newBankSettings = { IS_TESTING: true, TESTING_EXPIRATION_DATE: expDate };
    }
    const groupInsertRes = await db.query(
      'INSERT INTO groups (name, settings) VALUES ($1, $2) RETURNING id, public_id',
      [validatedBody.name, newBankSettings],
    );
    if (groupInsertRes.rowCount === 0) {
      return res.status(500).end();
    }
    const insertedGroup = groupInsertRes.rows[0];

    // add allowed emails
    const emailPattern = '*@' + validatedBody.adminEmail.split('@')[1].trim().toLowerCase();
    await db.query('INSERT INTO allowed_emails (pattern, group_id) VALUES (lower($1), $2)', [
      emailPattern,
      insertedGroup.id,
    ]);

    // add group admin
    const selectRes = await db.query('SELECT id FROM admins WHERE email=$1', [
      validatedBody.adminEmail,
    ]);
    var adminId = '';
    if (selectRes.rows.length === 0) {
      // Send new invitation
      const newId = v4();
      const insertRes = await db.query(
        `INSERT INTO admins (id, email, is_superadmin) VALUES ($1, lower($2), $3) RETURNING id`,
        [newId, validatedBody.adminEmail, false],
      );
      adminId = insertRes.rows[0].id;
    } else {
      adminId = selectRes.rows[0].id;
    }

    await db.query(
      'INSERT INTO admin_groups (admin_id, group_id) VALUES ($1,$2) ON CONFLICT (admin_id, group_id) DO NOTHING',
      [adminId, insertedGroup.id],
    );

    /////////////////////
    // SEND EMAIL
    /////////////////////
    const bankLink = `https://pro.upsignon.eu/${insertedGroup.public_id}`;
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
    const salesEmail = validatedBody.salesEmail || req.session?.adminEmail;
    const useBcc = salesEmail !== req.session?.adminEmail;

    await transporter.sendMail({
      from: `"UpSignon" <${emailConfig.EMAIL_SENDING_ADDRESS}>`,
      to: validatedBody.adminEmail,
      cc: useBcc ? salesEmail : null,
      replyTo: salesEmail,
      subject: validatedBody.isTrial
        ? 'Ouverture de votre banque de test UpSignon PRO'
        : 'Ouverture de votre banque UpSignon PRO',
      text: emailContent.text,
      html: emailContent.html,
    });

    res.status(200).end();
  } catch (e) {
    logError('insert_group', e);
    res.status(400).end();
  }
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
Merci pour votre demande de test de notre coffre-fort de mots de passe UpSignon PRO.
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
      Merci pour votre demande de test de notre coffre-fort de mots de passe <b>UpSignon PRO</b>.
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
Merci d'avoir choisi notre solution UpSignon PRO pour la gestion de vos mots de passe!
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
      Merci d'avoir choisi notre solution UpSignon PRO pour la gestion de vos mots de passe!
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
