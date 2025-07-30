import React from 'react';
import { EditableCell } from '../../helpers/EditableCell';
import { bankUrlFetch } from '../../helpers/urlFetch';
import { i18n } from '../../i18n/i18n';
import { autolockDelaySettings, settingsConfig } from '../../helpers/settingsConfig';
import { isReadOnlySuperadmin } from '../../helpers/isReadOnlySuperadmin';

// Props : setIsLoading
class OtherSettings extends React.Component {
  state = {
    name: '',
    settings: {},
  };
  newInputRef = null;

  fetchBankSettings = async () => {
    try {
      this.props.setIsLoading(true);
      const res = await bankUrlFetch('/api/bank-settings', 'GET', null);
      this.setState(res);
    } catch (e) {
      console.error(e);
    } finally {
      this.props.setIsLoading(false);
    }
  };
  updateBankSetting = async (newSettings, newName) => {
    try {
      this.props.setIsLoading(true);
      await bankUrlFetch('/api/bank-settings-update', 'POST', {
        settings: {
          ...this.state.settings,
          ...newSettings,
        },
        name: newName,
      });
      await this.fetchBankSettings();
    } catch (e) {
      console.error(e);
    } finally {
      this.props.setIsLoading(false);
    }
  };

  componentDidMount() {
    this.fetchBankSettings();
  }
  render() {
    return (
      <div style={{ marginTop: 20 }}>
        <h2>{i18n.t('settings_bank_settings')}</h2>
        <table className={isReadOnlySuperadmin ? 'disabledUI' : null}>
          <tbody>
            <tr>
              <td>{i18n.t('sasettings_bank_name')}</td>
              <EditableCell
                value={this.state.name}
                onChange={(newVal) => {
                  if (!newVal) return;
                  this.updateBankSetting(null, newVal);
                }}
              />
            </tr>
            {Object.keys(settingsConfig).map((k) => (
              <SettingTableRow
                key={k}
                settingNameInDB={k}
                stateSettings={this.state.settings}
                toggleValue={this.updateBankSetting}
              />
            ))}
            {Object.keys(autolockDelaySettings).map((k) => (
              <AutolockDelaySettingTableRow
                key={k}
                settingNameInDB={k}
                stateSettings={this.state.settings}
                toggleValue={this.updateBankSetting}
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
      <td>{i18n.t(settingConf.banksTitle)}</td>
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

const AutolockDelaySettingTableRow = (props) => {
  const { settingNameInDB, toggleValue, stateSettings } = props;
  const settingConf = autolockDelaySettings[settingNameInDB];
  const resValue = stateSettings?.[settingNameInDB] ?? -1;

  let maxDuration = null;
  if (settingConf.maxSettingKey != null) {
    maxDuration =
      stateSettings?.[settingConf.maxSettingKey] == null
        ? autolockDelaySettings[settingConf.maxSettingKey].recommendedOption
        : stateSettings?.[settingConf.maxSettingKey];
  }
  let defaultSettingDuration = null;
  if (settingConf.defaultSettingKey != null) {
    defaultSettingDuration =
      stateSettings?.[settingConf.defaultSettingKey] == null
        ? autolockDelaySettings[settingConf.defaultSettingKey].recommendedOption
        : stateSettings?.[settingConf.defaultSettingKey];
  }

  return (
    <tr>
      <td>{i18n.t(settingConf.banksTitle)}</td>
      <td>
        <select
          onChange={(ev) => {
            toggleValue(
              settingConf.defaultSettingKey != null
                ? {
                    ...stateSettings,
                    [settingNameInDB]: Number.parseInt(ev.target.value),
                    [settingConf.defaultSettingKey]: Math.min(
                      Number.parseInt(ev.target.value),
                      defaultSettingDuration,
                    ),
                  }
                : {
                    ...stateSettings,
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
      </td>
    </tr>
  );
};

export { OtherSettings };
