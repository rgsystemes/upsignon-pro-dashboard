import React from 'react';
import { fetchTemplate } from '../../helpers/fetchTemplate';
import { i18n } from '../../i18n/i18n';

export class ProSetupLink extends React.Component {
  qrcodeGenerator = null;
  base64Img = null;

  state = {
    proServerUrlConfig: null,
    isEditing: false,
    showOpenId: false,
  };
  fetchSetupUrlComponents = async () => {
    try {
      const settings = await fetchTemplate('/api/settings');
      if (settings.PRO_SERVER_URL_CONFIG) {
        this.setState({
          proServerUrlConfig: settings.PRO_SERVER_URL_CONFIG,
        });
        this.computeProSetupLink();
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
        value: JSON.stringify({
          url: this.state.proServerUrlConfig.url.trim(),
          oidcAuthority: this.state.proServerUrlConfig.oidcAuthority?.trim(),
          oidcClientId: this.state.proServerUrlConfig.oidcClientId?.trim(),
          oidcClientIdForAddons: this.state.proServerUrlConfig.oidcClientIdForAddons?.trim(),
        }),
      });
      this.setState({ isEditing: false, showOpenId: false });
      this.computeProSetupLink();
    } catch (e) {
      console.error(e);
    }
  };

  computeProSetupLink = () => {
    if (!this.state.proServerUrlConfig) return '';

    // First get link
    const { url, oidcAuthority, oidcClientId, oidcClientIdForAddons } =
      this.state.proServerUrlConfig;

    let link = `https://upsignon.eu/pro-setup?url=${encodeURIComponent(url.trim())}`;
    if (oidcAuthority && oidcClientId) {
      link += `&oidcAuthority=${encodeURIComponent(
        oidcAuthority.trim(),
      )}&oidcClientId=${oidcClientId.trim()}`;
      if (oidcClientIdForAddons) {
        link += `&oidcClientIdForAddons=${oidcClientIdForAddons.trim()}`;
      }
    }
    this.proSetupLink = link;

    // Then compute QR code
    if (!this.qrcodeGenerator) {
      this.qrcodeGenerator = require('./qrcode_generator').qrcode;
    }
    // create QR code
    const size = 150;
    const typeNumber = 0; // auto
    const errorCorrectionLevel = 'L';
    const qr = this.qrcodeGenerator(typeNumber, errorCorrectionLevel);
    qr.addData(this.proSetupLink);
    qr.make();
    const nbPixels = qr.getModuleCount();
    const cellSize = Math.round(size / nbPixels);
    const margin = 0;
    this.base64Img = qr.createDataURL(cellSize, margin);

    // Force rendering
    this.forceUpdate();
  };

  render() {
    const proServerUrlPlaceholder = 'https://upsignonpro.mycompany.com/server';
    return (
      <div>
        <h2>{i18n.t('setup_link')}</h2>
        <div style={{ display: 'flex', marginBottom: 10 }}>
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
        {!!this.proSetupLink && (
          <a
            href={this.proSetupLink}
            className="link"
            target="_blank"
            style={{
              margin: 20,
              borderRadius: 10,
              border: '1px solid #eee',
              padding: 20,
              width: 400,
              maxWidth: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '0 0 3px #eee',
            }}
            rel="noreferrer"
          >
            <div style={{ fontWeight: 'bold', textDecoration: 'none', color: 'black' }}>
              {i18n.t('link_to_communicate')}
            </div>
            <div
              style={{
                textAlign: 'center',
                display: 'block',
                marginBottom: 20,
                textOverflow: 'ellipsis',
                maxWidth: '100%',
                wordWrap: 'break-word',
              }}
            >
              {this.proSetupLink}
            </div>
            <img src={this.base64Img} style={{ height: 150, width: 150 }} alt="" />
          </a>
        )}
      </div>
    );
  }
}
