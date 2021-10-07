import './App.css';
import { Menu } from './nav/Menu';
import { Overview } from './pages/Overview';
import { Settings } from './pages/Settings';
import { Users } from './pages/Users';

function App() {
  const path = window.location.pathname;
  let pageContent = <Overview />;
  if (path.startsWith('/users')) {
    pageContent = <Users />;
  } else if (path.startsWith('/settings')) {
    pageContent = <Settings />;
  }
  return (
    <div className="App">
      <Menu currentPage="overview" />
      {pageContent}
    </div>
  );
}

export default App;
