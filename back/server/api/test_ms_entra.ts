import { inputSanitizer } from '../helpers/sanitizer';
import { logError } from '../helpers/logger';
import { EntraGroup, MicrosoftGraph } from '../helpers/microsoftEntraIdGraph';

export const test_ms_entra = async (req: any, res: any): Promise<void> => {
  try {
    const userEmail = req.body.email;
    if (!userEmail) return res.status(400).end();

    // prevent HTML injections
    const safeEmailAddress = inputSanitizer.cleanForHTMLInjections(userEmail);

    let isAuthorized = false;
    let isAuthorizedError = null;
    let allUpSignOnUsers = null;
    let allUpSignOnUsersError: string | null = null;
    let msUserId: string | null = null;
    let msUserIdError: string | null = null;
    try {
      msUserId = await MicrosoftGraph.getUserId(req.proxyParamsGroupId, safeEmailAddress);
    } catch (e) {
      logError('graph.getUserId', e);
      msUserIdError = '' + e;
    }
    try {
      isAuthorized = await MicrosoftGraph.isUserAuthorizedForUpSignOn(
        req.proxyParamsGroupId,
        safeEmailAddress,
      );
    } catch (e) {
      logError('graph.isUserAuthorizedForUpSignOn', e);
      isAuthorizedError = '' + e;
    }
    try {
      allUpSignOnUsers = await MicrosoftGraph.getAllUsersAssignedToUpSignOn(req.proxyParamsGroupId);
    } catch (e) {
      logError('graph.getAllUsersAssignedToUpSignOn', e);
      allUpSignOnUsersError = '' + e;
    }
    let userGroups: EntraGroup[] = [];
    let userGroupsError = null;
    try {
      userGroups = await MicrosoftGraph.getGroupsForUser(req.proxyParamsGroupId, safeEmailAddress);
    } catch (e) {
      logError('graph.getGroupsForUser', e);
      userGroupsError = '' + e;
    }
    // Return res
    return res.status(200).json({
      msUserId: { value: msUserId, error: msUserIdError },
      allUpSignOnUsers: { value: allUpSignOnUsers, error: allUpSignOnUsersError },
      isAuthorized: { value: isAuthorized, error: isAuthorizedError },
      userGroups: { value: userGroups, error: userGroupsError },
    });
  } catch (e) {
    logError('test_ms_entra', e);
    res.status(400).send();
  }
};
