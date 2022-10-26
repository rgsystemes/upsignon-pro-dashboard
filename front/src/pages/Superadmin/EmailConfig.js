import React from 'react';
import { groupUrlFetch } from '../../helpers/urlFetch';
import { i18n } from '../../i18n/i18n';

export class EmailConfig extends React.Component {
  emailHostInputRef = null;
  emailPortInputRef = null;
  emailUserInputRef = null;
  emailPassInputRef = null;
  emailSendingAddressInputRef = null;
  emailAllowInvalidCertificateInputRef = null;
  testingEmailInputRef = null;

  fetchEmailConfig = async () => {
    try {
      const settings = await groupUrlFetch('/api/get-setting', 'POST', { key: 'EMAIL_CONFIG' });
      if (settings.EMAIL_CONFIG) {
        this.emailHostInputRef.value = settings.EMAIL_CONFIG.EMAIL_HOST || '';
        this.emailPortInputRef.value = settings.EMAIL_CONFIG.EMAIL_PORT || '';
        this.emailUserInputRef.value = settings.EMAIL_CONFIG.EMAIL_USER || '';
        this.emailPassInputRef.value = settings.EMAIL_CONFIG.EMAIL_PASS || '';
        this.emailSendingAddressInputRef.value = settings.EMAIL_CONFIG.EMAIL_SENDING_ADDRESS || '';
        this.emailAllowInvalidCertificateInputRef.checked =
          settings.EMAIL_CONFIG.EMAIL_ALLOW_INVALID_CERTIFICATE;
      }
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
        EMAIL_HOST: this.emailHostInputRef.value,
        EMAIL_PORT: Number.parseInt(this.emailPortInputRef.value),
        EMAIL_USER: this.emailUserInputRef.value,
        EMAIL_PASS: this.emailPassInputRef.value,
        EMAIL_SENDING_ADDRESS: this.emailSendingAddressInputRef.value,
        EMAIL_ALLOW_INVALID_CERTIFICATE: this.emailAllowInvalidCertificateInputRef.checked,
      };
      await groupUrlFetch('/api/update-setting', 'POST', {
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
      await groupUrlFetch(`/api/test-email?email=${this.testingEmailInputRef.value}`, 'GET');
      alert(i18n.t('sasettings_email_config_testing_alert'));
    } catch (e) {
      console.log(e);
      alert(i18n.t('sasettings_email_config_testing_error_alert', {e}));
    } finally {
      this.props.setIsLoading(false);
    }
  };

  render() {
    return (
      <div>
        <h2>{i18n.t('sasettings_email_config')}</h2>
        <form onSubmit={this.submitNewEmailConfig}>
          <label htmlFor="emailHost">{i18n.t('sasettings_email_config_label_host')}</label>
          <br />
          <input
            name="emailHost"
            type="text"
            autoComplete="off"
            ref={(r) => {
              this.emailHostInputRef = r;
            }}
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
            ref={(r) => {
              this.emailPortInputRef = r;
            }}
            placeholder="465"
            style={{ minWidth: 300, marginBottom: 15 }}
          />

          <br />
          <label htmlFor="emailUser">{i18n.t('sasettings_email_config_label_user')}</label>
          <br />
          <input
            name="emailUser"
            type="text"
            autoComplete="off"
            ref={(r) => {
              this.emailUserInputRef = r;
            }}
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
            ref={(r) => {
              this.emailPassInputRef = r;
            }}
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
            ref={(r) => {
              this.emailSendingAddressInputRef = r;
            }}
            style={{ minWidth: 300, marginBottom: 15 }}
          />

          <br />
          <input
            name="emailAllowInvalidCertificate"
            type="checkbox"
            autoComplete="off"
            ref={(r) => {
              this.emailAllowInvalidCertificateInputRef = r;
            }}
            style={{ marginRight: 15 }}
          />
          <label htmlFor="emailAllowInvalidCertificate">
            {i18n.t('sasettings_email_config_label_allow_invalid_certificate')}
          </label>

          <br />
          <input style={{ marginTop: 15 }} type="submit" value="Appliquer la configuration" />
        </form>
        <div style={{ fontWeight: 'bold', marginTop: 20 }}>
          {i18n.t('sasettings_email_config_testing')}
        </div>
        <form onSubmit={this.testEmailSending}>
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
