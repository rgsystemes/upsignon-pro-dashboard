import { db } from '../helpers/db';
import { logError } from '../helpers/logger';
import { getEmailConfig, getMailTransporter } from '../helpers/mailTransporter';

const MAX_RECIPIENTS_PER_REQUEST = 100;
const MAX_EMAILS_PER_HOUR = 500;

const filterManualEmailList = async (req: any, isSuperadminPage: boolean): Promise<string[]> => {
  if (typeof req.body.emailList !== 'string') return [];

  const requestedEmails = req.body.emailList
    .split(';')
    .map((e: string) => e.trim().toLowerCase())
    .filter((e: string) => e.includes('@'));

  const dedupedEmails = Array.from(new Set(requestedEmails));
  if (dedupedEmails.length === 0) return [];

  const allowedEmailsQuery = isSuperadminPage
    ? `SELECT DISTINCT email
       FROM users
       WHERE lower(email) = ANY($1::text[])`
    : `SELECT DISTINCT email
       FROM users
       WHERE lower(email) = ANY($1::text[])
         AND bank_id=$2`;

  const allowedEmailsRes = await db.query(
    allowedEmailsQuery,
    isSuperadminPage ? [dedupedEmails] : [dedupedEmails, req.proxyParamsBankId],
  );

  return allowedEmailsRes.rows.map((u) => u.email);
};

const getSelectedEmails = async (req: any, isSuperadminPage: boolean): Promise<string[]> => {
  const extractorDuplicateSelect =
    typeof req.body.extractorDuplicateSelect === 'boolean'
      ? req.body.extractorDuplicateSelect
      : false;

  const extractorWeakSelect =
    typeof req.body.extractorWeakSelect === 'boolean' ? req.body.extractorWeakSelect : false;

  const extractorMediumSelect =
    typeof req.body.extractorMediumSelect === 'boolean' ? req.body.extractorMediumSelect : false;

  const extractorLongUnusedSelect =
    typeof req.body.extractorLongUnusedSelect === 'boolean'
      ? req.body.extractorLongUnusedSelect
      : false;

  const extractorSharingDeviceSelect =
    typeof req.body.extractorSharingDeviceSelect === 'boolean'
      ? req.body.extractorSharingDeviceSelect
      : false;

  const extractorDuplicateMin =
    typeof req.body.extractorDuplicateMin === 'number'
      ? parseInt(req.body.extractorDuplicateMin, 10)
      : 0;

  const extractorWeakMin =
    typeof req.body.extractorWeakMin === 'number' ? parseInt(req.body.extractorWeakMin, 10) : 0;

  const extractorMediumMin =
    typeof req.body.extractorMediumMin === 'number' ? parseInt(req.body.extractorMediumMin, 10) : 0;

  const extractorUnusedDaysMin =
    typeof req.body.extractorUnusedDaysMin === 'number'
      ? parseInt(req.body.extractorUnusedDaysMin, 10)
      : 0;

  const sendMailToAll =
    typeof req.body.sendMailToAll === 'boolean' ? req.body.sendMailToAll : false;

  let uniqueEmails: string[] = [];
  if (sendMailToAll) {
    uniqueEmails = (
      await db.query(
        `SELECT DISTINCT email FROM users ${isSuperadminPage ? '' : 'WHERE bank_id=$1'}`,
        isSuperadminPage ? [] : [req.proxyParamsBankId],
      )
    ).rows.map((u) => u.email);
  } else {
    const emails: string[][] = [];
    if (extractorDuplicateSelect) {
      const dupEmails = (
        await db.query(
          `SELECT email FROM users WHERE nb_accounts_with_duplicated_password >= $1 ${
            isSuperadminPage ? '' : 'AND bank_id=$2'
          }`,
          isSuperadminPage
            ? [extractorDuplicateMin]
            : [extractorDuplicateMin, req.proxyParamsBankId],
        )
      ).rows.map((u) => u.email);

      emails.push(dupEmails);
    }
    if (extractorWeakSelect) {
      const weakEmails = (
        await db.query(
          `SELECT email FROM users WHERE nb_accounts_weak >= $1 ${
            isSuperadminPage ? '' : 'AND bank_id=$2'
          }`,
          isSuperadminPage ? [extractorWeakMin] : [extractorWeakMin, req.proxyParamsBankId],
        )
      ).rows.map((u) => u.email);
      emails.push(weakEmails);
    }
    if (extractorMediumSelect) {
      const mediumEmails = (
        await db.query(
          `SELECT email FROM users WHERE nb_accounts_weak >= $1 ${
            isSuperadminPage ? '' : 'AND bank_id=$2'
          }`,
          isSuperadminPage ? [extractorMediumMin] : [extractorMediumMin, req.proxyParamsBankId],
        )
      ).rows.map((u) => u.email);
      emails.push(mediumEmails);
    }
    if (extractorLongUnusedSelect) {
      const longUnusedEmails = (
        await db.query(
          `SELECT email FROM users AS u
          WHERE (SELECT AGE(last_sync_date)
            FROM user_devices AS ud
            WHERE ud.user_id=u.id ORDER BY last_sync_date DESC NULLS LAST LIMIT 1) > interval '$1 days'
          ${isSuperadminPage ? '' : 'AND u.bank_id=$2'}
      `,
          isSuperadminPage
            ? [extractorUnusedDaysMin]
            : [extractorUnusedDaysMin, req.proxyParamsBankId],
        )
      ).rows.map((u) => u.email);
      emails.push(longUnusedEmails);
    }
    if (extractorSharingDeviceSelect) {
      const deviceSharedEmail = (
        await db.query(
          `SELECT email FROM user_devices AS ud
        INNER JOIN users ON ud.user_id=users.id
        WHERE (SELECT COUNT(id) FROM user_devices WHERE device_unique_id=ud.device_unique_id)>1
        ${isSuperadminPage ? '' : 'AND ud.bank_id=$1'}
      `,
          isSuperadminPage
            ? [extractorUnusedDaysMin]
            : [extractorUnusedDaysMin, req.proxyParamsBankId],
        )
      ).rows.map((u) => u.email);
      emails.push(deviceSharedEmail);
    }
    emails.forEach((list) => {
      list.forEach((email) => {
        if (uniqueEmails.indexOf(email) === -1) {
          uniqueEmails.push(email);
        }
      });
    });
  }

  return uniqueEmails;
};

export const send_email_precheck = async (
  req: any,
  res: any,
  isSuperadminPage: boolean,
): Promise<void> => {
  try {
    const uniqueEmails = await getSelectedEmails(req, isSuperadminPage);
    return res.status(200).send({ n: uniqueEmails.length });
  } catch (e) {
    logError('send_email_precheck', e);
  }
};

// Track email counts per admin
const emailCounts: Map<string, { count: number; resetTime: number }> = new Map();

export const send_email = async (req: any, res: any, isSuperadminPage: boolean): Promise<void> => {
  try {
    if (req.session.adminRole === 'restricted_superadmin') {
      return res.status(401).end();
    }

    const adminId = req.session.adminId;

    // Check hourly rate limit
    const now = Date.now();
    const adminEmailCount = emailCounts.get(adminId) || { count: 0, resetTime: now + 3600000 };
    if (now > adminEmailCount.resetTime) {
      adminEmailCount.count = 0;
      adminEmailCount.resetTime = now + 3600000;
    }

    const mailContent = typeof req.body.mailContent === 'string' ? req.body.mailContent : null;
    const mailSubject = typeof req.body.mailSubject === 'string' ? req.body.mailSubject : null;

    if (!mailContent) return res.status(400).end();

    let uniqueEmails: string[];
    if (typeof req.body.emailList === 'string') {
      uniqueEmails = await filterManualEmailList(req, isSuperadminPage);
    } else {
      uniqueEmails = await getSelectedEmails(req, isSuperadminPage);
    }

    // Check limits
    if (uniqueEmails.length > MAX_RECIPIENTS_PER_REQUEST) {
      return res
        .status(400)
        .json({ error: `Maximum ${MAX_RECIPIENTS_PER_REQUEST} recipients per request` });
    }

    if (adminEmailCount.count + uniqueEmails.length > MAX_EMAILS_PER_HOUR) {
      return res.status(429).json({ error: 'Hourly email limit exceeded' });
    }

    // Log the email action for audit
    console.log(`Admin ${adminId} sending ${uniqueEmails.length} emails`);

    adminEmailCount.count += uniqueEmails.length;
    emailCounts.set(adminId, adminEmailCount);

    // Send emails
    const emailConfig = await getEmailConfig();
    const transporter = getMailTransporter(emailConfig, { debug: false });
    await Promise.all(
      uniqueEmails.map(async (email) => {
        await transporter.sendMail({
          from: emailConfig.EMAIL_SENDING_ADDRESS,
          to: email,
          subject: mailSubject,
          text: mailContent,
        });
      }),
    );
    res.status(200).send({ n: uniqueEmails.length });
  } catch (e) {
    logError('send_email', e);
    res.status(400).end();
  }
};
