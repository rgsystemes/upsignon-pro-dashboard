import React from 'react';
import { i18n } from '../../i18n/i18n';
import { AllowedEmails } from './AllowedEmails';
import { BankAdmins } from './BankAdmins';
import { OtherSettings } from './OtherSettings';
import { ProSetupLink } from './ProSetupLink';
import { Urls } from './Urls';
import { ServerRedirection } from './ServerRedirection';
import { MicrosoftEntraConfig } from './MicrosoftEntraConfig';
import { OpenidConfiguration } from './OpenidConfiguration';
import '../../helpers/tabs.css';
import { ShamirTab } from './shamir/ShamirTab';

// Props setIsLoading, isSuperAdmin, otherBanks
class Settings extends React.Component {
  state = {
    activeTab: 'setup', // 'setup', 'options', 'admins', 'permissions', 'urls', 'shamir'
  };

  setActiveTab = (tabName) => {
    this.setState({ activeTab: tabName });
  };

  render() {
    const { activeTab } = this.state;

    return (
      <div className="page">
        <h1>{i18n.t('menu_settings')}</h1>
        {/* Navigation par onglets */}
        <div className="tabs-navigation">
          <button
            className={`tab-button ${activeTab === 'setup' ? 'active' : ''}`}
            onClick={() => this.setActiveTab('setup')}
          >
            {i18n.t('settings_tab_setup')}
          </button>
          <button
            className={`tab-button ${activeTab === 'options' ? 'active' : ''}`}
            onClick={() => this.setActiveTab('options')}
          >
            {i18n.t('settings_tab_options')}
          </button>
          <button
            className={`tab-button ${activeTab === 'shamir' ? 'active' : ''}`}
            onClick={() => this.setActiveTab('shamir')}
          >
            {i18n.t('settings_tab_shamir')}
          </button>
          <button
            className={`tab-button ${activeTab === 'admins' ? 'active' : ''}`}
            onClick={() => this.setActiveTab('admins')}
          >
            {i18n.t('settings_tab_admins')}
          </button>
          <button
            className={`tab-button ${activeTab === 'permissions' ? 'active' : ''}`}
            onClick={() => this.setActiveTab('permissions')}
          >
            {i18n.t('settings_tab_permissions')}
          </button>
          <button
            className={`tab-button ${activeTab === 'urls' ? 'active' : ''}`}
            onClick={() => this.setActiveTab('urls')}
          >
            {i18n.t('settings_tab_urls')}
          </button>
        </div>

        {/* Contenu des onglets */}
        <div className="tab-content">
          {activeTab === 'setup' && (
            <div>
              <ProSetupLink />
              <ServerRedirection />
            </div>
          )}

          {activeTab === 'options' && <OtherSettings setIsLoading={this.props.setIsLoading} />}

          {activeTab === 'admins' && <BankAdmins setIsLoading={this.props.setIsLoading} />}
          {activeTab === 'shamir' && <ShamirTab setIsLoading={this.props.setIsLoading} />}

          {activeTab === 'permissions' && (
            <div>
              <OpenidConfiguration setIsLoading={this.props.setIsLoading} />
              <MicrosoftEntraConfig setIsLoading={this.props.setIsLoading} />
              <AllowedEmails setIsLoading={this.props.setIsLoading} />
            </div>
          )}

          {activeTab === 'urls' && (
            <Urls
              setIsLoading={this.props.setIsLoading}
              isSuperAdmin={this.props.isSuperAdmin}
              otherBanks={this.props.otherBanks}
            />
          )}
        </div>
      </div>
    );
  }
}

export { Settings };
