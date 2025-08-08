import { Request, Response } from 'express';
import { logError } from './logger';
import { db } from './db';

export const licenceSummary = async (req: Request, res: Response, asSuperadmin: boolean) => {
  try {
    // @ts-ignore
    const resellerId = req.proxyParamsResellerId;
    let resellers = [];
    if (asSuperadmin) {
      const rRes = await db.query(`SELECT
        id,
        name,
        (SELECT
            ARRAY_AGG(JSON_BUILD_OBJECT(
              'id', ext_id,
              'nb_licences', nb_licences,
              'valid_from', valid_from,
              'valid_until', valid_until,
              'is_monthly', is_monthly,
              'to_be_renewed', to_be_renewed))
          FROM external_licences WHERE resellers.id=external_licences.reseller_id
        ) as licences
        FROM resellers
        `);
      resellers = rRes.rows;
    }

    const bRes = await db.query(
      `SELECT
      id,
      name,
      (SELECT
            ARRAY_AGG(JSON_BUILD_OBJECT(
              'id', il.id,
              'nb_licences', il.nb_licences,
              'valid_from', el.valid_from,
              'valid_until', el.valid_until,
              'is_monthly', el.is_monthly,
              'to_be_renewed', el.to_be_renewed))
          FROM external_licences as el
          INNER JOIN internal_licences as il ON il.external_licences_id=el.ext_id
          WHERE il.bank_id=banks.id
        ) as licences
      FROM banks
      WHERE reseller_id ${asSuperadmin ? 'IS NULL' : '=$1'}
      `,
      asSuperadmin ? [] : [resellerId],
    );
    res.status(200).json({ resellers: resellers, directBanks: bRes.rows });
  } catch (e) {
    logError('licenceSummary', e);
    res.sendStatus(400);
  }
};
