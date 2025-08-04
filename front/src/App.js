import React from 'react';
import './App.css';
import { baseUrlFetch, bankUrlFetch } from './helpers/urlFetch';
import { Loader } from './helpers/loader';
import './helpers/tableStyle.css';
import { Menu } from './nav/Menu';
import { Overview } from './pages/Overview';
import { Settings } from './pages/Settings';
import { SharedDevices } from './pages/SharedDevices';
import { Users } from './pages/Users';
import { i18n } from './i18n/i18n';
import { baseFrontUrl, bankId, resellerId } from './helpers/env';
import { Superadmin } from './pages/Superadmin';
import { PasswordResetRequests } from './pages/PasswordResetRequests';
import { SharedVaults } from './pages/SharedVaults';
import { Other } from './pages/Other';
import { Licences } from './pages/Licences';
import {
  isRestrictedSuperadmin,
  setIsRestrictedSuperadmin,
} from './helpers/isRestrictedSuperadmin';
import { Reseller } from './pages/Reseller';

class App extends React.Component {
  state = {
    isLoading: false,
    nb_users: null,
    nb_shared_vaults: null,
    nb_shared_devices: null,
    nb_pwd_reset_requests: null,
    banks: [],
    resellers: [],
    isSuperadminOrRestricted: false,
    isReady: false,
  };
  updateMenuBanks = (newBanks) => {
    this.setState({ banks: newBanks });
  };
  async componentDidMount() {
    try {
      const banksRes = await baseUrlFetch('/get_available_banks', 'GET', null);
      const isBankInList = banksRes.banks.some((b) => b.id === parseInt(bankId));
      const isResellerInList = banksRes.resellers.some((r) => r.id == resellerId);
      const isSuperadminOrRestricted =
        banksRes.adminRole === 'superadmin' || banksRes.adminRole === 'restricted_superadmin';
      if (isSuperadminOrRestricted) {
        const shouldRedirectToSuperadminPage =
          (resellerId && !isResellerInList) ||
          (!resellerId && (!bankId || (bankId !== 'superadmin' && !isBankInList)));
        if (shouldRedirectToSuperadminPage) {
          window.location.href = baseFrontUrl + '/superadmin/';
          return;
        }
      } else {
        const shouldRedirectToFirstResellerOrBankPage =
          (resellerId && !isResellerInList) || (!resellerId && (!bankId || !isBankInList));
        if (shouldRedirectToFirstResellerOrBankPage) {
          if (banksRes.resellers.length > 0) {
            window.location.href = baseFrontUrl + '/reseller/' + banksRes.resellers[0].id + '/';
            return;
          } else {
            window.location.href = baseFrontUrl + '/' + banksRes.banks[0].id + '/';
            return;
          }
        }
      }
      setIsRestrictedSuperadmin(banksRes.adminRole === 'restricted_superadmin');
      this.setState({
        banks: banksRes.banks,
        resellers: banksRes.resellers,
        isSuperadminOrRestricted: isSuperadminOrRestricted,
        isReady: true,
      });
    } catch (e) {
      console.error(e);
    }
    if (
      !window.location.href.replace(baseFrontUrl, '').startsWith('/superadmin') &&
      !window.location.href.replace(baseFrontUrl, '').startsWith('/reseller')
    ) {
      bankUrlFetch('/api/count-shared-vaults', 'GET', null)
        .then((res) => this.setState({ nb_shared_vaults: res }))
        .catch(() => {});
      bankUrlFetch('/api/count-shared-devices', 'GET', null)
        .then((res) => this.setState({ nb_shared_devices: res }))
        .catch(() => {});
      bankUrlFetch('/api/count-users', 'GET', null)
        .then((res) =>
          this.setState({
            nb_users: res.allUsersCount,
          }),
        )
        .catch(() => {});
    }
    if (!window.location.href.replace(baseFrontUrl, '').startsWith('/reseller')) {
      bankUrlFetch('/api/count-password-reset-requests', 'GET', null)
        .then((res) => this.setState({ nb_pwd_reset_requests: res }))
        .catch(() => {});
    }
  }
  setIsLoading = (isLoading) => {
    this.setState({ isLoading });
  };
  refetchBanks = async () => {
    try {
      const banksRes = await baseUrlFetch('/get_available_banks', 'GET', null);
      this.setState({
        banks: banksRes.banks,
      });
    } catch (e) {
      console.error(e);
    }
  };
  render() {
    if (!this.state.isReady) {
      return (
        <div
          style={{
            height: '100vh',
            width: '100vw',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div>{i18n.t('loading')}</div>
        </div>
      );
    }
    let path = window.location.href.replace(baseFrontUrl, '');

    let pageContent = (
      <Overview setIsLoading={this.setIsLoading} isSuperadminPage={bankId === 'superadmin'} />
    );
    let currentPage = 'overview';

    if (path.startsWith(`/${bankId}/users`)) {
      pageContent = <Users setIsLoading={this.setIsLoading} totalCount={this.state.nb_users} />;
      currentPage = 'users';
    } else if (path.startsWith(`/${bankId}/other`)) {
      pageContent = <Other setIsLoading={this.setIsLoading} />;
      currentPage = 'other';
    } else if (path.startsWith(`/${bankId}/shared_devices`)) {
      pageContent = (
        <SharedDevices setIsLoading={this.setIsLoading} totalCount={this.state.nb_shared_devices} />
      );
      currentPage = 'shared_devices';
    } else if (path.startsWith(`/${bankId}/password_reset_requests`)) {
      pageContent = (
        <PasswordResetRequests
          setIsLoading={this.setIsLoading}
          totalCount={this.state.nb_pwd_reset_requests}
          isSuperAdmin={this.state.isSuperadmin}
        />
      );
      currentPage = 'password_reset_requests';
    } else if (path.startsWith(`/${bankId}/shared_vaults`)) {
      pageContent = (
        <SharedVaults setIsLoading={this.setIsLoading} totalCount={this.state.nb_shared_vaults} />
      );
      currentPage = 'shared_vaults';
    } else if (path.startsWith(`/${bankId}/settings`)) {
      if (bankId === 'superadmin') {
        pageContent = (
          <Superadmin setIsLoading={this.setIsLoading} updateMenuBanks={this.updateMenuBanks} />
        );
      } else {
        pageContent = (
          <Settings
            setIsLoading={this.setIsLoading}
            isSuperAdmin={this.state.isSuperadmin}
            otherBanks={this.state.banks.filter((g) => g.id !== parseInt(bankId))}
          />
        );
      }
      currentPage = 'settings';
    } else if (path.startsWith(`/${bankId}/licences`)) {
      pageContent = <Licences setIsLoading={this.setIsLoading} />;
      currentPage = 'licences';
    } else if (path.startsWith(`/reseller/${resellerId}`)) {
      pageContent = (
        <Reseller
          setIsLoading={this.setIsLoading}
          resellerId={resellerId}
          banks={this.state.banks.filter((b) => b.reseller_id === resellerId)}
          refetchBanks={this.refetchBanks}
        />
      );
      currentPage = 'reseller';
    }

    const pages =
      currentPage === 'reseller'
        ? []
        : [
            {
              key: 'overview',
              href: '/',
              title: i18n.t('menu_overview'),
              isCurrent: currentPage === 'overview',
              disabledForSuperadmin: false,
            },
            {
              key: 'password_reset_requests',
              href: '/password_reset_requests/',
              title: `${i18n.t('menu_password_reset_requests')} (${
                this.state.nb_pwd_reset_requests || '-'
              })`,
              isCurrent: currentPage === 'password_reset_requests',
              disabledForSuperadmin: false,
            },
            {
              key: 'users',
              href: '/users/',
              title: `${i18n.t('menu_users')} (${this.state.nb_users || '-'})`,
              isCurrent: currentPage === 'users',
              disabledForSuperadmin: true,
            },
            {
              key: 'shared_devices',
              href: '/shared_devices/',
              title: `${i18n.t('menu_shared_devices')} (${this.state.nb_shared_devices || '-'})`,
              isCurrent: currentPage === 'shared_devices',
              disabledForSuperadmin: true,
            },
            {
              key: 'shared_vaults',
              href: '/shared_vaults/',
              title: `${i18n.t('menu_shared_vaults')} (${this.state.nb_shared_vaults || '-'})`,
              isCurrent: currentPage === 'shared_vaults',
              disabledForSuperadmin: true,
            },
            {
              key: 'other',
              href: '/other/',
              title: `${i18n.t('menu_other')}`,
              isCurrent: currentPage === 'other',
              disabledForSuperadmin: false,
            },
            {
              key: 'settings',
              href: '/settings/',
              title: i18n.t('menu_settings'),
              isCurrent: currentPage === 'settings',
              disabledForSuperadmin: false,
            },
            {
              key: 'licences',
              href: '/licences/',
              title: `${i18n.t('menu_licences')}`,
              isCurrent: currentPage === 'licences',
              disabledForSuperadmin: false,
            },
          ];

    return (
      <div className="App">
        <Menu
          pages={pages}
          banks={this.state.banks}
          resellers={this.state.resellers}
          isSuperadmin={this.state.isSuperadminOrRestricted}
          isSuperadminPage={bankId === 'superadmin'}
        />
        {pageContent}
        <div
          style={{
            position: 'absolute',
            right: 30,
            top: 0,
            zIndex: 10,
            display: this.state.isLoading ? 'initial' : 'none',
          }}
        >
          <Loader />
        </div>
      </div>
    );
  }
}

export default App;
