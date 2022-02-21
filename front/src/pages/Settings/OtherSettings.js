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
            <tr>
              <td>{i18n.t('sasettings_reset_pwd_admin_check')}</td>
              <td>
                {this.state.settings.DISABLE_MANUAL_VALIDATION_FOR_PASSWORD_FORGOTTEN === true && (
                  <span className="unrecommendedParam">{i18n.t('no')}</span>
                )}
                {!this.state.settings.DISABLE_MANUAL_VALIDATION_FOR_PASSWORD_FORGOTTEN && (
                  <span className="recommendedParam">{i18n.t('yes')}</span>
                )}
                <span
                  className="action"
                  onClick={() => {
                    this.updateGroupSetting(
                      {
                        ...this.state.settings,
                        DISABLE_MANUAL_VALIDATION_FOR_PASSWORD_FORGOTTEN:
                          !this.state.settings.DISABLE_MANUAL_VALIDATION_FOR_PASSWORD_FORGOTTEN,
                      },
                      null,
                    );
                  }}
                >
                  {i18n.t('settings_change')}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

export { OtherSettings };
