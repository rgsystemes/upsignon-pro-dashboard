import React from 'react';
import { i18n } from '../../i18n/i18n';
import { SecurityChart } from './SecurityChart';
import { UsageChart } from './UsageChart';
import './highlighter.css';

// Props = setIsLoading, isSuperadminPage
class Overview extends React.Component {
  render() {
    return (
      <div className="page">
        <h1>{i18n.t('menu_overview')}</h1>
        <h2>{i18n.t('useful_links')}</h2>
        <p>
          {i18n.t('suggestion')}{' '}
          <a href="mailto:BS-SEPTEOITSOLUTIONS-Support@septeo.com">
            BS-SEPTEOITSOLUTIONS-Support@septeo.com
          </a>
        </p>
        <ul className="highlighter">
          <li>
            <a
              className="link bold"
              target="_blank"
              href="https://upsignon.notion.site/Notice-d-utilisation-d-UpSignOn-de4f8ba200e14ec1adcaba2613b38340"
              rel="noreferrer"
            >
              {i18n.t('link_to_tutorials')}
            </a>
          </li>
          <li>
            <a
              className="link"
              target="_blank"
              href="https://upsignon.eu/fr/resources/release-notes/app"
              rel="noreferrer"
            >
              {i18n.t('link_to_changelogs')}
            </a>
          </li>
          <li>
            <a
              className="link"
              target="_blank"
              href="https://upsignon.eu/fr/downloads"
              rel="noreferrer"
            >
              {i18n.t('link_to_downloads')}
            </a>
          </li>
          <li>
            <a
              className="link"
              target="_blank"
              href="https://github.com/rgsystemes/upsignon-pro-server/blob/production/doc/GPO_deployment.md"
              rel="noreferrer"
            >
              {i18n.t('install_doc_browser_extension')}
            </a>
          </li>
          {this.props.isSuperadminPage && (
            <li>
              <a
                className="link"
                target="_blank"
                href="https://github.com/rgsystemes/upsignon-pro-server"
                rel="noreferrer"
              >
                {i18n.t('install_doc_server_pro')}
              </a>
            </li>
          )}
        </ul>

        <SecurityChart />
        <UsageChart />
      </div>
    );
  }
}

export { Overview };
