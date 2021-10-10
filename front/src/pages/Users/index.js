import React from 'react';
import { fetchTemplate } from '../../helpers/fetchTemplate';
import { PaginationBar } from '../../helpers/paginationBar';
import { i18n } from '../../i18n/i18n';
import { UserDevices } from './UserDevices';
import './users.css';

const maxRenderedItems = 50;

class Users extends React.Component {
  state = {
    userCount: 0,
    users: [],
    isLoading: true,
    limit: maxRenderedItems,
    pageIndex: 1,
  };
  getCurrentQueryParameters = () => {
    const queryParamsArray = window.location.search
      .replace(/^\?/, '')
      .split('&')
      .map((p) => p.split('='));
    const queryParams = {};
    queryParamsArray.forEach((qp) => {
      if (qp.length === 2) queryParams[qp[0]] = qp[1];
    });
    return queryParams;
  };
  loadUsers = async () => {
    try {
      const queryParams = this.getCurrentQueryParameters();
      const limit = parseInt(queryParams.limit) || maxRenderedItems;
      const pageIndex = parseInt(queryParams.pageIndex) || 1;
      const { users, userCount } = await fetchTemplate(
        `/api/users?pageIndex=${pageIndex}&limit=${limit}`,
        'GET',
        null,
      );
      this.setState({ users, userCount, limit, pageIndex });
    } catch (e) {
      console.error(e);
    } finally {
      this.setState({ isLoading: false });
    }
  };

  deleteUserWithWarning = async (userId, userEmail) => {
    const confirmation = window.confirm(i18n.t('user_delete_warning', { email: userEmail }));
    if (confirmation) {
      this.setState({ isLoading: true });
      try {
        await fetchTemplate(`/api/delete-user/${userId}`, 'POST', null);
        await this.loadUsers();
      } catch (e) {
        console.error(e);
        this.setState({ isLoading: false });
      }
    }
  };

  loadUserDevices = async (userId) => {
    try {
      const devices = await fetchTemplate(`/api/user-devices/${userId}`, 'GET', null);
      this.setState((s) => {
        return {
          ...s,
          users: s.users.map((u) => {
            if (u.user_id === userId) {
              return { ...u, devices };
            } else {
              return u;
            }
          }),
        };
      });
    } catch (e) {
      console.error(e);
    }
  };

  componentDidMount() {
    this.loadUsers();
  }

  goToPageIndex = (p) => {
    window.location.href = `/users/?limit=${this.state.limit}&pageIndex=${p}`;
  };

  render() {
    return (
      <div className="page">
        <h1>{i18n.t('menu_users')}</h1>
        {this.state.isLoading && <div>{i18n.t('loading')}</div>}
        <PaginationBar
          pageIndex={this.state.pageIndex}
          limit={this.state.limit}
          totalCount={this.state.userCount}
          onClick={this.goToPageIndex}
        />
        <table>
          <thead>
            <tr>
              <th>{i18n.t('user_email')}</th>
              <th>{i18n.t('user_data')}</th>
              <th>{i18n.t('user_nb_devices')}</th>
              <th style={{ width: 150 }}>{i18n.t('user_nb_codes_and_accounts')}</th>
              <th style={{ width: 150 }}>{i18n.t('user_passwords_stats')}</th>
              <th>{i18n.t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {this.state.users.map((u) => {
              return (
                <React.Fragment key={u.user_id}>
                  <tr>
                    <td>{u.email}</td>
                    <td>
                      <div>{`${Math.round(u.data_length / 1000)}ko`}</div>
                      <div>{new Date(u.updated_at).toLocaleString()}</div>
                    </td>
                    <td>
                      <div
                        className={u.nb_devices > 0 && 'action'}
                        onClick={() => this.loadUserDevices(u.user_id)}
                      >
                        {i18n.t('user_nb_devices_value', { nb: u.nb_devices || 0 })}
                      </div>
                    </td>
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
                    <td>
                      <div
                        className="action"
                        onClick={() => this.deleteUserWithWarning(u.user_id, u.email)}
                      >
                        {i18n.t('delete')}
                      </div>
                    </td>
                  </tr>
                  {u.devices && (
                    <tr className="detailContainer">
                      <td colSpan={6}>
                        <UserDevices
                          devices={u.devices}
                          email={u.email}
                          reloadDevices={() => this.loadUserDevices(u.user_id)}
                        />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
        <PaginationBar
          pageIndex={this.state.pageIndex}
          limit={this.state.limit}
          totalCount={this.state.userCount}
          onClick={this.goToPageIndex}
        />
      </div>
    );
  }
}

export { Users };
