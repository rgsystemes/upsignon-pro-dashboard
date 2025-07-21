import React from 'react';
import { EditableCell } from '../../helpers/EditableCell';
import { groupUrlFetch } from '../../helpers/urlFetch';
import { i18n } from '../../i18n/i18n';
import { isReadOnlySuperadmin } from '../../helpers/isReadOnlySuperadmin';

const namePlaceholder = 'Service';
const signinUrlPlaceholder = 'https://service.com/signin';

// Props = setIsLoading, isSuperAdmin, otherGroups
class Urls extends React.Component {
  state = {
    urls: [],
  };
  nameInput = null;
  signinUrlInput = null;
  nbCopiedFromTargetGroup = null;
  usesBasicAuthCheckbox = false;

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
      const usesBasicAuth = this.usesBasicAuthCheckbox.checked;
      if (!displayedName) {
        this.nameInput.style.borderColor = 'red';
        return;
      } else {
        this.nameInput.style.borderColor = null;
      }
      await groupUrlFetch('/api/insert-url', 'POST', {
        displayedName,
        signinUrl,
        usesBasicAuth,
      });
      await this.fetchUrls();
      this.nameInput.value = null;
      this.signinUrlInput.value = null;
      this.usesBasicAuthCheckbox.checked = false;
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
  copyFromGroup = async (event) => {
    const groupId = event.target.value;
    if (!groupId) {
      this.nbCopiedFromTargetGroup = null;
      this.forceUpdate();
      return;
    }
    try {
      this.props.setIsLoading(true);
      const { nbAdded } = await groupUrlFetch('/api/copy_urls_from_group', 'POST', {
        fromGroup: groupId,
      });
      this.nbCopiedFromTargetGroup = nbAdded;
      await this.fetchUrls();
    } catch (e) {
      console.error(e);
    } finally {
      this.props.setIsLoading(false);
    }
  };
  componentDidMount() {
    this.fetchUrls();
  }
  render() {
    return (
      <div style={{ marginTop: 20 }}>
        <h2>{i18n.t('settings_urls')}</h2>
        <div style={{ marginBottom: 10 }}>{i18n.t('settings_urls_explanation')}</div>
        {this.props.isSuperAdmin ? (
          <div>
            <div>{i18n.t('settings_urls_copy')}</div>
            <select onChange={this.copyFromGroup}>
              <option value="">{i18n.t('settings_urls_choose_group')}</option>
              {this.props.otherGroups.map((g) => (
                <option key={g.id} value={g.id} disabled={isReadOnlySuperadmin}>
                  {g.name}
                </option>
              ))}
            </select>
            {this.nbCopiedFromTargetGroup !== null && (
              <div>
                {i18n.t('settings_urls_copied_number', { n: this.nbCopiedFromTargetGroup })}
              </div>
            )}
          </div>
        ) : (
          <div>{i18n.t('settings_urls_copiable')}</div>
        )}
        <div
          style={{ marginTop: 20, marginBottom: 20 }}
          className={`${isReadOnlySuperadmin ? 'disabledUI' : ''}`}
        >
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
              <tr>
                <td>
                  <label htmlFor="url-uses-basic-auth" style={{ marginRight: 10 }}>
                    {i18n.t('settings_urls_basic_auth')}
                  </label>
                </td>
                <td>
                  <input
                    type="checkbox"
                    id="url-uses-basic-auth"
                    name="url-uses-basic-auth"
                    ref={(r) => (this.usesBasicAuthCheckbox = r)}
                  />
                </td>
              </tr>
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
                <th title={i18n.t('settings_urls_basic_auth_details')} style={{ cursor: 'help' }}>
                  {i18n.t('settings_urls_basic_auth')}
                </th>
                <th>{i18n.t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {this.state.urls.map((url) => {
                return (
                  <tr key={url.id} className={`${isReadOnlySuperadmin ? 'disabledUI' : ''}`}>
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
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <input
                          type="checkbox"
                          checked={url.uses_basic_auth}
                          onChange={() => {
                            this.submitUrlEdition(url.id, { usesBasicAuth: !url.uses_basic_auth });
                          }}
                        ></input>
                      </div>
                    </td>
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
        <input
          id={labelFor}
          name={labelFor}
          ref={handleRef}
          style={{ width: 300 }}
          placeholder={placeholder}
        />
      </td>
    </tr>
  );
}

export { Urls };
