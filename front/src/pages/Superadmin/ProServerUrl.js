import React from 'react';
import { baseUrlFetch, groupUrlFetch } from '../../helpers/urlFetch';
import { i18n } from '../../i18n/i18n';
import { ServerStatus } from './ServerStatus';
import { isReadOnlySuperadmin } from '../../helpers/isReadOnlySuperadmin';

export class ProServerUrl extends React.Component {
  urlInputRef = null;
  serverStatusUrl = null;
  state = {
    proServerUrlConfig: null,
    isEditing: false,
  };
  fetchSetupUrlComponents = async () => {
    try {
      const serverUrl = await baseUrlFetch('/server_url', 'GET');
      if (serverUrl) {
        this.serverStatusUrl = serverUrl.url;
        this.setState({
          proServerUrlConfig: serverUrl,
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
      let newUrl = this.state.proServerUrlConfig?.url.trim();
      newUrl = newUrl.replace(/\/$/, '');
      if (this.urlInputRef) {
        if (!newUrl) {
          this.urlInputRef.style.borderColor = 'red';
          return;
        } else {
          this.urlInputRef.style.borderColor = null;
        }
      }
      if (!newUrl) return;
      const newStateUrl = {
        url: newUrl,
        oidcAuthority: this.state.proServerUrlConfig.oidcAuthority?.trim(),
        oidcClientId: this.state.proServerUrlConfig.oidcClientId?.trim(),
        oidcClientIdForAddons: this.state.proServerUrlConfig.oidcClientIdForAddons?.trim(),
      };
      await groupUrlFetch('/api/update-setting', 'POST', {
        key: 'PRO_SERVER_URL_CONFIG',
        value: newStateUrl,
      });
      this.serverStatusUrl = newUrl;
      this.setState({ isEditing: false, proServerUrlConfig: newStateUrl });
    } catch (e) {
      console.error(e);
    }
  };

  render() {
    const proServerUrlPlaceholder = 'https://upsignonpro.mycompany.com/server';
    return (
      <div>
        <h2>{i18n.t('pro_server')}</h2>
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
            <div
              style={{ marginLeft: 20 }}
              className={`${isReadOnlySuperadmin ? 'disabledUI' : ''}`}
              onClick={this.submitNewProServerUrl}
            >
              {i18n.t('validate')}
            </div>
          ) : (
            <div
              style={{ marginLeft: 20 }}
              className={`${isReadOnlySuperadmin ? 'disabledUI' : ''}`}
              onClick={() => this.setState({ isEditing: true })}
            >
              {i18n.t('edit')}
            </div>
          )}
        </div>
        {/* add key to rebuild the component when url changes so that status is refreshed */}
        <ServerStatus key={this.serverStatusUrl} proServerUrl={this.serverStatusUrl} />
      </div>
    );
  }
}
