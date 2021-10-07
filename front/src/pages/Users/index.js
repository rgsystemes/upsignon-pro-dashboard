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
        <table>
          <thead>
            <tr>
              <th>{i18n.t('user_email')}</th>
              <th>{i18n.t('user_data_length')}</th>
            </tr>
          </thead>
          <tbody>
            {this.state.users.map((u) => {
              return (
                <tr key={u.user_id}>
                  <td>{u.email}</td>
                  <td>{`${Math.round(u.data_length / 1000)}ko`}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
}

export { Users };
