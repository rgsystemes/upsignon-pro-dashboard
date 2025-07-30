import React from 'react';
import { i18n } from '../../i18n/i18n';
import { Admins } from './Admins';
import '../../helpers/tabs.css';
import './superadmin.css';
import { Groups } from './Groups';
import { ProServerUrl } from './ProServerUrl';
import { groupUrlFetch } from '../../helpers/urlFetch';
import { EmailConfig } from './EmailConfig';
import { isReadOnlySuperadmin } from '../../helpers/isReadOnlySuperadmin';

// Props setIsLoading, updateMenuGroups
class Superadmin extends React.Component {
  state = {
    groups: [],
    adminsBuildCounter: 0,
    activeTab: 'banks', // 'banks', 'admins', 'settings'
  };
  fetchGroups = async () => {
    try {
      const groups = await groupUrlFetch('/api/groups', 'GET', null);
      this.setState((prev) => ({ groups, adminsBuildCounter: prev.adminsBuildCounter + 1 }));
      this.props.updateMenuGroups(groups);
    } catch (e) {
      console.error(e);
    }
  };
  componentDidMount() {
    this.fetchGroups();
  }
  setActiveTab = (tabName) => {
    this.setState({ activeTab: tabName });
  };
  render() {
    const { activeTab } = this.state;

    return (
      <div className="page">
        <h1>{i18n.t('menu_settings')}</h1>
        <div className="tabs-navigation">
          <button
            className={`tab-button large ${activeTab === 'banks' ? 'active' : ''}`}
            onClick={() => this.setActiveTab('banks')}
          >
            {i18n.t('sasettings_banks')}
          </button>
          <button
            className={`tab-button large ${activeTab === 'admins' ? 'active' : ''}`}
            onClick={() => this.setActiveTab('admins')}
          >
            {i18n.t('sasettings_superadmins')}
          </button>
          <button
            className={`tab-button large ${activeTab === 'settings' ? 'active' : ''} ${isReadOnlySuperadmin ? 'disabledUI' : ''}`}
            onClick={() => this.setActiveTab('settings')}
          >
            {i18n.t('menu_settings')}
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'banks' && (
            <Groups
              setIsLoading={this.props.setIsLoading}
              groups={this.state.groups}
              fetchGroups={this.fetchGroups}
            />
          )}

          {activeTab === 'admins' && (
            <Admins
              key={this.state.adminsBuildCounter}
              setIsLoading={this.props.setIsLoading}
              groups={this.state.groups}
            />
          )}

          {activeTab === 'settings' && (
            <div>
              <ProServerUrl />
              <EmailConfig setIsLoading={this.props.setIsLoading} />
            </div>
          )}
        </div>
      </div>
    );
  }
}

export { Superadmin };
