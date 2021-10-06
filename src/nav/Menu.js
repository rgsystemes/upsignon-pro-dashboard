import "./Menu.css";

function Menu(props) {
  const { currentPage } = props;
  return (
    <nav>
      <div className="logo">UpSignOn</div>
      <a href="/" className={`navItem ${currentPage === "overview" ? "current" : ""}`}>
        Overview
      </a>
      <a href="/users" className="navItem">
        Users
      </a>
      <a href="/settings" className="navItem">
        Settings
      </a>
    </nav>
  );
}

export { Menu };
