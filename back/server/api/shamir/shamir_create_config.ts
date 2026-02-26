import Joi from 'joi';
import { db } from '../../helpers/db';
import { logError } from '../../helpers/logger';
import { Request, Response } from 'express';
import { nextShamirConfigIndex } from './_nextShamirConfigIndex';
import {
  ShamirChange,
  ShamirConfigFootprint,
  ShamirShareholderFootprint,
} from './_configChangeSigning';

export const shamirCreateConfig = async (req: Request, res: Response): Promise<void> => {
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
        u.id,
        u.email,
        u.signing_public_key,
        b.public_id as bank_public_id,
        sh.nb_shares
      FROM shamir_holders AS sh
      INNER JOIN shamir_configs AS sc ON sc.id=sh.shamir_config_id
      INNER JOIN users AS u ON u.id=sh.vault_id
      INNER JOIN banks AS b ON b.id=u.bank_id
      WHERE sc.id=$1`,
      [configId],
    );
    const shareholders: ShamirShareholderFootprint[] = shareholderRes.rows.map(
      (h): ShamirShareholderFootprint => {
        return {
          vaultId: h.id,
          vaultEmail: h.email,
          vaultBankPublicId: h.bank_public_id,
          vaultSigningPubKey: h.signing_public_key,
          nbShares: h.nb_shares,
        };
      },
    );

    const bankRes = await db.query('SELECT public_id FROM banks WHERE id=$1', [bankId]);

    const newConfig: ShamirConfigFootprint = {
      configId,
      configName,
      bankPublicId: bankRes.rows[0].public_id,
      createdAt,
      minShares,
      supportEmail,
      creatorEmail,
      shareholders,
    };
    let previousConfig = null;
    if (previousConfigsRes.rows.length >= 1) {
      const previousConfigChange = JSON.parse(previousConfigsRes.rows[0].change);
      previousConfig = previousConfigChange.thisShamirConfig;
    }

    const configChange: ShamirChange = {
      previousShamirConfig: previousConfig,
      thisShamirConfig: newConfig,
    };
    const configChangeToSign = JSON.stringify(configChange);
    const willBeActive = previousConfig == null;
    await db.query('UPDATE shamir_configs SET change=$1, is_active=$2 WHERE id=$3', [
      configChangeToSign,
      willBeActive,
      configId,
    ]);
    res.status(200).end();
  } catch (e) {
    logError('shamirCreateFirstConfig', e);
    res.status(400).end();
  }
};
