import { i18n } from '../../../../i18n/i18n';
import { MinSharesSecurityComment } from './MinSharesSecurityComment';
import { ShareholdersResilienceComment } from './ShareholdersResilienceComment';

export const ConfigChangeSummary = (p) => {
  const { name, minShares, holders, supportEmail, showCreatorNotHolderWarning, previousConfig } = p;
  const minSharesWarning = <MinSharesSecurityComment minShares={minShares} />;
  const resilience = (
    <ShareholdersResilienceComment minShares={minShares} totalHolders={holders.length} />
  );

  return (
    <div className={`shamirSummary`}>
      <div style={{ marginBottom: 20 }}>
        <strong className="shamirConfigName">{name}</strong>
      </div>
      <div style={{ marginBottom: 20 }}>
        <label className={'bodyMedium'}>
          {i18n.t('shamir_config_summary_details_consensus_label')}
        </label>
        {(previousConfig.minShares != minShares ||
          previousConfig.shareholders.length != holders.length) && (
          <div className="oldValue">
            {i18n.t('shamir_config_summary_details_consensus_content', {
              min: previousConfig.minShares,
              total: previousConfig.shareholders.length,
            })}
          </div>
        )}
        <div>
          {i18n.t('shamir_config_summary_details_consensus_content', {
            min: minShares,
            total: holders.length,
          })}
        </div>
      </div>
      <div style={{ marginBottom: 20 }}>
        <label className={'bodyMedium'}>{i18n.t('shamir_config_summary_details_risk_label')}</label>
        <br />
        <div>{minSharesWarning}</div>
      </div>
      <div style={{ marginBottom: 20 }}>
        <label className={'bodyMedium'}>
          {i18n.t('shamir_config_summary_details_shareholders_label')}
        </label>
        <br />
        {showCreatorNotHolderWarning && (
          <span>{i18n.t('shamir_config_summary_details_admin_not_shareholder')}</span>
        )}
        <div>
          {previousConfig.shareholders
            .filter((s) => !holders.find((h) => h.email === s.email && h.bankName === s.bankName))
            .map((s) => (
              <div
                className="oldValue"
                key={s.email + s.bankName}
              >{`${s.email} - ${s.bankName}`}</div>
            ))}
          {holders.map((h) => {
            return <div key={h.id}>{`${h.email} - ${h.bankName}`}</div>;
          })}
        </div>
      </div>
      <div style={{ marginBottom: 20 }}>
        <label className={'bodyMedium'}>
          {i18n.t('shamir_config_summary_details_resilience_label')}
        </label>
        <br />
        <div>{resilience}</div>
      </div>
      <div style={{ marginBottom: 20 }}>
        <label className={'bodyMedium'}>
          {i18n.t('shamir_config_summary_details_support_email_label')}
        </label>
        {previousConfig.supportEmail != supportEmail && (
          <div className="oldValue">{previousConfig.supportEmail}</div>
        )}
        <div>
          {supportEmail || (
            <span style={{ color: '#E53E3E' }}>
              {i18n.t('shamir_config_summary_details_support_email_empty')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
