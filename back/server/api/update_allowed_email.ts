import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const update_allowed_email = async (req: any, res: any): Promise<void> => {
  try {
    await db.query(`UPDATE allowed_emails SET pattern=lower($1) WHERE id=$2 AND group_id=$3`, [
      req.body.updatedPattern.trim().toLowerCase(),
      req.body.allowedEmailId,
      req.proxyParamsGroupId,
    ]);
    res.status(200).end();
  } catch (e) {
    logError('update_allowed_email', e);
    res.status(400).end();
  }
};
