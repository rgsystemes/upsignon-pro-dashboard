import React from 'react';
import { baseUrlFetch, bankUrlFetch } from '../../helpers/urlFetch';
import { i18n } from '../../i18n/i18n';
import { isReadOnlySuperadmin } from '../../helpers/isReadOnlySuperadmin';

// Props : setIsLoading, banks
class Admins extends React.Component {
  state = {
    admins: [],
    adminRole: 'admin', // 'admin' | 'readOnlySuperadmin' | 'superadmin'
    visibleAdminChangeRightsView: [],
  };
  newInputRef = null;

  fetchAdmins = async () => {
    try {
      const admins = await bankUrlFetch('/api/admins', 'GET', null);
      this.setState({ admins: admins });
    } catch (e) {
      console.error(e);
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
      await bankUrlFetch('/api/insert-admin', 'POST', {
        newEmail,
        adminRole: this.state.adminRole,
      });
      await this.fetchAdmins();
      this.newInputRef.value = null;
      this.setState({ adminRole: 'admin' });
    } catch (e) {
      console.error(e);
    } finally {
      this.props.setIsLoading(false);
    }
  };
  updateAdminBank = async (adminId, bankId, willBelongToBank) => {
    try {
      this.props.setIsLoading(true);
      await bankUrlFetch('/api/update-admin-bank', 'POST', {
        adminId,
        bankId,
        willBelongToBank,
      });
      await this.fetchAdmins();
    } catch (e) {
      console.error(e);
    } finally {
      this.props.setIsLoading(false);
    }
  };
  changeSuperadminRole = async (adminId, adminRole) => {
    try {
      this.props.setIsLoading(true);
      await bankUrlFetch('/api/update-admin-role', 'POST', {
        adminId,
        adminRole,
      });
      await this.fetchAdmins();

      if (adminRole === 'superadmin' || adminRole === 'readOnlySuperadmin') {
        this.setState((s) => ({
          ...s,
          visibleAdminChangeRightsView: s.visibleAdminChangeRightsView.filter((v) => v !== adminId),
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      this.props.setIsLoading(false);
    }
  };
  deleteAdmin = async (id) => {
    const confirmation = window.confirm(i18n.t('sasettings_admin_delete_warning'));
    if (confirmation) {
      try {
        this.props.setIsLoading(true);
        await bankUrlFetch(`/api/delete-admin/${id}`, 'POST', null);
        await this.fetchAdmins();
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
  openChangeRights = (adminId) => {
    this.setState((s) => ({
      ...s,
      visibleAdminChangeRightsView: [...s.visibleAdminChangeRightsView, adminId],
    }));
  };
  closeChangeRights = (adminId) => {
    this.setState((s) => ({
      ...s,
      visibleAdminChangeRightsView: s.visibleAdminChangeRightsView.filter((v) => v !== adminId),
    }));
  };
  componentDidMount() {
    this.fetchAdmins();
  }
  render() {
    return (
      <div style={{ marginTop: 20 }}>
        <h2>{i18n.t('sasettings_superadmins')}</h2>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 20,
          }}
          className={`${isReadOnlySuperadmin ? 'disabledUI' : ''}`}
        >
          <input
            ref={(r) => {
              this.newInputRef = r;
            }}
            placeholder="admin.email@domain.com"
            style={{ width: 300, marginRight: 10 }}
          />
          <label>{i18n.t('sasettings_superadmin_role')}:</label>
          <AdminRoleSelect
            adminRole={this.state.adminRole}
            onChange={(r) => {
              this.setState((s) => ({ ...s, adminRole: r }));
            }}
          />
          <div
            className={`action ${isReadOnlySuperadmin ? 'disabledUI' : ''}`}
            style={{ marginLeft: 10 }}
            onClick={this.insertAdmin}
          >
            {i18n.t('sasettings_superadmins_invite')}
          </div>
        </div>
        {this.state.admins.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>{i18n.t('settings_admin_email')}</th>
                <th>{i18n.t('settings_admin_created_at')}</th>
                <th>{i18n.t('menu_superadmin')}</th>
                <th>{i18n.t('settings_admin_banks')}</th>
                <th>{i18n.t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {this.state.admins.map((admin) => {
                const isChangeRightsViewVisible = this.state.visibleAdminChangeRightsView.includes(
                  admin.id,
                );
                const showChangeRightsButton = admin.adminRole === 'admin';
                return (
                  <React.Fragment key={admin.id}>
                    <tr>
                      <td
                        style={
                          admin.adminRole != 'admin' ? { backgroundColor: 'rgb(246, 164, 0)' } : {}
                        }
                      >
                        {admin.email}
                      </td>
                      <td>{new Date(admin.created_at).toLocaleDateString()}</td>
                      <td>
                        <AdminRoleSelect
                          adminRole={admin.adminRole}
                          onChange={(r) => {
                            this.changeSuperadminRole(admin.id, r);
                          }}
                        />
                      </td>
                      <td
                        style={{
                          backgroundColor: admin.is_superadmin
                            ? 'lightgrey'
                            : admin.banks && admin.banks.length > 0
                              ? 'white'
                              : 'red',
                        }}
                      >
                        {admin.adminRole === 'admin' &&
                          admin.banks?.map((g) => {
                            return <div key={g.id}>{g.name}</div>;
                          })}
                      </td>
                      <td className={`${isReadOnlySuperadmin ? 'disabledUI' : ''}`}>
                        <div className="action" onClick={() => this.deleteAdmin(admin.id)}>
                          {i18n.t('delete')}
                        </div>
                        {showChangeRightsButton && (
                          <div className="action" onClick={() => this.openChangeRights(admin.id)}>
                            {i18n.t('sasettings_admin_change_rights')}
                          </div>
                        )}
                        <div className="action" onClick={() => this.sendAdminInvite(admin.email)}>
                          {i18n.t('settings_admin_send_invite')}
                        </div>
                      </td>
                    </tr>
                    {isChangeRightsViewVisible && (
                      <tr>
                        <td colSpan={5}>
                          <div className="action" onClick={() => this.closeChangeRights(admin.id)}>
                            {i18n.t('close')}
                          </div>
                          {!admin.is_superadmin && (
                            <div style={{ marginTop: 15, margin: 'auto' }}>
                              {this.props.banks.map((g) => {
                                const doesBelongToBank = admin.banks?.some((ag) => ag.id === g.id);
                                return (
                                  <div key={g.id} style={{ display: 'flex', alignItems: 'center' }}>
                                    <input
                                      type="checkbox"
                                      onChange={(v) => {
                                        this.updateAdminBank(admin.id, g.id, !doesBelongToBank);
                                      }}
                                      checked={doesBelongToBank}
                                      disabled={isReadOnlySuperadmin}
                                    />
                                    <div style={{ marginLeft: 5 }}>{g.name}</div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    );
  }
}

const AdminRoleSelect = (p) => {
  return (
    <select
      value={p.adminRole}
      onChange={(e) => {
        p.onChange(e.target.value);
      }}
      style={{ marginLeft: 10, marginRight: 10, padding: 5 }}
      disabled={isReadOnlySuperadmin}
    >
      <option value="admin">{i18n.t('sasettings_superadmin_role_admin')}</option>
      <option value="readOnlySuperadmin">
        {i18n.t('sasettings_superadmin_role_read_only_superadmin')}
      </option>
      <option value="superadmin">{i18n.t('sasettings_superadmin_role_superadmin')}</option>
    </select>
  );
};

export { Admins };
