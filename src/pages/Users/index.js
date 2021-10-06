import { i18n } from "../../i18n/i18n";

class Users {
  state = {
    users: [],
    isLoading: true,
  };
  async componentDidMount() {
    try {
      // TODO
    } catch (e) {
      console.error(e);
    } finally {
      this.setState({ isLoading: false });
    }
  }
  render() {
    return (
      <div>
        <h1>{i18n.t("menu_users")}</h1>
        {this.state.isLoading && <div>{i18n.t("loading")}</div>}
      </div>
    );
  }
}

export { Users };
