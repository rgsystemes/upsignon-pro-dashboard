import React from 'react';
import './App.css';
import { baseUrlFetch, groupUrlFetch } from './helpers/urlFetch';
import { Loader } from './helpers/loader';
import './helpers/tableStyle.css';
import { Menu } from './nav/Menu';
import { Overview } from './pages/Overview';
import { Settings } from './pages/Settings';
import { SharedAccounts } from './pages/SharedAccounts';
import { SharedDevices } from './pages/SharedDevices';
import { Users } from './pages/Users';
import { i18n } from './i18n/i18n';
import { baseFrontUrl, groupId } from './helpers/env';
import { Superadmin } from './pages/Superadmin';
import { PasswordResetRequests } from './pages/PasswordResetRequests';

class App extends React.Component {
  state = {
    isLoading: false,
    nb_users: null,
    nb_shared_accounts: null,
    nb_shared_devices: null,
    nb_pwd_reset_requests: null,
    groups: [],
    isSuperadmin: false,
    isReady: false,
  };
  updateMenuGroups = (newGroups) => {
    this.setState({ groups: newGroups });
  };
  async componentDidMount() {
    try {
      const groupsRes = await baseUrlFetch('/get_available_groups', 'GET', null);
      // eslint-disable-next-line eqeqeq
      const isGroupInList = groupsRes.groups.some((g) => g.id == groupId);
      if (groupsRes.isSuperadmin) {
        if (!groupId || (groupId !== 'superadmin' && !isGroupInList)) {
          window.location.href = baseFrontUrl + '/superadmin/';
        }
      } else {
        if (!groupId || !isGroupInList) {
          window.location.href = baseFrontUrl + '/' + groupsRes.groups[0].id + '/';
        }
      }
      this.setState({
        groups: groupsRes.groups,
        isSuperadmin: groupsRes.isSuperadmin,
        isReady: true,
      });
    } catch (e) {
      console.error(e);
      window.location.href = baseFrontUrl + '/login.html';
    }
    if (!window.location.href.replace(baseFrontUrl, '').startsWith('/superadmin')) {
      groupUrlFetch('/api/count-shared-accounts', 'GET', null)
        .then((res) => this.setState({ nb_shared_accounts: res }))
        .catch(() => {});
      groupUrlFetch('/api/count-shared-devices', 'GET', null)
        .then((res) => this.setState({ nb_shared_devices: res }))
        .catch(() => {});
      groupUrlFetch('/api/count-users', 'GET', null)
        .then((res) => this.setState({ nb_users: res }))
        .catch(() => {});
    }
    groupUrlFetch('/api/count-password-reset-requests', 'GET', null)
      .then((res) => this.setState({ nb_pwd_reset_requests: res }))
      .catch(() => {});
  }
  setIsLoading = (isLoading) => {
    this.setState({ isLoading });
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

    let pageContent = <Overview setIsLoading={this.setIsLoading} />;
    let currentPage = 'overview';

    if (path.startsWith(`/${groupId}/users`)) {
      pageContent = <Users setIsLoading={this.setIsLoading} totalCount={this.state.nb_users} />;
      currentPage = 'users';
    } else if (path.startsWith(`/${groupId}/shared_devices`)) {
      pageContent = (
        <SharedDevices setIsLoading={this.setIsLoading} totalCount={this.state.nb_shared_devices} />
      );
      currentPage = 'shared_devices';
    } else if (path.startsWith(`/${groupId}/password_reset_requests`)) {
      pageContent = (
        <PasswordResetRequests
          setIsLoading={this.setIsLoading}
          totalCount={this.state.nb_pwd_reset_requests}
          isSuperAdmin={this.state.isSuperadmin}
        />
      );
      currentPage = 'password_reset_requests';
    } else if (path.startsWith(`/${groupId}/shared_accounts`)) {
      pageContent = (
        <SharedAccounts
          setIsLoading={this.setIsLoading}
          totalCount={this.state.nb_shared_accounts}
        />
      );
      currentPage = 'shared_accounts';
    } else if (path.startsWith(`/${groupId}/settings`)) {
      pageContent = (
        <Settings
          setIsLoading={this.setIsLoading}
          isSuperAdmin={this.state.isSuperadmin}
          // eslint-disable-next-line eqeqeq
          otherGroups={this.state.groups.filter((g) => g.id != groupId)}
        />
      );
      currentPage = 'settings';
    } else if (path.startsWith('/superadmin')) {
      pageContent = (
        <Superadmin setIsLoading={this.setIsLoading} updateMenuGroups={this.updateMenuGroups} />
      );
      currentPage = 'superadmin';
    }

    const pages = [
      {
        key: 'overview',
        href: '/',
        title: i18n.t('menu_overview'),
        isCurrent: currentPage === 'overview',
        disabledForSuperadmin: true,
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
        key: 'shared_accounts',
        href: '/shared_accounts/',
        title: `${i18n.t('menu_shared_accounts')} (${this.state.nb_shared_accounts || '-'})`,
        isCurrent: currentPage === 'shared_accounts',
        disabledForSuperadmin: true,
      },
      {
        key: 'settings',
        href: '/settings/',
        title: i18n.t('menu_settings'),
        isCurrent: currentPage === 'settings',
        disabledForSuperadmin: true,
      },
    ];

    return (
      <div className="App">
        <Menu
          pages={pages}
          groups={this.state.groups}
          isSuperadmin={this.state.isSuperadmin}
          isSuperadminPage={
            currentPage === 'superadmin' ||
            (currentPage === 'password_reset_requests' && groupId === 'superadmin')
          }
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
