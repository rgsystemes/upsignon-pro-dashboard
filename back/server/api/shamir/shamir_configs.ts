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
    const activeConfigCreateDate = allConfigsRes.rows.find((c) => c.is_active)?.created_at;
    const configs = await Promise.all(
      allConfigsRes.rows.map(async (c) => {
        return await fetchEnhancedConfig(c, activeConfigCreateDate);
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
  shareholder_emails: string;
};

const fetchEnhancedConfig = async (
  config: ShamirRawConfig,
  activeConfigCreateDate: String,
): Promise<{
  id: number;
  name: string;
  creatorEmail: string;
  minShares: number;
  supportEmail: string;
  createdAt: string;
  shareholders: { vaultId: number; email: string; nbShares: number; bankName: string }[];
  isActive: boolean;
  approvedAt: string | null;
  isPending: boolean;
  signers: { email: string | null; bankName: string | null; approved: boolean }[];
}> => {
  // share holder emails session cache
  // do not make it global cache otherwise the cache could get very big in SaaS
  // and it would need cleaning from time to time
  const shareHolderEmailsCache: { [vaultId: number]: string } = {};
  const getShareHolderEmailFromDbWithCache = async (vaultId: number): Promise<string> => {
    if (!shareHolderEmailsCache.hasOwnProperty(vaultId)) {
      const dbRes = await db.query('SELECT email FROM users WHERE id=$1', [vaultId]);
      const dbUser = dbRes.rows[0];
      shareHolderEmailsCache[vaultId] = dbUser?.email;
    }
    return shareHolderEmailsCache[vaultId];
  };

  const change = JSON.parse(config.change) as ShamirChange;
  const shareholderEmails = JSON.parse(config.shareholder_emails) as { [vaultId: number]: string };
  const thisConfigShareholders = change.thisShamirConfig.shareholders;
  const thisConfigEnhancedShareholders = await Promise.all(
    thisConfigShareholders.map(async (sh: ShamirShareholderFootprint) => {
      const r = await db.query('SELECT name FROM banks WHERE public_id=$1', [sh.vaultBankPublicId]);
      const emailInDb = await getShareHolderEmailFromDbWithCache(sh.vaultId);
      return {
        vaultId: sh.vaultId,
        email: emailInDb || shareholderEmails[sh.vaultId],
        nbShares: sh.nbShares,
        bankName: r.rows[0]?.name || '?',
      };
    }),
  );

  const allSignatures = config.change_signatures || [];
  const approvingSignatures = allSignatures?.filter((s) => s.approved);
  const signingShareholders = (change.previousShamirConfig || change.thisShamirConfig).shareholders;
  const signingMinShares = (change.previousShamirConfig || change.thisShamirConfig).minShares;
  let approvedAt = null;
  let cumulatedApprovingShares = 0;
  for (let i = 0; i < approvingSignatures.length; i++) {
    const cs = approvingSignatures[i];
    const sh = signingShareholders.find((s) => s.vaultId === cs.holderVaultId);
    cumulatedApprovingShares += sh?.nbShares || 0;
    if (cumulatedApprovingShares >= signingMinShares) {
      approvedAt = cs.signedAt;
      break;
    }
  }

  let signers: { email: string | null; bankName: string | null; approved: boolean }[] = [];
  if (change.previousShamirConfig != null) {
    const prevConfShareHolderEmailsRes = await db.query(
      'SELECT shareholder_emails FROM shamir_configs WHERE id=$1',
      [change.previousShamirConfig.configId],
    );
    const prevConfShareHolderEmails = JSON.parse(
      prevConfShareHolderEmailsRes.rows[0].shareholder_emails,
    ) as { [vaulId: number]: string };
    signers = await Promise.all(
      allSignatures.map(async (as) => {
        const prevShareholder = change.previousShamirConfig!.shareholders.find(
          (s) => s.vaultId === as.holderVaultId,
        );
        if (!prevShareholder) {
          // should never happen
          return {
            vaultId: 0,
            email: '?',
            bankName: '?',
            approved: as.approved,
          };
        }

        const r = await db.query('SELECT name FROM banks WHERE public_id=$1', [
          prevShareholder?.vaultBankPublicId,
        ]);
        const emailInDb = await getShareHolderEmailFromDbWithCache(prevShareholder.vaultId);
        return {
          vaultId: prevShareholder.vaultId,
          email: emailInDb || prevConfShareHolderEmails[prevShareholder.vaultId],
          bankName: r.rows[0]?.name || '?',
          approved: as.approved,
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
    shareholders: thisConfigEnhancedShareholders,
    isActive: config.is_active,
    approvedAt,
    isPending: !config.is_active && activeConfigCreateDate < config.created_at,
    signers,
  };
};
