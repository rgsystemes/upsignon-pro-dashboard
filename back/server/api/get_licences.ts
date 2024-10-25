import { db } from '../helpers/db';
import { logError, logInfo } from '../helpers/logger';

export const get_licences = async (
  req: any,
  res: any,
  isSuperadminPage: boolean,
): Promise<void> => {
  try {
    const dbRes = await db.query("SELECT value FROM settings WHERE key='LICENCES'", []);
    const groupsRes = await db.query('SELECT id, name FROM groups');
    const licencesRes: any[] = dbRes.rows[0]?.value.map((l: any) => {
      return {
        ...l,
        bankName: groupsRes.rows.find((g) => g.id === l.masterBank)?.name,
      };
    });
    if (isSuperadminPage) {
      res.status(200).send(licencesRes);
    } else {
      const groupLicences = licencesRes?.filter((r) => r.masterBank == req.proxyParamsGroupId);
      res.status(200).send(groupLicences);
    }
  } catch (e) {
    logError('get_licences', e);
    res.status(400).end();
  }
};
