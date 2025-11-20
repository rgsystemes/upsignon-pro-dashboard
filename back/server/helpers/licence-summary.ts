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
        r.id,
        r.name,
        ARRAY_AGG(
          JSON_BUILD_OBJECT(
            'id', el.ext_id,
            'nb_licences', el.nb_licences,
            'valid_from', el.valid_from,
            'valid_until', el.valid_until,
            'is_monthly', el.is_monthly,
            'to_be_renewed', el.to_be_renewed
          )
        ) FILTER (WHERE el.ext_id IS NOT NULL) as licences
        FROM resellers AS r
        LEFT JOIN external_licences AS el
          ON r.id=el.reseller_id
        GROUP BY r.id
        `);
      resellers = rRes.rows;
    }

    const bRes = await db.query(
      `SELECT
        b.id,
        b.name,
        ARRAY_AGG(
          JSON_BUILD_OBJECT(
            'id', il.id,
            'nb_licences', il.nb_licences,
            'valid_from', el.valid_from,
            'valid_until', el.valid_until,
            'is_monthly', el.is_monthly,
            'to_be_renewed', el.to_be_renewed
          )
        ) FILTER (WHERE il.id IS NOT NULL) ||
        ARRAY_AGG(
          JSON_BUILD_OBJECT(
            'id', el2.ext_id,
            'nb_licences', el2.nb_licences,
            'valid_from', el2.valid_from,
            'valid_until', el2.valid_until,
            'is_monthly', el2.is_monthly,
            'to_be_renewed', el2.to_be_renewed
          )
        ) FILTER (WHERE el2.ext_id IS NOT NULL)
          as licences
        FROM banks AS b
        LEFT JOIN internal_licences AS il
          ON il.bank_id=b.id
        LEFT JOIN external_licences AS el
          ON il.external_licences_id=el.ext_id
        LEFT JOIN external_licences AS el2
          ON el2.bank_id = b.id
        WHERE b.reseller_id ${asSuperadmin ? 'IS NULL' : '=$1'}
        GROUP BY b.id
        `,
      asSuperadmin ? [] : [resellerId],
    );
    let directBanks = bRes.rows;

    res.status(200).json({ resellers: resellers, directBanks: directBanks });
  } catch (e) {
    logError('licenceSummary', e);
    res.sendStatus(400);
  }
};
