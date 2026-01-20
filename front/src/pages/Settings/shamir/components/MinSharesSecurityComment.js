import { i18n } from '../../../../i18n/i18n';

export const MinSharesSecurityComment = (p) => {
  const { minShares } = p;
  return (
    <div>
      {minShares === 1 && (
        <span className={`shamir-warning danger`}>
          <strong>{i18n.t('shamir_config_min_shares_risk_1')}</strong>
          <br />
          {i18n.t('shamir_config_min_shares_risk_1_details')}
        </span>
      )}
      {minShares === 2 && (
        <span className={`shamir-warning warning`}>
          <strong>{i18n.t('shamir_config_min_shares_risk_2')}</strong>
        </span>
      )}
      {minShares === 3 && (
        <span className={`shamir-warning good`}>
          <strong>{i18n.t('shamir_config_min_shares_risk_3')}</strong>
        </span>
      )}
      {minShares === 4 && (
        <span className={`shamir-warning verygood`}>
          <strong>{i18n.t('shamir_config_min_shares_risk_4')}</strong>
        </span>
      )}
      {minShares >= 5 && (
        <span className={`shamir-warning heavy`}>
          <strong>{i18n.t('shamir_config_min_shares_risk_5')}</strong>
        </span>
      )}
    </div>
  );
};
