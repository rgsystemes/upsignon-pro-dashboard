import React from 'react';
import { EditableCell } from '../../helpers/EditableCell';
import { groupUrlFetch } from '../../helpers/urlFetch';
import { i18n } from '../../i18n/i18n';
import { baseFrontUrl } from '../../helpers/env';

// eslint-disable-next-line no-extend-native
Date.prototype.addWeeks = function (w) {
  this.setTime(this.getTime() + w * 7 * 24 * 60 * 60 * 1000);
  return this;
};

// Props : setIsLoading, groups, fetchGroups
class Groups extends React.Component {
  state = {
    groupToDeleteId: null,
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
        settings: JSON.stringify(newSettings),
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
                <th>{i18n.t('sasettings_group_name')}</th>
                <th>{i18n.t('sasettings_nb_users')}</th>
                <th>{i18n.t('sasettings_nb_licences_sold')}</th>
                <th>{i18n.t('sasettings_group_created_at')}</th>
                <th>{i18n.t('sasettings_group_is_testing')}</th>
                <th>{i18n.t('sasettings_group_test_expires_at')}</th>
                <th>{i18n.t('settings_group_settings')}</th>
                <th>{i18n.t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {this.props.groups.map((group) => {
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
                        if (!newVal) return;
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
                      <InlineSetting
                        group={group}
                        title={i18n.t('sasettings_reset_pwd_admin_check')}
                        settingNameInDB="DISABLE_MANUAL_VALIDATION_FOR_PASSWORD_FORGOTTEN"
                        toggleGroupSetting={this.toggleGroupSetting}
                      />
                      <InlineSetting
                        group={group}
                        title={i18n.t('sasettings_offline_default_desktop')}
                        settingNameInDB="DISABLE_OFFLINE_MODE_DEFAULT_DESKTOP"
                        toggleGroupSetting={this.toggleGroupSetting}
                      />
                      <InlineSetting
                        group={group}
                        title={i18n.t('sasettings_offline_default_smartphone')}
                        settingNameInDB="DISABLE_OFFLINE_MODE_DEFAULT_SMARTPHONE"
                        toggleGroupSetting={this.toggleGroupSetting}
                      />
                      <InlineSetting
                        group={group}
                        title={i18n.t('sasettings_export_allowed_default')}
                        settingNameInDB="DISABLE_CSV_EXPORT"
                        toggleGroupSetting={this.toggleGroupSetting}
                      />
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
              </tr>
            </tbody>
          </table>
        )}
      </div>
    );
  }
}

const InlineSetting = (props) => {
  const { group, title, settingNameInDB, toggleGroupSetting } = props;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ marginBottom: 5, fontSize: '0.5em' }}>{title}</div>
      {group.settings?.[settingNameInDB] === true && (
        <span className="unrecommendedParam">{i18n.t('no')}</span>
      )}
      {!group.settings?.[settingNameInDB] && (
        <span className="recommendedParam">{i18n.t('yes')}</span>
      )}
      <span
        className="action"
        onClick={() => {
          toggleGroupSetting(group.id, {
            ...group.settings,
            [settingNameInDB]: !group.settings?.[settingNameInDB],
          });
        }}
      >
        {i18n.t('settings_change')}
      </span>
    </div>
  );
};

export { Groups };
