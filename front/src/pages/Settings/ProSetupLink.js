import React from 'react';
import { fetchTemplate } from '../../helpers/fetchTemplate';
import { i18n } from '../../i18n/i18n';

export class ProSetupLink extends React.Component {
  state = {
    proServerUrlConfig: null,
    isEditing: false,
  };
  fetchSetupUrlComponents = async () => {
    try {
      const settings = await fetchTemplate('/api/settings');
      if (settings.PRO_SERVER_URL_CONFIG) {
        this.setState({ proServerUrlConfig: settings.PRO_SERVER_URL_CONFIG });
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
      await fetchTemplate('/api/setting', 'POST', {
        key: 'PRO_SERVER_URL_CONFIG',
        value: JSON.stringify(this.state.proServerUrlConfig),
      });
      this.setState({ isEditing: false });
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
      </div>
    );
  }
}
