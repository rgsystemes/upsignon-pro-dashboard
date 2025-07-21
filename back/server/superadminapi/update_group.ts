import Joi from 'joi';
import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const update_group = async (req: any, res: any): Promise<void> => {
  try {
    if (req.body.name && typeof req.body.name === 'string') {
      await db.query(`UPDATE groups SET name=$1 WHERE id=$2`, [req.body.name, req.body.id]);
    }
    if (req.body.settings) {
      const safeSettings = { ...req.body.settings };
      if (req.body.settings.SALES_REP) {
        const safeSalesRep = Joi.attempt(
          req.body.settings.SALES_REP,
          Joi.string().lowercase().email(),
        );
        safeSettings.SALES_REP = safeSalesRep;
      }

      // PREVENT SOME ACTIONS FOR READ ONLY SUPERADMINS
      if (req.session.isReadOnlySuperadmin) {
        const prevSettingsRes = await db.query('SELECT settings FROM groups WHERE id=$1', [
          req.body.id,
        ]);
        const prevSettings = prevSettingsRes.rows[0].settings;
        if (
          prevSettings.IS_TESTING != safeSettings.IS_TESTING ||
          prevSettings.TESTING_EXPIRATION_DATE != safeSettings.TESTING_EXPIRATION_DATE
        ) {
          res.status(401).json({ error: 'Not allowed for read only superadmin' });
          return;
        }
      }

      await db.query(`UPDATE groups SET settings=$1 WHERE id=$2`, [safeSettings, req.body.id]);
    }
    if (typeof req.body.nb_licences_sold === 'number') {
      await db.query(`UPDATE groups SET nb_licences_sold=$1 WHERE id=$2`, [
        req.body.nb_licences_sold,
        req.body.id,
      ]);
    }
    res.status(200).end();
  } catch (e) {
    logError('update_group', e);
    res.status(400).end();
  }
};
