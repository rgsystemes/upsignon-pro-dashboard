import { useState } from 'react';
import './App.css';
import { Loader } from './helpers/loader';
import './helpers/tableStyle.css';
import { Menu } from './nav/Menu';
import { Overview } from './pages/Overview';
import { Settings } from './pages/Settings';
import { SharedAccounts } from './pages/SharedAccounts';
import { SharedDevices } from './pages/SharedDevices';
import { Users } from './pages/Users';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const path = window.location.pathname;

  let pageContent = <Overview setIsLoading={setIsLoading} />;
  let currentPage = 'overview';

  if (path.startsWith('/users')) {
    pageContent = <Users setIsLoading={setIsLoading} />;
    currentPage = 'users';
  } else if (path.startsWith('/shared_devices')) {
    pageContent = <SharedDevices setIsLoading={setIsLoading} />;
    currentPage = 'shared_devices';
  } else if (path.startsWith('/shared_accounts')) {
    pageContent = <SharedAccounts setIsLoading={setIsLoading} />;
    currentPage = 'shared_accounts';
  } else if (path.startsWith('/settings')) {
    pageContent = <Settings setIsLoading={setIsLoading} />;
    currentPage = 'settings';
  }

  const pages = [
    {
      key: 'overview',
      href: '/',
      translationKey: 'menu_overview',
      isCurrent: currentPage === 'overview',
    },
    {
      key: 'users',
      href: '/users/',
      translationKey: 'menu_users',
      isCurrent: currentPage === 'users',
    },
    {
      key: 'shared_devices',
      href: '/shared_devices/',
      translationKey: 'menu_shared_devices',
      isCurrent: currentPage === 'shared_devices',
    },
    {
      key: 'shared_accounts',
      href: '/shared_accounts/',
      translationKey: 'menu_shared_accounts',
      isCurrent: currentPage === 'shared_accounts',
    },
    {
      key: 'settings',
      href: '/settings/',
      translationKey: 'menu_settings',
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
          display: isLoading ? 'initial' : 'none',
        }}
      >
        <Loader />
      </div>
    </div>
  );
}

export default App;
