import React from 'react';
import { adminFetchTemplate } from '../../helpers/fetchTemplate';
import { i18n } from '../../i18n/i18n';
import { ServerStatus } from './ServerStatus';

export class ProServerUrl extends React.Component {
  urlInputRef = null;
  serverStatusUrl = null;
  state = {
    proServerUrlConfig: null,
    isEditing: false,
    showOpenId: false,
  };
  fetchSetupUrlComponents = async () => {
    try {
      const serverUrl = await adminFetchTemplate('/server_url', 'GET');
      if (serverUrl) {
        this.serverStatusUrl = serverUrl.url;
        this.setState({
          proServerUrlConfig: serverUrl,
          showOpenId: false,
        });
      } else {
        this.setState({ isEditing: true });
      }
    } catch (e) {
      console.error(e);
      this.setState({ isEditing: true });
    }
  };
  componentDidMount() {
    this.fetchSetupUrlComponents();
  }

  submitNewProServerUrl = async () => {
    try {
      const newUrl = this.state.proServerUrlConfig?.url.trim();
      if (this.urlInputRef) {
        if (!newUrl) {
          this.urlInputRef.style.borderColor = 'red';
          return;
        } else {
          this.urlInputRef.style.borderColor = null;
        }
      }
      await adminFetchTemplate('/superadmin-api/update-setting', 'POST', {
        key: 'PRO_SERVER_URL_CONFIG',
        value: JSON.stringify({
          url: newUrl,
          oidcAuthority: this.state.proServerUrlConfig.oidcAuthority?.trim(),
          oidcClientId: this.state.proServerUrlConfig.oidcClientId?.trim(),
          oidcClientIdForAddons: this.state.proServerUrlConfig.oidcClientIdForAddons?.trim(),
        }),
      });
      this.serverStatusUrl = newUrl;
      this.setState({ isEditing: false, showOpenId: false });
    } catch (e) {
      console.error(e);
    }
  };

  render() {
    const proServerUrlPlaceholder = 'https://upsignonpro.mycompany.com/server';
    return (
      <div>
        <h2>{i18n.t('pro_server')}</h2>
        {/* add key to rebuild the component when url changes so that status is refreshed */}
        <ServerStatus key={this.serverStatusUrl} proServerUrl={this.serverStatusUrl} />
        <div style={{ display: 'flex', marginBottom: 10 }}>
          <div style={{ marginRight: 20 }}>{i18n.t('pro_server_url')}</div>
          {this.state.isEditing ? (
            <input
              ref={(r) => {
                this.urlInputRef = r;
              }}
              style={{
                width: `${Math.max(
                  this.state.proServerUrlConfig?.url.length || proServerUrlPlaceholder.length,
                  15,
                )}ch`,
              }}
              placeholder={proServerUrlPlaceholder}
              type="text"
              value={this.state.proServerUrlConfig?.url || ''}
              onChange={(ev) => {
                this.setState((s) => ({
                  proServerUrlConfig: {
                    ...s.proServerUrlConfig,
                    url: ev.target.value,
                  },
                }));
              }}
            />
          ) : (
            <a
              className="link"
              href={this.state.proServerUrlConfig?.url}
              target="_blank"
              rel="noreferrer"
            >
              {this.state.proServerUrlConfig?.url}
            </a>
          )}
          {this.state.isEditing ? (
            <div style={{ marginLeft: 20 }} className="action" onClick={this.submitNewProServerUrl}>
              {i18n.t('validate')}
            </div>
          ) : (
            <div
              style={{ marginLeft: 20 }}
              className="action"
              onClick={() => this.setState({ isEditing: true })}
            >
              {i18n.t('edit')}
            </div>
          )}
        </div>
        <div>
          {i18n.t('openid_unfold')}{' '}
          {this.state.showOpenId ? (
            <span className="action" onClick={() => this.setState({ showOpenId: false })}>
              {i18n.t('hide')}
            </span>
          ) : (
            <span className="action" onClick={() => this.setState({ showOpenId: true })}>
              {i18n.t('see')}
            </span>
          )}
        </div>
        {this.state.showOpenId && (
          <div style={{ border: '1px solid #aaa', borderRadius: 3, padding: 10, marginTop: 5 }}>
            <div style={{ display: 'flex', marginBottom: 10 }}>
              <div>{i18n.t('openid_authority')}</div>
              <input
                style={{ marginLeft: 10, width: 200 }}
                type="text"
                value={this.state.proServerUrlConfig?.oidcAuthority || ''}
                onChange={(ev) => {
                  this.setState((s) => ({
                    proServerUrlConfig: { ...s.proServerUrlConfig, oidcAuthority: ev.target.value },
                  }));
                }}
              />
            </div>
            <div style={{ display: 'flex', marginBottom: 10 }}>
              <div>{i18n.t('openid_clientid')}</div>
              <input
                style={{ marginLeft: 10, width: 200 }}
                type="text"
                value={this.state.proServerUrlConfig?.oidcClientId || ''}
                onChange={(ev) => {
                  this.setState((s) => ({
                    proServerUrlConfig: { ...s.proServerUrlConfig, oidcClientId: ev.target.value },
                  }));
                }}
              />
            </div>
            <div style={{ display: 'flex', marginBottom: 10 }}>
              <div>{i18n.t('openid_clientid_browsers')}</div>
              <input
                style={{ marginLeft: 10, width: 200 }}
                type="text"
                value={this.state.proServerUrlConfig?.oidcClientIdForAddons || ''}
                onChange={(ev) => {
                  this.setState((s) => ({
                    proServerUrlConfig: {
                      ...s.proServerUrlConfig,
                      oidcClientIdForAddons: ev.target.value,
                    },
                  }));
                }}
              />
            </div>
            <div className="action" onClick={this.submitNewProServerUrl}>
              {i18n.t('validate')}
            </div>
          </div>
        )}
      </div>
    );
  }
}
