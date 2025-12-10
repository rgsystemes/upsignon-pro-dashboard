import Joi from 'joi';
import { db } from '../../helpers/db';
import { logError } from '../../helpers/logger';
import { Request, Response } from 'express';
import { nextShamirConfigIndex } from './_nextShamirConfigIndex';
import { getShamirConfigChangeToSign, ShamirShareholderToSign } from './_configChangeSigning';

export const shamirCreateConfig = async (req: Request, res: Response): Promise<void> => {
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
    // @ts-ignore
    const creatorEmail = req.session.adminEmail;

    const previousConfigsRes = await db.query(
      `SELECT change FROM shamir_configs WHERE bank_id=$1 ORDER BY created_at DESC LIMIT 1`,
      [bankId],
    );

    const nextShamirConfigIdx = await nextShamirConfigIndex(bankId);
    const configName = `Shamir ${nextShamirConfigIdx}`;
    const configRes = await db.query(
      'INSERT INTO shamir_configs (name, min_shares, bank_id, support_email, creator_email, is_active) VALUES ($1, $2, $3, $4, $5, false) RETURNING id, created_at',
      [configName, minShares, bankId, supportEmail, creatorEmail],
    );
    const configId = configRes.rows[0].id;
    const createdAt = configRes.rows[0].created_at;
    for (let i = 0; i < selectedHolderIds.length; i++) {
      await db.query(
        'INSERT INTO shamir_holders (vault_id, shamir_config_id, nb_shares) VALUES ($1, $2, 1)',
        [selectedHolderIds[i], configId],
      );
    }
    const shareholderRes = await db.query(
      `SELECT
      u.email,
      ub.public_id,
      sh.nb_shares
    FROM shamir_holders AS sh
    INNER JOIN shamir_configs AS sc ON sc.id=sh.shamir_config_id
    INNER JOIN users AS u ON u.id=sh.vault_id
    INNER JOIN banks AS ub ON ub.id=u.bank_id
    WHERE sc.id=$1`,
      [configId],
    );
    // TODO add vaultSigningPublicKey here
    const shareholders: ShamirShareholderToSign[] = shareholderRes.rows.map(
      (h): ShamirShareholderToSign => {
        return {
          vaultEmail: h.email,
          vaultBankPublicId: h.public_id,
          vaultSigningPubKey: '',
          nbShares: h.nb_shares,
        };
      },
    );

    const newConfig = {
      minShares,
      creatorEmail,
      supportEmail,
      shareholders,
      createdAt,
    };
    let previousConfig = null;
    if (previousConfigsRes.rows.length >= 1) {
      const previousConfigChange = JSON.parse(previousConfigsRes.rows[0].change);
      previousConfig = previousConfigChange.nextShamirConfig;
    }

    const changeToSign = getShamirConfigChangeToSign(previousConfig, newConfig);
    await db.query('UPDATE shamir_configs SET change=$1 WHERE id=$2', [changeToSign, configId]);
    if (nextShamirConfigIdx === 1) {
      await db.query('UPDATE shamir_configs SET is_active=$1 WHERE id=$2', [true, configId]);
    }
    res.status(200).end();
  } catch (e) {
    logError('shamirCreateFirstConfig', e);
    res.status(400).end();
  }
};
