import React, { useState, useEffect } from 'react';
import { baseUrlFetch, groupUrlFetch } from '../../helpers/urlFetch';
import { i18n } from '../../i18n/i18n';
import './OpenidConfiguration.css';
import { Loader } from '../../helpers/loader';

// Windows Logo Component
const WindowsLogo = () => (
  <svg width="16" height="16" viewBox="0 0 21 21" style={{ marginRight: '5px' }}>
    <path fill="#0078D4" d="M0 0h9.5v9.5H0z" />
    <path fill="#0078D4" d="M10.5 0H20v9.5h-9.5z" />
    <path fill="#0078D4" d="M0 10.5h9.5V20H0z" />
    <path fill="#0078D4" d="M10.5 10.5H20V20h-9.5z" />
  </svg>
);

// Check Icon Component (white check mark on green circle)
const CheckIcon = ({ size = 24 }) => (
  <svg className="check-icon-container" width={size} height={size} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" fill="#4CAF50" />
    <path
      d="M9.75 15.4L6.25 11.9l-1.15 1.15L9.75 17.7 19.05 8.4l-1.15-1.15L9.75 15.4z"
      fill="white"
      strokeWidth="0.5"
    />
  </svg>
);

// Props : setIsLoading
export class OpenidConfiguration extends React.Component {
  state = {
    openidConfig: null,
    choice: 'none', // none | microsoft | custom
  };

  lock = false;

  fetchBankSSOConfig = async () => {
    try {
      this.props.setIsLoading(true);
      const { openidConfigs } = await groupUrlFetch('/api/sso_configurations', 'GET', null);
      if (openidConfigs && openidConfigs[0]) {
        this.setState({
          openidConfig: openidConfigs[0],
          choice: openidConfigs[0].configType,
        });
      } else {
        this.setState({
          openidConfig: null,
          choice: 'none',
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      this.props.setIsLoading(false);
    }
  };
  addBankSSOConfig = async (configType, configUrl, clientId) => {
    try {
      if (this.lock) {
        return;
      }
      this.lock = true;
      this.props.setIsLoading(true);

      // Validation de l'URL avant envoi de la requête
      if (configUrl && configType === 'custom') {
        try {
          const url = new URL(configUrl);
          if (!url.protocol.startsWith('http')) {
            alert(i18n.t('settings_openid_invalid_url_protocol'));
            return;
          }
        } catch (error) {
          alert(i18n.t('settings_openid_invalid_url'));
          return;
        }
      }

      await groupUrlFetch('/api/add_sso_configuration', 'POST', {
        configType,
        configUrl,
        clientId,
      });
      await this.fetchBankSSOConfig();
    } catch (e) {
      console.error(e);
    } finally {
      this.props.setIsLoading(false);
      this.lock = false;
    }
  };
  deleteBankSSOConfig = async (configId) => {
    try {
      if (this.lock) {
        return;
      }
      this.lock = true;
      this.props.setIsLoading(true);
      await groupUrlFetch('/api/delete_sso_configuration', 'POST', {
        configId,
      });
      await this.fetchBankSSOConfig();
    } catch (e) {
      console.error(e);
    } finally {
      this.props.setIsLoading(false);
      this.lock = false;
    }
  };

  componentDidMount() {
    this.fetchBankSSOConfig();
  }

  onSelectNone = async (ev) => {
    const hasValueConfigured = this.state.openidConfig != null;
    if (hasValueConfigured) {
      const confirmation = window.confirm(i18n.t('settings_openid_confirm_erase_previous_config'));
      if (!confirmation) {
        return;
      }
      await this.deleteBankSSOConfig(this.state.openidConfig.id);
    } else {
      this.setState({ openidConfig: null, choice: 'none' });
    }
  };
  onSelectMicrosoft = async () => {
    const hasValueConfigured = this.state.openidConfig != null;
    if (hasValueConfigured) {
      const confirmation = window.confirm(i18n.t('settings_openid_confirm_erase_previous_config'));
      if (!confirmation) {
        return;
      }
      await this.deleteBankSSOConfig(this.state.openidConfig.id);
    }
    await this.addBankSSOConfig('microsoft');
  };
  onSelectCustom = async () => {
    const hasValueConfigured = this.state.openidConfig != null;
    if (hasValueConfigured) {
      const confirmation = window.confirm(i18n.t('settings_openid_confirm_erase_previous_config'));
      if (!confirmation) {
        return;
      }
      await this.deleteBankSSOConfig(this.state.openidConfig.id);
    }
    this.setState({ choice: 'custom', openidConfig: null });
  };
  submitCustomConfig = async (configUrl, clientId) => {
    await this.addBankSSOConfig('custom', configUrl, clientId);
  };

  render() {
    return (
      <div style={{ marginTop: 50 }}>
        <h2>{i18n.t('settings_openid_config')}</h2>
        <p>{i18n.t('settings_openid_config_pitch')}</p>
        <p>
          <strong>{i18n.t('settings_openid_config_details')}</strong>
        </p>
        <NoSSOChoice
          value="none"
          name={i18n.t('settings_openid_unset')}
          onSelect={this.onSelectNone}
          isSelected={this.state.choice === 'none'}
        />
        <PreconfiguredSSOProvider
          value="microsoft"
          name="Microsoft"
          onSelect={this.onSelectMicrosoft}
          isSelected={this.state.choice === 'microsoft'}
          logo={<WindowsLogo />}
        />
        <CustomSSOProvider
          value="custom"
          onSelect={this.onSelectCustom}
          onValidateAddConfig={this.submitCustomConfig}
          isSelected={this.state.choice === 'custom'}
          currentConfig={this.state.openidConfig}
        />
      </div>
    );
  }
}

class NoSSOChoice extends React.Component {
  render() {
    const { value, name, onSelect, isSelected } = this.props;
    return (
      <div className="ssoChoiceInputContainer">
        <input
          type="radio"
          id={value}
          name="ssoChoice"
          value={value}
          checked={isSelected}
          onChange={onSelect}
        />
        <label htmlFor={value} className="ssoChoiceContainerLabel">
          {name}
        </label>
      </div>
    );
  }
}
class PreconfiguredSSOProvider extends React.Component {
  render() {
    const { value, name, onSelect, isSelected, logo } = this.props;
    return (
      <div className="ssoChoiceInputContainer">
        <input
          type="radio"
          id={value}
          name="ssoChoice"
          value={value}
          checked={isSelected}
          onChange={onSelect}
        />
        <label htmlFor={value} className="ssoChoiceContainerLabel">
          {logo && <span className="provider-logo">{logo}</span>}
          {name}
        </label>
        {isSelected && <CheckIcon size={20} />}
      </div>
    );
  }
}

const CustomSSOProvider = (p) => {
  const { value, onSelect, onValidateAddConfig, isSelected, currentConfig } = p;
  const [configUrl, setConfigUrl] = useState(currentConfig?.configUrl || '');
  const [clientId, setClientId] = useState(currentConfig?.clientId || '');

  useEffect(() => {
    setConfigUrl(currentConfig?.configUrl || '');
    setClientId(currentConfig?.clientId || '');
  }, [currentConfig]);

  const hasUrlEdition = configUrl != currentConfig?.configUrl;
  const hasClientIdEdition = clientId != currentConfig?.clientId;
  const hasEdition = hasUrlEdition || hasClientIdEdition;
  const canSubmit = !!configUrl && !!clientId;
  return (
    <div>
      <div className="ssoChoiceInputContainer">
        <input
          type="radio"
          id={value}
          name="ssoChoice"
          value={value}
          checked={isSelected}
          onChange={onSelect}
        />
        <label htmlFor={value} className="ssoChoiceContainerLabel">
          {i18n.t('settings_openid_custom_config')}
        </label>
      </div>
      {isSelected && (
        <div className="customConfigContainer">
          <label htmlFor="custom_sso_config_url">
            {i18n.t('settings_openid_custom_config_url')}
          </label>
          <div className="customConfigInputUrlContainer">
            <input
              id="custom_sso_config_url"
              type="url"
              placeholder="https://login.microsoftonline.com/septeo.com/v2.0/.well-known/openid-configuration"
              value={configUrl}
              onChange={(ev) => setConfigUrl(ev.target.value)}
              autoComplete="off"
            />
            {!hasUrlEdition && !!currentConfig?.configUrl && <CheckIcon size={20} />}
          </div>
          <label htmlFor="custom_sso_config_client_id">
            {i18n.t('settings_openid_custom_config_client_id')}
          </label>
          <div className="customConfigInputClientIdContainer">
            <input
              id="custom_sso_config_client_id"
              type="text"
              placeholder="a58bc65d-c84f-4526-9057-6d7722ff8593"
              value={clientId}
              onChange={(ev) => setClientId(ev.target.value)}
              autoComplete="off"
            />
            {!hasClientIdEdition && !!currentConfig?.clientId && <CheckIcon size={20} />}
          </div>
          {hasEdition && (
            <button
              className="customConfigSubmit"
              onClick={() => onValidateAddConfig(configUrl, clientId)}
              disabled={!canSubmit}
            >
              {i18n.t('settings_openid_custom_config_submit')}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
