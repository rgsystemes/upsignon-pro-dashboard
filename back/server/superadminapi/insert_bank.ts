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
        adminEmail: Joi.string().email().allow(null, ''),
        isTrial: Joi.boolean(),
        salesEmail: Joi.string().email().allow(null, ''),
        resellerId: Joi.string().allow(null),
      }),
    );
    await configureBankWithAdminEmailAndSendMail(res, req.session?.adminEmail, validatedBody);
  } catch (e) {
    logError('superadmin insert_bank', e);
    res.sendStatus(400);
  }
};
