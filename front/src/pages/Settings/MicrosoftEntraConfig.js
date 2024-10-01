import React from 'react';
import { groupUrlFetch } from '../../helpers/urlFetch';
import { i18n } from '../../i18n/i18n';

export class MicrosoftEntraConfig extends React.Component {
  state = {
    tenantId: '',
    clientId: '',
    clientSecret: '',
    appResourceId: '',
    testResult: null,
  };
  testingEmailInputRef = null;

  fetchMSEntraConfig = async () => {
    try {
      const entraConfig = await groupUrlFetch('/api/group-entra-config', 'GET', null);
      if (entraConfig) {
        this.setState({
          tenantId: entraConfig.tenantId || '',
          clientId: entraConfig.clientId || '',
          clientSecret: entraConfig.clientSecret || '',
          appResourceId: entraConfig.appResourceId || '',
        });
      }
    } catch (e) {
      console.error(e);
    }
  };
  componentDidMount() {
    this.fetchMSEntraConfig();
  }

  submitNewEntraConfig = async (event) => {
    try {
      event.preventDefault();
      this.props.setIsLoading(true);
      const entraConfig = {
        tenantId: this.state.tenantId,
        clientId: this.state.clientId,
        clientSecret: this.state.clientSecret,
        appResourceId: this.state.appResourceId,
      };
      await groupUrlFetch('/api/group-settings-update', 'POST', {
        msEntraConfig: entraConfig,
      });
    } catch (e) {
      console.error(e);
    } finally {
      this.props.setIsLoading(false);
    }
  };

  testConfigWithEmail = async (event) => {
    try {
      event.preventDefault();
      this.props.setIsLoading(true);
      this.setState({ testResult: null });
      const testRes = await groupUrlFetch('/api/test-ms-entra', 'POST', {
        email: this.testingEmailInputRef.value,
      });
      console.log(testRes);
      this.setState({ testResult: testRes });
    } catch (e) {
      console.error(e);
      alert(i18n.t('group_setting_microsoft_entra_test_error', { e }));
    } finally {
      this.props.setIsLoading(false);
    }
  };

  render() {
    return (
      <div style={{ marginTop: 50 }}>
        <h2>{i18n.t('group_setting_microsoft_entra_title')}</h2>
        <p>{i18n.t('group_setting_microsoft_entra_pitch')}</p>
        <p>
          {i18n.t('group_setting_microsoft_entra_authorizations')}
          <ul>
            <li>User.Read.All</li>
            <li>AppRoleAssignment.ReadWrite.All</li>
            <li>GroupMember.Read.All</li>
          </ul>
          {i18n.t('or')}
          <ul>
            <li>Directory.Read.All</li>
          </ul>
        </p>
        <form onSubmit={this.submitNewEntraConfig}>
          <label htmlFor="tenantId">
            {i18n.t('group_setting_microsoft_entra_tenant_id_label')}
          </label>
          <br />
          <input
            id="tenantId"
            name="tenantId"
            type="text"
            autoComplete="off"
            onChange={(v) => {
              this.setState({ tenantId: v.target.value });
            }}
            value={this.state.tenantId}
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxx"
            style={{ minWidth: 350, marginBottom: 15 }}
          />

          <br />
          <label htmlFor="clientId">
            {i18n.t('group_setting_microsoft_entra_client_id_label')}
          </label>
          <br />
          <input
            id="clientId"
            name="clientId"
            type="text"
            autoComplete="off"
            onChange={(v) => {
              this.setState({ clientId: v.target.value });
            }}
            value={this.state.clientId}
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxx"
            style={{ minWidth: 350, marginBottom: 15 }}
          />

          <br />
          <label htmlFor="appResourceId">
            {i18n.t('group_setting_microsoft_entra_app_resource_id_label')}
          </label>
          <br />
          <input
            id="appResourceId"
            name="appResourceId"
            type="text"
            autoComplete="off"
            onChange={(v) => {
              this.setState({ appResourceId: v.target.value });
            }}
            value={this.state.appResourceId}
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxx"
            style={{ minWidth: 350, marginBottom: 15 }}
          />

          <br />
          <label htmlFor="clientSecret">
            {i18n.t('group_setting_microsoft_entra_client_secret_label')}
          </label>
          <br />
          <input
            id="clientSecret"
            name="clientSecret"
            type="text"
            autoComplete="off"
            onChange={(v) => {
              this.setState({ clientSecret: v.target.value });
            }}
            value={this.state.clientSecret}
            placeholder="xxxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            style={{ minWidth: 350, marginBottom: 15 }}
          />

          <br />
          <input
            style={{ marginTop: 15 }}
            type="submit"
            value={i18n.t('group_setting_microsoft_entra_apply_config')}
          />
        </form>
        <div style={{ fontWeight: 'bold', marginTop: 20 }}>
          {i18n.t('group_setting_microsoft_entra_testing')}
        </div>
        <form onSubmit={this.testConfigWithEmail}>
          <input
            type="text"
            placeholder="prenom.nom@domaine.fr"
            autoComplete="off"
            ref={(r) => {
              this.testingEmailInputRef = r;
            }}
            required
            style={{ minWidth: 350, marginRight: 15 }}
          />
          <input type="submit" value={i18n.t('group_setting_microsoft_entra_test_start')} />
        </form>
        {this.state.testResult != null && (
          <div>
            <div
              style={{
                backgroundColor: this.state.testResult.msUserId.value ? 'green' : 'red',
                padding: 5,
                color: 'white',
                margin: '5px 0',
              }}
            >
              <span style={{ marginRight: 5 }}>
                {i18n.t('group_setting_microsoft_entra_test_user_id')}
              </span>
              <span>{this.state.testResult.msUserId.value}</span>
            </div>
            <div
              style={{
                backgroundColor: this.state.testResult.isAuthorized.value ? 'green' : 'red',
                padding: 5,
                color: 'white',
                margin: '5px 0',
              }}
            >
              <span style={{ marginRight: 5 }}>
                {i18n.t('group_setting_microsoft_entra_test_user_authorized')}
              </span>
              <span>{this.state.testResult.isAuthorized.value ? i18n.t('yes') : i18n.t('no')}</span>
            </div>
            <div
              style={{
                backgroundColor: this.state.testResult.userGroups.error ? 'red' : 'green',
                padding: 5,
                color: 'white',
                margin: '5px 0',
              }}
            >
              <span style={{ marginRight: 5 }}>
                {i18n.t('group_setting_microsoft_entra_test_user_groupes')}
              </span>
              <span>
                {this.state.testResult.userGroups.error ||
                  this.state.testResult.userGroups.value.map((g) => g.displayName).join(', ')}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }
}
