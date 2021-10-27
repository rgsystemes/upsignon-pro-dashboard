import React from 'react';
import { adminFetchTemplate } from '../../helpers/fetchTemplate';
import { i18n } from '../../i18n/i18n';

// Props : setIsLoading
class SuperAdmins extends React.Component {
  state = {
    superAdmins: [],
  };
  newInputRef = null;

  fetchSuperAdmins = async () => {
    try {
      const adminEmails = await adminFetchTemplate('/superadmin-api/super-admins', 'GET', null);
      this.setState({
        superAdmins: adminEmails,
      });
    } catch (e) {
      console.error(e);
    }
  };
  insertSuperAdmin = async () => {
    try {
      this.props.setIsLoading(true);
      const newEmail = this.newInputRef.value;
      await adminFetchTemplate('/superadmin-api/insert-super-admin', 'POST', { newEmail });
      await this.fetchSuperAdmins();
      this.newInputRef.value = null;
    } catch (e) {
      console.error(e);
    } finally {
      this.props.setIsLoading(false);
    }
  };
  deleteAdmin = async (id) => {
    const confirmation = window.confirm(i18n.t('settings_admin_delete_warning'));
    if (confirmation) {
      try {
        this.props.setIsLoading(true);
        await adminFetchTemplate(`/superadmin-api/delete-super-admin/${id}`, 'POST', null);
        await this.fetchSuperAdmins();
      } catch (e) {
        console.error(e);
      } finally {
        this.props.setIsLoading(false);
      }
    }
  };
  componentDidMount() {
    this.fetchSuperAdmins();
  }
  render() {
    return (
      <div style={{ marginTop: 50 }}>
        <h2>{i18n.t('sasettings_superadmins')}</h2>
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
            style={{ width: 300 }}
          />
          <div className="action" style={{ marginLeft: 10 }} onClick={this.insertSuperAdmin}>
            {i18n.t('add')}
          </div>
        </div>
        {this.state.superAdmins.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>{i18n.t('settings_admin_email')}</th>
                <th>{i18n.t('settings_admin_created_at')}</th>
                <th>{i18n.t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {this.state.superAdmins.map((admin) => {
                return (
                  <tr key={admin.id}>
                    <td>{admin.email}</td>
                    <td>{new Date(admin.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="action" onClick={() => this.deleteAdmin(admin.id)}>
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

export { SuperAdmins };
