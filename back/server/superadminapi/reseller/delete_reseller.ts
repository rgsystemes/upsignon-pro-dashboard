/* eslint-disable @typescript-eslint/no-var-requires */
import { db } from '../../helpers/db';
import { logError } from '../../helpers/logger';
import { Request, Response } from 'express';

export const delete_reseller = async (req: Request, res: Response): Promise<void> => {
  try {
    const resellerId = req.params.id;
    // this will fail if there are still banks associated with this reseller, and that's intentionnal
    await db.query(`DELETE FROM resellers WHERE id=$1`, [resellerId]);
    res.status(200).end();
  } catch (e) {
    logError('delete_reseller', e);
    res.status(400).end();
  }
};
