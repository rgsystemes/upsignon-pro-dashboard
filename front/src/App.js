import React from 'react';
import './App.css';
import { adminFetchTemplate, fetchTemplate } from './helpers/fetchTemplate';
import { Loader } from './helpers/loader';
import './helpers/tableStyle.css';
import { Menu } from './nav/Menu';
import { Overview } from './pages/Overview';
import { Settings } from './pages/Settings';
import { SharedAccounts } from './pages/SharedAccounts';
import { SharedDevices } from './pages/SharedDevices';
import { Users } from './pages/Users';
import { i18n } from './i18n/i18n';
import { baseFrontUrl, group } from './helpers/env';
import { Superadmin } from './pages/Superadmin';

class App extends React.Component {
  state = {
    isLoading: false,
    nb_users: null,
    nb_shared_accounts: null,
    nb_shared_devices: null,
    groups: [],
    isSuperadmin: false,
  };
  fetchStats = async () => {
    try {
      const stats = await Promise.all([
        fetchTemplate('/api/count-shared-accounts', 'GET', null),
        fetchTemplate('/api/count-shared-devices', 'GET', null),
        fetchTemplate('/api/count-users', 'GET', null),
      ]);

      this.setState({
        nb_shared_accounts: stats[0],
        nb_shared_devices: stats[1],
        nb_users: stats[2],
      });
    } catch (e) {
      console.error(e);
    }
  };
  fetchGroups = async () => {
    try {
      const groupsRes = await adminFetchTemplate('/get_available_groups', 'GET', null);
      this.setState({
        groups: groupsRes.groups,
        isSuperadmin: groupsRes.isSuperadmin,
      });
    } catch (e) {
      console.error(e);
    }
  };
  updateMenuGroups = (newGroups) => {
    this.setState({ groups: newGroups });
  };
  componentDidMount() {
    this.fetchGroups();
    if (!window.location.href.replace(baseFrontUrl, '').startsWith('/superadmin')) {
      this.fetchStats();
    }
  }
  setIsLoading = (isLoading) => {
    this.setState({ isLoading });
  };
  render() {
    let path = window.location.href.replace(baseFrontUrl, '');

    let pageContent = <Overview setIsLoading={this.setIsLoading} />;
    let currentPage = 'overview';

    if (path.startsWith(`/${group}/users`)) {
      pageContent = <Users setIsLoading={this.setIsLoading} totalCount={this.state.nb_users} />;
      currentPage = 'users';
    } else if (path.startsWith(`/${group}/shared_devices`)) {
      pageContent = (
        <SharedDevices setIsLoading={this.setIsLoading} totalCount={this.state.nb_shared_devices} />
      );
      currentPage = 'shared_devices';
    } else if (path.startsWith(`/${group}/shared_accounts`)) {
      pageContent = (
        <SharedAccounts
          setIsLoading={this.setIsLoading}
          totalCount={this.state.nb_shared_accounts}
        />
      );
      currentPage = 'shared_accounts';
    } else if (path.startsWith(`/${group}/settings`)) {
      pageContent = <Settings setIsLoading={this.setIsLoading} />;
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
      },
      {
        key: 'users',
        href: '/users/',
        title: `${i18n.t('menu_users')} (${this.state.nb_users || '-'})`,
        isCurrent: currentPage === 'users',
      },
      {
        key: 'shared_devices',
        href: '/shared_devices/',
        title: `${i18n.t('menu_shared_devices')} (${this.state.nb_shared_devices || '-'})`,
        isCurrent: currentPage === 'shared_devices',
      },
      {
        key: 'shared_accounts',
        href: '/shared_accounts/',
        title: `${i18n.t('menu_shared_accounts')} (${this.state.nb_shared_accounts || '-'})`,
        isCurrent: currentPage === 'shared_accounts',
      },
      {
        key: 'settings',
        href: '/settings/',
        title: i18n.t('menu_settings'),
        isCurrent: currentPage === 'settings',
      },
    ];

    return (
      <div className="App">
        <Menu
          pages={pages}
          groups={this.state.groups}
          isSuperadmin={this.state.isSuperadmin}
          isSuperadminPage={currentPage === 'superadmin'}
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
