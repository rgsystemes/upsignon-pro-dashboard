import React from 'react';
import { fetchTemplate } from '../../helpers/fetchTemplate';
import { i18n } from '../../i18n/i18n';

// Props = setIsLoading
class SecuritySettings extends React.Component {
  state = {
    settingPwdResetSkipAdminCheck: null,
  };

  fetchSettings = async () => {
    try {
      const settings = await fetchTemplate('/api/settings', 'GET', null);
      this.setState({
        settingPwdResetSkipAdminCheck: settings.DISABLE_MANUAL_VALIDATION_FOR_PASSWORD_FORGOTTEN,
      });
    } catch (e) {
      console.error(e);
    }
  };
  updateSettings = async (key, newValue) => {
    try {
      this.props.setIsLoading(true);
      if (key === 'settingPwdResetSkipAdminCheck') {
        await fetchTemplate('/api/setting', 'POST', {
          key: 'DISABLE_MANUAL_VALIDATION_FOR_PASSWORD_FORGOTTEN',
          value: newValue,
        });
        await this.fetchSettings();
      }
    } catch (e) {
      console.error(e);
    } finally {
      this.props.setIsLoading(false);
    }
  };
  componentDidMount() {
    this.fetchSettings();
  }
  render() {
    return (
      <div>
        <h2>{i18n.t('settings_security')}</h2>
        <span>
          <span>{i18n.t('settings_reset_pwd_admin_check')}</span>
          {this.state.settingPwdResetSkipAdminCheck === true && (
            <span className="unrecommendedParam">{i18n.t('no')}</span>
          )}
          {this.state.settingPwdResetSkipAdminCheck === false && (
            <span className="recommendedParam">{i18n.t('yes')}</span>
          )}
        </span>
        <span
          className="action"
          onClick={() => {
            this.updateSettings(
              'settingPwdResetSkipAdminCheck',
              !this.state.settingPwdResetSkipAdminCheck,
            );
          }}
        >
          {i18n.t('settings_change')}
        </span>
      </div>
    );
  }
}

export { SecuritySettings };
