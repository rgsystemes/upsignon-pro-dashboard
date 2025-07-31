import { db } from './db';
import { logError } from './logger';

export const get_available_banks = async (req: any, res: any): Promise<void> => {
  try {
    const allBanks = await db.query('SELECT id, name FROM banks ORDER BY NAME ASC');
    if (
      req.session.adminRole !== 'superadmin' &&
      req.session.adminRole !== 'restricted_superadmin'
    ) {
      const filteredBanks = allBanks.rows.filter((g) => req.session.banks?.includes(g.id));
      if (filteredBanks.length === 0) {
        // this case should not happen
        req.destroy();
        logError('get_available_banks filteredBanks.length === 0');
        return res.status(401).end();
      }
      return res.status(200).json({
        banks: filteredBanks,
        adminRole: req.session.adminRole,
      });
    }
    // superadmin case
    res.status(200).json({
      banks: allBanks.rows,
      adminRole: req.session.adminRole,
    });
  } catch (e) {
    logError('get_available_banks', e);
    res.status(400).end();
  }
};
