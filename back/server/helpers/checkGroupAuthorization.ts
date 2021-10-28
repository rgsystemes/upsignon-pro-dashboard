import { db } from './connection';
import { logError } from './logger';

export const checkGroupAuthorization = async (req: any, res: any): Promise<boolean> => {
  try {
    const groupId = req.params.groupId;
    req.url = req.url.replace(`/${groupId}/`, '');

    if (req.session?.groupId != null && req.session?.groupId == groupId) {
      return true;
    }

    const adminEmail = req.session?.adminEmail;

    if (req.session?.isSuperadmin && !req.session?.groupId) {
      const groupRes = await db.query('SELECT id FROM groups WHERE id=$1', [groupId]);
      if (groupRes.rowCount === 0) return false;
      // @ts-ignore
      req.session?.groupId = groupRes.rows[0]?.id;
    } else {
      const groupRes = await db.query(
        'SELECT groups.id FROM groups INNER JOIN admins ON admins.group_id=groups.id WHERE admins.email=$1 AND groups.id=$2',
        [adminEmail, groupId],
      );
      if (groupRes.rowCount === 0) return false;
      // @ts-ignore
      req.session?.groupId = groupRes.rows[0]?.id;
    }
    return true;
  } catch (e) {
    logError(e);
    return false;
  }
};
