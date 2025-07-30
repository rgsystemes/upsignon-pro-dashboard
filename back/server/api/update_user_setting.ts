import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const update_user_setting = async (req: any, res: any): Promise<void> => {
  try {
    if (req.session.isReadOnlySuperadmin) {
      return res.status(401).end();
    }
    if (Object.keys(req.body).indexOf('allowed_offline_desktop') != -1) {
      await db.query(`UPDATE users SET allowed_offline_desktop=$1 WHERE id=$2 AND group_id=$3`, [
        req.body.allowed_offline_desktop,
        req.body.userId,
        req.proxyParamsBankId,
      ]);
    }
    if (Object.keys(req.body).indexOf('allowed_offline_mobile') != -1) {
      await db.query(`UPDATE users SET allowed_offline_mobile=$1 WHERE id=$2 AND group_id=$3`, [
        req.body.allowed_offline_mobile,
        req.body.userId,
        req.proxyParamsBankId,
      ]);
    }
    if (Object.keys(req.body).indexOf('allowed_to_export') != -1) {
      await db.query(`UPDATE users SET allowed_to_export=$1 WHERE id=$2 AND group_id=$3`, [
        req.body.allowed_to_export,
        req.body.userId,
        req.proxyParamsBankId,
      ]);
    }

    if (Object.keys(req.body).indexOf('settings_override') != -1) {
      {
        await db.query(`UPDATE users SET settings_override=$1 WHERE id=$2 AND group_id=$3`, [
          req.body.settings_override,
          req.body.userId,
          req.proxyParamsBankId,
        ]);
      }
    }

    res.status(200).end();
  } catch (e) {
    logError('update_user_setting', e);
    res.status(400).end();
  }
};
