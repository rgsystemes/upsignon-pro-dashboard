import { db } from './db';
import Joi from 'joi';
import { SessionData } from './updateSessionAuthorizations';

export const updateBank = async (
  session: SessionData,
  update: {
    bankId: number;
    name: string | null;
    resellerId: string | null;
    settings: {
      SALES_REP: string | null;
    } | null;
  },
): Promise<void> => {
  if (update.name) {
    await db.query(`UPDATE banks SET name=$1 WHERE id=$2`, [update.name, update.bankId]);
  }
  if (update.settings) {
    let safeSettings = { ...update.settings };
    if (update.settings.SALES_REP) {
      const safeSalesRep = Joi.attempt(update.settings.SALES_REP, Joi.string().lowercase().email());
      safeSettings.SALES_REP = safeSalesRep;
    }

    // PREVENT SOME ACTIONS FOR RESTRICTED SUPERADMINS
    if (session.adminRole !== 'superadmin') {
      const prevSettingsRes = await db.query('SELECT settings FROM banks WHERE id=$1', [
        update.bankId,
      ]);
      const prevSettings = prevSettingsRes.rows[0].settings;
      const newSettings = { ...prevSettings };
      // whitelist settings that restricted superadmins can edit
      newSettings.SALES_REP = safeSettings.SALES_REP;
      safeSettings = newSettings;
    }

    await db.query(`UPDATE banks SET settings=$1 WHERE id=$2`, [safeSettings, update.bankId]);
  }

  if (update.resellerId != null) {
    await db.query(`UPDATE banks SET reseller_id=$1 WHERE id=$2`, [
      update.resellerId || null, // force null instead of empty string
      update.bankId,
    ]);
  }
};
