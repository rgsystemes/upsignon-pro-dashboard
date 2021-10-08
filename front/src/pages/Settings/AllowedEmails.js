import React from 'react';
import { fetchTemplate } from '../../helpers/fetchTemplate';
import { i18n } from '../../i18n/i18n';

class AllowedEmails extends React.Component {
  state = {
    allowedEmails: [],
    isEditing: false,
    editingEmailId: null,
    updatedPattern: null,
  };
  newInputRef = null;

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
    if (this.state.updatedPattern !== null) {
      try {
        await fetchTemplate('/api/update-allowed-email', 'POST', {
          allowedEmailId: this.state.editingEmailId,
          updatedPattern: this.state.updatedPattern,
        });
        await this.fetchAllowedEmails();
      } catch (e) {
        console.error(e);
      }
    }
    this.setState({ isEditing: false, editingEmailId: null, updatedPattern: null });
  };
  insertAllowedEmail = async () => {
    try {
      const newPattern = this.newInputRef.value;
      await fetchTemplate('/api/insert-allowed-email', 'POST', { newPattern });
      await this.fetchAllowedEmails();
      this.newInputRef.value = null;
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
      <div style={{ marginTop: 50 }}>
        <h3>{i18n.t('settings_allowed_emails')}</h3>
        <div>{i18n.t('settings_allowed_emails_pattern')}</div>
        <div style={{ marginTop: 20 }}>{i18n.t('settings_allowed_emails_new')}</div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <input
            placeholder="*@domain.com"
            ref={(r) => {
              this.newInputRef = r;
            }}
          />
          <div className="action" style={{ marginLeft: 10 }} onClick={this.insertAllowedEmail}>
            {i18n.t('add')}
          </div>
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
                if (this.state.editingEmailId !== ae.id || !this.state.isEditing) {
                  return (
                    <tr key={ae.id}>
                      <td
                        style={{ cursor: 'pointer' }}
                        onClick={() =>
                          this.setState((s) => {
                            return {
                              isEditing: true,
                              editingEmailId: ae.id,
                              updatedPattern: ae.pattern,
                            };
                          })
                        }
                      >
                        {ae.pattern}
                      </td>
                      <td>
                        <div className="action" onClick={() => this.deleteAllowedEmail(ae.id)}>
                          {i18n.t('delete')}
                        </div>
                      </td>
                    </tr>
                  );
                } else {
                  return (
                    <tr key={`editing_${ae.id}`}>
                      <td colSpan={2}>
                        <div
                          style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
                        >
                          <input
                            autoFocus
                            placeholder="*@domain.com"
                            value={this.state.updatedPattern}
                            onChange={(ev) => {
                              this.setState({ updatedPattern: ev.target.value });
                            }}
                            onBlur={(ev) => {
                              // do make isEditing false but do not prevent onClick on validate
                              setTimeout(() => {
                                this.setState({ isEditing: false });
                              }, 150);
                            }}
                          />
                          <span
                            style={{ marginLeft: 20 }}
                            className="action"
                            onClick={() => this.submitAllowedEmailEdition()}
                          >
                            {i18n.t('validate')}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                }
              })}
            </tbody>
          </table>
        )}
      </div>
    );
  }
}

export { AllowedEmails };
