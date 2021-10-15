import React from 'react';
import { i18n } from '../../i18n/i18n';
import { AllowedEmails } from './AllowedEmails';
import { ProSetupLink } from './ProSetupLink';
import { SecuritySettings } from './SecuritySettings';
import './settings.css';
import { Urls } from './Urls';

// Props setIsLoading
class Settings extends React.Component {
  render() {
    return (
      <div className="page">
        <h1>{i18n.t('menu_settings')}</h1>
        <h2>{i18n.t('useful_links')}</h2>
        <ul>
          <li>
            <a
              className="link"
              target="_blank"
              href="https://github.com/UpSignOn/UpSignOn-pro-server"
              rel="noreferrer"
            >
              {i18n.t('install_doc_server_pro')}
            </a>
          </li>
          <li>
            <a
              className="link"
              target="_blank"
              href="https://github.com/UpSignOn/UpSignOn-pro-forest-admin"
              rel="noreferrer"
            >
              {i18n.t('install_doc_server_pro_dashboard')}
            </a>
          </li>
          <li>
            <a
              className="link"
              target="_blank"
              href="https://github.com/UpSignOn/UpSignOn-pro-server/blob/production/doc/GPO_deployment.md"
              rel="noreferrer"
            >
              {i18n.t('install_doc_browser_extension')}
            </a>
          </li>
          <li>
            <a
              className="link"
              href="https://app.upsignon.eu/windows-sideloading-gpo/UpSignOn_latest"
            >
              {i18n.t('windows_app_download_link')}
            </a>
            {` (${i18n.t('to_unzip')})`}
          </li>
        </ul>
        <ProSetupLink />
        <SecuritySettings setIsLoading={this.props.setIsLoading} />
        <AllowedEmails setIsLoading={this.props.setIsLoading} />
        <Urls setIsLoading={this.props.setIsLoading} />
      </div>
    );
  }
}

export { Settings };
