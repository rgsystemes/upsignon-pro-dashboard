import { db } from '../../helpers/db';
import { logError } from '../../helpers/logger';
import { hasResellerOwnership } from '../helpers/securityChecks';

export const admins = async (req: any, res: any): Promise<void> => {
  try {
    if (
      req.session.adminRole !== 'superadmin' &&
      req.session.adminRole !== 'restricted_superadmin'
    ) {
      const isOwner = await hasResellerOwnership(req, req.proxyParamsResellerId);
      if (!isOwner) {
        res.sendStatus(401);
        return;
      }
    }
    const adminsRes = await db.query(`SELECT id, email FROM admins WHERE reseller_id=$1`, [
      req.proxyParamsResellerId,
    ]);
    res.status(200).json({
      admins: adminsRes.rows,
    });
  } catch (e) {
    logError('admins', e);
    res.status(400).end();
  }
};
