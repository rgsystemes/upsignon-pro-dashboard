import React from 'react';
import { EditableCell } from '../../helpers/EditableCell';
import { groupUrlFetch } from '../../helpers/urlFetch';
import { i18n } from '../../i18n/i18n';
import { settingsConfig } from '../../helpers/settingsConfig';

// Props : setIsLoading
class OtherSettings extends React.Component {
  state = {
    name: '',
    settings: {},
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
        settings: {
          ...this.state.settings,
          ...newSettings,
        },
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
            {Object.keys(settingsConfig).map((k) => (
              <SettingTableRow
                settingNameInDB={k}
                stateSettings={this.state.settings}
                toggleValue={this.updateGroupSetting}
              />
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

const SettingTableRow = (props) => {
  const { settingNameInDB, toggleValue, stateSettings } = props;
  const settingConf = settingsConfig[settingNameInDB];
  const resValue =
    stateSettings?.[settingNameInDB] == null
      ? settingConf.recommendedValue
      : stateSettings[settingNameInDB];
  const isRecommendedValue = resValue === settingConf.recommendedValue;
  return (
    <tr>
      <td>{i18n.t(settingConf.groupsTitle)}</td>
      <td>
        {isRecommendedValue ? (
          <span className="recommendedParam">
            {i18n.t(settingConf.recommendedValue ? 'yes' : 'no')}
          </span>
        ) : (
          <span className="unrecommendedParam">
            {i18n.t(settingConf.recommendedValue ? 'no' : 'yes')}
          </span>
        )}
        <span
          className="action"
          onClick={() => {
            toggleValue({ [settingNameInDB]: !resValue });
          }}
        >
          {i18n.t('settings_change')}
        </span>
      </td>
    </tr>
  );
};

export { OtherSettings };
