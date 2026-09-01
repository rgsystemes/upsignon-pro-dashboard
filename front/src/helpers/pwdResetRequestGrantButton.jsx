import { i18n } from '../i18n/i18n';
import { isRestrictedSuperadmin } from './isRestrictedSuperadmin';

// p: {status, onGrantPress}
export const PwdResetRequestGrantButton = (p) => {
  if (p.status === 'PENDING_ADMIN_CHECK') {
    return (
      <div
        className={`action ${isRestrictedSuperadmin ? 'disabledUI' : ''}`}
        onClick={p.onGrantPress}
      >
        {i18n.t('password_reset_request_grant')}
      </div>
    );
  }
  return null;
};
