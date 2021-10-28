import React from 'react';
import { EditableCell } from '../../helpers/EditableCell';
import { groupUrlFetch } from '../../helpers/urlFetch';
import { i18n } from '../../i18n/i18n';

const namePlaceholder = 'Service';
const signinUrlPlaceholder = 'https://service.com/signin';
const passwordChangeUrlPlaceholder = 'https://service.com/account-setting';

// Props = setIsLoading
class Urls extends React.Component {
  state = {
    urls: [],
  };
  nameInput = null;
  signinUrlInput = null;
  passwordChangeUrlInput = null;

  fetchUrls = async () => {
    try {
      const urls = await groupUrlFetch('/api/urls', 'GET', null);
      this.setState({ urls });
    } catch (e) {
      console.error(e);
    }
  };
  submitUrlEdition = async (id, valObject) => {
    try {
      this.props.setIsLoading(true);
      await groupUrlFetch('/api/update-url', 'POST', { id, ...valObject });
      await this.fetchUrls();
    } catch (e) {
      console.error(e);
    } finally {
      this.props.setIsLoading(false);
    }
  };
  insertUrl = async () => {
    try {
      this.props.setIsLoading(true);
      const displayedName = this.nameInput.value;
      const signinUrl = this.signinUrlInput.value;
      const passwordChangeUrl = this.passwordChangeUrlInput.value;
      if (!displayedName) {
        this.nameInput.style.borderColor = 'red';
        return;
      } else {
        this.nameInput.style.borderColor = null;
      }
      await groupUrlFetch('/api/insert-url', 'POST', {
        displayedName,
        signinUrl,
        passwordChangeUrl,
      });
      await this.fetchUrls();
      this.nameInput.value = null;
      this.signinUrlInput.value = null;
      this.passwordChangeUrlInput.value = null;
    } catch (e) {
      console.error(e);
    } finally {
      this.props.setIsLoading(false);
    }
  };
  deleteUrl = async (id) => {
    const confirmation = window.confirm(i18n.t('settings_urls_delete_warning'));
    if (confirmation) {
      try {
        this.props.setIsLoading(true);
        await groupUrlFetch(`/api/delete-url/${id}`, 'POST', null);
        await this.fetchUrls();
      } catch (e) {
        console.error(e);
      } finally {
        this.props.setIsLoading(false);
      }
    }
  };
  componentDidMount() {
    this.fetchUrls();
  }
  render() {
    return (
      <div style={{ marginTop: 50 }}>
        <h2>{i18n.t('settings_urls')}</h2>
        <div>{i18n.t('settings_urls_explanation')}</div>
        <div style={{ marginTop: 20, marginBottom: 20 }}>
          <div style={{ fontWeight: 'bold' }}>{i18n.t('settings_urls_new')}</div>
          <table className="invisibleTable">
            <tbody>
              <InputWithLabel
                labelFor="displayed-name"
                label={`${i18n.t('settings_urls_name')}*`}
                handleRef={(r) => {
                  this.nameInput = r;
                }}
                placeholder={namePlaceholder}
              />
              <InputWithLabel
                labelFor="signin-url"
                label={i18n.t('settings_urls_signin_url')}
                handleRef={(r) => {
                  this.signinUrlInput = r;
                }}
                placeholder={signinUrlPlaceholder}
              />
              <InputWithLabel
                labelFor="password-change-url"
                label={i18n.t('settings_urls_password_change_url')}
                handleRef={(r) => {
                  this.passwordChangeUrlInput = r;
                }}
                placeholder={passwordChangeUrlPlaceholder}
              />
            </tbody>
          </table>
          <div className="action" onClick={this.insertUrl}>
            {i18n.t('add')}
          </div>
        </div>
        {this.state.urls.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>{i18n.t('settings_urls_name')}</th>
                <th>{i18n.t('settings_urls_signin_url')}</th>
                <th>{i18n.t('settings_urls_password_change_url')}</th>
                <th>{i18n.t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {this.state.urls.map((url) => {
                return (
                  <tr key={url.id}>
                    <EditableCell
                      value={url.displayed_name}
                      placeholder={namePlaceholder}
                      onChange={(newVal) => {
                        if (!newVal) return;
                        this.submitUrlEdition(url.id, { displayedName: newVal });
                      }}
                    />
                    <EditableCell
                      value={url.signin_url}
                      placeholder={signinUrlPlaceholder}
                      onChange={(newVal) => {
                        this.submitUrlEdition(url.id, { signinUrl: newVal });
                      }}
                    />
                    <EditableCell
                      value={url.password_change_url}
                      placeholder={passwordChangeUrlPlaceholder}
                      onChange={(newVal) => {
                        this.submitUrlEdition(url.id, { passwordChangeUrl: newVal });
                      }}
                    />
                    <td>
                      <div className="action" onClick={() => this.deleteUrl(url.id)}>
                        {i18n.t('delete')}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    );
  }
}

function InputWithLabel(props) {
  const { label, labelFor, handleRef, placeholder } = props;
  return (
    <tr>
      <td>
        <label htmlFor={labelFor} style={{ marginRight: 10 }}>
          {label}
        </label>
      </td>
      <td>
        <input name={labelFor} ref={handleRef} style={{ width: 300 }} placeholder={placeholder} />
      </td>
    </tr>
  );
}

export { Urls };
