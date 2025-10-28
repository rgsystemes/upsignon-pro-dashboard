import Joi from 'joi';
import { logError } from '../../helpers/logger';
import { configureBankWithAdminEmailAndSendMail } from '../../helpers/configureBankWithAdminEmail';
import { hasResellerOwnership } from '../helpers/securityChecks';

export const insert_bank = async (req: any, res: any): Promise<void> => {
  try {
    const validatedBody: {
      name: string;
      adminEmail: string | null;
    } = Joi.attempt(
      req.body,
      Joi.object({
        name: Joi.string()
          .required()
          .pattern(/^.{2,50}$/),
        adminEmail: Joi.string().email().allow(null, ''),
      }),
    );

    const resellerId = req.proxyParamsResellerId;
    if (
      req.session.adminRole !== 'superadmin' &&
      req.session.adminRole !== 'restricted_superadmin'
    ) {
      const isOwner = await hasResellerOwnership(req, resellerId);
      if (!isOwner) {
        res.sendStatus(401);
        return;
      }
    }

    await configureBankWithAdminEmailAndSendMail(req, res, req.session?.adminEmail, {
      name: validatedBody.name,
      adminEmail: validatedBody.adminEmail,
      isTrial: false,
      salesEmail: null,
      resellerId: resellerId,
    });

    res.status(200).end();
  } catch (e) {
    logError('insert_bank', e);
    res.status(400).end();
  }
};
