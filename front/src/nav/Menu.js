import React from 'react';
import './Menu.css';
import { i18n } from '../i18n/i18n';
import { baseUrlFetch } from '../helpers/urlFetch';
import { bankFrontUrl, baseFrontUrl } from '../helpers/env';
import { BankChooser } from './BankChooser';
import bySepteoLogo from './bySepteoLogo.svg';

// PROPS pages, banks, isSuperadmin, isSuperadminPage
function Menu(props) {
  const { pages, banks, resellers, isSuperadmin, isSuperadminPage } = props;
  const dashboardVersion = require('../../package.json').version;
  return (
    <nav>
      <BankChooser
        banks={banks}
        resellers={resellers}
        isSuperadminPage={isSuperadminPage}
        isSuperadmin={isSuperadmin}
      />
      <React.Fragment>
        {pages
          .filter((p) => !isSuperadminPage || !p.disabledForSuperadmin)
          .map((p) => {
            return (
              <a
                key={p.key}
                href={bankFrontUrl + p.href}
                className={`navItem ${p.isCurrent ? 'current' : ''}`}
              >
                {p.title}
              </a>
            );
          })}
      </React.Fragment>
      <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center' }}>
        <div
          className="action"
          onClick={async () => {
            try {
              await baseUrlFetch('/disconnect', 'POST', null);
            } catch (e) {
            } finally {
              window.location.href = baseFrontUrl + '/login.html';
            }
          }}
        >
          {i18n.t('disconnect')}
        </div>
      </div>
      <div className="logo">
        <img src={bySepteoLogo} alt="UpSignOn logo" />
        <div style={{ marginTop: 10 }}>{dashboardVersion}</div>
      </div>
    </nav>
  );
}

export { Menu };
