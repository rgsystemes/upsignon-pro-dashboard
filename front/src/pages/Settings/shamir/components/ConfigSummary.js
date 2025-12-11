import { i18n } from '../../../../i18n/i18n';
import { MinSharesSecurityComment } from './MinSharesSecurityComment';
import { ShamirState } from './ShamirState';
import { ShareholdersResilienceComment } from './ShareholdersResilienceComment';

export const ConfigSummary = (p) => {
  const {
    creationDesign,
    isActive,
    isPending,
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
  const approvers = [];

  return (
    <div className={`shamirSummary ${creationDesign ? '' : 'shamirSummaryAlt'}`}>
      <div style={{ marginBottom: 20 }}>
        <strong className="shamirConfigName">{name}</strong>
      </div>
      <div style={{ marginBottom: 20 }}>
        <label className={'bodyMedium'}>{i18n.t('shamir_config_summary_state')}</label>
        <br />
        {!creationDesign && <ShamirState isActive={isActive} isPending={isPending} />}
      </div>
      <div style={{ marginBottom: 20 }}>
        <label className={'bodyMedium'}>{i18n.t('shamir_config_creation')}</label>
        <br />
        {creationDate.toLocaleDateString()}
      </div>
      <div style={{ marginBottom: 20 }}>
        <label className={'bodyMedium'}>{i18n.t('shamir_config_creator')}</label>
        <br />
        {creatorEmail}
      </div>
      <div style={{ marginBottom: 20 }}>
        <label className={'bodyMedium'}>
          {i18n.t('shamir_config_summary_details_consensus_label')}
        </label>
        <br />
        {i18n.t('shamir_config_summary_details_consensus_content', {
          min: minShares,
          total: holders.length,
        })}
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
        <br />
        {supportEmail}
      </div>
      {!creationDesign && (
        <div style={{ marginBottom: 20 }}>
          <label className={'bodyMedium'}>{i18n.t('shamir_config_approved_by')}</label>
          <br />
          <div>
            {approvers.map((ap) => {
              return <div key={ap.id}>{`${ap.email} - ${ap.bankName}`}</div>;
            })}
            {approvers.length === 0 && 'Ø'}
          </div>
        </div>
      )}
    </div>
  );
};
