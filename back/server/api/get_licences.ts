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
    if (bankId) {
      const directLicencesRes = await db.query(
        `SELECT
          el.ext_id as id,
          el.nb_licences,
          el.is_monthly,
          el.to_be_renewed,
          el.valid_from,
          el.valid_until
        FROM external_licences AS el
        INNER JOIN banks AS b ON b.id=el.bank_id
        WHERE el.bank_id=$1
        ORDER BY b.name ASC, el.valid_from ASC, el.valid_until ASC
          `,
        [bankId],
      );
      const indirectLicencesRes = await db.query(
        `SELECT
        il.id,
        il.nb_licences,
        el.is_monthly,
        el.to_be_renewed,
        el.valid_from,
        el.valid_until
        FROM internal_licences AS il
        INNER JOIN external_licences AS el ON el.ext_id=il.external_licences_id
        INNER JOIN banks AS b ON b.id=il.bank_id
        WHERE il.bank_id=$1
        ORDER BY b.name ASC, el.valid_from ASC, el.valid_until ASC
        `,
        [bankId],
      );
      res.status(200).send({
        internalLicences: [],
        externalLicences: [...directLicencesRes.rows, ...indirectLicencesRes.rows],
        banks: [],
      });
    } else {
      const internalLicencesRes = await db.query(
        `SELECT il.id, il.external_licences_id, il.nb_licences, il.bank_id, b.name as bank_name
          FROM internal_licences AS il
          INNER JOIN external_licences AS el ON il.external_licences_id=el.ext_id
          INNER JOIN banks AS b ON b.id=il.bank_id
          ${isSuperadminPage ? '' : resellerId ? 'WHERE el.reseller_id=$1' : ''}
          ORDER BY b.name ASC, el.valid_from ASC, el.valid_until ASC
        `,
        isSuperadminPage ? [] : resellerId ? [resellerId] : [],
      );
      const externalLicencesRes = await db.query(
        `SELECT
          el.ext_id as id,
          el.reseller_id,
          r.name as reseller_name,
          el.bank_id,
          b.name as bank_name,
          el.nb_licences,
          el.is_monthly,
          el.to_be_renewed,
          el.valid_from,
          el.valid_until
          FROM external_licences AS el
          LEFT JOIN resellers AS r ON r.id=el.reseller_id
          LEFT JOIN banks AS b ON b.id=el.bank_id
          ${isSuperadminPage ? '' : resellerId ? 'WHERE el.reseller_id=$1' : ''}
          ORDER BY
          r.name ASC, b.name ASC, el.valid_from ASC, el.valid_until ASC
        `,
        isSuperadminPage ? [] : resellerId ? [resellerId] : [],
      );
      let banks = [];
      if (isSuperadminPage) {
        const banksRes = await db.query(`SELECT id, name FROM banks WHERE reseller_id IS NULL`);
        banks = banksRes.rows;
      } else if (resellerId) {
        const banksRes = await db.query(`SELECT id, name FROM banks WHERE reseller_id=$1`, [
          resellerId,
        ]);
        banks = banksRes.rows;
      }
      res.status(200).send({
        internalLicences: internalLicencesRes.rows,
        externalLicences: externalLicencesRes.rows,
        banks: banks,
      });
    }
  } catch (e) {
    logError('get_licences', e);
    res.status(400).end();
  }
};
