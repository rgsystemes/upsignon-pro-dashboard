import React from 'react';
import { i18n } from '../../i18n/i18n';
import { Admins } from './Admins';
import '../../helpers/tabs.css';
import './superadmin.css';
import { Banks } from './Banks';
import { Resellers } from './Resellers';
import { ProServerUrl } from './ProServerUrl';
import { bankUrlFetch } from '../../helpers/urlFetch';
import { EmailConfig } from './EmailConfig';
import { isRestrictedSuperadmin } from '../../helpers/isRestrictedSuperadmin';
import { isSaasServer } from '../../helpers/env';

// Props setIsLoading, updateMenuBanks, updateMenuResellers
class Superadmin extends React.Component {
  state = {
    banks: [],
    adminsBuildCounter: 0,
    activeTab: 'banks', // 'banks', 'resellers', 'admins', 'settings'
  };
  fetchBanks = async () => {
    try {
      const banks = await bankUrlFetch('/api/banks', 'GET', null);
      this.setState((prev) => ({ banks, adminsBuildCounter: prev.adminsBuildCounter + 1 }));
      this.props.updateMenuBanks(banks);
    } catch (e) {
      console.error(e);
    }
  };
  componentDidMount() {
    this.fetchBanks();
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
          {isSaasServer && (
            <button
              className={`tab-button large ${activeTab === 'resellers' ? 'active' : ''}`}
              onClick={() => this.setActiveTab('resellers')}
            >
              {i18n.t('sasettings_resellers')}
            </button>
          )}
          <button
            className={`tab-button large ${activeTab === 'admins' ? 'active' : ''}`}
            onClick={() => this.setActiveTab('admins')}
          >
            {i18n.t('sasettings_superadmins')}
          </button>
          <button
            className={`tab-button large ${activeTab === 'settings' ? 'active' : ''} ${isRestrictedSuperadmin ? 'disabledUI' : ''}`}
            onClick={() => this.setActiveTab('settings')}
          >
            {i18n.t('menu_settings')}
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'banks' && (
            <Banks
              setIsLoading={this.props.setIsLoading}
              banks={this.state.banks}
              fetchBanks={this.fetchBanks}
            />
          )}

          {activeTab === 'resellers' && (
            <Resellers
              setIsLoading={this.props.setIsLoading}
              updateMenuResellers={this.props.updateMenuResellers}
            />
          )}

          {activeTab === 'admins' && (
            <Admins
              key={this.state.adminsBuildCounter}
              setIsLoading={this.props.setIsLoading}
              banks={this.state.banks}
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
