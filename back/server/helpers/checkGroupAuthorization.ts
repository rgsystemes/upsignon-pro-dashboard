import { db } from './connection';
import { logError } from './logger';

export const checkGroupAuthorization = async (req: any, res: any): Promise<boolean> => {
  try {
    const groupId = req.params.groupId;
    req.url = req.url.replace(`/${groupId}/`, '');

    if (req.session?.groupId != null && req.session?.groupId == groupId) {
      return true;
    }

    if (req.session?.isSuperadmin) {
      const groupExistsRes = await db.query('SELECT id FROM groups WHERE id=$1', [groupId]);
      if (groupExistsRes.rowCount === 0) return false;
    } else {
      const adminGroupRes = await db.query(
        'SELECT group_id, is_superadmin FROM admins WHERE email=$1',
        [req.session?.adminEmail],
      );
      if (adminGroupRes.rowCount === 0) return false;
      if (!adminGroupRes.rows[0]?.is_superadmin && adminGroupRes.rows[0]?.group_id !== groupId)
        return false;
    }
    // @ts-ignore
    req.session?.groupId = groupId;
    return true;
  } catch (e) {
    logError(e);
    return false;
  }
};
