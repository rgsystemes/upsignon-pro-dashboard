import { db } from '../../helpers/db';
import { logError } from '../../helpers/logger';
import { Request, Response } from 'express';

export const shamirRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    // @ts-ignore
    const bankId = req.proxyParamsBankId;
    const requestRes = await db.query(
      `SELECT srr.*, u.email, sc.name
      FROM shamir_recovery_requests AS srr
      INNER JOIN shamir_configs AS sc ON sc.id=srr.shamir_config_id
      INNER JOIN user_devices AS ud ON ud.id=srr.device_id
      INNER JOIN users AS u ON u.id=ud.user_id
      WHERE sc.bank_id=$1`,
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
          status: r.status,
        };
      }),
    });
  } catch (e) {
    logError('shamirRequests', e);
    res.status(400).end();
  }
};
