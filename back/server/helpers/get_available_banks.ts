import { db } from './db';
import { logError } from './logger';

export const get_available_banks = async (req: any, res: any): Promise<void> => {
  try {
    const directBanks = await db.query(
      `SELECT
        id,
        name,
        reseller_id,
        created_at,
        (SELECT count(users.id) FROM users WHERE users.bank_id=banks.id) AS nb_users
      FROM banks ORDER BY NAME ASC`,
    );

    if (
      req.session.adminRole !== 'superadmin' &&
      req.session.adminRole !== 'restricted_superadmin'
    ) {
      const resellersRes = await db.query(
        `SELECT
          resellers.id,
          resellers.name
        FROM resellers
        RIGHT JOIN admins on admins.reseller_id=resellers.id
        WHERE admins.reseller_id=$1
        ORDER BY name ASC`,
        [req.session.adminId],
      );
      const filteredBanks = directBanks.rows.filter((b) => req.session.banks?.includes(b.id));
      if (filteredBanks.length === 0 && resellersRes.rows.length === 0) {
        // this case should not happen
        req.destroy();
        logError('get_available_banks filteredBanks.length === 0');
        return res.status(401).end();
      }
      return res.status(200).json({
        banks: filteredBanks,
        resellers: resellersRes.rows,
        adminRole: req.session.adminRole,
      });
    }

    const resellersRes = await db.query(
      `SELECT
        id,
        name
      FROM resellers
      ORDER BY name ASC`,
    );
    // superadmin case
    res.status(200).json({
      banks: directBanks.rows,
      resellers: resellersRes.rows,
      adminRole: req.session.adminRole,
    });
  } catch (e) {
    logError('get_available_banks', e);
    res.status(400).end();
  }
};
