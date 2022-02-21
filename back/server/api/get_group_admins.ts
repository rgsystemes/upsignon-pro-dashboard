import { db } from '../helpers/connection';
import { logError } from '../helpers/logger';

export const get_group_admins = async (req: any, res: any): Promise<void> => {
  try {
    const dbRes = await db.query(
      `SELECT
        admins.id,
        admins.email,
        admins.created_at
      FROM admins
      LEFT JOIN admin_groups ON admins.id=admin_groups.admin_id
      WHERE admin_groups.group_id = $1
      ORDER admins.created_at ASC`,
      [req.proxyParamsGroupId],
    );
    res.status(200).send(dbRes.rows);
  } catch (e) {
    logError(e);
    res.status(400).end();
  }
};
