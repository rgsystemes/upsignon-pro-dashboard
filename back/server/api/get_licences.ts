import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const get_licences = async (
  req: any,
  res: any,
  isSuperadminPage: boolean,
): Promise<void> => {
  try {
    const bankId = req.proxyParamsBankId;
    const resellerId = req.proxyParamsResellerId;

    const internalLicencesRes = await db.query(
      `SELECT
    il.id,
    b.name as bank_name,
    il.nb_licences,
    el.is_monthly,
    el.to_be_renewed,
    el.valid_from,
    el.valid_until
    FROM internal_licences AS il
    INNER JOIN external_licences AS el ON il.external_licences_id=el.ext_id
    INNER JOIN banks AS b ON b.id=il.bank_id
    ${isSuperadminPage ? '' : bankId ? 'WHERE il.bank_id=$1' : resellerId ? 'WHERE el.reseller_id=$1' : ''}
    ORDER BY b.name ASC, el.valid_from ASC, el.valid_until ASC
    `,
      isSuperadminPage ? [] : bankId ? [bankId] : resellerId ? [resellerId] : [],
    );
    const externalLicencesRes = await db.query(
      `SELECT
    el.ext_id as id,
    r.name as reseller_name,
    b.name as bank_name,
    el.nb_licences,
    el.is_monthly,
    el.to_be_renewed,
    el.valid_from,
    el.valid_until
    FROM external_licences AS el
    LEFT JOIN resellers AS r ON r.id=el.reseller_id
    LEFT JOIN banks AS b ON b.id=el.bank_id
    ${isSuperadminPage ? '' : bankId ? 'WHERE el.bank_id=$1' : resellerId ? 'WHERE el.reseller_id=$1' : ''}
    ORDER BY
    r.name ASC, b.name ASC, el.valid_from ASC, el.valid_until ASC
    `,
      isSuperadminPage ? [] : bankId ? [bankId] : resellerId ? [resellerId] : [],
    );
    res.status(200).send({
      internalLicences: internalLicencesRes.rows,
      externalLicences: externalLicencesRes.rows,
    });
  } catch (e) {
    logError('get_licences', e);
    res.status(400).end();
  }
};
