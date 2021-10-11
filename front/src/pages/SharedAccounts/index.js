import React from 'react';
import { fetchTemplate } from '../../helpers/fetchTemplate';
import { PaginationBar } from '../../helpers/paginationBar';
import { i18n } from '../../i18n/i18n';

const maxRenderedItems = 50;

class SharedAccounts extends React.Component {
  searchInput = null;
  state = {
    sharedAccountsCount: 0,
    sharedAccounts: [],
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
  getSharedAccounts = async () => {
    try {
      const queryParams = this.getCurrentQueryParameters();
      const limit = parseInt(queryParams.limit) || maxRenderedItems;
      const pageIndex = parseInt(queryParams.pageIndex) || 1;
      const { sharedAccounts, sharedAccountsCount } = await fetchTemplate(
        `/api/shared-accounts?pageIndex=${pageIndex}&limit=${limit}`,
        'GET',
        null,
      );
      this.setState({
        sharedAccounts,
        sharedAccountsCount,
        limit,
        pageIndex,
      });
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

  onSearch = async (ev) => {
    const searchText = ev.target.value;
    // if search is emptied, reload all
    if (!searchText) {
      return this.getSharedAccounts();
    }
    try {
      const limit = 50;
      const pageIndex = 1;
      const { sharedAccounts, sharedAccountsCount } = await fetchTemplate(
        `/api/shared-accounts?search=${searchText}&pageIndex=${pageIndex}&limit=${limit}`,
        'GET',
        null,
      );
      this.setState({
        sharedAccounts,
        sharedAccountsCount,
        limit,
        pageIndex,
      });
    } catch (e) {
      console.error(e);
    }
  };

  goToPageIndex = (p) => {
    window.location.href = `/shared_accounts/?limit=${this.state.limit}&pageIndex=${p}`;
  };

  componentDidMount() {
    this.getSharedAccounts();
  }
  render() {
    const searchInputStyle = { width: 200 };
    if (this.state.sharedAccounts.length === 0 && !!this.searchInput?.value) {
      searchInputStyle.backgroundColor = 'red';
      searchInputStyle.color = 'white';
    } else if (this.state.sharedAccounts.length === 1 && !!this.searchInput?.value) {
      searchInputStyle.backgroundColor = 'green';
      searchInputStyle.color = 'white';
    }
    return (
      <div className="page">
        <h1>{i18n.t('menu_shared_accounts')}</h1>
        <div>
          <div>{i18n.t('shared_account_search')}</div>
          <input
            ref={(r) => (this.searchInput = r)}
            type="search"
            style={searchInputStyle}
            placeholder="email@domain.com"
            onChange={this.onSearch}
          />
        </div>
        <PaginationBar
          pageIndex={this.state.pageIndex}
          limit={this.state.limit}
          totalCount={this.state.sharedAccountsCount}
          onClick={this.goToPageIndex}
          itemUnitName={i18n.t('shared_account_unit_name')}
        />
        <table>
          <thead>
            <tr>
              <th>{i18n.t('shared_account_name')}</th>
              <th>{i18n.t('shared_account_url')}</th>
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
                      <td>
                        <div>{s.type}</div>
                        <div>{s.url}</div>
                        <div>{s.login}</div>
                      </td>
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
                      u.is_manager &&
                      s.users.filter(
                        (a) =>
                          a.is_manager && a.shared_account_user_id !== u.shared_account_user_id,
                      ).length === 0;
                    return (
                      <tr key={u.shared_account_user_id}>
                        {i === 0 && <td rowSpan={s.users.length}>{s.name}</td>}
                        {i === 0 && (
                          <td rowSpan={s.users.length}>
                            <div>{s.type}</div>
                            <div>{s.url}</div>
                            <div>{s.login}</div>
                          </td>
                        )}
                        <td>{u.email}</td>
                        <td>{new Date(u.created_at).toLocaleDateString()}</td>
                        <td>
                          <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <input
                              type="checkbox"
                              checked={u.is_manager}
                              disabled={isLastManager}
                              onChange={() => {
                                this.toggleManagerRightsForUser(
                                  u.shared_account_user_id,
                                  !u.is_manager,
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
                                u.shared_account_user_id,
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
        <PaginationBar
          pageIndex={this.state.pageIndex}
          limit={this.state.limit}
          totalCount={this.state.sharedAccountsCount}
          onClick={this.goToPageIndex}
          itemUnitName={i18n.t('shared_account_unit_name')}
        />
      </div>
    );
  }
}

export { SharedAccounts };
