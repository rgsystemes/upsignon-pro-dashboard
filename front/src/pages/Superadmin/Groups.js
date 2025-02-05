import React from 'react';
import { EditableCell } from '../../helpers/EditableCell';
import { baseFrontUrl } from '../../helpers/env';
import { autolockDelaySettings, settingsConfig } from '../../helpers/settingsConfig';
import { groupUrlFetch } from '../../helpers/urlFetch';
import { i18n } from '../../i18n/i18n';

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
  };
  newInputRef = null;

  insertGroup = async () => {
    try {
      this.props.setIsLoading(true);
      const newGroup = this.newInputRef.value;
      if (!newGroup) {
        this.newInputRef.style.borderColor = 'red';
        return;
      } else {
        this.newInputRef.style.borderColor = null;
      }
      await groupUrlFetch('/api/insert-group', 'POST', { name: newGroup });
      await this.props.fetchGroups();
      this.newInputRef.value = null;
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
    return (
      <div style={{ marginTop: 50 }}>
        <h2>{i18n.t('sasettings_groups')}</h2>
        <p>{i18n.t('sasettings_groups_explanation')}</p>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <input
            ref={(r) => {
              this.newInputRef = r;
            }}
            placeholder={i18n.t('sasettings_group_name')}
            style={{ width: 300 }}
          />
          <div className="action" style={{ marginLeft: 10 }} onClick={this.insertGroup}>
            {i18n.t('add')}
          </div>
        </div>
        <div>{i18n.t('sasettings_group_name_change_warning')}</div>
        {this.props.groups.length > 0 && (
          <table>
            <thead>
              <tr>
                <th></th>
                <th>{i18n.t('sasettings_group_id')}</th>
                <th>{i18n.t('sasettings_group_name')}</th>
                <th>{i18n.t('sasettings_nb_users')}</th>
                <th>{i18n.t('sasettings_nb_licences_sold')}</th>
                <th>{i18n.t('sasettings_group_created_at')}</th>
                <th>{i18n.t('sasettings_group_is_testing')}</th>
                <th>{i18n.t('sasettings_group_test_expires_at')}</th>
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
              {this.props.groups.map((group) => {
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
                <td>{this.props.groups.reduce((r, g) => r + parseInt(g.nb_users), 0)}</td>
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
