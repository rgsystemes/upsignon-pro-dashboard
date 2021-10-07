import { i18n } from '../i18n/i18n';
import './Menu.css';

function Menu(props) {
  const { pages } = props;
  return (
    <nav>
      <div className="logo">UpSignOn</div>
      {pages.map((p) => {
        return (
          <a key={p.key} href={p.href} className={`navItem ${p.isCurrent ? 'current' : ''}`}>
            {i18n.t(p.translationKey)}
          </a>
        );
      })}
    </nav>
  );
}

export { Menu };
