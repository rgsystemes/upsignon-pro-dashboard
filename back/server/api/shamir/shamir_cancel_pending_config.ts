import { Request, Response } from 'express';
import { logError } from '../../helpers/logger';
import { db } from '../../helpers/db';
import Joi from 'joi';
import { sendShamirConfigChangeCancelledToTrustedPersonsCCAdmins } from '../../emails/shamir/sendShamirConfigChangeCancelled';
import { getShareholdersEmailsForConfig } from './_trustedPersonEmails';

export const cancelPendingConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    /// It is already required to be superadmin, restricted_superadmin, group admin or bank admin.
    /// But this route should be forbidden to restricted_superadmin
    // @ts-ignore
    if (req.session.adminRole === 'restricted_superadmin') {
      res.status(401).end();
      return;
    }
    const validatedBody = Joi.attempt(
      req.body,
      Joi.object({
        configId: Joi.number().required(),
      }),
    );
    const configId = validatedBody.configId;
    // @ts-ignore
    const bankId = req.proxyParamsBankId;

    // Check we only delete the latest config that is not yet active
    const allConfigsRes = await db.query(
      `SELECT id, name, creator_email, is_active, support_email, created_at FROM shamir_configs WHERE bank_id=$1 ORDER BY created_at DESC`,
      [bankId],
    );
    if (allConfigsRes.rows.length > 0) {
      const latestConfig = allConfigsRes.rows[0];
      if (latestConfig.id !== configId || latestConfig.is_active) {
        res.status(400).end();
        return;
      }
    }
    // compute shareholder emails before deleting the config
    const shareholders = await getShareholdersEmailsForConfig(configId);
    await db.query('DELETE FROM shamir_configs WHERE id=$1 AND is_active=false', [configId]);

    // Send email notification
    const bankRes = await db.query('SELECT name FROM banks WHERE id = $1', [bankId]);
    const activeConfig = allConfigsRes.rows.find((c) => c.is_active);
    const acceptLanguage = req.headers['accept-language'];
    if (activeConfig) {
      await sendShamirConfigChangeCancelledToTrustedPersonsCCAdmins({
        trustedPersonEmails: shareholders,
        supportEmail: activeConfig.support_email,
        bankId,
        bankName: bankRes.rows[0].name,
        shamirConfigName: activeConfig.name,
        creatorEmail: activeConfig.creator_email,
        acceptLanguage,
      });
    }
    res.status(200).end();
  } catch (e) {
    logError('cancelPendingConfig', e);
    res.status(400).end();
  }
};
