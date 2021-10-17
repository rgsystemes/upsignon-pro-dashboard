import { db } from '../helpers/connection';

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
    const checkRes = await db.query('SELECT id, email FROM users WHERE email = $1', [newEmail]);
    if (checkRes.rowCount > 0) {
      return res.status(409).send({ status: 'EMAIL_ALREADY_EXISTS' });
    }
    // check that new email is not an older email of someone else
    const checkRes2 = await db.query(
      'SELECT user_id FROM changed_emails WHERE old_email = $1 AND user_id != $2',
      [newEmail, userId],
    );
    if (checkRes2.rowCount > 0) {
      return res.status(409).send({ status: 'EMAIL_ALREADY_EXISTED' });
    }

    // Update DB
    await db.transaction(async (dbClient) => {
      // Start by cleaning any previous such change (case when admin is playing with the feature)
      // In most cases, this will do nothing
      await dbClient.query('DELETE FROM changed_emails WHERE old_email=$1', [oldEmail]);
      // Then insert the new changed Email
      await dbClient.query(
        'INSERT INTO changed_emails(user_id, old_email, new_email) VALUES($1,$2,$3)',
        [userId, oldEmail, newEmail],
      );
      // Then update the user current email
      await dbClient.query('UPDATE users SET email=$1 WHERE id=$2 AND email=$3', [
        newEmail,
        userId,
        oldEmail,
      ]);
    });

    res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};
