import { Request } from 'express';
import { AdminRoles } from './adminRoles';
import { db } from './db';
import env from './env';
import { logError } from './logger';

export type SessionData = {
  adminEmail: string;
  adminId: string;
  adminRole: AdminRoles;
  banks: number[];
};
export const recomputeSessionAuthorizationsForAdminByEmail = async (
  email: string,
  req?: Request,
): Promise<void> => {
  try {
    const adminRes = await db.query(`SELECT id FROM admins WHERE email=$1`, [email]);

    if (adminRes.rows.length === 0) {
      return;
    }
    await recomputeSessionAuthorizationsForAdminById(adminRes.rows[0].id, req);
  } catch (e) {
    logError('updateSessionAuthorizations', e);
    return;
  }
};

export const recomputeSessionAuthorizationsForAdminById = async (
  adminId: string,
  req?: Request,
): Promise<void> => {
  try {
    const adminRes = await db.query(
      'SELECT email, admin_role, reseller_id FROM admins WHERE id=$1',
      [adminId],
    );
    if (adminRes.rows.length === 0) {
      return;
    }
    const adminEmail = adminRes.rows[0].email;

    let adminRole = adminRes.rows[0].admin_role;
    if (!env.IS_PRODUCTION && adminEmail === env.DEV_FALLBACK_ADMIN_EMAIL) {
      adminRole = env.DEV_FALLBACK_ADMIN_RESTRICTED ? 'restricted_superadmin' : 'superadmin';
    }
    const resellerId = adminRes.rows[0].reseller_id;
    const banksRes = await db.query('SELECT bank_id FROM admin_banks WHERE admin_id=$1', [adminId]);
    const banksInResellerRes = await db.query('SELECT id FROM banks WHERE reseller_id=$1', [
      resellerId,
    ]);
    const bankIds = [...banksRes.rows.map((b) => b.bank_id)];
    for (let b of banksInResellerRes.rows) {
      if (bankIds.indexOf(b.id) === -1) {
        bankIds.push(b.id);
      }
    }
    if (req) {
      // @ts-ignore
      req.session.adminEmail = adminEmail;
      // @ts-ignore
      req.session.adminId = adminId;
      // @ts-ignore
      req.session.adminRole = adminRole;
      // @ts-ignore
      req.session.banks = bankIds;
      // NB, do not do 'req.session =', this breaks the system
    } else {
      const sessionRes = await db.query(
        "SELECT session_id, session_data FROM admin_sessions WHERE session_data ->> 'adminEmail' = $1",
        [adminEmail],
      );
      if (sessionRes.rows.length > 0) {
        const newSession = {
          ...sessionRes.rows[0].session_data,
          adminEmail,
          adminId,
          adminRole,
          banks: bankIds,
        };
        await db.query(`UPDATE admin_sessions SET session_data = $1 WHERE session_id = $2`, [
          newSession,
          sessionRes.rows[0].session_id,
        ]);
      }
    }
  } catch (e) {
    logError('updateSessionAuthorizationsForAdmin', e);
  }
};
