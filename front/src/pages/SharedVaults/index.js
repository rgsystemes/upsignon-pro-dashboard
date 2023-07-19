import React from 'react';
import { groupUrlFetch } from '../../helpers/urlFetch';
import { PaginationBar } from '../../helpers/paginationBar';
import { frontUrl } from '../../helpers/env';
import { i18n } from '../../i18n/i18n';
import { StatsCell } from '../../helpers/statsCell';

const maxRenderedItems = 20;

// PROPS = setIsLoading
class SharedVaults extends React.Component {
  searchInput = null;
  state = {
    sharedVaults: [],
    sharedVaultsCount: [],
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
  getSharedVaults = async () => {
    try {
      this.props.setIsLoading(true);
      const queryParams = this.getCurrentQueryParameters();
      const limit = parseInt(queryParams.limit, 10) || maxRenderedItems;
      const pageIndex = parseInt(queryParams.pageIndex, 10) || 1;
      const { sharedVaults, sharedVaultsCount } = await groupUrlFetch(
        `/api/shared-vaults?pageIndex=${pageIndex}&limit=${limit}`,
        'GET',
        null,
      );
      this.setState({
        sharedVaults,
        sharedVaultsCount,
        limit,
        pageIndex,
      });
    } catch (e) {
      console.error(e);
    } finally {
      this.props.setIsLoading(false);
    }
  };

  unshareWithUser = async (sharedVaultId, userId, sharedVaultName, userEmail) => {
    try {
      this.props.setIsLoading(true);
      const confirmation = window.confirm(
        i18n.t('shared_vault_user_delete_warning', {
          name: sharedVaultName,
          user: userEmail,
        }),
      );
      if (!confirmation) return;
      await groupUrlFetch(`/api/delete-shared-vault-user`, 'POST', {
        sharedVaultId,
        userId,
      });
      await this.getSharedVaults();
    } catch (e) {
      console.error(e);
    } finally {
      this.props.setIsLoading(false);
    }
  };

  toggleManagerRightsForUser = async (sharedVaultId, willBeManager, userId) => {
    try {
      this.props.setIsLoading(true);
      await groupUrlFetch(`/api/update-shared-vault-manager`, 'POST', {
        sharedVaultId,
        willBeManager,
        userId,
      });
      await this.getSharedVaults();
    } catch (e) {
      console.error(e);
    } finally {
      this.props.setIsLoading(false);
    }
  };

  onSearch = async (ev) => {
    const searchText = ev.target.value;
    // if search is emptied, reload all
    if (!searchText) {
      return this.getSharedVaults();
    }
    try {
      this.props.setIsLoading(true);
      const limit = 50;
      const pageIndex = 1;
      const { sharedVaults, sharedVaultsCount } = await groupUrlFetch(
        `/api/shared-vaults?search=${searchText}&pageIndex=${pageIndex}&limit=${limit}`,
        'GET',
        null,
      );
      this.setState({
        sharedVaults,
        sharedVaultsCount,
        limit,
        pageIndex,
      });
    } catch (e) {
      console.error(e);
    } finally {
      this.props.setIsLoading(false);
    }
  };

  goToPageIndex = (p) => {
    window.location.href = `${frontUrl}/shared_vaults/?limit=${this.state.limit}&pageIndex=${p}`;
  };

  componentDidMount() {
    this.getSharedVaults();
  }
  render() {
    const searchInputStyle = { width: 200 };
    if (this.state.sharedVaults.length === 0 && !!this.searchInput?.value) {
      searchInputStyle.backgroundColor = 'red';
      searchInputStyle.color = 'white';
    } else if (this.state.sharedVaults.length === 1 && !!this.searchInput?.value) {
      searchInputStyle.backgroundColor = 'green';
      searchInputStyle.color = 'white';
    }

    return (
      <div className="page">
        <h1>{`${i18n.t('menu_shared_vaults')} - ${i18n.t('total_count', {
          count: this.props.totalCount,
        })}`}</h1>
        <p>{i18n.t('shared_vault_manager_note')}</p>
        <div>
          <div>{i18n.t('shared_vault_search')}</div>
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
          totalCount={this.state.sharedVaultsCount}
          onClick={this.goToPageIndex}
          itemUnitName={i18n.t('shared_vault_unit_name')}
        />
        <table>
          <thead>
            <tr>
              <th>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <SharedFolderIcon color="white" />
                  {i18n.t('shared_vault_shared_folder_name')}
                </div>
              </th>
              <th style={{ width: 150 }}>{i18n.t('shared_vault_passwords_stats')}</th>
              <th>{i18n.t('shared_account_users')}</th>
              <th>{i18n.t('shared_account_user_creation_date')}</th>
              <th>{i18n.t('shared_account_user_is_manager')}</th>
              <th>{i18n.t('shared_account_user_actions')}</th>
            </tr>
          </thead>
          <tbody>
            {this.state.sharedVaults.map((sv) => {
              const contacts = [];
              sv.users?.forEach((u) => {
                const prevContact = contacts.find((c) => c.user_id === u.user_id);
                if (!prevContact) {
                  contacts.push(u);
                } else {
                  prevContact.created_at =
                    prevContact.created_at < u.created_at ? prevContact.created_at : u.created_at;
                  prevContact.is_manager = prevContact.is_manager && u.is_manager;
                }
              });
              return (
                <React.Fragment key={sv.id}>
                  {contacts.map((u, i) => {
                    const isLastManager =
                      u.is_manager &&
                      contacts.filter((c) => c.is_manager && c.user_id !== u.user_id).length === 0;
                    return (
                      <tr key={u.user_id}>
                        {i === 0 && <td rowSpan={contacts.length}>{sv.name}</td>}
                        {i === 0 && (
                          <StatsCell
                            rowSpan={contacts.length}
                            nb_accounts_strong={sv.nb_accounts_strong}
                            nb_accounts_medium={sv.nb_accounts_medium}
                            nb_accounts_weak={sv.nb_accounts_weak}
                            nb_accounts_with_duplicated_password={
                              sv.nb_accounts_with_duplicated_password
                            }
                            nb_accounts_red={sv.nb_accounts_red}
                            nb_accounts_orange={sv.nb_accounts_orange}
                            nb_accounts_green={sv.nb_accounts_green}
                          />
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
                                this.toggleManagerRightsForUser(sv.id, !u.is_manager, u.user_id);
                              }}
                            ></input>
                          </div>
                        </td>
                        <td>
                          {!isLastManager && (
                            <div
                              className="action"
                              onClick={() => {
                                this.unshareWithUser(
                                  sv.id,
                                  u.user_id,
                                  sv.name,
                                  u.email,
                                  contacts.length === 1,
                                );
                              }}
                            >
                              {i18n.t('shared_account_user_delete')}
                            </div>
                          )}
                        </td>
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
          totalCount={this.state.sharedVaultsCount}
          onClick={this.goToPageIndex}
          itemUnitName={i18n.t('shared_vault_unit_name')}
        />
      </div>
    );
  }
}

export { SharedVaults };

const SharedFolderIcon = (p) => {
  return (
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 768 768"
      fill={p.color}
    >
      <path d="M607.5 544.5v-33q0-28.5-44.25-45.75t-83.25-17.25-83.25 17.25-44.25 45.75v33h255zM480 288q-25.5 0-45 19.5t-19.5 45 19.5 44.25 45 18.75 45-18.75 19.5-44.25-19.5-45-45-19.5zM640.5 192q25.5 0 44.25 19.5t18.75 45v319.5q0 25.5-18.75 45t-44.25 19.5h-513q-25.5 0-44.25-19.5t-18.75-45v-384q0-25.5 18.75-45t44.25-19.5h192l64.5 64.5h256.5z"></path>
    </svg>
  );
};
