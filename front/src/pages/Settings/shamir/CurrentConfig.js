import { useState, useCallback } from 'react';
import { ExternalLink } from '../../../helpers/ExternalLink/ExternalLink';
import { i18n } from '../../../i18n/i18n';
import { MinSharesSecurityComment } from './components/MinSharesSecurityComment';
import { ShareholdersResilienceComment } from './components/ShareholdersResilienceComment';
import { ConfigSummary } from './components/ConfigSummary';

export const CurrentConfig = (p) => {
  const { currentConfig, pendingNewConfig } = p;
  const minSharesSecurityComment = <MinSharesSecurityComment minShares={currentConfig.minShares} />;
  const resilienceComment = (
    <ShareholdersResilienceComment
      minShares={currentConfig.minShares}
      totalHolders={currentConfig.shareholders.length}
    />
  );
  return (
    <div>
      <h2>{i18n.t('shamir_presentation_title')}</h2>
      <ExternalLink href="https://upsignon.eu/shamir-doc">{i18n.t('shamir_doc_link')}</ExternalLink>
      <div style={{ marginTop: 20 }}>
        <ConfigSummary
          alternateDesign
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
    </div>
  );
};
