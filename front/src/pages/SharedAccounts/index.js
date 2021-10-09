import React from 'react';
import { fetchTemplate } from '../../helpers/fetchTemplate';
import { i18n } from '../../i18n/i18n';

class SharedAccounts extends React.Component {
  state = {
    sharedAccounts: [],
  };
  getSharedAccounts = async () => {
    try {
      const accounts = await fetchTemplate('/api/shared-accounts', 'GET', null);
      const sharedAccountGroups = {};
      accounts.forEach((s) => {
        if (!sharedAccountGroups[s.id]) {
          sharedAccountGroups[s.id] = {
            id: s.id,
            url: s.url,
            name: s.name,
            login: s.login,
            type: s.type,
            users: [],
          };
        }
        if (s.email) {
          sharedAccountGroups[s.id].users.push({
            email: s.email,
            isManager: s.is_manager,
            createdAt: s.created_at,
            sharedAccountUserId: s.shared_account_user_id,
          });
        }
      });
      const sharedAccounts = Object.values(sharedAccountGroups).map((sa) => {
        return {
          ...sa,
          users: sa.users.sort((u1, u2) => {
            if (u1.createdAt < u2.createdAt) return -1;
            if (u1.createdAt > u2.createdAt) return 1;
            if (u1.email < u2.email) return -1;
            return 1;
          }),
        };
      });
      this.setState({ sharedAccounts });
    } catch (e) {
      console.error(e);
    }
  };

  deleteSharedAccount = async (accountId) => {
    try {
      await fetchTemplate(`/api/delete-shared-account/${accountId}`, 'POST', null);
      await this.getSharedAccounts();
    } catch (e) {
      console.error(e);
    }
  };

  unshareWithUser = async (sharedAccountUserId, accountName, user, isLastUser) => {
    try {
      const confirmation = window.confirm(
        i18n.t('shared_account_user_delete_warning', { accountName, user }),
      );
      if (!confirmation) return;
      if (isLastUser) {
        const confirmation2 = window.confirm(i18n.t('shared_account_last_user_warning'));
        if (!confirmation2) return;
      }
      await fetchTemplate(`/api/delete-shared-account-user/${sharedAccountUserId}`, 'POST', null);
      await this.getSharedAccounts();
    } catch (e) {
      console.error(e);
    }
  };

  toggleManagerRightsForUser = async (
    sharedAccountUserId,
    willBeManager,
    accountName,
    user,
    isLastManager,
  ) => {
    try {
      await fetchTemplate(`/api/update-shared-account-manager`, 'POST', {
        sharedAccountUserId,
        willBeManager,
      });
      await this.getSharedAccounts();
    } catch (e) {
      console.error(e);
    }
  };

  componentDidMount() {
    this.getSharedAccounts();
  }
  render() {
    return (
      <div className="page">
        <h1>{i18n.t('menu_shared_accounts')}</h1>
        <table>
          <thead>
            <tr>
              <th>{i18n.t('shared_account_name')}</th>
              <th>{i18n.t('shared_account_type')}</th>
              <th>{i18n.t('shared_account_url')}</th>
              <th>{i18n.t('shared_account_login')}</th>
              <th>{i18n.t('shared_account_users')}</th>
              <th>{i18n.t('shared_account_user_creation_date')}</th>
              <th>{i18n.t('shared_account_user_is_manager')}</th>
              <th>{i18n.t('shared_account_user_actions')}</th>
              <th>{i18n.t('shared_account_actions')}</th>
            </tr>
          </thead>
          <tbody>
            {this.state.sharedAccounts.map((s) => {
              return (
                <React.Fragment key={s.id}>
                  {s.users.length === 0 && (
                    <tr>
                      <td>{s.name}</td>
                      <td>{s.type}</td>
                      <td>{s.url}</td>
                      <td>{s.login}</td>
                      <td className="warningCell"></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td>
                        <div className="action" onClick={() => this.deleteSharedAccount(s.id)}>
                          {i18n.t('delete')}
                        </div>
                      </td>
                    </tr>
                  )}
                  {s.users.map((u, i) => {
                    const isLastManager =
                      u.isManager &&
                      s.users.filter(
                        (a) => a.isManager && a.sharedAccountUserId !== u.sharedAccountUserId,
                      ).length === 0;
                    return (
                      <tr key={u.sharedAccountUserId}>
                        {i === 0 && <td rowSpan={s.users.length}>{s.name}</td>}
                        {i === 0 && <td rowSpan={s.users.length}>{s.type}</td>}
                        {i === 0 && <td rowSpan={s.users.length}>{s.url}</td>}
                        {i === 0 && <td rowSpan={s.users.length}>{s.login}</td>}
                        <td>{u.email}</td>
                        <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <input
                              type="checkbox"
                              checked={u.isManager}
                              disabled={isLastManager}
                              onChange={() => {
                                this.toggleManagerRightsForUser(
                                  u.sharedAccountUserId,
                                  !u.isManager,
                                  s.name,
                                  u.email,
                                );
                              }}
                            ></input>
                          </div>
                        </td>
                        <td>
                          <div
                            className="action"
                            onClick={() =>
                              this.unshareWithUser(
                                u.sharedAccountUserId,
                                s.name,
                                u.email,
                                s.users.length === 1,
                              )
                            }
                          >
                            {i18n.t('shared_account_user_delete')}
                          </div>
                        </td>
                        {i === 0 && <td rowSpan={s.users.length}></td>}
                      </tr>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
}

export { SharedAccounts };
