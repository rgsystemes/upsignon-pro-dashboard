import React from 'react';
import { EditableCell } from '../../helpers/EditableCell';
import { EditableResellerCell } from '../../helpers/EditableResellerCell';
import { ResellerSelector } from '../../helpers/ResellerSelector';
import { Toggler } from '../../helpers/Toggler';
import { baseFrontUrl, isSaasServer } from '../../helpers/env';
import { autolockDelaySettings, settingsConfig } from '../../helpers/settingsConfig';
import { bankUrlFetch } from '../../helpers/urlFetch';
import { i18n } from '../../i18n/i18n';
import './Banks.css';
import { isRestrictedSuperadmin } from '../../helpers/isRestrictedSuperadmin';

// eslint-disable-next-line no-extend-native
Date.prototype.addWeeks = function (w) {
  this.setTime(this.getTime() + w * 7 * 24 * 60 * 60 * 1000);
  return this;
};

// Props : setIsLoading, banks, fetchBanks
class Banks extends React.Component {
  state = {
    bankToDeleteId: null,
    showAllSettings: false,
    showBankSettings: {},
    filterType: 0, // 0: all, 1: testing only
    sortType: 0, // 0: name, 1: reseller, 2: expiration date
    sortDirection: 'asc', // 'asc' or 'desc'
    salesRepFilter: localStorage.getItem('banksSalesRepFilter') || '', // Filter by sales rep name
    selectedResellerIdForNewBank: null, // Selected reseller for new bank form
    resellers: [],
  };
  newBankNameInputRef = null;
  newAdminEmailInputRef = null;
  isTestingCheckboxRef = null;
  salesEmailRef = null;

  insertBank = async () => {
    try {
      this.props.setIsLoading(true);
      const newBankName = this.newBankNameInputRef.value;
      const newAdminEmail = this.newAdminEmailInputRef.value;
      const isTrial = this.isTestingCheckboxRef.checked;
      const salesEmail = this.salesEmailRef.value;
      const resellerId = this.state.selectedResellerIdForNewBank || null;
      if (!newBankName || newBankName.length < 2) {
        this.newBankNameInputRef.style.borderColor = 'red';
        return;
      } else {
        this.newBankNameInputRef.style.borderColor = null;
      }
      if (!this.state.selectedResellerIdForNewBank && !newAdminEmail) {
        this.newAdminEmailInputRef.style.borderColor = 'red';
        return;
      } else {
        this.newAdminEmailInputRef.style.borderColor = null;
      }
      if (salesEmail) {
        localStorage.setItem('newBankSalesEmail', salesEmail);
      }
      await bankUrlFetch('/api/insert-bank', 'POST', {
        name: newBankName,
        adminEmail: newAdminEmail,
        isTrial,
        salesEmail,
        resellerId,
      });
      await this.props.fetchBanks();
      this.newBankNameInputRef.value = null;
      this.newAdminEmailInputRef.value = null;
      this.isTestingCheckboxRef.checked = true;
      this.setState({ selectedResellerIdForNewBank: '' });
      window.alert(i18n.t('sasettings_new_bank_form_success'));
    } catch (e) {
      console.error(e);
    } finally {
      this.props.setIsLoading(false);
    }
  };
  updateBankName = async (bankId, newName) => {
    try {
      this.props.setIsLoading(true);
      await bankUrlFetch('/api/update-bank', 'POST', {
        name: newName,
        id: bankId,
      });
      await this.props.fetchBanks();
    } catch (e) {
      console.error(e);
    } finally {
      this.props.setIsLoading(false);
    }
  };
  updateResellerId = async (bankId, resellerId) => {
    try {
      this.props.setIsLoading(true);
      await bankUrlFetch('/api/update-bank', 'POST', {
        id: bankId,
        resellerId: resellerId,
      });
      await this.props.fetchBanks();
    } catch (e) {
      console.error(e);
    } finally {
      this.props.setIsLoading(false);
    }
  };
  updateNbLicences = async (bankId, newNb) => {
    try {
      this.props.setIsLoading(true);
      await bankUrlFetch('/api/update-bank', 'POST', {
        nb_licences_sold: parseInt(newNb),
        id: bankId,
      });
      await this.props.fetchBanks();
    } catch (e) {
      console.error(e);
    } finally {
      this.props.setIsLoading(false);
    }
  };
  toggleBankSetting = async (bankId, newSettings) => {
    try {
      this.props.setIsLoading(true);
      await bankUrlFetch('/api/update-bank', 'POST', {
        id: bankId,
        settings: newSettings,
      });
      await this.props.fetchBanks();
    } catch (e) {
      console.error(e);
    } finally {
      this.props.setIsLoading(false);
    }
  };
  deleteBank = async (id) => {
    try {
      this.props.setIsLoading(true);
      await bankUrlFetch(`/api/delete-bank/${id}`, 'POST', null);
      await this.props.fetchBanks();
    } catch (e) {
      console.error(e);
    } finally {
      this.props.setIsLoading(false);
    }
  };

  fetchResellers = async () => {
    try {
      const resellers = await bankUrlFetch('/api/resellers', 'GET', null);
      this.setState({ resellers: resellers });
    } catch (e) {
      console.error('Error fetching resellers:', e);
    }
  };
  componentDidMount() {
    this.fetchResellers();
  }
  toggleAllSettings = () => {
    this.setState((s) => {
      if (s.showAllSettings) {
        return { ...s, showAllSettings: false, showBankSettings: {} };
      }
      return { ...s, showAllSettings: true };
    });
  };
  toggleShowBankSettings = (bankId) => {
    this.setState((s) => {
      return { ...s, showBankSettings: { [bankId]: !s.showBankSettings[bankId] } };
    });
  };

  handleSort = (sortType) => {
    this.setState((prevState) => ({
      sortType,
      sortDirection:
        prevState.sortType === sortType && prevState.sortDirection === 'asc' ? 'desc' : 'asc',
    }));
  };

  getSortIcon = (columnSortType) => {
    if (this.state.sortType !== columnSortType) {
      return '↕'; // No sort icon when not active
    }
    return this.state.sortDirection === 'asc' ? '↑' : '↓';
  };

  handleSalesRepFilterChange = (value) => {
    this.setState({ salesRepFilter: value });
    localStorage.setItem('banksSalesRepFilter', value);
  };

  render() {
    const bankToDelete = this.props.banks.find((g) => g.id === this.state.bankToDeleteId);
    if (bankToDelete) {
      return (
        <div>
          <h2>{i18n.t('sasettings_banks')}</h2>
          <div
            className={`delete-confirmation-container ${isRestrictedSuperadmin ? 'disabledUI' : ''}`}
          >
            <h3>{i18n.t('sasettings_bank_delete_warning')}</h3>
            <div style={{ marginBottom: 10 }}>
              {i18n.t('sasetting_confirm_bank_delete', {
                name: bankToDelete.name,
              })}
            </div>
            <input ref={(r) => (this.deleteBankInputRef = r)} />
            <div className="button-group">
              <div
                className="danger-button"
                onClick={() => {
                  if (this.deleteBankInputRef.value === bankToDelete.name) {
                    this.deleteBank(bankToDelete.id);
                  } else {
                    this.deleteBankInputRef.style.borderColor = 'red';
                  }
                }}
              >
                {i18n.t('validate')}
              </div>
              <div className="button" onClick={() => this.setState({ bankToDeleteId: null })}>
                {i18n.t('cancel')}
              </div>
            </div>
          </div>
        </div>
      );
    }

    const filteredBanks = this.props.banks
      .filter((bank) => {
        // Filter by type (all or testing only)
        const typeFilter = this.state.filterType === 0 || bank.settings?.IS_TESTING;

        // Filter by sales rep
        const salesRepFilter =
          !this.state.salesRepFilter ||
          (bank.settings?.SALES_REP || '')
            .toLowerCase()
            .includes(this.state.salesRepFilter.toLowerCase());

        return typeFilter && salesRepFilter;
      })
      .sort((a, b) => {
        let comparison = 0;

        switch (this.state.sortType) {
          case 1: // Sort by reseller
            const resellerA = a.reseller_name.toLowerCase();
            const resellerB = b.reseller_name.toLowerCase();
            comparison = resellerA.localeCompare(resellerB);
            break;

          case 2: // Sort by expiration date/days remaining
            const getExpirationValue = (bank) => {
              if (!bank.settings?.IS_TESTING || !bank.settings?.TESTING_EXPIRATION_DATE) {
                return Infinity; // Non-testing banks go to the end
              }
              const today = new Date();
              const expirationDate = new Date(bank.settings.TESTING_EXPIRATION_DATE);
              return expirationDate - today; // Sort by time remaining (expired first)
            };
            comparison = getExpirationValue(a) - getExpirationValue(b);
            break;

          case 0: // Sort by bank name (default)
          default:
            comparison = a.name.toLowerCase().localeCompare(b.name.toLowerCase());
            break;
        }

        return this.state.sortDirection === 'desc' ? -comparison : comparison;
      });
    return (
      <div>
        <h2>{i18n.t('sasettings_banks')}</h2>
        <p>{i18n.t('sasettings_banks_explanation')}</p>
        <div className="newBankForm">
          <div className="newBankFormTitle">{i18n.t('sasettings_new_bank_form_title')}</div>
          <div className="newBankInputContainer">
            <label htmlFor="bankNameInput">{i18n.t('sasettings_new_bank_form_bank_name')}*</label>
            <input
              id="bankNameInput"
              ref={(r) => {
                this.newBankNameInputRef = r;
              }}
              placeholder={i18n.t('sasettings_new_bank_form_bank_name')}
            />
          </div>
          <div className="newBankInputContainer">
            <label htmlFor="isTestingCheckbox">
              {i18n.t('sasettings_new_bank_form_is_testing')}
            </label>
            <input
              id="isTestingCheckbox"
              type="checkbox"
              defaultChecked
              ref={(r) => {
                this.isTestingCheckboxRef = r;
              }}
            />
          </div>
          {isSaasServer && (
            <div className="newBankInputContainer">
              <label htmlFor="resellerName">{i18n.t('sasettings_bank_reseller')}</label>
              <ResellerSelector
                value={this.state.selectedResellerIdForNewBank}
                onChange={(value) => this.setState({ selectedResellerIdForNewBank: value })}
                placeholder={i18n.t('sasettings_select_reseller')}
                resellers={this.state.resellers}
              />
            </div>
          )}
          <div
            className="newBankInputContainer"
            style={this.state.selectedResellerIdForNewBank ? { display: 'none' } : null}
          >
            <div>
              <label htmlFor="adminEmailInput">
                {i18n.t('sasettings_new_bank_form_admin_email_label')}
              </label>
              <input
                id="adminEmailInput"
                ref={(r) => {
                  this.newAdminEmailInputRef = r;
                }}
                placeholder={i18n.t('sasettings_new_bank_form_admin_email')}
              />
            </div>
          </div>
          <div className="newBankInputContainer">
            <label htmlFor="salesEmail">{i18n.t('sasettings_new_bank_form_sales_email')}</label>
            <input
              id="salesEmail"
              ref={(r) => {
                this.salesEmailRef = r;
              }}
              placeholder={i18n.t('sasettings_new_bank_form_sales_email_placeholder')}
              defaultValue={localStorage.getItem('newBankSalesEmail')}
            />
          </div>

          <div className="action" onClick={this.insertBank}>
            {i18n.t('add')}
          </div>
        </div>
        {isSaasServer && (
          <div className="filters-container">
            <div>
              <Toggler
                choices={[
                  {
                    key: 0,
                    title: i18n.t('sasettings_filter_all_banks'),
                    isCurrent: this.state.filterType === 0,
                  },
                  {
                    key: 1,
                    title: i18n.t('sasettings_filter_testing_banks'),
                    isCurrent: this.state.filterType === 1,
                  },
                ]}
                onSelect={(filterType) => this.setState({ filterType })}
              />
            </div>
            <div>
              <input
                type="text"
                className="sales-rep-filter-input"
                placeholder={i18n.t('sasettings_sales_rep_filter_placeholder')}
                value={this.state.salesRepFilter}
                onChange={(e) => this.handleSalesRepFilterChange(e.target.value)}
              />
            </div>
          </div>
        )}
        {(this.state.salesRepFilter || this.state.filterType !== 0) && (
          <div className="filter-warning">⚠️ {i18n.t('sasettings_filtered_list_warning')}</div>
        )}
        {this.props.banks.length > 0 && (
          <table>
            <thead>
              <tr>
                <th></th>
                <th>{i18n.t('sasettings_bank_id')}</th>
                {isSaasServer && (
                  <th
                    className="sortable-header"
                    onClick={() => this.handleSort(1)}
                    title={i18n.t('sasettings_click_to_sort')}
                  >
                    {i18n.t('sasettings_bank_reseller')}
                    <br />
                    {this.getSortIcon(1)}
                  </th>
                )}
                <th
                  className="sortable-header"
                  style={{ minWidth: 100 }}
                  onClick={() => this.handleSort(0)}
                  title={i18n.t('sasettings_click_to_sort')}
                >
                  {i18n.t('sasettings_bank_name')}
                  <br />
                  {this.getSortIcon(0)}
                </th>
                <th>{i18n.t('sasettings_nb_associated_licences')}</th>
                <th>{i18n.t('sasettings_nb_users')}</th>
                <th>{i18n.t('sasettings_bank_created_at')}</th>
                <th>{i18n.t('sasettings_bank_is_testing')}</th>
                <th>{i18n.t('sasettings_bank_test_expires_at')}</th>
                <th
                  className="sortable-header"
                  onClick={() => this.handleSort(2)}
                  title={i18n.t('sasettings_click_to_sort')}
                >
                  {i18n.t('sasettings_bank_test_days_remaining')}
                  <br />
                  {this.getSortIcon(2)}
                </th>
                {isSaasServer && <th>{i18n.t('sasettings_bank_sales_rep')}</th>}
                {!isRestrictedSuperadmin && (
                  <th style={{ minWidth: 200 }}>
                    <div>{i18n.t('settings_bank_settings')}</div>
                    <div
                      className="action"
                      style={{ color: 'white' }}
                      onClick={this.toggleAllSettings}
                    >
                      {i18n.t('settings_bank_settings_toggle_all_settings')}
                    </div>
                  </th>
                )}
                {!isRestrictedSuperadmin && <th>{i18n.t('actions')}</th>}
              </tr>
            </thead>
            <tbody>
              {filteredBanks.map((bank) => {
                const showSettings =
                  this.state.showAllSettings || this.state.showBankSettings[bank.id];
                return (
                  <tr key={bank.id}>
                    <td>
                      <span
                        className="action"
                        onClick={() => {
                          window.location.href = baseFrontUrl + '/' + bank.id + '/';
                        }}
                      >
                        {i18n.t('sasettings_bank_open')}
                      </span>
                    </td>
                    <td>{bank.id}</td>
                    {isSaasServer && (
                      <EditableResellerCell
                        value={bank.reseller_id}
                        onChange={(newId) => {
                          this.updateResellerId(bank.id, newId);
                        }}
                        resellers={this.state.resellers}
                      />
                    )}
                    <EditableCell
                      value={bank.name}
                      onChange={(newVal) => {
                        if (!newVal) return;
                        this.updateBankName(bank.id, newVal);
                      }}
                    />
                    <EditableCell
                      type="number"
                      value={bank.nb_licences_sold}
                      onChange={(newVal) => {
                        if (newVal == null || newVal < 0) return;
                        this.updateNbLicences(bank.id, newVal);
                      }}
                    />
                    <td
                      className={bank.nb_users > bank.nb_licences_sold ? 'user-count-warning' : ''}
                    >
                      {bank.nb_users}
                    </td>
                    <td>{new Date(bank.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="testing-checkbox-container">
                        <input
                          type="checkbox"
                          checked={bank.settings?.IS_TESTING}
                          onChange={() => {
                            this.toggleBankSetting(bank.id, {
                              ...bank.settings,
                              IS_TESTING: !bank.settings?.IS_TESTING,
                            });
                          }}
                          disabled={isRestrictedSuperadmin}
                        ></input>
                        &nbsp;{bank.settings?.IS_TESTING ? i18n.t('yes') : i18n.t('no')}
                      </div>
                    </td>
                    {bank.settings?.IS_TESTING ? (
                      <EditableCell
                        type="date"
                        value={bank.settings?.TESTING_EXPIRATION_DATE}
                        className={
                          !bank.settings?.TESTING_EXPIRATION_DATE ||
                          new Date(bank.settings?.TESTING_EXPIRATION_DATE) < new Date()
                            ? 'expired-date'
                            : ''
                        }
                        onChange={(newVal) => {
                          this.toggleBankSetting(bank.id, {
                            ...bank.settings,
                            TESTING_EXPIRATION_DATE: newVal,
                          });
                        }}
                        disabled={isRestrictedSuperadmin}
                      />
                    ) : (
                      <td>N/A</td>
                    )}
                    <td>
                      {bank.settings?.IS_TESTING && bank.settings?.TESTING_EXPIRATION_DATE
                        ? (() => {
                            const today = new Date();
                            const expirationDate = new Date(bank.settings.TESTING_EXPIRATION_DATE);
                            const diffTime = expirationDate - today;
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                            if (diffDays <= 0) {
                              const expiredDays = Math.abs(diffDays);
                              return (
                                <span className="expired-text">
                                  {i18n.t('sasettings_bank_expired_since', {
                                    days: expiredDays,
                                    s: expiredDays > 1 ? 's' : '',
                                  })}
                                </span>
                              );
                            } else if (diffDays <= 7) {
                              return (
                                <span className="expiring-soon-text">
                                  {i18n.t('sasettings_bank_days_remaining', {
                                    days: diffDays,
                                    s: diffDays > 1 ? 's' : '',
                                  })}
                                </span>
                              );
                            } else {
                              return (
                                <span>
                                  {i18n.t('sasettings_bank_days_remaining', {
                                    days: diffDays,
                                    s: diffDays > 1 ? 's' : '',
                                  })}
                                </span>
                              );
                            }
                          })()
                        : 'N/A'}
                    </td>
                    {isSaasServer && (
                      <EditableCell
                        value={bank.settings?.SALES_REP || ''}
                        onChange={(newVal) => {
                          if (
                            newVal &&
                            !newVal
                              .toLowerCase()
                              .match(
                                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                              )
                          ) {
                            window.alert(i18n.t('sasettings_bank_sales_rep_must_be_email'));
                            return;
                          }
                          this.toggleBankSetting(bank.id, {
                            ...bank.settings,
                            SALES_REP: newVal,
                          });
                        }}
                      />
                    )}
                    {!isRestrictedSuperadmin && (
                      <td className={showSettings ? 'settings-column-expanded' : ''}>
                        <div
                          className="action"
                          onClick={() => this.toggleShowBankSettings(bank.id)}
                        >
                          {i18n.t('settings_bank_settings_toggle_bank_settings')}
                        </div>
                        {showSettings && (
                          <>
                            {Object.keys(settingsConfig).map((k) => (
                              <InlineSetting
                                key={k}
                                bank={bank}
                                settingNameInDB={k}
                                toggleBankSetting={this.toggleBankSetting}
                              />
                            ))}
                            {Object.keys(autolockDelaySettings).map((k) => (
                              <AutolockDelaySetting
                                key={k}
                                bank={bank}
                                settingNameInDB={k}
                                toggleBankSetting={this.toggleBankSetting}
                              />
                            ))}
                          </>
                        )}
                      </td>
                    )}
                    {!isRestrictedSuperadmin && (
                      <td>
                        <div
                          className={`action ${isRestrictedSuperadmin ? 'disabledUI' : ''}`}
                          onClick={() => this.setState({ bankToDeleteId: bank.id })}
                        >
                          {i18n.t('delete')}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
              <tr className="total-row">
                <td>{i18n.t('total')}</td>
                <td></td>
                {isSaasServer && <td></td>}
                <td></td>
                <td></td>
                <td>{filteredBanks.reduce((r, g) => r + parseInt(g.nb_users), 0)}</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                {isSaasServer && <td></td>}
                {!isRestrictedSuperadmin && <td></td>}
                {!isRestrictedSuperadmin && <td></td>}
              </tr>
            </tbody>
          </table>
        )}
      </div>
    );
  }
}

const InlineSetting = (props) => {
  const { bank, settingNameInDB, toggleBankSetting } = props;
  const settingConf = settingsConfig[settingNameInDB];
  const resValue =
    bank.settings?.[settingNameInDB] == null
      ? settingConf.recommendedValue
      : bank.settings?.[settingNameInDB];
  const isRecommendedValue = resValue === settingConf.recommendedValue;
  return (
    <div className="inline-setting">
      <div className="inline-setting-content">{i18n.t(settingConf.banksTitle)}</div>
      <div
        onClick={() => {
          toggleGroupSetting(group.id, {
            ...group.settings,
            [settingNameInDB]: !resValue,
          });
        }}
        className={`action ${isRestrictedSuperadmin ? 'disabledUI' : ''}`}
      >
        {isRecommendedValue ? (
          <div className="recommendedParam">
            {i18n.t(settingConf.recommendedValue ? 'yes' : 'no')}
          </div>
        ) : (
          <div className="unrecommendedParam">
            {i18n.t(settingConf.recommendedValue ? 'no' : 'yes')}
          </div>
        )}
      </div>
    </div>
  );
};

const AutolockDelaySetting = (props) => {
  const { bank, settingNameInDB, toggleBankSetting } = props;
  const settingConf = autolockDelaySettings[settingNameInDB];
  const resValue = bank.settings?.[settingNameInDB] ?? -1;

  let maxDuration = null;
  if (settingConf.maxSettingKey != null) {
    maxDuration =
      bank.settings?.[settingConf.maxSettingKey] == null
        ? autolockDelaySettings[settingConf.maxSettingKey].recommendedOption
        : bank.settings?.[settingConf.maxSettingKey];
  }
  let defaultSettingDuration = null;
  if (settingConf.defaultSettingKey != null) {
    defaultSettingDuration =
      bank.settings?.[settingConf.defaultSettingKey] == null
        ? autolockDelaySettings[settingConf.defaultSettingKey].recommendedOption
        : bank.settings?.[settingConf.defaultSettingKey];
  }

  return (
    <div className="inline-setting">
      <div className="inline-setting-content">{i18n.t(settingConf.banksTitle)}</div>
      <div>
        <select
          onChange={(ev) => {
            toggleBankSetting(
              bank.id,
              settingConf.defaultSettingKey != null
                ? {
                    ...bank.settings,
                    [settingNameInDB]: Number.parseInt(ev.target.value),
                    [settingConf.defaultSettingKey]: Math.min(
                      Number.parseInt(ev.target.value),
                      defaultSettingDuration,
                    ),
                  }
                : {
                    ...bank.settings,
                    [settingNameInDB]: Number.parseInt(ev.target.value),
                  },
            );
          }}
          value={resValue}
          className="autolock-setting-select"
        >
          {/* important to avoid visual incoherence between the default here and the default in the app if this setting is never changed */}
          <option disabled value={-1} disabled={isRestrictedSuperadmin}></option>
          {settingConf.options.map((op) => {
            return (
              <option
                key={op.seconds}
                value={op.seconds}
                disabled={
                  (maxDuration != null && op.seconds > maxDuration) || isRestrictedSuperadmin
                }
              >
                {op.title}
                {op.seconds == settingConf.recommendedOption ? ' (sugg.)' : ''}
              </option>
            );
          })}
        </select>
      </div>
    </div>
  );
};

export { Banks };
