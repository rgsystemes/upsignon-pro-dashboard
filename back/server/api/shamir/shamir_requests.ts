import { db } from '../../helpers/db';
import { logError } from '../../helpers/logger';
import { Request, Response } from 'express';

export const shamirRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    // @ts-ignore
    const bankId = req.proxyParamsBankId;
    const requestRes = await db.query(
      `SELECT
        srr.*,
        u.email,
        sc.name,
        srr.expiry_date < current_timestamp(0) as expired,
        (sc.min_shares > COALESCE(SUM(
          CASE
            WHEN sh.vault_id = ANY(srr.denied_by) THEN 0
            ELSE sh.nb_shares
          END
        ), 0)) AS is_refused,
      (sc.min_shares <= COALESCE(SUM(
        CASE
          WHEN sh.vault_id = ANY(srr.approved_by) THEN sh.nb_shares
          ELSE 0
        END
      ), 0)) AS is_approved
      FROM shamir_recovery_requests AS srr
      INNER JOIN shamir_configs AS sc ON sc.id=srr.shamir_config_id
      INNER JOIN users AS u ON u.id=srr.vault_id
      LEFT JOIN shamir_holders sh ON sh.shamir_config_id = srr.shamir_config_id
      WHERE sc.bank_id=$1
      GROUP BY sc.id, srr.id, u.id`,
      [bankId],
    );
    res.status(200).json({
      requests: requestRes.rows.map((r) => {
        return {
          id: r.id,
          email: r.email,
          createdAt: r.created_at,
          expiresAt: r.expiry_date,
          completedAt: r.completed_at,
          shamirConfigName: r.name,
          status: _shamirRequestStatusHelper(r),
        };
      }),
    });
  } catch (e) {
    logError('shamirRequests', e);
    res.status(400).end();
  }
};

const _shamirRequestStatusHelper = (r: {
  status: 'PENDING' | 'ABORTED' | 'COMPLETED';
  is_refused: boolean;
  is_approved: boolean;
  expired: boolean;
}): 'PENDING' | 'APPROVED' | 'EXPIRED' | 'ABORTED' | 'REFUSED' | 'COMPLETED' => {
  if (r.status === 'COMPLETED') return 'COMPLETED';
  if (r.is_refused) return 'REFUSED';
  if (r.status === 'ABORTED') return 'ABORTED';
  if (r.expired) return 'EXPIRED';
  if (r.is_approved) return 'APPROVED';
  return 'PENDING';
};
