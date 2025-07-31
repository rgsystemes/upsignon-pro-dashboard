import { db } from '../../helpers/db';
import { logError } from '../../helpers/logger';
import { microsoftConfigUrl } from './sso_constants';

export const get_bank_sso_config = async (req: any, res: any): Promise<void> => {
  try {
    if (req.session.adminRole === 'restricted_superadmin') {
      return res.status(401).end();
    }
    const dbRes = await db.query(`SELECT * FROM bank_sso_config WHERE bank_id=$1 ORDER BY id`, [
      req.proxyParamsBankId,
    ]);

    const openidConfigs = dbRes.rows.map((r) => ({
      id: r.id,
      configUrl: r.openid_configuration_url,
      clientId: r.client_id,
      configType: r.openid_configuration_url === microsoftConfigUrl ? 'microsoft' : 'custom',
    }));

    res.status(200).send({ openidConfigs });
  } catch (e) {
    logError('get_bank_sso_config', e);
    res.status(400).end();
  }
};
