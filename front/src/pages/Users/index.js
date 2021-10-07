import React from 'react';
import { fetchTemplate } from '../../helpers/fetchTemplate';
import { i18n } from '../../i18n/i18n';
import './users.css';

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
              <th>{i18n.t('user_data')}</th>
              <th>{i18n.t('user_nb_devices')}</th>
              <th style={{ width: 150 }}>{i18n.t('user_nb_codes_and_accounts')}</th>
              <th style={{ width: 150 }}>{i18n.t('user_passwords_stats')}</th>
            </tr>
          </thead>
          <tbody>
            {this.state.users.map((u) => {
              return (
                <tr key={u.user_id}>
                  <td>{u.email}</td>
                  <td>
                    <div>{`${Math.round(u.data_length / 1000)}ko`}</div>
                    <div>{new Date(u.updated_at).toLocaleString()}</div>
                  </td>
                  <td>{i18n.t('user_nb_devices_value', { nb: u.nb_devices || 0 })}</td>
                  <td>
                    <div>{i18n.t('user_nb_codes_value', { nb: u.nb_codes || 0 })}</div>
                    <div>{i18n.t('user_nb_accounts_value', { nb: u.nb_accounts || 0 })}</div>
                    <div>
                      {u.nb_shared_items &&
                        i18n.t('user_nb_shared_items_value', { nb: u.nb_shared_items || 0 })}
                    </div>
                  </td>
                  <td>
                    <div className={`tag ${u.nb_accounts_weak > 0 && 'positiveWeak'}`}>
                      {i18n.t('user_passwords_weak', { nb: u.nb_accounts_weak || 0 })}
                    </div>
                    <div className={`tag ${u.nb_accounts_medium > 0 && 'positiveMedium'}`}>
                      {i18n.t('user_passwords_medium', { nb: u.nb_accounts_medium || 0 })}
                    </div>
                    <div className={`tag ${u.nb_accounts_strong > 0 && 'positiveStrong'}`}>
                      {i18n.t('user_passwords_strong', { nb: u.nb_accounts_strong || 0 })}
                    </div>
                    <div className={`tag ${u.nb_accounts_reused > 0 && 'positiveReused'}`}>
                      {i18n.t('user_passwords_reused', {
                        nb: u.nb_accounts_with_duplicate_password || 0,
                      })}
                    </div>
                  </td>
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
