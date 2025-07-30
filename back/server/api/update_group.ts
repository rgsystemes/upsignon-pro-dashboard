import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const update_group = async (req: any, res: any): Promise<void> => {
  try {
    if (req.body.name) {
      await db.query('UPDATE banks SET name=$1 WHERE id=$2', [
        req.body.name,
        req.proxyParamsBankId,
      ]);
    }
    if (req.body.settings) {
      if (req.session.isReadOnlySuperadmin) {
        return res.status(401).end();
      }
      await db.query('UPDATE banks SET settings=$1 WHERE id=$2', [
        req.body.settings,
        req.proxyParamsBankId,
      ]);
    }
    if (req.body.msEntraConfig) {
      if (req.session.isReadOnlySuperadmin) {
        return res.status(401).end();
      }
      if (
        typeof req.body.msEntraConfig.clientSecret === 'string' &&
        /^[*]+$/.test(req.body.msEntraConfig.clientSecret)
      ) {
        // clientSecret contains only asterisques, do not update it.
        const dbRes = await db.query(`SELECT ms_entra_config FROM banks WHERE id=$1`, [
          req.proxyParamsBankId,
        ]);
        const previousConfig = dbRes.rows[0].ms_entra_config || {};
        req.body.msEntraConfig.clientSecret = previousConfig.clientSecret;
      }

      await db.query('UPDATE banks SET ms_entra_config=$1 WHERE id=$2', [
        req.body.msEntraConfig,
        req.proxyParamsBankId,
      ]);
    }
    res.status(200).end();
  } catch (e) {
    logError('update_group', e);
    res.status(400).end();
  }
};
