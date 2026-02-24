import { db } from '../../helpers/db';
import { logError } from '../../helpers/logger';
import { inputSanitizer } from '../../helpers/sanitizer';

export const check_user_shamir_involvement = async (req: any, res: any): Promise<void> => {
  try {
    const userId = inputSanitizer.getNumberOrNull(req.params?.userId);
    if (!userId) {
      res.status(400).json({ error: 'Invalid userId paramter' });
      return;
    }

    // Check if user is a shareholder in any Shamir config
    const allConfigsRes = await db.query(
      `SELECT
        sc.id as config_id,
        sc.name as config_name,
        sc.min_shares,
        sc.is_active,
        sh.nb_shares as user_shares,
        (SELECT SUM(nb_shares) FROM shamir_holders WHERE shamir_config_id = sc.id) as total_shares,
        (SELECT EXISTS(SELECT 1 FROM shamir_shares WHERE shamir_config_id = sc.id AND holder_vault_id=sh.vault_id)) as has_protected_vaults
      FROM shamir_holders AS sh
      INNER JOIN shamir_configs AS sc ON sc.id = sh.shamir_config_id
      WHERE sh.vault_id = $1
        AND sc.bank_id = $2`,
      [userId, req.proxyParamsBankId],
    );

    // Check each active config where user is a shareholder
    const shareholderConfigs = allConfigsRes.rows
      .map((row) => {
        const remainingShares = row.total_shares - row.user_shares;
        const wouldBreakConsensus = remainingShares < row.min_shares;

        return {
          configId: row.config_id,
          configName: row.config_name,
          isActive: row.is_active,
          wouldBreakConsensus,
          hasProtectedVaults: row.has_protected_vaults,
        };
      })
      .filter((c) => c.isActive || (c.wouldBreakConsensus && c.hasProtectedVaults));

    if (shareholderConfigs.length === 0) {
      // User is not a shareholder, deletion is safe
      res.status(200).json({
        isShareholder: false,
        canDelete: true,
        impactedConfigs: [],
      });
      return;
    }

    const wouldBreakAnyConsensus = shareholderConfigs.some((c) => c.wouldBreakConsensus);

    res.status(200).json({
      isShareholder: true,
      canDelete: !wouldBreakAnyConsensus,
      impactedConfigs: shareholderConfigs.map((c) => ({ id: c.configId, name: c.configName })),
    });
  } catch (e) {
    logError('check_user_shamir_involvement', e);
    res.status(400).end();
  }
};
