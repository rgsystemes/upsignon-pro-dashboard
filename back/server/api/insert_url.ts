import { db } from '../helpers/connection';

export const insert_url = async (req: any, res: any): Promise<void> => {
  try {
    await db.query(
      `INSERT INTO url_list (displayed_name, signin_url, password_change_url) VALUES ($1, $2, $3)`,
      [req.body.displayedName, req.body.signinUrl, req.body.passwordChangeUrl],
    );
    res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};
