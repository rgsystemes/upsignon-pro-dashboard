/* eslint-disable @typescript-eslint/no-var-requires */
import { db } from '../../helpers/db';
import { logError } from '../../helpers/logger';
import Joi from 'joi';
import { Request, Response } from 'express';

export const update_reseller = async (req: Request, res: Response): Promise<void> => {
  try {
    const safeBody: { resellerId: string; resellerName: string } = Joi.attempt(
      req.body,
      Joi.object({ resellerName: Joi.string().required(), resellerId: Joi.string().required() }),
    );

    await db.query(`UPDATE resellers SET name=$2 WHERE id=$1`, [
      safeBody.resellerId,
      safeBody.resellerName,
    ]);
    res.status(200).end();
  } catch (e) {
    logError('update_reseller', e);
    res.status(400).end();
  }
};
