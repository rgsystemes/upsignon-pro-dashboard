import { db } from '../../helpers/db';
import { logError } from '../../helpers/logger';
import { hasBankOwnership } from '../helpers/securityChecks';

export const delete_bank = async (req: any, res: any): Promise<void> => {
  try {
    const bankId = req.params.id;
    const isOwner = await hasBankOwnership(req, bankId);
    if (!isOwner) {
      res.sendStatus(401);
      return;
    }
    await db.query(`DELETE FROM banks WHERE id=$1`, [bankId]);
    res.status(200).end();
  } catch (e) {
    logError('delete_bank', e);
    res.status(400).end();
  }
};
