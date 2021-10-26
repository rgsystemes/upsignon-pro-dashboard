import { db } from './connection';
import { logError } from './logger';

export const get_group_id = async (
  adminEmail: string,
  groupPath: string,
): Promise<null | number> => {
  try {
    const dbRes = await db.query(
      'SELECT groups.id FROM admins LEFT JOIN groups ON admins.group_id=groups.id WHERE admins.email=$1 AND groups.urlpath=$2',
      [adminEmail, groupPath],
    );
    if (dbRes.rowCount === 0) return null;
    return dbRes.rows[0].id;
  } catch (e) {
    logError(e);
    return null;
  }
};
