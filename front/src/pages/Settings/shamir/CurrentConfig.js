import { useState, useCallback } from 'react';
import { ExternalLink } from '../../../helpers/ExternalLink/ExternalLink';
import { i18n } from '../../../i18n/i18n';
import { MinSharesSecurityComment } from './components/MinSharesSecurityComment';
import { ShareholdersResilienceComment } from './components/ShareholdersResilienceComment';
import { ConfigSummary } from './components/ConfigSummary';
import './CurrentConfig.css';
import { NameAndVersion } from './components/NameAndVersion';
import { RightPanel } from '../../../helpers/RightPanel/RightPanel';
import { toast } from 'react-toastify';
import { bankUrlFetch } from '../../../helpers/urlFetch';

export const CurrentConfig = (p) => {
  const { currentConfig, pendingNewConfig, onStartEdit, onDeletePendingConfig } = p;
  const minSharesSecurityComment = <MinSharesSecurityComment minShares={currentConfig.minShares} />;
  const resilienceComment = (
    <ShareholdersResilienceComment
      minShares={currentConfig.minShares}
      totalHolders={currentConfig.shareholders.length}
    />
  );
  const [showPendingConfig, setShowPendingConfig] = useState(false);
  const onCancelPendingRequest = async (handleClose) => {
    try {
      p.setIsLoading(true);
      await bankUrlFetch('/api/shamir-cancel-pending-config', 'POST', {
        configId: pendingNewConfig.id,
      });
      await handleClose();
      p.onDeletePendingConfig();
      toast.info(i18n.t('shamir_change_pending_cancel_sucess'));
    } catch (e) {
      console.error(e);
      toast.error(e.toString());
    } finally {
      p.setIsLoading(false);
    }
  };
  return (
    <div>
      <div className="currentConfigHeader">
        <div>
          <h2>{i18n.t('shamir_presentation_title')}</h2>
          <ExternalLink href="https://upsignon.eu/shamir-doc">
            {i18n.t('shamir_doc_link')}
          </ExternalLink>
        </div>
        <button
          className={`whiteButton ${pendingNewConfig ? 'disabled' : ''}`}
          onClick={onStartEdit}
        >
          {i18n.t('shamir_change')}
        </button>
      </div>
      {pendingNewConfig && (
        <div className="shamirPendingNewConfig">
          <div className="shamirPendingFirstCol">
            <div className="shamirPendingTag">{i18n.t('shamir_change_pending_title')}</div>
            <NameAndVersion
              name={pendingNewConfig.name}
              creationDate={new Date(pendingNewConfig.createdAt)}
            />
          </div>
          <div>
            <button
              className="submitButton submitButtonAlt"
              onClick={() => setShowPendingConfig(true)}
            >
              {i18n.t('shamir_change_pending_view')}
            </button>
          </div>
        </div>
      )}
      <div style={{ marginTop: 20 }}>
        <ConfigSummary
          creationDesign={false}
          isActive={currentConfig.isActive}
          isPending={currentConfig.isPending}
          name={currentConfig.name}
          creationDate={new Date(currentConfig.createdAt)}
          creatorEmail={currentConfig.creatorEmail}
          minShares={currentConfig.minShares}
          holders={currentConfig.shareholders.map((sh) => {
            return {
              id: `${sh.email}${sh.bankName}`,
              email: sh.email,
              bankName: sh.bankName,
            };
          })}
          supportEmail={currentConfig.supportEmail}
          showCreatorNotHolderWarning={false}
        />
      </div>
      {showPendingConfig && (
        <RightPanel
          onClose={() => setShowPendingConfig(false)}
          mainAction={(handleClose) => (
            <button className="dangerButton" onClick={() => onCancelPendingRequest(handleClose)}>
              {i18n.t('shamir_change_pending_cancel')}
            </button>
          )}
        >
          <div style={{ padding: 40 }}>
            <ConfigSummary
              creationDesign={false}
              isActive={false}
              isPending={true}
              name={pendingNewConfig.name}
              creationDate={new Date(pendingNewConfig.createdAt)}
              creatorEmail={pendingNewConfig.creatorEmail}
              minShares={pendingNewConfig.minShares}
              holders={pendingNewConfig.shareholders.map((sh) => {
                return {
                  id: `${sh.email}${sh.bankName}`,
                  email: sh.email,
                  bankName: sh.bankName,
                };
              })}
              supportEmail={pendingNewConfig.supportEmail}
              showCreatorNotHolderWarning={false}
            />
          </div>
        </RightPanel>
      )}
    </div>
  );
};
