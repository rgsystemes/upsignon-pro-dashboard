import { Request, Response } from 'express';
import { db } from '../../helpers/db';
import { logError } from '../../helpers/logger';
import { ShamirConfigChangeToSign } from './_configChangeSigning';

export const getShamirCurrentConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const dbRes = await db.query(
      `SELECT * FROM shamir_configs WHERE is_active=true AND bank_id=$1`,
      // @ts-ignore
      [req.proxyParamsBankId],
    );
    if (dbRes.rows.length === 0) {
      res.status(200).json({ currentConfig: null });
      return;
    }
    const currentConfig = dbRes.rows[0];
    const change = JSON.parse(currentConfig.change) as ShamirConfigChangeToSign;
    const shareholders = change.nextShamirConfig.shareholders;
    const enhancedShareholders = await Promise.all(
      shareholders.map(async (sh) => {
        const r = await db.query('SELECT name FROM banks WHERE public_id=$1', [
          sh.vaultBankPublicId,
        ]);
        return {
          email: sh.vaultEmail,
          nbShares: sh.nbShares,
          bankName: r.rows[0].name,
        };
      }),
    );
    res.status(200).json({
      currentConfig: {
        name: currentConfig.name,
        creatorEmail: change.nextShamirConfig.creatorEmail,
        minShares: change.nextShamirConfig.minShares,
        supportEmail: change.nextShamirConfig.supportEmail,
        createdAt: change.nextShamirConfig.createdAt,
        shareholders: enhancedShareholders,
      },
    });
  } catch (e) {
    logError('getShamirCurrentConfig', e);
    res.status(400).end();
  }
};
