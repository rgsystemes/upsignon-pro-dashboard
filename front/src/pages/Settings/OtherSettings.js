import React from 'react';
import { EditableCell } from '../../helpers/EditableCell';
import { groupUrlFetch } from '../../helpers/urlFetch';
import { i18n } from '../../i18n/i18n';

// Props : setIsLoading
class OtherSettings extends React.Component {
  state = {
    name: '',
    settings: {
      DISABLE_MANUAL_VALIDATION_FOR_PASSWORD_FORGOTTEN: false,
    },
  };
  newInputRef = null;

  fetchGroupSettings = async () => {
    try {
      this.props.setIsLoading(true);
      const res = await groupUrlFetch('/api/group-settings', 'GET', null);
      this.setState(res);
    } catch (e) {
      console.error(e);
    } finally {
      this.props.setIsLoading(false);
    }
  };
  updateGroupSetting = async (newSettings, newName) => {
    try {
      this.props.setIsLoading(true);
      await groupUrlFetch('/api/group-settings-update', 'POST', {
        settings: newSettings,
        name: newName,
      });
      await this.fetchGroupSettings();
    } catch (e) {
      console.error(e);
    } finally {
      this.props.setIsLoading(false);
    }
  };

  componentDidMount() {
    this.fetchGroupSettings();
  }
  render() {
    return (
      <div style={{ marginTop: 50 }}>
        <h2>{i18n.t('settings_group_settings')}</h2>
        <div>{i18n.t('sasettings_group_name_change_warning')}</div>
        <table>
          <tbody>
            <tr>
              <td>{i18n.t('sasettings_group_name')}</td>
              <EditableCell
                value={this.state.name}
                onChange={(newVal) => {
                  if (!newVal) return;
                  this.updateGroupSetting(null, newVal);
                }}
              />
            </tr>
            <SettingTableRow
              title={i18n.t('sasettings_reset_pwd_admin_check')}
              settingNameInDB="DISABLE_MANUAL_VALIDATION_FOR_PASSWORD_FORGOTTEN"
              value={this.state.settings?.DISABLE_MANUAL_VALIDATION_FOR_PASSWORD_FORGOTTEN}
              toggleValue={this.updateGroupSetting}
            />
            <SettingTableRow
              title={i18n.t('sasettings_offline_default_desktop')}
              settingNameInDB="DISABLE_OFFLINE_MODE_DEFAULT_DESKTOP"
              value={this.state.settings?.DISABLE_OFFLINE_MODE_DEFAULT_DESKTOP}
              toggleValue={this.updateGroupSetting}
            />
            <SettingTableRow
              title={i18n.t('sasettings_offline_default_smartphone')}
              settingNameInDB="DISABLE_OFFLINE_MODE_DEFAULT_SMARTPHONE"
              value={this.state.settings?.DISABLE_OFFLINE_MODE_DEFAULT_SMARTPHONE}
              toggleValue={this.updateGroupSetting}
            />
            <SettingTableRow
              title={i18n.t('sasettings_export_allowed_default')}
              settingNameInDB="DISABLE_CSV_EXPORT"
              value={this.state.settings?.DISABLE_CSV_EXPORT}
              toggleValue={this.updateGroupSetting}
            />
          </tbody>
        </table>
      </div>
    );
  }
}

const SettingTableRow = (props) => {
  const { title, settingNameInDB, value, toggleValue } = props;
  return (
    <tr>
      <td>{title}</td>
      <td>
        {value === true && <span className="unrecommendedParam">{i18n.t('no')}</span>}
        {!value && <span className="recommendedParam">{i18n.t('yes')}</span>}
        <span
          className="action"
          onClick={() => {
            toggleValue(
              {
                ...this.state.settings,
                [settingNameInDB]: !value,
              },
              null,
            );
          }}
        >
          {i18n.t('settings_change')}
        </span>
      </td>
    </tr>
  );
};

export { OtherSettings };
