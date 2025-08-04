import { db } from '../../helpers/db';
import { logError } from '../../helpers/logger';
import { deleteSession } from '../../helpers/sessionStore';
import { hasResellerOwnership } from '../helpers/securityChecks';

export const delete_admin = async (req: any, res: any): Promise<void> => {
  try {
    if (req.session.adminRole !== 'superadmin') {
      const isOwner = await hasResellerOwnership(req, req.proxyParamsResellerId);
      if (!isOwner) {
        res.sendStatus(401);
        return;
      }
    }
    const deletionRes = await db.query(`DELETE FROM admins WHERE id=$1 RETURNING email`, [
      req.params.adminId,
    ]);
    // DISCONNECT
    deletionRes.rows.forEach(async (a) => {
      await deleteSession(a.email);
    });
    res.status(200).end();
  } catch (e) {
    logError('delete_admin', e);
    res.status(400).end();
  }
};
