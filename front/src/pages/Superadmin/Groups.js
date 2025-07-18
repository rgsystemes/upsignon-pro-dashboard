import React from 'react';
import { EditableCell } from '../../helpers/EditableCell';
import { Toggler } from '../../helpers/Toggler';
import { baseFrontUrl } from '../../helpers/env';
import { autolockDelaySettings, settingsConfig } from '../../helpers/settingsConfig';
import { groupUrlFetch } from '../../helpers/urlFetch';
import { i18n } from '../../i18n/i18n';
import './Groups.css';

// eslint-disable-next-line no-extend-native
Date.prototype.addWeeks = function (w) {
  this.setTime(this.getTime() + w * 7 * 24 * 60 * 60 * 1000);
  return this;
};

// Props : setIsLoading, groups, fetchGroups
class Groups extends React.Component {
  state = {
    groupToDeleteId: null,
    showAllSettings: false,
    showGroupSettings: {},
    filterType: 0, // 0: all, 1: testing only
    sortType: 0, // 0: name, 1: reseller, 2: expiration date
    sortDirection: 'asc', // 'asc' or 'desc'
    salesRepFilter: localStorage.getItem('groupsSalesRepFilter') || '', // Filter by sales rep name
  };
  newBankNameInputRef = null;
  newAdminEmailInputRef = null;
  isTestingCheckboxRef = null;
  salesEmailRef = null;

  insertGroup = async () => {
    try {
      this.props.setIsLoading(true);
      const newBankName = this.newBankNameInputRef.value;
      const newAdminEmail = this.newAdminEmailInputRef.value;
      const isTrial = this.isTestingCheckboxRef.checked;
      const salesEmail = this.salesEmailRef.value;
      if (!newBankName) {
        this.newBankNameInputRef.style.borderColor = 'red';
        return;
      } else {
        this.newBankNameInputRef.style.borderColor = null;
      }
      if (!newAdminEmail) {
        this.newAdminEmailInputRef.style.borderColor = 'red';
        return;
      } else {
        this.newAdminEmailInputRef.style.borderColor = null;
      }
      if (salesEmail) {
        localStorage.setItem('newBankSalesEmail', salesEmail);
      }
      await groupUrlFetch('/api/insert-group', 'POST', {
        name: newBankName,
        adminEmail: newAdminEmail,
        isTrial,
        salesEmail,
      });
      await this.props.fetchGroups();
      this.newBankNameInputRef.value = null;
      this.newAdminEmailInputRef.value = null;
      this.isTestingCheckboxRef.checked = true;
      window.alert(i18n.t('sasettings_new_bank_form_success'));
    } catch (e) {
      console.error(e);
    } finally {
      this.props.setIsLoading(false);
    }
  };
  updateGroupName = async (groupId, newName) => {
    try {
      this.props.setIsLoading(true);
      await groupUrlFetch('/api/update-group', 'POST', {
        name: newName,
        id: groupId,
      });
      await this.props.fetchGroups();
    } catch (e) {
      console.error(e);
    } finally {
      this.props.setIsLoading(false);
    }
  };
  updateNbLicences = async (groupId, newNb) => {
    try {
      this.props.setIsLoading(true);
      await groupUrlFetch('/api/update-group', 'POST', {
        nb_licences_sold: parseInt(newNb),
        id: groupId,
      });
      await this.props.fetchGroups();
    } catch (e) {
      console.error(e);
    } finally {
      this.props.setIsLoading(false);
    }
  };
  toggleGroupSetting = async (groupId, newSettings) => {
    try {
      this.props.setIsLoading(true);
      await groupUrlFetch('/api/update-group', 'POST', {
        id: groupId,
        settings: newSettings,
      });
      await this.props.fetchGroups();
    } catch (e) {
      console.error(e);
    } finally {
      this.props.setIsLoading(false);
    }
  };
  deleteGroup = async (id) => {
    try {
      this.props.setIsLoading(true);
      await groupUrlFetch(`/api/delete-group/${id}`, 'POST', null);
      await this.props.fetchGroups();
    } catch (e) {
      console.error(e);
    } finally {
      this.props.setIsLoading(false);
    }
  };
  toggleAllSettings = () => {
    this.setState((s) => {
      if (s.showAllSettings) {
        return { ...s, showAllSettings: false, showGroupSettings: {} };
      }
      return { ...s, showAllSettings: true };
    });
  };
  toggleShowGroupSettings = (groupId) => {
    this.setState((s) => {
      return { ...s, showGroupSettings: { [groupId]: !s.showGroupSettings[groupId] } };
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
    localStorage.setItem('groupsSalesRepFilter', value);
  };

  render() {
    const groupToDelete = this.props.groups.find((g) => g.id === this.state.groupToDeleteId);
    if (groupToDelete) {
      return (
        <div style={{ marginTop: 50 }}>
          <h2>{i18n.t('sasettings_groups')}</h2>
          <div style={{ border: '5px solid red', padding: 20 }}>
            <h3>{i18n.t('sasettings_group_delete_warning')}</h3>
            <div style={{ marginBottom: 10 }}>
              {i18n.t('sasetting_confirm_group_delete', {
                name: groupToDelete.name,
              })}
            </div>
            <input ref={(r) => (this.deleteGroupInputRef = r)} />
            <div
              className="danger-button"
              style={{ marginLeft: 20 }}
              onClick={() => {
                if (this.deleteGroupInputRef.value === groupToDelete.name) {
                  this.deleteGroup(groupToDelete.id);
                } else {
                  this.deleteGroupInputRef.style.borderColor = 'red';
                }
              }}
            >
              {i18n.t('validate')}
            </div>
            <div
              className="button"
              style={{ marginLeft: 20 }}
              onClick={() => this.setState({ groupToDeleteId: null })}
            >
              {i18n.t('cancel')}
            </div>
          </div>
        </div>
      );
    }

    const filteredBanks = this.props.groups
      .filter((group) => {
        // Filter by type (all or testing only)
        const typeFilter = this.state.filterType === 0 || group.settings?.IS_TESTING;

        // Filter by sales rep
        const salesRepFilter =
          !this.state.salesRepFilter ||
          (group.settings?.SALES_REP || '')
            .toLowerCase()
            .includes(this.state.salesRepFilter.toLowerCase());

        return typeFilter && salesRepFilter;
      })
      .sort((a, b) => {
        let comparison = 0;

        switch (this.state.sortType) {
          case 1: // Sort by reseller
            const resellerA = (a.settings?.RESELLER || '').toLowerCase();
            const resellerB = (b.settings?.RESELLER || '').toLowerCase();
            comparison = resellerA.localeCompare(resellerB);
            break;

          case 2: // Sort by expiration date/days remaining
            const getExpirationValue = (group) => {
              if (!group.settings?.IS_TESTING || !group.settings?.TESTING_EXPIRATION_DATE) {
                return Infinity; // Non-testing groups go to the end
              }
              const today = new Date();
              const expirationDate = new Date(group.settings.TESTING_EXPIRATION_DATE);
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
      <div style={{ marginTop: 50 }}>
        <h2>{i18n.t('sasettings_groups')}</h2>
        <p>{i18n.t('sasettings_groups_explanation')}</p>
        <div className="newBankForm">
          <div className="newBankFormTitle">{i18n.t('sasettings_new_bank_form_title')}</div>
          <div className="newBankInputContainer">
            <label htmlFor="bankNameInput">{i18n.t('sasettings_new_bank_form_bank_name')}</label>
            <input
              id="bankNameInput"
              ref={(r) => {
                this.newBankNameInputRef = r;
              }}
              placeholder={i18n.t('sasettings_new_bank_form_bank_name')}
            />
          </div>
          <div className="newBankInputContainer">
            <label htmlFor="adminEmailInput">
              {i18n.t('sasettings_new_bank_form_admin_email')}
            </label>
            <input
              id="adminEmailInput"
              ref={(r) => {
                this.newAdminEmailInputRef = r;
              }}
              placeholder={i18n.t('sasettings_new_bank_form_admin_email')}
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
          <div className="action" onClick={this.insertGroup}>
            {i18n.t('add')}
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '30px',
            flexWrap: 'wrap',
            marginBottom: 20,
          }}
        >
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
              placeholder={i18n.t('sasettings_sales_rep_filter_placeholder')}
              value={this.state.salesRepFilter}
              onChange={(e) => this.handleSalesRepFilterChange(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontSize: '14px',
                width: '250px',
              }}
            />
          </div>
        </div>
        {this.props.groups.length > 0 && (
          <table>
            <thead>
              <tr>
                <th></th>
                <th>{i18n.t('sasettings_group_id')}</th>
                <th
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => this.handleSort(1)}
                  title={i18n.t('sasettings_click_to_sort')}
                >
                  {i18n.t('sasettings_group_reseller')}
                  <br />
                  {this.getSortIcon(1)}
                </th>
                <th
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => this.handleSort(0)}
                  title={i18n.t('sasettings_click_to_sort')}
                >
                  {i18n.t('sasettings_group_name')}
                  <br />
                  {this.getSortIcon(0)}
                </th>
                <th>{i18n.t('sasettings_nb_users')}</th>
                <th>{i18n.t('sasettings_nb_licences_sold')}</th>
                <th>{i18n.t('sasettings_group_created_at')}</th>
                <th>{i18n.t('sasettings_group_is_testing')}</th>
                <th>{i18n.t('sasettings_group_test_expires_at')}</th>
                <th
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => this.handleSort(2)}
                  title={i18n.t('sasettings_click_to_sort')}
                >
                  {i18n.t('sasettings_group_test_days_remaining')}
                  <br />
                  {this.getSortIcon(2)}
                </th>
                <th>{i18n.t('sasettings_group_sales_rep')}</th>
                <th>
                  <div>{i18n.t('settings_group_settings')}</div>
                  <div
                    className="action"
                    style={{ color: 'white' }}
                    onClick={this.toggleAllSettings}
                  >
                    {i18n.t('settings_group_settings_toggle_all_settings')}
                  </div>
                </th>
                <th>{i18n.t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredBanks.map((group) => {
                const showSettings =
                  this.state.showAllSettings || this.state.showGroupSettings[group.id];
                return (
                  <tr key={group.id}>
                    <td>
                      <span
                        className="action"
                        onClick={() => {
                          window.location.href = baseFrontUrl + '/' + group.id + '/';
                        }}
                      >
                        {i18n.t('sasettings_group_open')}
                      </span>
                    </td>
                    <td>{group.id}</td>
                    <EditableCell
                      value={group.settings?.RESELLER || ''}
                      onChange={(newVal) => {
                        this.toggleGroupSetting(group.id, {
                          ...group.settings,
                          RESELLER: newVal,
                        });
                      }}
                    />
                    <EditableCell
                      value={group.name}
                      onChange={(newVal) => {
                        if (!newVal) return;
                        this.updateGroupName(group.id, newVal);
                      }}
                    />
                    <td
                      style={
                        group.nb_users > group.nb_licences_sold
                          ? { backgroundColor: 'orange' }
                          : null
                      }
                    >
                      {group.nb_users}
                    </td>
                    <EditableCell
                      type="number"
                      value={group.nb_licences_sold}
                      onChange={(newVal) => {
                        if (newVal == null || newVal < 0) return;
                        this.updateNbLicences(group.id, newVal);
                      }}
                    />
                    <td>{new Date(group.created_at).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <input
                          type="checkbox"
                          checked={group.settings?.IS_TESTING}
                          onChange={() => {
                            this.toggleGroupSetting(group.id, {
                              ...group.settings,
                              IS_TESTING: !group.settings?.IS_TESTING,
                            });
                          }}
                        ></input>
                        &nbsp;{group.settings?.IS_TESTING ? i18n.t('yes') : i18n.t('no')}
                      </div>
                    </td>
                    {group.settings?.IS_TESTING ? (
                      <EditableCell
                        type="date"
                        value={group.settings?.TESTING_EXPIRATION_DATE}
                        style={
                          !group.settings?.TESTING_EXPIRATION_DATE ||
                          new Date(group.settings?.TESTING_EXPIRATION_DATE) < new Date()
                            ? { backgroundColor: 'red', color: 'white' }
                            : null
                        }
                        onChange={(newVal) => {
                          this.toggleGroupSetting(group.id, {
                            ...group.settings,
                            TESTING_EXPIRATION_DATE: newVal,
                          });
                        }}
                      />
                    ) : (
                      <td>N/A</td>
                    )}
                    <td>
                      {group.settings?.IS_TESTING && group.settings?.TESTING_EXPIRATION_DATE
                        ? (() => {
                            const today = new Date();
                            const expirationDate = new Date(group.settings.TESTING_EXPIRATION_DATE);
                            const diffTime = expirationDate - today;
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                            if (diffDays <= 0) {
                              const expiredDays = Math.abs(diffDays);
                              return (
                                <span style={{ color: 'red', fontWeight: 'bold' }}>
                                  {i18n.t('sasettings_group_expired_since', {
                                    days: expiredDays,
                                    s: expiredDays > 1 ? 's' : '',
                                  })}
                                </span>
                              );
                            } else if (diffDays <= 7) {
                              return (
                                <span style={{ color: 'orange', fontWeight: 'bold' }}>
                                  {i18n.t('sasettings_group_days_remaining', {
                                    days: diffDays,
                                    s: diffDays > 1 ? 's' : '',
                                  })}
                                </span>
                              );
                            } else {
                              return (
                                <span>
                                  {i18n.t('sasettings_group_days_remaining', {
                                    days: diffDays,
                                    s: diffDays > 1 ? 's' : '',
                                  })}
                                </span>
                              );
                            }
                          })()
                        : 'N/A'}
                    </td>
                    <EditableCell
                      value={group.settings?.SALES_REP || ''}
                      onChange={(newVal) => {
                        this.toggleGroupSetting(group.id, {
                          ...group.settings,
                          SALES_REP: newVal,
                        });
                      }}
                    />
                    <td style={showSettings ? { width: 400 } : {}}>
                      <div
                        className="action"
                        onClick={() => this.toggleShowGroupSettings(group.id)}
                      >
                        {i18n.t('settings_group_settings_toggle_group_settings')}
                      </div>
                      {showSettings && (
                        <>
                          {Object.keys(settingsConfig).map((k) => (
                            <InlineSetting
                              key={k}
                              group={group}
                              settingNameInDB={k}
                              toggleGroupSetting={this.toggleGroupSetting}
                            />
                          ))}
                          {Object.keys(autolockDelaySettings).map((k) => (
                            <AutolockDelaySetting
                              key={k}
                              group={group}
                              settingNameInDB={k}
                              toggleGroupSetting={this.toggleGroupSetting}
                            />
                          ))}
                        </>
                      )}
                    </td>
                    <td>
                      <div
                        className="action"
                        onClick={() => this.setState({ groupToDeleteId: group.id })}
                      >
                        {i18n.t('delete')}
                      </div>
                    </td>
                  </tr>
                );
              })}
              <tr style={{ backgroundColor: '#eee', fontWeight: 'bold' }}>
                <td>{i18n.t('total')}</td>
                <td></td>
                <td></td>
                <td></td>
                <td>{filteredBanks.reduce((r, g) => r + parseInt(g.nb_users), 0)}</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    );
  }
}

const InlineSetting = (props) => {
  const { group, settingNameInDB, toggleGroupSetting } = props;
  const settingConf = settingsConfig[settingNameInDB];
  const resValue =
    group.settings?.[settingNameInDB] == null
      ? settingConf.recommendedValue
      : group.settings?.[settingNameInDB];
  const isRecommendedValue = resValue === settingConf.recommendedValue;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        borderBottom: '1px solid grey',
      }}
    >
      <div style={{ flex: 1 }}>{i18n.t(settingConf.groupsTitle)}</div>
      <div>
        {isRecommendedValue ? (
          <div className="recommendedParam">
            {i18n.t(settingConf.recommendedValue ? 'yes' : 'no')}
          </div>
        ) : (
          <div className="unrecommendedParam">
            {i18n.t(settingConf.recommendedValue ? 'no' : 'yes')}
          </div>
        )}
        <div
          className="action"
          onClick={() => {
            toggleGroupSetting(group.id, {
              ...group.settings,
              [settingNameInDB]: !resValue,
            });
          }}
        >
          {i18n.t('settings_change')}
        </div>
      </div>
    </div>
  );
};

const AutolockDelaySetting = (props) => {
  const { group, settingNameInDB, toggleGroupSetting } = props;
  const settingConf = autolockDelaySettings[settingNameInDB];
  const resValue = group.settings?.[settingNameInDB] ?? -1;

  let maxDuration = null;
  if (settingConf.maxSettingKey != null) {
    maxDuration =
      group.settings?.[settingConf.maxSettingKey] == null
        ? autolockDelaySettings[settingConf.maxSettingKey].recommendedOption
        : group.settings?.[settingConf.maxSettingKey];
  }
  let defaultSettingDuration = null;
  if (settingConf.defaultSettingKey != null) {
    defaultSettingDuration =
      group.settings?.[settingConf.defaultSettingKey] == null
        ? autolockDelaySettings[settingConf.defaultSettingKey].recommendedOption
        : group.settings?.[settingConf.defaultSettingKey];
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        borderBottom: '1px solid grey',
      }}
    >
      <div style={{ flex: 1 }}>{i18n.t(settingConf.groupsTitle)}</div>
      <div>
        <select
          onChange={(ev) => {
            toggleGroupSetting(
              group.id,
              settingConf.defaultSettingKey != null
                ? {
                    ...group.settings,
                    [settingNameInDB]: Number.parseInt(ev.target.value),
                    [settingConf.defaultSettingKey]: Math.min(
                      Number.parseInt(ev.target.value),
                      defaultSettingDuration,
                    ),
                  }
                : {
                    ...group.settings,
                    [settingNameInDB]: Number.parseInt(ev.target.value),
                  },
            );
          }}
          value={resValue}
          style={{ width: 60 }}
        >
          {/* important to avoid visual incoherence between the default here and the default in the app if this setting is never changed */}
          <option disabled value={-1}></option>
          {settingConf.options.map((op) => {
            return (
              <option
                key={op.seconds}
                value={op.seconds}
                disabled={maxDuration != null && op.seconds > maxDuration}
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

export { Groups };
