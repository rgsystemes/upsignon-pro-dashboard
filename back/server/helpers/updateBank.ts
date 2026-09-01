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
      IS_TESTING?: boolean;
    } | null;
  },
): Promise<void> => {
  if (update.name) {
    await db.query(`UPDATE banks SET name=$1 WHERE id=$2`, [update.name, update.bankId]);
  }

  let safeSettings: { SALES_REP: string | null; IS_TESTING?: boolean } | null = null;
  if (update.settings) {
    safeSettings = { ...update.settings };
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
  }

  const isMovingToGroup = update.resellerId != null;
  const isChangingIsTesting = safeSettings != null && 'IS_TESTING' in safeSettings;
  if (isMovingToGroup || isChangingIsTesting) {
    // A test bank must never belong to a bank group (reseller): resolve the resulting
    // reseller_id / IS_TESTING pair (falling back to the bank's current values for
    // whichever one isn't part of this update) and reject if both would end up set.
    const currentBankRes = await db.query('SELECT settings, reseller_id FROM banks WHERE id=$1', [
      update.bankId,
    ]);
    const currentBank = currentBankRes.rows[0];
    const newResellerId = isMovingToGroup ? update.resellerId || null : currentBank.reseller_id;
    const newIsTesting = isChangingIsTesting
      ? safeSettings!.IS_TESTING
      : currentBank.settings?.IS_TESTING;
    if (newIsTesting && newResellerId) {
      throw new Error('A test bank cannot belong to a bank group');
    }
  }

  if (safeSettings) {
    await db.query(`UPDATE banks SET settings=$1 WHERE id=$2`, [safeSettings, update.bankId]);
  }

  if (update.resellerId != null) {
    await db.query(`UPDATE banks SET reseller_id=$1 WHERE id=$2`, [
      update.resellerId || null, // force null instead of empty string
      update.bankId,
    ]);
  }
};
