import Joi from 'joi';
import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const update_shared_vault_access_level = async (req: any, res: any): Promise<void> => {
  try {
    if (req.session.isReadOnlySuperadmin) {
      return res.status(401).end();
    }
    let accessLevel = Joi.attempt(
      req.body.accessLevel,
      Joi.string().valid('blind', 'reader', 'editor', 'owner').required(),
    );
    const willBeManager = accessLevel == 'owner';
    await db.query(
      `UPDATE shared_vault_recipients SET is_manager=$1, access_level=$2 WHERE user_id=$3 AND shared_vault_id=$4 AND group_id=$5`,
      [willBeManager, accessLevel, req.body.userId, req.body.sharedVaultId, req.proxyParamsGroupId],
    );
    res.status(200).end();
  } catch (e) {
    logError('update_shared_vault_manager', e);
    res.status(400).end();
  }
};
