import Joi from 'joi';
import { logError } from '../../helpers/logger';
import { hasResellerOwnership } from '../helpers/securityChecks';
import { db } from '../../helpers/db';

export const insert_admin = async (req: any, res: any): Promise<void> => {
  try {
    const validatedBody: {
      email: string | null;
    } = Joi.attempt(
      req.body,
      Joi.object({
        email: Joi.string().email().lowercase().required(),
      }),
    );

    const resellerId = req.proxyParamsResellerId;
    if (req.session.adminRole !== 'superadmin') {
      const isOwner = await hasResellerOwnership(req, resellerId);
      if (!isOwner) {
        res.sendStatus(401);
        return;
      }
    }

    await db.query(
      "INSERT INTO admins (id, email, admin_role, reseller_id) VALUES (gen_random_uuid(),$1,'admin', $2) ON CONFLICT (email) DO UPDATE SET reseller_id=EXCLUDED.reseller_id",
      [validatedBody.email, resellerId],
    );
    res.status(200).end();
  } catch (e) {
    logError('insert_admin', e);
    res.status(400).end();
  }
};
