import React from 'react';
import { i18n } from '../../i18n/i18n';
import { Admins } from './Admins';
import './superadmin.css';
import { Groups } from './Groups';
import { ProServerUrl } from './ProServerUrl';
import { groupUrlFetch } from '../../helpers/urlFetch';
import { EmailConfig } from './EmailConfig';

// Props setIsLoading, updateMenuGroups
class Superadmin extends React.Component {
  state = {
    groups: [],
  };
  fetchGroups = async () => {
    try {
      const groups = await groupUrlFetch('/api/groups', 'GET', null);
      this.setState({ groups });
      this.props.updateMenuGroups(groups);
    } catch (e) {
      console.error(e);
    }
  };
  componentDidMount() {
    this.fetchGroups();
  }
  render() {
    return (
      <div className="page">
        <h1>{i18n.t('menu_superadmin')}</h1>
        <ProServerUrl />
        <Groups
          setIsLoading={this.props.setIsLoading}
          groups={this.state.groups}
          fetchGroups={this.fetchGroups}
        />
        <Admins setIsLoading={this.props.setIsLoading} groups={this.state.groups} />
        <EmailConfig setIsLoading={this.props.setIsLoading} />
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
              target="_blank"
              rel="noreferrer"
            >
              {i18n.t('windows_app_download_link')}
            </a>
            {` (${i18n.t('to_unzip')})`}
          </li>
        </ul>
      </div>
    );
  }
}

export { Superadmin };
