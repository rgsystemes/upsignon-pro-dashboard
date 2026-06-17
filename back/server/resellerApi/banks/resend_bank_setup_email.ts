import Joi from 'joi';
import { logError } from '../../helpers/logger';
import { db } from '../../helpers/db';
import { resendBankSetupEmailToAdmins } from '../../helpers/resendBankSetupEmailToAdmins';
import { hasResellerOwnership } from '../helpers/securityChecks';

export const resend_bank_setup_email = async (req: any, res: any): Promise<void> => {
  try {
    const validatedBody: { bankId: number } = Joi.attempt(
      req.body,
      Joi.object({
        bankId: Joi.number().required(),
      }),
    );

    const resellerId = req.proxyParamsResellerId;
    if (
      req.session.adminRole !== 'superadmin' &&
      req.session.adminRole !== 'restricted_superadmin'
    ) {
      const isOwner = await hasResellerOwnership(req, resellerId);
      if (!isOwner) {
        res.status(401).json({});
        return;
      }
    }

    const bankRes = await db.query('SELECT id FROM banks WHERE id=$1 AND reseller_id=$2', [
      validatedBody.bankId,
      resellerId,
    ]);
    if (bankRes.rowCount === 0) {
      res.status(404).json({ error: 'Bank not found for this reseller' });
      return;
    }

    await resendBankSetupEmailToAdmins(req, validatedBody.bankId);
    res.status(200).json({});
  } catch (e) {
    logError('reseller_resend_bank_setup_email', e);
    res.status(400).json({});
  }
};
