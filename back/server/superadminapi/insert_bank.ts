import Joi from 'joi';
import { logError } from '../helpers/logger';
import { configureBankWithAdminEmailAndSendMail } from '../helpers/configureBankWithAdminEmail';

export const insert_bank = async (req: any, res: any): Promise<void> => {
  try {
    const validatedBody: {
      name: string;
      adminEmail: string | null;
      isTrial: boolean;
      salesEmail: string | null;
      resellerId: string | null;
    } = Joi.attempt(
      req.body,
      Joi.object({
        name: Joi.string()
          .required()
          .pattern(/^.{2,50}$/),
        adminEmail: Joi.string().trim().email().allow(null, ''),
        isTrial: Joi.boolean(),
        salesEmail: Joi.string().trim().email().allow(null, ''),
        resellerId: Joi.string().trim().allow(null),
      }),
    );
    if (validatedBody.resellerId && req.session.adminRole !== 'superadmin') {
      res.status(401).json({ error: 'Not allowed for restricted superadmin' });
      return;
    }
    await configureBankWithAdminEmailAndSendMail(req, res, {
      ...validatedBody,
      salesEmail: validatedBody.salesEmail || validatedBody.adminEmail,
    });
  } catch (e) {
    logError('superadmin insert_bank', e);
    res.sendStatus(400);
  }
};
