import { db } from '../helpers/db';
import { getEmailAuthorizationStatus } from '../helpers/emailAuthorization';
import { logError } from '../helpers/logger';
import { MicrosoftGraph } from 'ms-entra-for-upsignon';

export const update_user_email = async (req: any, res: any): Promise<void> => {
  try {
    if (req.session.isReadOnlySuperadmin) {
      return res.status(401).end();
    }
    const { userId, oldEmail, newEmail } = req.body;
    if (
      typeof userId !== 'number' ||
      typeof oldEmail !== 'string' ||
      typeof newEmail !== 'string'
    ) {
      return res.status(400).end();
    }

    // check that newEmail is not already in use
    const checkRes = await db.query(
      'SELECT id, email FROM users WHERE email = lower($1) AND bank_id=$2',
      [newEmail, req.proxyParamsBankId],
    );
    if (checkRes.rowCount && checkRes.rowCount > 0) {
      return res.status(409).send({ status: 'EMAIL_ALREADY_EXISTS' });
    }
    // check that new email is not an older email of someone else
    const checkRes2 = await db.query(
      'SELECT user_id FROM changed_emails WHERE old_email = lower($1) AND user_id != $2 AND bank_id=$3',
      [newEmail, userId, req.proxyParamsBankId],
    );
    if (checkRes2.rowCount && checkRes2.rowCount > 0) {
      return res.status(409).send({ status: 'EMAIL_ALREADY_EXISTED' });
    }

    // check the new email is authorized (otherwise it will be deactivated)
    const userMSEntraId = await MicrosoftGraph.getUserId(req.proxyParamsBankId, newEmail);
    const authStatus = await getEmailAuthorizationStatus(
      newEmail,
      userMSEntraId,
      req.proxyParamsBankId,
    );
    if (authStatus == 'UNAUTHORIZED') {
      return res.status(409).send({ status: 'EMAIL_NOT_AUTHORIZED' });
    }
    // Update DB
    await db.transaction(async (dbClient) => {
      // Start by cleaning any previous such change (case when admin is playing with the feature)
      // In most cases, this will do nothing
      await dbClient.query('DELETE FROM changed_emails WHERE old_email=lower($1) AND bank_id=$2', [
        oldEmail,
        req.proxyParamsBankId,
      ]);
      // Then insert the new changed Email
      await dbClient.query(
        'INSERT INTO changed_emails(user_id, old_email, new_email, bank_id) VALUES($1,lower($2),lower($3), $4)',
        [userId, oldEmail, newEmail, req.proxyParamsBankId],
      );
      // Then update the user current email
      await dbClient.query(
        'UPDATE users SET email=lower($1) WHERE id=$2 AND email=lower($3) AND bank_id=$4',
        [newEmail, userId, oldEmail, req.proxyParamsBankId],
      );
    });

    res.status(200).end();
  } catch (e) {
    logError('update_user_email', e);
    res.status(400).end();
  }
};
