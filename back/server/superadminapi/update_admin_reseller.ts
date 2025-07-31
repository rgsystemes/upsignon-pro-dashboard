import { db } from '../helpers/db';
import { logError } from '../helpers/logger';
import { recomputeSessionAuthorizationsForAdminById } from '../helpers/updateSessionAuthorizations';

export const update_admin_reseller = async (req: any, res: any): Promise<void> => {
  try {
    if (req.session.adminRole !== 'superadmin') {
      res.status(401).json({ error: 'Not allowed for restricted superadmin' });
      return;
    }
    if (!req.body.adminId) return res.status(401).end();

    await db.query('UPDATE admins SET reseller_id=$2 WHERE id=$1', [
      req.body.adminId,
      req.body.resellerId,
    ]);
    await recomputeSessionAuthorizationsForAdminById(req.body.adminId);
    res.status(200).end();
  } catch (e) {
    logError('update_admin_reseller', e);
    res.status(400).end();
  }
};
