import React from 'react';
import { fetchTemplate } from '../../helpers/fetchTemplate';
import { i18n } from '../../i18n/i18n';

class AllowedEmails extends React.Component {
  state = {
    allowedEmails: [],
    editingEmailId: null,
    newPattern: null,
  };

  fetchAllowedEmails = async () => {
    try {
      const emails = await fetchTemplate('/api/allowed-emails', 'GET', null);
      this.setState({
        allowedEmails: emails,
      });
    } catch (e) {
      console.error(e);
    }
  };
  submitAllowedEmailEdition = async () => {
    if (this.state.newPattern !== null) {
      try {
        await fetchTemplate('/api/update-allowed-email', 'POST', {
          allowedEmailId: this.state.editingEmailId,
          newPattern: this.state.newPattern,
        });
        await this.fetchAllowedEmails();
      } catch (e) {
        console.error(e);
      }
    }
    this.setState({ editingEmailId: null, newPattern: null });
  };
  insertAllowedEmail = async (key, newValue) => {
    try {
    } catch (e) {
      console.error(e);
    }
  };
  deleteAllowedEmail = async (id) => {
    const confirmation = window.confirm(i18n.t('settings_allowed_emails_delete_warning'));
    if (confirmation) {
      try {
        await fetchTemplate(`/api/delete-allowed-email/${id}`, 'POST', null);
        await this.fetchAllowedEmails();
      } catch (e) {
        console.error(e);
      }
    }
  };
  componentDidMount() {
    this.fetchAllowedEmails();
  }
  render() {
    return (
      <div>
        <h3>{i18n.t('settings_allowed_emails')}</h3>
        <div>{i18n.t('settings_allowed_emails_pattern')}</div>
        <div className="action" style={{ marginBottom: 20 }} onClick={() => {}}>
          {i18n.t('settings_allowed_emails_add')}
        </div>
        {this.state.allowedEmails.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>{i18n.t('settings_allowed_emails_email_pattern')}</th>
                <th>{i18n.t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {this.state.allowedEmails.map((ae) => {
                return (
                  <tr key={ae.id}>
                    {this.state.editingEmailId !== ae.id ? (
                      <td
                        style={{ cursor: 'pointer' }}
                        onClick={() =>
                          this.setState({ editingEmailId: ae.id, newPattern: ae.pattern })
                        }
                      >
                        {ae.pattern}
                      </td>
                    ) : (
                      <td colSpan={2}>
                        <div
                          style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
                        >
                          <input
                            autoFocus
                            placeholder="*@domain.com"
                            value={this.state.newPattern}
                            onChange={(ev) => {
                              this.setState({ newPattern: ev.target.value });
                            }}
                          />
                          <span style={{ marginLeft: 20 }}>
                            <div className="action" onClick={this.submitAllowedEmailEdition}>
                              {i18n.t('validate')}
                            </div>
                            <div
                              className="action"
                              onClick={() =>
                                this.setState({ editingEmailId: null, newPattern: null })
                              }
                            >
                              {i18n.t('cancel')}
                            </div>
                          </span>
                        </div>
                      </td>
                    )}
                    {this.state.editingEmailId !== ae.id && (
                      <td>
                        <div className="action" onClick={() => this.deleteAllowedEmail(ae.id)}>
                          {i18n.t('delete')}
                        </div>
                      </td>
                    )}
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

export { AllowedEmails };
