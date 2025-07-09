import Joi from 'joi';
import { db } from '../../helpers/db';
import { logError } from '../../helpers/logger';

export const delete_bank_sso_config = async (req: any, res: any): Promise<void> => {
  try {
    const safeBody = Joi.attempt(
      req.body,
      Joi.object({
        configId: Joi.number().required(),
      }),
    );
    await db.query(`DELETE FROM bank_sso_config WHERE id=$1`, [safeBody.configId]);
    return res.status(200).end();
  } catch (e) {
    logError('delete_bank_sso_config', e);
    res.status(400).end();
  }
};
