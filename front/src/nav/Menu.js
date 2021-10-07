import { i18n } from '../i18n/i18n';
import './Menu.css';

function Menu(props) {
  const { currentPage } = props;
  return (
    <nav>
      <div className="logo">UpSignOn</div>
      <a href="/" className={`navItem ${currentPage === 'overview' ? 'current' : ''}`}>
        {i18n.t('menu_overview')}
      </a>
      <a href="/users" className="navItem">
        {i18n.t('menu_users')}
      </a>
      <a href="/settings" className="navItem">
        {i18n.t('menu_settings')}
      </a>
    </nav>
  );
}

export { Menu };
