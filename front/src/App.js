import React from 'react';
import './App.css';
import { fetchTemplate } from './helpers/fetchTemplate';
import { Loader } from './helpers/loader';
import './helpers/tableStyle.css';
import { Menu } from './nav/Menu';
import { Overview } from './pages/Overview';
import { Settings } from './pages/Settings';
import { SharedAccounts } from './pages/SharedAccounts';
import { SharedDevices } from './pages/SharedDevices';
import { Users } from './pages/Users';
import { i18n } from './i18n/i18n';

class App extends React.Component {
  state = {
    isLoading: false,
    nb_users: null,
    nb_shared_accounts: null,
    nb_shared_devices: null,
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
  componentDidMount() {
    this.fetchStats();
  }
  setIsLoading = (isLoading) => {
    this.setState({ isLoading });
  };
  render() {
    let path = window.location.href.replace(process.env.PUBLIC_URL, '');

    let pageContent = <Overview setIsLoading={this.setIsLoading} />;
    let currentPage = 'overview';

    if (path.startsWith('/users')) {
      pageContent = <Users setIsLoading={this.setIsLoading} totalCount={this.state.nb_users} />;
      currentPage = 'users';
    } else if (path.startsWith('/shared_devices')) {
      pageContent = (
        <SharedDevices setIsLoading={this.setIsLoading} totalCount={this.state.nb_shared_devices} />
      );
      currentPage = 'shared_devices';
    } else if (path.startsWith('/shared_accounts')) {
      pageContent = (
        <SharedAccounts
          setIsLoading={this.setIsLoading}
          totalCount={this.state.nb_shared_accounts}
        />
      );
      currentPage = 'shared_accounts';
    } else if (path.startsWith('/settings')) {
      pageContent = <Settings setIsLoading={this.setIsLoading} />;
      currentPage = 'settings';
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
        <Menu pages={pages} />
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
