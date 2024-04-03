import { cleanForHTMLInjections } from '../helpers/cleanHTMLInjections';
import { db } from '../helpers/db';
import { logError } from '../helpers/logger';
import { MicrosoftGraph } from '../helpers/microsoftEntraIdGraph';

export const test_ms_entra = async (req: any, res: any): Promise<void> => {
  try {
    const userEmail = req.body.email;
    if (!userEmail) return res.status(400).end();

    // prevent HTML injections
    const safeEmailAddress = cleanForHTMLInjections(userEmail);

    const entraConfigRes = await db.query('SELECT ms_entra_config FROM groups WHERE id=$1', [
      req.proxyParamsGroupId,
    ]);
    if (entraConfigRes.rowCount == null || entraConfigRes.rowCount == 0) {
      return res.status(400).end();
    }
    const entraConfig = entraConfigRes.rows[0].ms_entra_config;
    const graph = MicrosoftGraph.initInstance(req.proxyParamsGroupId, entraConfig);
    let isAuthorized = false;
    let isAuthorizedError = null;
    try {
      isAuthorized = await graph.isUserAuthorizedForUpSignOn(safeEmailAddress);
    } catch (e) {
      logError('graph.isUserAuthorizedForUpSignOn', e);
      isAuthorizedError = '' + e;
    }
    let userGroups: any = [];
    let userGroupsError = null;
    try {
      userGroups = await graph.getGroupsForUser(safeEmailAddress);
    } catch (e) {
      logError('graph.getGroupsForUser', e);
      userGroupsError = '' + e;
    }
    // Return res
    return res.status(200).json({
      isAuthorized: { value: isAuthorized, error: isAuthorizedError },
      userGroups: { value: userGroups, error: userGroupsError },
    });
  } catch (e) {
    logError('test_ms_entra', e);
    res.status(400).send();
  }
};
