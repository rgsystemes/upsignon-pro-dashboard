import { db } from '../helpers/connection';

export const delete_admin = async (req: any, res: any): Promise<void> => {
  try {
    const adminId = req.params.id;
    const deletedAdmin = await db.query(`DELETE FROM admins WHERE id=$1 RETURNING email`, [
      adminId,
    ]);
    // DISCONNECT this user or these users
    deletedAdmin.rows.forEach(async (a) => {
      await db.query(`DELETE FROM admin_sessions WHERE session_data ->> 'adminEmail' = $1`, [
        a.email,
      ]);
    });
    res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};
