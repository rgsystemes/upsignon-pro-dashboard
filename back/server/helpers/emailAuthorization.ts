import { db } from './db';
import { MicrosoftGraph } from './microsoftEntraIdGraph';

type TEmailAuthorizationStatus = 'UNAUTHORIZED' | 'PATTERN_AUTHORIZED' | 'MS_ENTRA_AUTHORIZED';

const isEmailAuthorizedWithPattern = (emailPattern: string, emailToCheck: string) => {
  if (emailPattern.indexOf('*@') === 0) {
    return emailToCheck.split('@')[1] === emailPattern.replace('*@', '');
  } else {
    return emailToCheck === emailPattern;
  }
};

export const getEmailAuthorizationStatus = async (
  userEmail: string,
  userMSEntraId: string | null,
  groupId: number,
): Promise<TEmailAuthorizationStatus> => {
  // CHECK MICROSOFT ENTRA
  if (userMSEntraId) {
    try {
      const isEntraAuthorized = await MicrosoftGraph.isUserAuthorizedForUpSignOn(
        groupId,
        userMSEntraId,
      );
      if (isEntraAuthorized) return 'MS_ENTRA_AUTHORIZED';
    } catch (e) {
      console.error(e);
    }
  }

  // CHECK EMAIL PATTERNS
  const patternRes = await db.query('SELECT pattern FROM allowed_emails WHERE group_id=$1', [
    groupId,
  ]);
  const isAuthorizedByPattern = patternRes.rows
    .map((p) => p.pattern)
    .some((emailPattern) => isEmailAuthorizedWithPattern(emailPattern, userEmail));

  if (isAuthorizedByPattern) return 'PATTERN_AUTHORIZED';

  return 'UNAUTHORIZED';
};
