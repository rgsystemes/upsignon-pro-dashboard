import Joi from 'joi';
import { db } from '../../helpers/db';
import { logError } from '../../helpers/logger';

export const delete_bank_sso_config = async (req: any, res: any): Promise<void> => {
  try {
    if (req.session.adminRole === 'restricted_superadmin') {
      return res.status(401).end();
    }
    const safeBody = Joi.attempt(
      req.body,
      Joi.object({
        configId: Joi.number().required(),
      }),
    );
    const deleteRes = await db.query(`DELETE FROM bank_sso_config WHERE id=$1 AND bank_id=$2`, [
      safeBody.configId,
      req.proxyParamsBankId,
    ]);
    if (deleteRes.rowCount === 0) {
      return res.status(404).end();
    }
    return res.status(200).end();
  } catch (e) {
    logError('delete_bank_sso_config', e);
    res.status(400).end();
  }
};
