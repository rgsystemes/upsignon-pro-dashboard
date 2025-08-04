import React from 'react';
import { baseUrlFetch, bankUrlFetch } from '../../helpers/urlFetch';
import { i18n } from '../../i18n/i18n';
import { isRestrictedSuperadmin } from '../../helpers/isRestrictedSuperadmin';

// Props : setIsLoading, resellerId
class ResellerAdmins extends React.Component {
  state = {
    admins: [],
  };
  newInputRef = null;

  fetchAdmins = async () => {
    try {
      const adminsRes = await bankUrlFetch(`/api/reseller-admins`, 'GET', null);
      this.setState({ admins: adminsRes.admins });
    } catch (e) {
      console.error('Error fetching reseller admins:', e);
    }
  };

  insertAdmin = async () => {
    try {
      this.props.setIsLoading(true);
      const newEmail = this.newInputRef.value;
      if (!newEmail) {
        this.newInputRef.style.borderColor = 'red';
        return;
      } else {
        this.newInputRef.style.borderColor = null;
      }
      await bankUrlFetch('/api/insert-reseller-admin', 'POST', {
        email: newEmail,
      });
      await this.fetchAdmins();
      this.newInputRef.value = null;
    } catch (e) {
      console.error('Error inserting reseller admin:', e);
    } finally {
      this.props.setIsLoading(false);
    }
  };

  deleteAdmin = async (id) => {
    const confirmation = window.confirm(i18n.t('sasettings_admin_delete_warning'));
    if (confirmation) {
      try {
        this.props.setIsLoading(true);
        await bankUrlFetch(`/api/delete-reseller-admin/${id}`, 'POST', null);
        await this.fetchAdmins();
      } catch (e) {
        console.error('Error deleting reseller admin:', e);
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
      console.error('Error sending admin invite:', e);
      window.alert(i18n.t('sasettings_email_config_testing_error_alert', { e }));
    } finally {
      this.props.setIsLoading(false);
    }
  };

  componentDidMount() {
    this.fetchAdmins();
  }

  render() {
    return (
      <div style={{ marginTop: 20 }}>
        <h2>{i18n.t('reseller_admins')}</h2>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 20,
          }}
          className={isRestrictedSuperadmin ? 'disabledUI' : null}
        >
          <input
            ref={(r) => {
              this.newInputRef = r;
            }}
            placeholder="admin.email@domain.com"
            style={{ width: 300, marginRight: 10 }}
          />
          <div className="action" style={{ marginLeft: 10 }} onClick={this.insertAdmin}>
            {i18n.t('sasettings_superadmins_invite')}
          </div>
        </div>
        {this.state.admins.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>{i18n.t('settings_admin_email')}</th>
                <th>{i18n.t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {this.state.admins.map((admin) => {
                return (
                  <tr key={admin.id}>
                    <td>{admin.email}</td>
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

export { ResellerAdmins };
