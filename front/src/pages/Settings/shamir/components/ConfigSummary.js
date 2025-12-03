import { EditIcon } from '../../../../helpers/icons/EditIcon';
import { i18n } from '../../../../i18n/i18n';
import { MinSharesSecurityComment } from './MinSharesSecurityComment';
import { ShareholdersResilienceComment } from './ShareholdersResilienceComment';

export const ConfigSummary = (p) => {
  const {
    name,
    creationDate,
    creatorEmail,
    minShares,
    holders,
    supportEmail,
    showCreatorNotHolderWarning,
  } = p;
  const minSharesWarning = <MinSharesSecurityComment minShares={minShares} />;
  const resilience = (
    <ShareholdersResilienceComment minShares={minShares} totalHolders={holders.length} />
  );
  return (
    <div className="shamirSummary">
      <div style={{ marginBottom: 20 }}>
        <strong>{name}</strong>
      </div>
      <div style={{ marginBottom: 20 }}>
        <strong>{i18n.t('shamir_config_creation')}</strong>
        {i18n.t('shamir_config_creation_content', {
          date: creationDate.toLocaleDateString(),
          creator: creatorEmail,
        })}
      </div>
      <div style={{ marginBottom: 20 }}>
        <strong>{i18n.t('shamir_config_summary_details_consensus_label')}</strong>{' '}
        {i18n.t('shamir_config_summary_details_consensus_content', {
          min: minShares,
          total: holders.length,
        })}
      </div>
      <div style={{ marginBottom: 20 }}>
        <strong>{i18n.t('shamir_config_summary_details_risk_label')}</strong>
        <div style={{ marginLeft: 20 }}>{minSharesWarning}</div>
      </div>
      <div style={{ marginBottom: 20 }}>
        <strong>{i18n.t('shamir_config_summary_details_resilience_label')}</strong>
        <div style={{ marginLeft: 20 }}>{resilience}</div>
      </div>
      <div style={{ marginBottom: 20 }}>
        <strong>{i18n.t('shamir_config_summary_details_shareholders_label')}</strong>
        {showCreatorNotHolderWarning && (
          <span>{i18n.t('shamir_config_summary_details_admin_not_shareholder')}</span>
        )}
        <div style={{ marginLeft: 20 }}>
          <ul>
            {holders.map((h) => {
              return <li key={h.id}>{`${h.email} (${h.bankName})`}</li>;
            })}
          </ul>
        </div>
      </div>
      <div style={{ marginBottom: 20 }}>
        <strong>{i18n.t('shamir_config_summary_details_support_email_label')}</strong>{' '}
        {supportEmail}
      </div>
    </div>
  );
};
