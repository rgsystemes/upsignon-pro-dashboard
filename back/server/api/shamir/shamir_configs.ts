import { Request, Response } from 'express';
import { db } from '../../helpers/db';
import { logError } from '../../helpers/logger';
import {
  ShamirChange,
  ShamirChangeSignature,
  ShamirShareholderFootprint,
} from './_configChangeSigning';

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
  change_signatures: ShamirChangeSignature[];
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
  isPending: boolean;
  approvers: { email: string | null; bankName: string | null }[];
}> => {
  const change = JSON.parse(config.change) as ShamirChange;
  const shareholders = change.thisShamirConfig.shareholders;
  const enhancedShareholders = await Promise.all(
    shareholders.map(async (sh: ShamirShareholderFootprint) => {
      const r = await db.query('SELECT name FROM banks WHERE public_id=$1', [sh.vaultBankPublicId]);
      return {
        vaultId: sh.vaultId,
        email: sh.vaultEmail,
        nbShares: sh.nbShares,
        bankName: r.rows[0]?.name || '-',
      };
    }),
  );

  const approvingSignatures = config.change_signatures?.filter((cs) => cs.approved) || [];
  let approvedAt = null;
  let cumulatedApprovingShares = 0;
  for (let i = 0; i < approvingSignatures.length; i++) {
    const cs = approvingSignatures[i];
    const sh = shareholders.find((s) => s.vaultId === cs.holderVaultId);
    cumulatedApprovingShares += sh?.nbShares || 0;
    if (cumulatedApprovingShares >= change.thisShamirConfig.minShares) {
      approvedAt = cs.signedAt;
      continue;
    }
  }

  let approvers: { email: string | null; bankName: string | null }[];
  if (change.previousShamirConfig == null) {
    approvers = approvingSignatures.map((as) => {
      const sh = enhancedShareholders.find((es) => es.vaultId === as.holderVaultId);
      return {
        email: sh?.email || null,
        bankName: sh?.bankName || null,
      };
    });
  } else {
    const rawPreviousShareholders = change.previousShamirConfig.shareholders;
    approvers = await Promise.all(
      approvingSignatures.map(async (as) => {
        const prevShareholder = change.previousShamirConfig?.shareholders.find(
          (s) => s.vaultId === as.holderVaultId,
        );
        if (!prevShareholder) {
          return {
            email: null,
            bankName: null,
          };
        }

        const r = await db.query('SELECT name FROM banks WHERE public_id=$1', [
          prevShareholder?.vaultBankPublicId,
        ]);
        return {
          email: prevShareholder.vaultEmail,
          bankName: r.rows[0]?.name || null,
        };
      }),
    );
  }

  return {
    id: config.id,
    name: config.name,
    creatorEmail: change.thisShamirConfig.creatorEmail,
    minShares: change.thisShamirConfig.minShares,
    supportEmail: change.thisShamirConfig.supportEmail,
    createdAt: change.thisShamirConfig.createdAt,
    shareholders: enhancedShareholders,
    isActive: config.is_active,
    approvedAt,
    isPending: !config.is_active && !approvedAt,
    approvers,
  };
};
