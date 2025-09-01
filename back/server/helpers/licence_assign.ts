import { Request, Response } from 'express';
import { logError } from './logger';
import Joi from 'joi';
import { db } from './db';

export const licenceAssign = async (req: Request, res: Response, asSuperadmin: boolean) => {
  try {
    const checkedBody = Joi.attempt(
      req.body,
      Joi.object({
        licencesExtId: Joi.number().required(),
        bankId: Joi.number().required(),
        nbLicences: Joi.number().min(0).allow(null).required(),
      }),
    );
    // @ts-ignore
    const resellerId = req.proxyParamsResellerId;

    const licenceRes = await db.query(
      'SELECT bank_id, reseller_id, nb_licences FROM external_licences WHERE ext_id=$1',
      [checkedBody.licencesExtId],
    );
    const externalLicence = licenceRes.rows[0];

    const alreadyAssignedLicencesRes = await db.query(
      'SELECT SUM(nb_licences) as sum FROM internal_licences WHERE external_licences_id=$1 AND bank_id!=$2',
      [checkedBody.licencesExtId, checkedBody.bankId],
    );
    const alreadyAssignedLicences = alreadyAssignedLicencesRes.rows[0].sum || 0;

    if (externalLicence.bank_id) {
      logError('Bank licences cannot be assigned.');
      res.sendStatus(400);
      return;
    }
    if (asSuperadmin) {
      if (externalLicence.reseller_id) {
        logError('Reseller licences cannot be assigned as superadmin.');
        res.sendStatus(400);
        return;
      }
    } else if (resellerId) {
      if (externalLicence.reseller_id !== resellerId) {
        logError("Reseller licences must be assigned by a reseller's admin.");
        res.sendStatus(400);
        return;
      }
    }

    if (externalLicence.nb_licences - alreadyAssignedLicences < checkedBody.nbLicences) {
      logError('Not enough licences to assign.');
      res.sendStatus(400);
      return;
    }
    if (checkedBody.nbLicences > 0) {
      await db.query(
        'INSERT INTO internal_licences (external_licences_id, nb_licences, bank_id) VALUES ($1, $2, $3) ON CONFLICT (external_licences_id, bank_id) DO UPDATE SET nb_licences=EXCLUDED.nb_licences',
        [checkedBody.licencesExtId, checkedBody.nbLicences, checkedBody.bankId],
      );
    } else if (checkedBody.nbLicences === 0 || checkedBody.nbLicences == null) {
      await db.query('DELETE FROM internal_licences WHERE external_licences_id=$1 AND bank_id=$2', [
        checkedBody.licencesExtId,
        checkedBody.bankId,
      ]);
    }
    res.status(200).end();
  } catch (e) {
    logError('licenceAssign', e);
    res.sendStatus(400);
  }
};
