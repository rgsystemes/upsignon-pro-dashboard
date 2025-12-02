import Joi from 'joi';
import { db } from '../../helpers/db';
import { logError } from '../../helpers/logger';
import { Request, Response } from 'express';
import { nextShamirConfigIndex } from './_nextShamirConfigIndex';

export const shamirCreateFirstConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedBody = Joi.attempt(
      req.body,
      Joi.object({
        minShares: Joi.number().min(1).required(),
        selectedHolderIds: Joi.array().items(Joi.number()).required(),
        supportEmail: Joi.string().required(),
      }),
    );

    const { minShares, selectedHolderIds, supportEmail } = validatedBody;
    if (selectedHolderIds.length < minShares) {
      res.status(400).end();
      return;
    }
    // @ts-ignore
    const bankId = req.proxyParamsBankId;
    const nextShamirConfigIdx = await nextShamirConfigIndex(bankId);
    const configRes = await db.query(
      'INSERT INTO shamir_configs (name, min_shares, bank_id, support_email, creator_email) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [
        `Shamir ${nextShamirConfigIdx}`,
        minShares,
        bankId,
        supportEmail,
        // @ts-ignore
        req.session.adminEmail,
      ],
    );
    const configId = configRes.rows[0].id;
    for (let i = 0; i < selectedHolderIds.length; i++) {
      await db.query(
        'INSERT INTO shamir_holders (vault_id, shamir_config_id, nb_shares) VALUES ($1, $2, 1)',
        [selectedHolderIds[i], configId],
      );
    }
    // TODO request for self-signing this config
    res.status(200).end();
  } catch (e) {
    logError('shamirCreateFirstConfig', e);
    res.status(400).end();
  }
};
