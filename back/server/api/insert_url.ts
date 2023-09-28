import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const insert_url = async (req: any, res: any): Promise<void> => {
  try {
    await db.query(
      `INSERT INTO url_list (displayed_name, signin_url, uses_basic_auth, group_id) VALUES ($1, $2, $3, $4)`,
      [
        req.body.displayedName,
        req.body.signinUrl,
        req.body.usesBasicAuth,
        req.proxyParamsGroupId,
      ],
    );
    res.status(200).end();
  } catch (e) {
    logError("insert_url", e);
    res.status(400).end();
  }
};
