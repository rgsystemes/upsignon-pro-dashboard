import React from 'react';
import { fetchTemplate } from '../../helpers/fetchTemplate';
import { i18n } from '../../i18n/i18n';

// Props : setIsLoading
class Admins extends React.Component {
  state = {
    admins: [],
  };
  newInputRef = null;

  fetchAdmins = async () => {
    try {
      const adminEmails = await fetchTemplate('/api/admins', 'GET', null);
      this.setState({
        admins: adminEmails,
      });
    } catch (e) {
      console.error(e);
    }
  };
  insertAdmin = async () => {
    try {
      this.props.setIsLoading(true);
      const newEmail = this.newInputRef.value;
      await fetchTemplate('/api/insert-admin', 'POST', { newEmail });
      await this.fetchAdmins();
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
        await fetchTemplate(`/api/delete-admin/${id}`, 'POST', null);
        await this.fetchAdmins();
      } catch (e) {
        console.error(e);
      } finally {
        this.props.setIsLoading(false);
      }
    }
  };
  componentDidMount() {
    this.fetchAdmins();
  }
  render() {
    return (
      <div style={{ marginTop: 50 }}>
        <h2>{i18n.t('settings_admins')}</h2>
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
          />
          <div className="action" style={{ marginLeft: 10 }} onClick={this.insertAdmin}>
            {i18n.t('add')}
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

export { Admins };
