import { db } from './connection';
import { logError } from './logger';

export const get_available_groups = async (req: any, res: any): Promise<void> => {
  try {
    if (!req.session.isSuperadmin) {
      const groupRes = await db.query('SELECT id, name FROM groups WHERE id=$1', [
        req.session.groupId,
      ]);
      const g = groupRes.rows[0];
      if (!g) {
        // this case should not happen
        req.destroy();
        return res.status(401).end();
      }
      return res.status(200).json({ groups: [g], isSuperadmin: false });
    }
    // superadmin case
    const allGroups = await db.query('SELECT id, name FROM groups');
    res.status(200).json({ groups: allGroups.rows, isSuperadmin: true });
  } catch (e) {
    logError(e);
    res.status(400).end();
  }
};
