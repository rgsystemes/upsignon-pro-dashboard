import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const delete_user = async (req: any, res: any): Promise<void> => {
  try {
    if (req.session.isReadOnlySuperadmin) {
      return res.status(401).end();
    }
    const userId = req.params.userId;
    await db.query(`DELETE FROM users WHERE id=$1 AND bank_id=$2`, [userId, req.proxyParamsBankId]);
    res.status(200).end();
  } catch (e) {
    logError('delete_user', e);
    res.status(400).end();
  }
};
