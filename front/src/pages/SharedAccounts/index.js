import React, { useState } from 'react';
import { groupUrlFetch } from '../../helpers/urlFetch';
import { PaginationBar } from '../../helpers/paginationBar';
import { frontUrl } from '../../helpers/env';
import { i18n } from '../../i18n/i18n';

const maxRenderedItems = 50;

// PROPS = setIsLoading
class SharedAccounts extends React.Component {
  searchInput = null;
  state = {
    sharedFolders: [],
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
      this.props.setIsLoading(true);
      await groupUrlFetch(`/api/clean-empty-shared-folders`, 'POST', null);
      const sharedFolders = await groupUrlFetch(`/api/shared_folders`, 'GET', null);
      const queryParams = this.getCurrentQueryParameters();
      const limit = parseInt(queryParams.limit, 10) || maxRenderedItems;
      const pageIndex = parseInt(queryParams.pageIndex, 10) || 1;
      const { sharedAccounts, sharedAccountsCount } = await groupUrlFetch(
        `/api/shared-accounts?pageIndex=${pageIndex}&limit=${limit}`,
        'GET',
        null,
      );
      this.setState({
        sharedFolders,
        sharedAccounts,
        sharedAccountsCount,
        limit,
        pageIndex,
      });
    } catch (e) {
      console.error(e);
    } finally {
      this.props.setIsLoading(false);
    }
  };

  deleteSharedAccount = async (accountId) => {
    try {
      this.props.setIsLoading(true);
      await groupUrlFetch(`/api/delete-shared-account/${accountId}`, 'POST', null);
      await this.getSharedAccounts();
    } catch (e) {
      console.error(e);
    } finally {
      this.props.setIsLoading(false);
    }
  };

  unshareWithUser = async (
    sharedAccountUserId,
    sharedFolderId,
    userId,
    accountOrFolderName,
    userEmail,
    isLastUser,
  ) => {
    try {
      this.props.setIsLoading(true);
      const confirmation = window.confirm(
        sharedFolderId
          ? i18n.t('shared_folder_user_delete_warning', {
              name: accountOrFolderName,
              user: userEmail,
            })
          : i18n.t('shared_account_user_delete_warning', {
              name: accountOrFolderName,
              user: userEmail,
            }),
      );
      if (!confirmation) return;
      if (isLastUser) {
        const confirmation2 = window.confirm(i18n.t('shared_account_last_user_warning'));
        if (!confirmation2) return;
      }
      await groupUrlFetch(`/api/delete-shared-account-user`, 'POST', {
        sharedAccountUserId,
        sharedFolderId,
        userId,
      });
      await this.getSharedAccounts();
    } catch (e) {
      console.error(e);
    } finally {
      this.props.setIsLoading(false);
    }
  };

  toggleManagerRightsForUser = async (
    sharedAccountUserId,
    sharedFolderId,
    willBeManager,
    userId,
  ) => {
    try {
      this.props.setIsLoading(true);
      await groupUrlFetch(`/api/update-shared-account-manager`, 'POST', {
        sharedAccountUserId,
        sharedFolderId,
        willBeManager,
        userId,
      });
      await this.getSharedAccounts();
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
      return this.getSharedAccounts();
    }
    try {
      this.props.setIsLoading(true);
      const limit = 50;
      const pageIndex = 1;
      const { sharedAccounts, sharedAccountsCount } = await groupUrlFetch(
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
    } finally {
      this.props.setIsLoading(false);
    }
  };

  goToPageIndex = (p) => {
    window.location.href = `${frontUrl}/shared_accounts/?limit=${this.state.limit}&pageIndex=${p}`;
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

    const sharedAccountsOutOfSharedFolders = this.state.sharedAccounts.filter(
      (ac) => !ac.shared_folder_id,
    );

    const foldersOnPage = this.state.sharedFolders
      .filter((sf) => this.state.sharedAccounts.some((ac) => ac.shared_folder_id === sf.id))
      .map((sf) => {
        return {
          ...sf,
          rows: this.state.sharedAccounts.filter((ac) => ac.shared_folder_id === sf.id),
        };
      });

    return (
      <div className="page">
        <h1>{`${i18n.t('menu_shared_accounts')} - ${i18n.t('total_count', {
          count: this.props.totalCount,
        })}`}</h1>
        <p>{i18n.t('shared_account_manager_note')}</p>
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
              <th>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <SharedFolderIcon color="white" />
                  {i18n.t('shared_account_shared_folder_name')}
                </div>
              </th>
              <th>{i18n.t('shared_account_items')}</th>
              <th>{i18n.t('shared_account_users')}</th>
              <th>{i18n.t('shared_account_user_creation_date')}</th>
              <th>{i18n.t('shared_account_user_is_manager')}</th>
              <th>{i18n.t('shared_account_user_actions')}</th>
            </tr>
          </thead>
          <tbody>
            {sharedAccountsOutOfSharedFolders.map((s) => {
              return (
                <React.Fragment key={s.id}>
                  {(s.users == null || s.users.length === 0) && (
                    <tr>
                      <td></td>
                      <td>
                        <SharedAccountItem
                          name={s.name}
                          type={s.type}
                          url={s.url}
                          login={s.login}
                        />
                      </td>
                      <td className="warningCell"></td>
                      <td></td>
                      <td></td>
                      <td>
                        <div className="action" onClick={() => this.deleteSharedAccount(s.id)}>
                          {i18n.t('delete')}
                        </div>
                      </td>
                    </tr>
                  )}
                  {s.users?.map((u, i) => {
                    const isLastManager =
                      u.is_manager &&
                      s.users?.filter((a) => a.is_manager && a.user_id !== u.user_id).length === 0;
                    return (
                      <tr key={u.user_id}>
                        {i === 0 && <td rowSpan={s.users?.length}>{'-'}</td>}
                        {i === 0 && (
                          <td rowSpan={s.users?.length}>
                            <SharedAccountItem
                              name={s.name}
                              type={s.type}
                              url={s.url}
                              login={s.login}
                            />
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
                                  null,
                                  !u.is_manager,
                                  u.user_id,
                                );
                              }}
                            ></input>
                          </div>
                        </td>
                        <td>
                          {!isLastManager && (
                            <div
                              className="action"
                              onClick={() =>
                                this.unshareWithUser(
                                  u.shared_account_user_id,
                                  null,
                                  u.user_id,
                                  s.name,
                                  u.email,
                                  s.users?.length === 1,
                                )
                              }
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
            {foldersOnPage.map((sf) => {
              const contacts = [];
              sf.rows.forEach((r) => {
                r.users?.forEach((u) => {
                  const prevContact = contacts.find((c) => c.user_id === u.user_id);
                  if (!prevContact) {
                    contacts.push(u);
                  } else {
                    prevContact.created_at =
                      prevContact.created_at < u.created_at ? prevContact.created_at : u.created_at;
                    prevContact.is_manager = prevContact.is_manager && u.is_manager;
                  }
                });
              });
              return (
                <React.Fragment key={sf.id}>
                  {contacts.map((u, i) => {
                    const isLastManager =
                      u.is_manager &&
                      contacts.filter((c) => c.is_manager && c.user_id !== u.user_id).length === 0;
                    return (
                      <tr key={u.user_id}>
                        {i === 0 && <td rowSpan={contacts.length}>{sf.name}</td>}
                        {i === 0 && (
                          <td rowSpan={contacts.length}>
                            {sf.rows.map((r) => {
                              return (
                                <SharedAccountItem
                                  key={r.id}
                                  name={r.name}
                                  type={r.type}
                                  url={r.url}
                                  login={r.login}
                                />
                              );
                            })}
                            {parseInt(sf.count) !== sf.rows.length && <div>•••</div>}
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
                                  null,
                                  sf.id,
                                  !u.is_manager,
                                  u.user_id,
                                );
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
                                  null,
                                  sf.id,
                                  u.user_id,
                                  sf.name,
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
          totalCount={this.state.sharedAccountsCount}
          onClick={this.goToPageIndex}
          itemUnitName={i18n.t('shared_account_unit_name')}
        />
      </div>
    );
  }
}

export { SharedAccounts };

const SharedAccountItem = (props) => {
  const [isFolded, setIsFolded] = useState(true);
  const urlDomain = props.url
    ?.replace(/^https?:\/\//, '')
    .split('/')[0]
    .split('?')[0]
    .split('#')[0];
  return (
    <div
      onClick={() => {
        setIsFolded((prev) => !prev);
      }}
      style={{ marginBottom: 5, cursor: 'pointer' }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'rgb(44, 82, 132)',
          color: 'white',
          padding: 5,
          borderRadius: 3,
        }}
      >
        <div>{props.type === 'ACCOUNT' ? <AccountIcon /> : <CodeIcon />}</div>
        <span style={{ marginLeft: 5 }}>{props.name}</span>
      </div>
      {!isFolded && (
        <div style={{ marginLeft: 15 }}>
          <div style={{ maxWidth: 300, textOverflow: 'clip', overflow: 'hidden' }}>{urlDomain}</div>
          <div>{props.login}</div>
        </div>
      )}
    </div>
  );
};

const AccountIcon = () => {
  return (
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
      viewBox="0 0 512 512"
      fill="white"
    >
      <path d="M352 0c-88.365 0-160 71.634-160 160 0 10.013 0.929 19.808 2.688 29.312l-194.688 194.688v96c0 17.673 14.327 32 32 32h32v-32h64v-64h64v-64h64l41.521-41.521c17.005 6.158 35.348 9.521 54.479 9.521 88.365 0 160-71.634 160-160s-71.635-160-160-160zM399.937 160.063c-26.51 0-48-21.49-48-48s21.49-48 48-48 48 21.49 48 48-21.49 48-48 48z"></path>
    </svg>
  );
};

const CodeIcon = () => {
  return (
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
      viewBox="0 0 768 768"
      fill="white"
    >
      <path d="M51 12.75h90q10.5 0 18 7.5t7.5 18v0 89.25q0 10.5-7.5 18t-18 7.5v0h-90q-10.5 0-18-7.5t-7.5-18v0-89.25q0-10.5 7.5-18t18-7.5v0 0zM51 178.5h90q10.5 0 18 7.5t7.5 18.75v0 89.25q0 10.5-7.5 18t-18 7.5v0h-90q-10.5 0-18-7.5t-7.5-18v0-89.25q0-11.25 7.5-18.75t18-7.5v0 0zM51 345h90q10.5 0 18 7.5t7.5 18v0 90q0 10.5-7.5 18t-18 7.5v0h-90q-10.5 0-18-7.5t-7.5-18v0-90q0-10.5 7.5-18t18-7.5v0 0zM710.25 330q2.25 3 6 5.25t8.25 2.25q6.75 0 11.625-4.875t4.875-11.625q0-2.25-0.75-4.875t-1.5-4.125v0q-6-20.25-22.875-33.375t-38.625-13.125q-18 0-32.25 8.625t-22.5 22.125h-0.75q-8.25-12-22.125-19.5t-29.625-7.5q-18.75 0-33.75 9.375t-22.5 24.375h-0.75q-3-3.75-6.375-7.125t-7.125-5.625v0-85.5q0-11.25-7.5-18.75t-18.75-7.5v0h-94.5l-7.5-27.75q2.25 1.5 5.25 1.875t6 0.375h90.75q11.25 0 18.75-7.5t7.5-18v0-89.25q0-10.5-7.5-18t-18.75-7.5v0h-89.25q-10.5 0-18 7.5t-7.5 18v0 87q-5.25-7.5-12-13.5t-14.25-9.75h-0.75v-63q0-10.5-7.5-18t-18-7.5v0h-90q-10.5 0-18 7.5t-7.5 18v0 90q0 10.5 7.5 18t18 7.5v0h36v6.75q0 5.25 0.75 10.125t2.25 9.375v-0.75h-39q-10.5 0-18 7.5t-7.5 18v0 90q0 10.5 7.5 18t18 7.5v0h77.25l7.5 25.5h-84.75q-10.5 0-18 7.5t-7.5 18v0 90q0 10.5 7.5 18t18 7.5v0h90q10.5 0 18-7.5t7.5-18v0l19.5 63.75h-96q-9.75 0-33.75 9.75-24.75 10.5-45.375 31.875t-28.125 55.875q-8.25 33.75 15 81.75 1.5 0 3 0.375t3 0.375q3.75 0 7.125-0.75t6.375-3h-0.75l96-29.25 173.25 34.5 22.5 12.75h1.5q6.75 0 11.25-4.5t4.5-10.5q0-3-1.125-5.625t-2.625-4.875v0l-19.5-15-192-38.25-90 27.75q-18.75-28.5 9.375-68.625t61.125-40.125h115.5q8.25 0 13.875-5.625t5.625-13.875v0l-113.25-377.25q0-1.5-0.375-3.75t-0.375-3.75q0-13.5 9.75-23.25t23.25-9.75q11.25 0 20.25 7.125t12 17.625v0l63.75 218.25q2.25 3 6 4.875t8.25 1.875q7.5 0 12.75-5.25t5.25-12.75v-1.5q-5.25-39 30-41.625t39 37.125q2.25 3.75 6 5.625t8.25 1.875q7.5 0 12.75-5.25t5.25-12.75v-1.125t-0.75-1.125h0.75q-5.25-38.25 30-40.125t39.75 43.875q1.5 6 5.625 9.375t10.125 3.375q6.75 0 11.25-4.5t4.5-11.25v-1.5t-0.75-1.5v0q-4.5-33.75 30.75-39t39.75 35.25v0z"></path>
    </svg>
  );
};

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
