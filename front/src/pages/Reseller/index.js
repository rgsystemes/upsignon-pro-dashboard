import React from 'react';
import { i18n } from '../../i18n/i18n';
import { isRestrictedSuperadmin } from '../../helpers/isRestrictedSuperadmin';
import '../../helpers/tabs.css';
import { ResellerBanks } from './ResellerBanks';
import { ResellerAdmins } from './ResellerAdmins';

// Props setIsLoading, updateMenuBanks
class Reseller extends React.Component {
  state = {
    activeTab: 'banks', // 'banks', 'admins'
  };
  setActiveTab = (tabName) => {
    this.setState({ activeTab: tabName });
  };
  render() {
    const { activeTab } = this.state;
    return (
      <div className="page">
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
        </div>

        <div className="tab-content">
          {activeTab === 'banks' && (
            <ResellerBanks
              setIsLoading={this.props.setIsLoading}
              banks={this.props.banks}
              resellerId={this.props.resellerId}
              fetchBanks={this.props.refetchBanks}
            />
          )}

          {activeTab === 'admins' && (
            <ResellerAdmins
              setIsLoading={this.props.setIsLoading}
              resellerId={this.props.resellerId}
            />
          )}
        </div>
      </div>
    );
  }
}

export { Reseller };
