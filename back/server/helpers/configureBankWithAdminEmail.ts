import { Request, Response } from 'express';
import { db } from './db';
import env from './env';
import { getEmailConfig, getMailTransporter } from './mailTransporter';
import { forceProStatusUpdate } from './forceProStatusUpdate';
import { recomputeSessionAuthorizationsForAdminsByResellerId } from './updateSessionAuthorizations';
import { buildEmail, getBestLanguage } from 'upsignon-mail';

type BankSettings = {
  SALES_REP: string | null;
  IS_TESTING?: boolean;
  TESTING_EXPIRATION_DATE?: string | Date;
};

export const configureBankWithAdminEmailAndSendMail = async (
  req: Request,
  res: Response,
  validatedBody: {
    name: string;
    adminEmail: string | null;
    isTrial: boolean;
    salesEmail: string | null;
    resellerId: string | null;
  },
): Promise<void> => {
  // @ts-ignore
  const sessionAdminEmail: string = req.session?.adminEmail;
  const salesEmail = validatedBody.salesEmail; // Important ! do not add a fallback. Otherwise the reseller's admin could be set as the Septeo sales and receive trial emails.

  let newBankSettings: BankSettings = {
    SALES_REP: salesEmail,
  };
  let expDate = null;
  if (validatedBody.isTrial) {
    expDate = new Date();
    expDate.setDate(expDate.getDate() + 30);
    expDate.setMilliseconds(0);
    expDate.setSeconds(0);
    expDate.setMinutes(0);
    expDate.setHours(0);
    newBankSettings = {
      ...newBankSettings,
      IS_TESTING: true,
      TESTING_EXPIRATION_DATE: expDate,
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
  if (validatedBody.resellerId) {
    await recomputeSessionAuthorizationsForAdminsByResellerId(validatedBody.resellerId, req);
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
        `INSERT INTO admins (id, email, admin_role) VALUES (gen_random_uuid(), lower($1), 'admin') RETURNING id`,
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
    const adminLoginPage = `${env.FRONTEND_URL}/login.html`;

    const emailContent = validatedBody.isTrial
      ? await buildEmail({
          templateName: 'trialWelcome',
          locales: getBestLanguage(req.headers['accept-language']),
          args: {
            activationLink: bankLink,
            consoleLink: adminLoginPage,
            trialEndDate: expDate!,
          },
        })
      : await buildEmail({
          templateName: 'proBankOpening',
          locales: getBestLanguage(req.headers['accept-language']),
          args: {
            bankSetupUrl: bankLink,
            consoleLink: adminLoginPage,
            userEmail: validatedBody.adminEmail,
          },
        });

    const emailConfig = await getEmailConfig();
    const transporter = getMailTransporter(emailConfig, { debug: false });
    const useCc = salesEmail !== sessionAdminEmail && !!salesEmail;

    transporter.sendMail({
      from: `"UpSignOn" <${emailConfig.EMAIL_SENDING_ADDRESS}>`,
      to: validatedBody.adminEmail,
      cc: useCc ? [salesEmail!] : undefined,
      replyTo: salesEmail ?? undefined,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html,
    });
  }

  forceProStatusUpdate();

  res.status(200).end();
};
