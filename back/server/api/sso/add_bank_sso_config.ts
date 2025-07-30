import Joi from 'joi';
import { db } from '../../helpers/db';
import { logError } from '../../helpers/logger';
import { microsoftClientId, microsoftConfigUrl } from './sso_constants';

export const add_bank_sso_config = async (req: any, res: any): Promise<void> => {
  try {
    const safeBody: {
      configType: 'microsoft' | 'custom';
      configUrl: string | null;
      clientId: string | null;
    } = Joi.attempt(
      req.body,
      Joi.object({
        configType: Joi.string().allow('microsoft', 'custom').required(),
        configUrl: Joi.string()
          .uri({ scheme: 'https' })
          .when('configType', { is: 'custom', then: Joi.required(), otherwise: Joi.forbidden() }),
        clientId: Joi.string().when('configType', {
          is: 'custom',
          then: Joi.required(),
          otherwise: Joi.forbidden(),
        }),
      }),
    );

    const configUrl = safeBody.configType == 'microsoft' ? microsoftConfigUrl : safeBody.configUrl;
    const clientId = safeBody.configType == 'microsoft' ? microsoftClientId : safeBody.clientId;

    // check if item already exists to avoid readding it
    const selectRes = await db.query(
      `SELECT 1 FROM bank_sso_config WHERE bank_id=$1 AND openid_configuration_url=$2 AND client_id=$3`,
      [req.proxyParamsBankId, configUrl, clientId],
    );
    if (selectRes.rows.length > 0) {
      return res.status(200).end();
    }

    // for now, make sure there is only one config per bank by deleting previous configs
    await db.query(`DELETE FROM bank_sso_config WHERE bank_id=$1`, [req.proxyParamsBankId]);

    await db.query(
      `INSERT INTO bank_sso_config (bank_id, openid_configuration_url, client_id) VALUES ($1,$2,$3)`,
      [req.proxyParamsBankId, configUrl, clientId],
    );

    res.status(200).end();
  } catch (e) {
    logError('add_bank_sso_config', e);
    res.status(400).end();
  }
};
