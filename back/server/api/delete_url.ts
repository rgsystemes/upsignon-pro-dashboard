import { db } from '../helpers/connection';

export const delete_url = async (req: any, res: any): Promise<void> => {
  try {
    const urlId = req.params.id;
    await db.query(`DELETE FROM url_list WHERE id=$1`, [urlId]);
    res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};
