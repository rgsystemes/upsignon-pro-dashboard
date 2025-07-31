import React from 'react';
import { bankUrlFetch } from '../../helpers/urlFetch';
import { i18n } from '../../i18n/i18n';
import { isRestrictedSuperadmin } from '../../helpers/isRestrictedSuperadmin';

export class EmailConfig extends React.Component {
  state = {
    emailHost: '',
    emailPort: '',
    emailUser: '',
    emailPass: '',
    emailSendingAddress: '',
    emailAllowInvalidCertificate: false,
    usePostfix: true,
  };
  testingEmailInputRef = null;

  fetchEmailConfig = async () => {
    try {
      const settings = await bankUrlFetch('/api/get-setting', 'POST', { key: 'EMAIL_CONFIG' });
      this.setState({
        emailHost: settings.EMAIL_CONFIG?.EMAIL_HOST || '',
        emailPort: settings.EMAIL_CONFIG?.EMAIL_PORT || '',
        emailUser: settings.EMAIL_CONFIG?.EMAIL_USER || '',
        emailPass: settings.EMAIL_CONFIG?.EMAIL_PASS || '',
        emailSendingAddress: settings.EMAIL_CONFIG?.EMAIL_SENDING_ADDRESS || '',
        emailAllowInvalidCertificate: settings.EMAIL_CONFIG?.EMAIL_ALLOW_INVALID_CERTIFICATE,
        usePostfix: !!settings.usePostfix,
      });
    } catch (e) {
      console.error(e);
    }
  };
  componentDidMount() {
    this.fetchEmailConfig();
  }

  submitNewEmailConfig = async (event) => {
    try {
      event.preventDefault();
      this.props.setIsLoading(true);
      const emailConfig = {
        EMAIL_HOST: this.state.emailHost,
        EMAIL_PORT: this.state.emailPort,
        EMAIL_USER: this.state.emailUser,
        EMAIL_PASS: this.state.emailPass,
        EMAIL_SENDING_ADDRESS: this.state.emailSendingAddress,
        EMAIL_ALLOW_INVALID_CERTIFICATE: this.state.emailAllowInvalidCertificate,
      };
      await bankUrlFetch('/api/update-setting', 'POST', {
        key: 'EMAIL_CONFIG',
        value: emailConfig,
      });
    } catch (e) {
      console.error(e);
    } finally {
      this.props.setIsLoading(false);
    }
  };

  testEmailSending = async (event) => {
    try {
      event.preventDefault();
      this.props.setIsLoading(true);
      await bankUrlFetch(`/api/test-email?email=${this.testingEmailInputRef.value}`, 'GET');
      alert(i18n.t('sasettings_email_config_testing_alert'));
    } catch (e) {
      console.log(e);
      alert(i18n.t('sasettings_email_config_testing_error_alert', { e }));
    } finally {
      this.props.setIsLoading(false);
    }
  };

  render() {
    return (
      <div>
        <h2>{i18n.t('sasettings_email_config')}</h2>
        {this.state.usePostfix && (
          <div>
            <div>{i18n.t('sasettings_email_config_use_postfix')}</div>
            <div>{i18n.t('sasettings_email_config_use_postfix_check_deliverability')}</div>
            <a href="https://mail-tester.com">https://mail-tester.com</a>
          </div>
        )}
        {!this.state.usePostfix && (
          <form
            onSubmit={this.submitNewEmailConfig}
            className={`${isRestrictedSuperadmin ? 'disabledUI' : ''}`}
          >
            <label htmlFor="emailHost">{i18n.t('sasettings_email_config_label_host')}</label>
            <br />
            <input
              name="emailHost"
              type="text"
              autoComplete="off"
              onChange={(v) => {
                this.setState({ emailHost: v.target.value });
              }}
              value={this.state.emailHost}
              placeholder="smtp.ionos.fr"
              style={{ minWidth: 300, marginBottom: 15 }}
            />

            <br />
            <label htmlFor="emailPort">{i18n.t('sasettings_email_config_label_port')}</label>
            <br />
            <input
              name="emailPort"
              type="text"
              autoComplete="off"
              onChange={(v) => {
                this.setState({
                  emailPort: !!v.target.value ? Number.parseInt(v.target.value) : '',
                });
              }}
              value={this.state.emailPort}
              placeholder="587"
              style={{ minWidth: 300, marginBottom: 15 }}
            />

            <br />
            <label htmlFor="emailUser">{i18n.t('sasettings_email_config_label_user')}</label>
            <br />
            <input
              name="emailUser"
              type="text"
              autoComplete="off"
              onChange={(v) => {
                this.setState({ emailUser: v.target.value });
              }}
              value={this.state.emailUser}
              placeholder="ne-pas-repondre@domaine.fr"
              style={{ minWidth: 300, marginBottom: 15 }}
            />

            <br />
            <label htmlFor="emailPass">{i18n.t('sasettings_email_config_label_pass')}</label>
            <br />
            <input
              name="emailPass"
              type="password"
              autoComplete="off"
              onChange={(v) => {
                this.setState({ emailPass: v.target.value });
              }}
              value={this.state.emailPass}
              style={{ minWidth: 300, marginBottom: 15 }}
            />

            <br />
            <label htmlFor="emailSendingAddress">
              {i18n.t('sasettings_email_config_label_sending_address')}
            </label>
            <br />
            <input
              name="emailSendingAddress"
              type="text"
              autoComplete="off"
              onChange={(v) => {
                this.setState({ emailSendingAddress: v.target.value });
              }}
              value={this.state.emailSendingAddress}
              style={{ minWidth: 300, marginBottom: 15 }}
            />

            <br />
            <input
              name="emailAllowInvalidCertificate"
              type="checkbox"
              autoComplete="off"
              onChange={(v) => {
                this.setState({ emailAllowInvalidCertificate: v.target.checked });
              }}
              checked={this.state.emailAllowInvalidCertificate}
              style={{ marginRight: 15 }}
            />
            <label htmlFor="emailAllowInvalidCertificate">
              {i18n.t('sasettings_email_config_label_allow_invalid_certificate')}
            </label>

            <br />
            <input
              style={{ marginTop: 15 }}
              type="submit"
              value={i18n.t('sasettings_email_config_apply_config')}
            />
          </form>
        )}
        <div style={{ fontWeight: 'bold', marginTop: 20 }}>
          {i18n.t('sasettings_email_config_testing')}
        </div>
        <form
          onSubmit={this.testEmailSending}
          className={`${isRestrictedSuperadmin ? 'disabledUI' : ''}`}
        >
          <input
            type="text"
            placeholder="prenom.nom@domaine.fr"
            autoComplete="off"
            ref={(r) => {
              this.testingEmailInputRef = r;
            }}
            required
            style={{ minWidth: 300, marginRight: 15 }}
          />
          <input type="submit" value={i18n.t('sasettings_email_config_testing_button')} />
        </form>
      </div>
    );
  }
}
