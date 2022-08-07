import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const update_user_email = async (req: any, res: any): Promise<void> => {
  try {
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
      'SELECT id, email FROM users WHERE email = lower($1) AND group_id=$2',
      [newEmail, req.proxyParamsGroupId],
    );
    if (checkRes.rowCount > 0) {
      return res.status(409).send({ status: 'EMAIL_ALREADY_EXISTS' });
    }
    // check that new email is not an older email of someone else
    const checkRes2 = await db.query(
      'SELECT user_id FROM changed_emails WHERE old_email = lower($1) AND user_id != $2 AND group_id=$3',
      [newEmail, userId, req.proxyParamsGroupId],
    );
    if (checkRes2.rowCount > 0) {
      return res.status(409).send({ status: 'EMAIL_ALREADY_EXISTED' });
    }

    // Update DB
    await db.transaction(async (dbClient) => {
      // Start by cleaning any previous such change (case when admin is playing with the feature)
      // In most cases, this will do nothing
      await dbClient.query('DELETE FROM changed_emails WHERE old_email=lower($1) AND group_id=$2', [
        oldEmail,
        req.proxyParamsGroupId,
      ]);
      // Then insert the new changed Email
      await dbClient.query(
        'INSERT INTO changed_emails(user_id, old_email, new_email, group_id) VALUES($1,lower($2),lower($3), $4)',
        [userId, oldEmail, newEmail, req.proxyParamsGroupId],
      );
      // Then update the user current email
      await dbClient.query(
        'UPDATE users SET email=lower($1) WHERE id=$2 AND email=lower($3) AND group_id=$4',
        [newEmail, userId, oldEmail, req.proxyParamsGroupId],
      );
    });

    res.status(200).end();
  } catch (e) {
    logError(e);
    res.status(400).end();
  }
};
