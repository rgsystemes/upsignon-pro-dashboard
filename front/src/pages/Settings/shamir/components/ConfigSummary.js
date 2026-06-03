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
    signers,
    previousConfig,
  } = p;
  const minSharesWarning = <MinSharesSecurityComment minShares={minShares} />;
  const resilience = (
    <ShareholdersResilienceComment minShares={minShares} totalHolders={holders.length} />
  );

  const approvingShareholders = (signers || []).filter((ap) => ap.approved);
  const refusingShareholders = (signers || []).filter((ap) => !ap.approved);

  return (
    <div className={`shamirSummary ${creationDesign ? '' : 'shamirSummaryAlt'}`}>
      <div style={{ marginBottom: 20 }}>
        <strong className="shamirConfigName">{name}</strong>
      </div>
      {!creationDesign && (
        <div style={{ marginBottom: 20 }}>
          <label className={'bodyMedium'}>{i18n.t('shamir_config_summary_state')}</label>
          <br />
          <ShamirState isActive={isActive} isPending={isPending} />
        </div>
      )}
      {!creationDesign && (
        <div style={{ marginBottom: 20 }}>
          <label className={'bodyMedium'}>{i18n.t('shamir_config_creation')}</label>
          <br />
          {creationDate.toLocaleDateString()}
        </div>
      )}
      {!creationDesign && (
        <div style={{ marginBottom: 20 }}>
          <label className={'bodyMedium'}>{i18n.t('shamir_config_creator')}</label>
          <br />
          {creatorEmail}
        </div>
      )}
      <div style={{ marginBottom: 20 }}>
        <label className={'bodyMedium'}>
          {i18n.t('shamir_config_summary_details_consensus_label')}
        </label>
        <br />
        {isPending &&
          previousConfig &&
          (previousConfig.minShares !== minShares ||
            previousConfig.shareholders.length !== holders.length) && (
            <div className="oldValue">
              {i18n.t('shamir_config_summary_details_consensus_content', {
                min: previousConfig.minShares,
                total: previousConfig.shareholders.length,
              })}
            </div>
          )}
        {i18n.t('shamir_config_summary_details_consensus_content', {
          min: minShares,
          total: holders.length,
        })}
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
          {previousConfig?.shareholders
            .filter((s) => !holders.find((h) => h.vaultId === s.vaultId))
            .map((s) => (
              <div className="oldValue" key={s.vaultId}>{`${s.email} - ${s.bankName}`}</div>
            ))}
          {holders.map((h) => {
            return <div key={h.vaultId}>{`${h.email} - ${h.bankName}`}</div>;
          })}
        </div>
        <div>{resilience}</div>
      </div>
      <div style={{ marginBottom: 20 }}>
        <label className={'bodyMedium'}>
          {i18n.t('shamir_config_summary_details_support_email_label')}
        </label>
        <br />
        {previousConfig?.supportEmail !== supportEmail && (
          <div className="oldValue">{previousConfig?.supportEmail}</div>
        )}
        {supportEmail || (
          <span style={{ color: '#E53E3E' }}>
            {i18n.t('shamir_config_summary_details_support_email_empty')}
          </span>
        )}
      </div>
      {!creationDesign && (
        <>
          <div style={{ marginBottom: 20 }}>
            <label className={'bodyMedium'}>{i18n.t('shamir_config_approved_by')}</label>
            <br />
            <div>
              {approvingShareholders.map((ap) => {
                return <div key={ap.vaultId}>{`${ap.email || '--'} - ${ap.bankName || '--'}`}</div>;
              })}
              {approvingShareholders.length === 0 && '--'}
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label className={'bodyMedium'}>{i18n.t('shamir_config_refused_by')}</label>
            <br />
            <div>
              {refusingShareholders.map((ap) => {
                return <div key={ap.vaultId}>{`${ap.email || '--'} - ${ap.bankName || '--'}`}</div>;
              })}
              {refusingShareholders.length === 0 && '--'}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
