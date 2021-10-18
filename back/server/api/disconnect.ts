import { db } from '../helpers/connection';

export const disconnect = async (req: any, res: any): Promise<void> => {
  try {
    const adminEmail = req.session?.adminEmail;
    await db.query(`DELETE FROM admin_sessions WHERE session_data ->> 'adminEmail' = $1`, [
      adminEmail,
    ]);
    res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};
