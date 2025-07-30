import Joi from 'joi';
import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const insert_allowed_email = async (req: any, res: any): Promise<void> => {
  try {
    if (req.session.isReadOnlySuperadmin) {
      return res.status(401).end();
    }
    const joiValidatedNewEmailPattern = req.body.newPattern;
    try {
      Joi.assert(joiValidatedNewEmailPattern, Joi.string().required());
    } catch (e) {
      console.error(e);
      return res.status(400).end();
    }
    await db.query(`INSERT INTO allowed_emails (pattern, group_id) VALUES (lower($1), $2)`, [
      joiValidatedNewEmailPattern.trim().toLowerCase(),
      req.proxyParamsBankId,
    ]);
    res.status(200).end();
  } catch (e) {
    logError('insert_allowed_email', e);
    res.status(400).end();
  }
};
