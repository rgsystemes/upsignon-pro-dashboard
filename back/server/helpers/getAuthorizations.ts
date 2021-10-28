import { db } from './connection';

export const getAuthorizations = async (
  adminEmail: string,
): Promise<{ isSuperadmin: boolean; groupId: null | number }> => {
  // Check Superadmin
  const isSuperadminRes = await db.query(
    'SELECT is_superadmin, group_id FROM admins WHERE admins.email=$1',
    [adminEmail],
  );
  const isSuperadmin = isSuperadminRes.rows[0]?.is_superadmin;

  let groupId = null;
  if (!isSuperadmin) {
    const groupRes = await db.query(
      'SELECT groups.id FROM groups INNER JOIN admins ON admins.group_id=groups.id WHERE admins.email=$1',
      [adminEmail],
    );
    groupId = groupRes.rows[0]?.id;
  }

  return { isSuperadmin, groupId };
};
