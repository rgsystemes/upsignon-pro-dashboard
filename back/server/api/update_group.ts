import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const update_group = async (req: any, res: any): Promise<void> => {
  try {
    if (req.body.name) {
      await db.query('UPDATE groups SET name=$1 WHERE id=$2', [
        req.body.name,
        req.proxyParamsGroupId,
      ]);
    }
    if (req.body.settings) {
      await db.query('UPDATE groups SET settings=$1 WHERE id=$2', [
        req.body.settings,
        req.proxyParamsGroupId,
      ]);
    }
    if (req.body.msEntraConfig) {
      await db.query('UPDATE groups SET ms_entra_config=$1 WHERE id=$2', [
        req.body.msEntraConfig,
        req.proxyParamsGroupId,
      ]);
    }
    res.status(200).end();
  } catch (e) {
    logError('update_group', e);
    res.status(400).end();
  }
};
