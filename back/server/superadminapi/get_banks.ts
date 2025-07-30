import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const get_banks = async (req: any, res: any): Promise<void> => {
  try {
    const dbRes = await db.query(
      `SELECT
        banks.created_at,
        banks.id,
        banks.name,
        banks.settings,
        (SELECT count(users.id) FROM users WHERE users.bank_id=banks.id) AS nb_users,
        banks.nb_licences_sold
      FROM banks ORDER BY name ASC`,
    );
    res.status(200).send(dbRes.rows);
  } catch (e) {
    logError('get_banks', e);
    res.status(400).end();
  }
};
