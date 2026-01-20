import { Request, Response } from 'express';
import { logError } from '../../helpers/logger';
import { db } from '../../helpers/db';
import Joi from 'joi';

export const cancelPendingConfig = async (req: Request, res: Response): Promise<void> => {
  try {
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
      `SELECT id, is_active, created_at FROM shamir_configs WHERE bank_id=$1 ORDER BY created_at DESC`,
      [bankId],
    );
    if (allConfigsRes.rows.length > 0) {
      const latestConfig = allConfigsRes.rows[0];
      if (latestConfig.id !== configId || latestConfig.is_active) {
        res.status(400).end();
        return;
      }
    }

    await db.query('DELETE FROM shamir_configs WHERE id=$1 AND is_active=false', [
      validatedBody.configId,
    ]);
    res.status(200).end();
  } catch (e) {
    logError('cancelPendingConfig', e);
    res.status(400).end();
  }
};
