import { Request, Response } from 'express';
import { db } from '../../helpers/db';
import { logError } from '../../helpers/logger';
import { ShamirChangeSignatures, ShamirConfigChangeToSign } from './_configChangeSigning';

export const getShamirConfigs = async (req: Request, res: Response): Promise<void> => {
  try {
    const allConfigsRes = await db.query(
      `SELECT * FROM shamir_configs WHERE bank_id=$1 ORDER BY created_at DESC`,
      // @ts-ignore
      [req.proxyParamsBankId],
    );
    const configs = await Promise.all(
      allConfigsRes.rows.map(async (c) => {
        return await fetchEnhancedConfig(c);
      }),
    );

    res.status(200).json({
      configs,
    });
  } catch (e) {
    logError('getShamirConfigs', e);
    res.status(400).end();
  }
};

type ShamirRawConfig = {
  id: number;
  name: string;
  min_shares: number;
  bank_id: number;
  created_at: string;
  support_email: string;
  creator_email: string;
  change_signatures: ShamirChangeSignatures;
  change: string;
  is_active: boolean;
};

const fetchEnhancedConfig = async (
  config: ShamirRawConfig,
): Promise<{
  id: number;
  name: string;
  creatorEmail: string;
  minShares: number;
  supportEmail: string;
  createdAt: string;
  shareholders: { email: string; nbShares: number; bankName: string }[];
  isActive: boolean;
  approvedAt: string | null;
}> => {
  const change = JSON.parse(config.change) as ShamirConfigChangeToSign;
  const shareholders = change.nextShamirConfig.shareholders;
  const enhancedShareholders = await Promise.all(
    shareholders.map(async (sh) => {
      const r = await db.query('SELECT name FROM banks WHERE public_id=$1', [sh.vaultBankPublicId]);
      return {
        email: sh.vaultEmail,
        nbShares: sh.nbShares,
        bankName: r.rows[0].name,
      };
    }),
  );
  let approvedAt = null;
  if (!change.previousShamirConfig) {
    approvedAt = config.created_at;
  } else {
    const sortedApprovals = config.change_signatures
      ? Object.values(config.change_signatures).sort((a, b) => {
          if (a.approvedAt < b.approvedAt) return -1;
          if (a.approvedAt > b.approvedAt) return 1;
          return 0;
        })
      : [];
    if (sortedApprovals.length >= config.min_shares) {
      approvedAt = sortedApprovals[config.min_shares - 1].approvedAt;
    }
  }
  return {
    id: config.id,
    name: config.name,
    creatorEmail: change.nextShamirConfig.creatorEmail,
    minShares: change.nextShamirConfig.minShares,
    supportEmail: change.nextShamirConfig.supportEmail,
    createdAt: change.nextShamirConfig.createdAt,
    shareholders: enhancedShareholders,
    isActive: config.is_active,
    approvedAt,
  };
};
