import { db } from '../helpers/connection';

export const update_setting = async (req: any, res: any): Promise<void> => {
  try {
    await db.query('UPDATE settings SET value=$1 WHERE key=$2', [req.body.value, req.body.key]);
    res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};
