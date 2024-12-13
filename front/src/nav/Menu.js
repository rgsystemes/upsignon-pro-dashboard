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
            <path d="M50.00,3.00a17 17 0 1 0 0,34a17 17 0 1 0 0,-34ZM50,7a10 10 0 0 1 0,20a10 10 0 1 1 0,-20ZM24.63,29.23A30 30 0 0 0 75.37,29.23A3.5 3.5 20 1 1 81.95,31.63A34 34 0 0 1 18.05,31.63A3.5 3.5 -20 1 1 24.63,29.23ZM8.65,35.05A47 47 0 0 0 91.35,35.05A3.5 3.5 20 1 1 97.92,37.44A51 51 0 0 1 2.08,37.44A3.5 3.5 -20 1 1 8.65,35.05ZM50.00,97.00a10,10 0 0 0 0,-20a10,10 0 0 0 0,20Z" />
          </svg>
        </svg>
        <div>UpSignOn</div>
        <div style={{ marginTop: 10 }}>{dashboardVersion}</div>
      </div>
    </nav>
  );
}

export { Menu };
