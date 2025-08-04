import { Request } from 'express';
import { db } from '../../helpers/db';

export const hasBankOwnership = async (req: Request, bankId: string): Promise<boolean> => {
  const directOwnerCheck = await db.query(
    `SELECT 1
    FROM banks
    INNER JOIN admin_banks ON admin_banks.bank_id=banks.id
    WHERE admin_banks.admin_id=$1 AND banks.id=$2`,
    [
      // @ts-ignore
      req.session.adminId,
      bankId,
    ],
  );
  if (directOwnerCheck.rows.length > 0) {
    return true;
  }

  const resellerOwnershipCheck = await db.query(
    `SELECT 1
    FROM banks
    INNER JOIN admin_banks ON admin_banks.bank_id=banks.id
    INNER JOIN admins ON admins.id=admin_banks.admin_id
    WHERE admins.id=$1 AND admins.reseller_id=banks.reseller_id AND banks.id=$2`,
    [
      // @ts-ignore
      req.session.adminId,
      bankId,
    ],
  );
  return resellerOwnershipCheck.rows.length > 0;
};
export const hasResellerOwnership = async (req: Request, resellerId: string): Promise<boolean> => {
  const checkRes = await db.query(
    `SELECT 1
    FROM resellers
    INNER JOIN admins ON admins.reseller_id=resellers.id
    WHERE admins.id=$1 AND resellers.id=$2`,
    [
      // @ts-ignore
      req.session.adminId,
      resellerId,
    ],
  );
  return checkRes.rows.length > 0;
};
