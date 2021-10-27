import { db } from './connection';
import { logError } from './logger';

export const get_available_groups = async (req: any, res: any): Promise<void> => {
  try {
    if (!req.session.isSuperadmin) {
      const dbRes = await db.query(
        'SELECT admins.is_superadmin, admins.group_id, groups.name FROM admins LEFT JOIN groups ON admins.group_id=groups.id WHERE admins.email=$1',
        [req.session.adminEmail],
      );
      if (dbRes.rowCount === 0) return res.status(401).end();
      const userGroup = dbRes.rows[0];
      if (!userGroup.is_superadmin) {
        return res.status(200).send({ groups: [userGroup], isSuperadmin: false });
      }
    }

    // superadmin case
    const allGroups = await db.query('SELECT * FROM groups');
    res.status(200).send({ groups: allGroups.rows, isSuperadmin: true });
  } catch (e) {
    logError(e);
    res.status(400).end();
  }
};
