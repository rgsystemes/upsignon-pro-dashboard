import React from 'react';
import { baseUrlFetch, groupUrlFetch } from '../../helpers/urlFetch';
import { i18n } from '../../i18n/i18n';
import { isReadOnlySuperadmin } from '../../helpers/isReadOnlySuperadmin';

export class ServerRedirection extends React.Component {
  urlInputRef = null;
  state = {
    redirectionUrl: null,
    isEditing: false,
  };
  fetchRedirectionUrl = async () => {
    try {
      const { redirectionUrl } = await groupUrlFetch('/api/redirection_url', 'POST', null);
      if (redirectionUrl) {
        this.setState({
          redirectionUrl: redirectionUrl,
        });
      }
    } catch (e) {
      console.error(e);
    }
  };
  componentDidMount() {
    this.fetchRedirectionUrl();
  }

  submitRedirectionUrl = async () => {
    try {
      if (!window.confirm(i18n.t('settings_server_redirection_confirm'))) return;
      let redirectionUrl = this.state.redirectionUrl?.trim() || '';
      redirectionUrl = redirectionUrl.replace(/\/$/, '');
      await groupUrlFetch('/api/set_redirection_url', 'POST', {
        redirectionUrl: redirectionUrl,
      });
      this.setState({ isEditing: false, redirectionUrl: redirectionUrl });
    } catch (e) {
      console.error(e);
    }
  };

  render() {
    return (
      <div style={{ marginTop: 50 }}>
        <h2>{i18n.t('settings_server_redirection')}</h2>
        <div>{i18n.t('settings_server_redirection_explanation')}</div>
        <div style={{ display: 'flex', marginBottom: 10 }}>
          <div style={{ marginRight: 20 }}>
            {i18n.t('settings_server_redirection_new_url_label')}
          </div>
          {this.state.isEditing ? (
            <input
              ref={(r) => {
                this.urlInputRef = r;
              }}
              style={{
                width: `${Math.max(this.state.redirectionUrl?.length || 0, 15)}ch`,
              }}
              type="text"
              value={this.state.redirectionUrl || ''}
              onChange={(ev) => {
                this.setState((s) => ({
                  redirectionUrl: ev.target.value,
                }));
              }}
            />
          ) : (
            <div>{this.state.redirectionUrl}</div>
          )}
          {this.state.isEditing ? (
            <div style={{ marginLeft: 20 }} className="action" onClick={this.submitRedirectionUrl}>
              {i18n.t('validate')}
            </div>
          ) : (
            <div
              style={{ marginLeft: 20 }}
              className={`action ${isReadOnlySuperadmin ? 'disabledUI' : ''}`}
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
