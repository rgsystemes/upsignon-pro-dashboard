import React from 'react';
import './Menu.css';
import { i18n } from '../i18n/i18n';
import { baseUrlFetch } from '../helpers/urlFetch';
import { frontUrl, baseFrontUrl } from '../helpers/env';
import { GroupChooser } from './GroupChooser';

// PROPS pages, groups, isSuperadmin, isSuperadminPage
function Menu(props) {
  const { pages, groups, isSuperadmin, isSuperadminPage } = props;
  const dashboardVersion = require('../../package.json').version;
  return (
    <nav>
      <GroupChooser
        groups={groups}
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
                href={frontUrl + p.href}
                className={`navItem ${p.isCurrent ? 'current' : ''}`}
              >
                {p.title}
                {p.toMigrate > 0 && (
                  <div
                    style={{ color: 'red', fontWeight: 'bold', backgroundColor: 'white' }}
                  >{`${p.toMigrate} ${i18n.t('to_migrate')}`}</div>
                )}
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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 140 140"
          preserveAspectRatio="xMidYMid meet"
        >
          <circle fill="rgb(0, 171, 169)" cx="70" cy="70" r="70" />
          <svg fill="white" strokeWidth="0" x="20" y="20">
            <path d="M50.00,1.00a17 17 0 1 0 0,34a17 17 0 1 0 0,-34v7a10 10 0 0 1 0,20a10 10 0 1 1 0,-20Z" />
            <path d="M24.63,27.23A27 27 0 0 0 75.37,27.23A3.5 3.5 20 1 1 81.95,29.63A34 34 0 0 1 18.05,29.63A3.5 3.5 -20 1 1 24.63,27.23Z" />
            <path d="M8.65,33.05A44 44 0 0 0 91.35,33.05A3.5 3.5 20 1 1 97.92,35.44A51 51 0 0 1 2.08,35.44A3.5 3.5 -20 1 1 8.65,33.05Z" />
            <circle cx="50.00" cy="89.00" r="10" />
          </svg>
        </svg>
        <div>UpSignOn</div>
        <div style={{ marginTop: 10 }}>{dashboardVersion}</div>
      </div>
    </nav>
  );
}

export { Menu };
