import React from 'react';
import { baseUrlFetch, groupUrlFetch } from '../../helpers/urlFetch';
import { i18n } from '../../i18n/i18n';

// Props : setIsLoading
class GroupAdmins extends React.Component {
  state = {
    admins: [],
  };
  newInputRef = null;

  fetchGroupAdmins = async () => {
    try {
      const adminEmails = await groupUrlFetch('/api/group-admins', 'GET', null);
      this.setState({ admins: adminEmails });
    } catch (e) {
      console.error(e);
    }
  };

  insertGroupAdmin = async () => {
    try {
      this.props.setIsLoading(true);
      const newEmail = this.newInputRef.value;
      if (!newEmail) {
        this.newInputRef.style.borderColor = 'red';
        return;
      } else {
        this.newInputRef.style.borderColor = null;
      }
      await groupUrlFetch('/api/insert-admin', 'POST', {
        newEmail,
      });
      await this.fetchGroupAdmins();
      this.newInputRef.value = null;
    } catch (e) {
      console.error(e);
    } finally {
      this.props.setIsLoading(false);
    }
  };
  deleteAdmin = async (id) => {
    const confirmation = window.confirm(i18n.t('settings_group_admin_delete_warning'));
    if (confirmation) {
      try {
        this.props.setIsLoading(true);
        await groupUrlFetch(`/api/delete-admin/${id}`, 'POST', null);
        await this.fetchGroupAdmins();
      } catch (e) {
        console.error(e);
      } finally {
        this.props.setIsLoading(false);
      }
    }
  };
  sendAdminInvite = async (adminEmail) => {
    try {
      this.props.setIsLoading(true);
      const { success } = await baseUrlFetch('/get_admin_invite', 'POST', { adminEmail });
      if (success) {
        window.alert(i18n.t('settings_admin_invite_sent'));
      } else {
        window.alert(i18n.t('sasettings_email_config_testing_error_alert', { e: '' }));
      }
    } catch (e) {
      console.error(e);
      window.alert(i18n.t('sasettings_email_config_testing_error_alert', { e }));
    } finally {
      this.props.setIsLoading(false);
    }
  };

  componentDidMount() {
    this.fetchGroupAdmins();
  }
  render() {
    return (
      <div style={{ marginTop: 50 }}>
        <h2>{i18n.t('settings_group_admins_title')}</h2>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <input
            ref={(r) => {
              this.newInputRef = r;
            }}
            placeholder="admin.email@domain.com"
            style={{ width: 300, marginRight: 10 }}
          />
          <div className="action" style={{ marginLeft: 10 }} onClick={this.insertGroupAdmin}>
            {i18n.t('settings_group_admins_invite')}
          </div>
        </div>
        {this.state.admins.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>{i18n.t('settings_admin_email')}</th>
                <th>{i18n.t('settings_admin_created_at')}</th>
                <th>{i18n.t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {this.state.admins.map((admin) => {
                return (
                  <tr key={admin.id}>
                    <td>{admin.email}</td>
                    <td>{new Date(admin.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="action" onClick={() => this.deleteAdmin(admin.id)}>
                        {i18n.t('delete')}
                      </div>
                      <div className="action" onClick={() => this.sendAdminInvite(admin.email)}>
                        {i18n.t('settings_admin_send_invite')}
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

export { GroupAdmins };
