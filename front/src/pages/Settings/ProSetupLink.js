import React from 'react';
import { i18n } from '../../i18n/i18n';

export class ProSetupLink extends React.Component {
  state = {
    proServerUrl: '',
    oidcAuthority: null,
    oidcClientId: null,
    oidcClientIdForAddons: null,
    isEditing: false,
  };
  fetchSetupUrlComponents = () => {
    try {
      const { proServerUrl, oidcAuthority, oidcClientId, oidcClientIdForAddons } = {
        proServerUrl: '',
      };
      if (!proServerUrl) {
        this.setState({ isEditing: true });
      } else {
        this.setState({ proServerUrl, oidcAuthority, oidcClientId, oidcClientIdForAddons });
      }
    } catch (e) {
      console.error(e);
    }
  };
  componentDidMount() {
    this.fetchSetupUrlComponents();
  }

  submitNewProServerUrl = async (url) => {
    try {
      //TODO
      this.fetchSetupUrlComponents();
    } catch (e) {
      console.error(e);
    }
  };
  render() {
    const proServerUrlPlaceholder = 'https://upsignonpro.mycompany.com/server';
    return (
      <div>
        <h2>{i18n.t('setup_link')}</h2>
        <div style={{ display: 'flex' }}>
          <div style={{ marginRight: 20 }}>{i18n.t('pro_server_url')}</div>
          {this.state.isEditing ? (
            <input
              style={{
                width: `${Math.max(
                  this.state.proServerUrl.length || proServerUrlPlaceholder.length || 0,
                  15,
                )}ch`,
              }}
              placeholder={proServerUrlPlaceholder}
              type="text"
              value={this.state.proServerUrl}
              onChange={(ev) => {
                this.setState({ proServerUrl: ev.target.value });
              }}
            />
          ) : (
            <a className="link" href={this.state.proServerUrl} target="_blank" rel="noreferrer">
              {this.state.proServerUrl}
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
      </div>
    );
  }
}
