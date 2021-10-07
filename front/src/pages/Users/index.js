import React from 'react';
import { fetchTemplate } from '../../helpers/fetchTemplate';
import { i18n } from '../../i18n/i18n';

class Users extends React.Component {
  state = {
    users: [],
    isLoading: true,
  };
  async componentDidMount() {
    try {
      const users = await fetchTemplate('/api/users', 'GET', null);
      this.setState({ users });
    } catch (e) {
      console.error(e);
    } finally {
      this.setState({ isLoading: false });
    }
  }
  render() {
    return (
      <div>
        <h1>{i18n.t('menu_users')}</h1>
        {this.state.isLoading && <div>{i18n.t('loading')}</div>}
        {this.state.users.map((u) => {
          return <div>{u.email}</div>;
        })}
      </div>
    );
  }
}

export { Users };
