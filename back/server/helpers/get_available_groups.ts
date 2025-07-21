import { db } from './db';
import { logError } from './logger';

export const get_available_groups = async (req: any, res: any): Promise<void> => {
  try {
    const allGroups = await db.query('SELECT id, name FROM groups ORDER BY NAME ASC');
    if (!req.session.isSuperadmin && !req.session.isReadOnlySuperadmin) {
      const filteredGroups = allGroups.rows.filter((g) => req.session.groups?.includes(g.id));
      if (filteredGroups.length === 0) {
        // this case should not happen
        req.destroy();
        logError('get_available_groups filteredGroups.length === 0');
        return res.status(401).end();
      }
      return res.status(200).json({
        groups: filteredGroups,
        isSuperadmin: false,
        isReadOnlySuperadmin: false,
      });
    }
    // superadmin case
    res.status(200).json({
      groups: allGroups.rows,
      isSuperadmin: true,
      isReadOnlySuperadmin: req.session.isReadOnlySuperadmin,
    });
  } catch (e) {
    logError('get_available_groups', e);
    res.status(400).end();
  }
};
