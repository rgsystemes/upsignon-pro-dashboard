import { Request, Response } from 'express';
import { logError } from './logger';
import { db } from './db';
import Joi from 'joi';

export const licenceTogglePool = async (req: Request, res: Response, asSuperadmin: boolean) => {
  try {
    const checkedBody: { licencesExtId: number; usesPool: boolean } = Joi.attempt(
      req.body,
      Joi.object({
        licencesExtId: Joi.number().required(),
        usesPool: Joi.boolean().required(),
      }),
    );

    const internalLicencesRes = await db.query(
      'SELECT count(id) as count FROM internal_licences WHERE external_licences_id=$1',
      [checkedBody.licencesExtId],
    );
    if (internalLicencesRes.rows[0].count > 0) {
      res.status(400).json({ error: 'Remove all assignements first.' });
      return;
    }

    if (asSuperadmin) {
      // if bank_id is set, then it is nonsense to set uses_pool to true.
      await db.query(
        'UPDATE external_licences SET uses_pool=$1 WHERE ext_id=$2 AND bank_id is null',
        [checkedBody.usesPool, checkedBody.licencesExtId],
      );
    } else {
      // @ts-ignore
      const resellerId = req.proxyParamsResellerId;
      await db.query(
        'UPDATE external_licences SET uses_pool=$1 WHERE ext_id=$2 AND reseller_id=$3',
        [checkedBody.usesPool, checkedBody.licencesExtId, resellerId],
      );
    }

    res.status(200).end();
  } catch (e) {
    logError('licenceTogglePool', e);
    res.sendStatus(400);
  }
};
