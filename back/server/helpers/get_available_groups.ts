import { db } from './connection';
import { logError } from './logger';

export const get_available_groups = async (req: any, res: any): Promise<void> => {
  try {
    const allGroups = await db.query('SELECT id, name FROM groups');
    if (!req.session.isSuperadmin) {
      const filteredGroups = allGroups.rows.filter((g) => req.session.groups.includes(g.id));
      if (filteredGroups.length === 0) {
        // this case should not happen
        req.destroy();
        return res.status(401).end();
      }
      return res.status(200).json({ groups: filteredGroups, isSuperadmin: false });
    }
    // superadmin case
    res.status(200).json({ groups: allGroups.rows, isSuperadmin: true });
  } catch (e) {
    logError(e);
    res.status(400).end();
  }
};
