import './App.css';
import './helpers/tableStyle.css';
import { Menu } from './nav/Menu';
import { Overview } from './pages/Overview';
import { Settings } from './pages/Settings';
import { Users } from './pages/Users';

function App() {
  const path = window.location.pathname;

  let pageContent = <Overview />;
  let currentPage = 'overview';

  if (path.startsWith('/users')) {
    pageContent = <Users />;
    currentPage = 'users';
  } else if (path.startsWith('/settings')) {
    pageContent = <Settings />;
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
    </div>
  );
}

export default App;
