/* eslint-disable @typescript-eslint/no-var-requires */
import { db } from '../../helpers/db';
import { logError } from '../../helpers/logger';
import Joi from 'joi';
import { Request, Response } from 'express';
import { forceProStatusUpdate } from '../../helpers/forceProStatusUpdate';

export const add_reseller = async (req: Request, res: Response): Promise<void> => {
  try {
    const safeBody: { resellerName: string } = Joi.attempt(
      req.body,
      Joi.object({ resellerName: Joi.string().required() }),
    );

    await db.query(`INSERT INTO resellers (name) VALUES ($1) ON CONFLICT (name) DO NOTHING`, [
      safeBody.resellerName,
    ]);
    forceProStatusUpdate();
    res.status(200).end();
  } catch (e) {
    logError('add_reseller', e);
    res.status(400).end();
  }
};
