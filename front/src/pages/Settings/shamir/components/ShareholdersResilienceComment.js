import { i18n } from '../../../../i18n/i18n';

export const ShareholdersResilienceComment = (p) => {
  const { minShares, totalHolders } = p;
  const margin = totalHolders - minShares;
  return (
    <div>
      {margin < 0 && (
        <span className={`forbidden`}>
          {i18n.t('shamir_config_holders_warning_not_enough')}{' '}
          <strong>
            {i18n.t('shamir_config_holders_warning_not_enough_number', { n: -margin })}
          </strong>
        </span>
      )}
      {margin === 0 && (
        <span className={`shamir-warning danger`}>
          <strong>{i18n.t('shamir_config_holders_warning_resilience_0_short')}</strong>
          <br />
          <strong>{i18n.t('shamir_config_holders_warning_resilience_0_details_1')}</strong>
          <br />
          {i18n.t('shamir_config_holders_warning_resilience_0_details_2')}
        </span>
      )}
      {margin === 1 && (
        <span className={`shamir-warning warning`}>
          <strong>{i18n.t('shamir_config_holders_warning_resilience_1_short')}</strong>
          <br />
          {i18n.t('shamir_config_holders_warning_resilience_1_details')}
        </span>
      )}
      {margin === 2 && (
        <span className={`shamir-warning good`}>
          <strong>{i18n.t('shamir_config_holders_warning_resilience_2_short')}</strong>
          <br />
          {i18n.t('shamir_config_holders_warning_resilience_2_details')}
        </span>
      )}
      {margin >= 3 && (
        <span className={`shamir-warning verygood`}>
          <strong>{i18n.t('shamir_config_holders_warning_resilience_3_short')}</strong>
          <br />
          {i18n.t('shamir_config_holders_warning_resilience_3_details', { n: margin })}
        </span>
      )}
    </div>
  );
};
