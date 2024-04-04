import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const reactivate_user = async (req: any, res: any): Promise<void> => {
  try {
    const userId = req.params.userId;
    await db.query(`UPDATE users SET deactivated=null WHERE id=$1 AND group_id=$2`, [
      userId,
      req.proxyParamsGroupId,
    ]);
    res.status(200).end();
  } catch (e) {
    logError('reactivate_user', e);
    res.status(400).end();
  }
};
