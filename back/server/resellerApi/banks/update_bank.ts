import Joi from 'joi';
import { logError } from '../../helpers/logger';
import { hasResellerOwnership } from '../helpers/securityChecks';
import { updateBank } from '../../helpers/updateBank';

export const update_bank = async (req: any, res: any): Promise<void> => {
  try {
    const resellerId = req.proxyParamsResellerId;
    const validatedBody: {
      id: number;
      name: string | null;
    } = Joi.attempt(
      req.body,
      Joi.object({
        id: Joi.number().required(),
        name: Joi.string().allow(null),
      }),
    );
    if (
      req.session.adminRole !== 'superadmin' &&
      req.session.adminRole !== 'restricted_superadmin'
    ) {
      const isOwner = await hasResellerOwnership(req, resellerId);
      if (!isOwner && req.session.adminRole !== 'restricted_superadmin') {
        res.sendStatus(401);
        return;
      }
    }

    await updateBank(req.session, {
      bankId: validatedBody.id,
      resellerId: resellerId,
      name: validatedBody.name,
      settings: null,
    });
    res.status(200).end();
  } catch (e) {
    logError('update_bank', e);
    res.status(400).end();
  }
};
