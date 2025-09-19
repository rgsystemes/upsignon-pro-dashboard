import { inputSanitizer } from '../helpers/sanitizer';
import { logError } from '../helpers/logger';
import { EntraGroup, MicrosoftGraph } from 'upsignon-ms-entra';

export const test_ms_entra = async (req: any, res: any): Promise<void> => {
  try {
    if (req.session.adminRole === 'restricted_superadmin') {
      res.status(401).end();
      return;
    }
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
      msUserId = await MicrosoftGraph.getUserId(req.proxyParamsBankId, safeEmailAddress);
    } catch (e) {
      logError('graph.getUserId', e);
      msUserIdError = '' + e;
    }
    if (!msUserId) {
      isAuthorized: false;
      isAuthorizedError: 'MS user id not found';
    } else {
      try {
        isAuthorized = await MicrosoftGraph.isUserAuthorizedForUpSignOn(
          req.proxyParamsBankId,
          msUserId,
        );
      } catch (e) {
        logError('graph.isUserAuthorizedForUpSignOn', e);
        isAuthorizedError = '' + e;
      }
    }
    try {
      allUpSignOnUsers = await MicrosoftGraph.getAllUsersAssignedToUpSignOn(
        req.proxyParamsBankId,
        false,
      );
    } catch (e) {
      logError('graph.getAllUsersAssignedToUpSignOn', e);
      allUpSignOnUsersError = '' + e;
    }
    let userGroups: EntraGroup[] = [];
    let userGroupsError = null;
    if (!msUserId) {
      userGroupsError = 'MS user id not found';
    } else {
      try {
        userGroups = await MicrosoftGraph.getGroupsForUser(req.proxyParamsBankId, msUserId);
      } catch (e) {
        logError('graph.getGroupsForUser', e);
        userGroupsError = '' + e;
      }
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
