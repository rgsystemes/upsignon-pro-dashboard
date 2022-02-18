import React from 'react';
import { baseUrlFetch } from '../../helpers/urlFetch';
import { i18n } from '../../i18n/i18n';

// Props : setIsLoading, groups
class Admins extends React.Component {
  state = {
    admins: [],
    newAdminGroupId: null,
  };
  newInputRef = null;

  fetchAdmins = async () => {
    try {
      const adminEmails = await baseUrlFetch('/superadmin/api/admins', 'GET', null);
      this.setState({
        admins: adminEmails,
      });
    } catch (e) {
      console.error(e);
    }
  };
  insertSuperAdmin = async () => {
    try {
      this.props.setIsLoading(true);
      const newEmail = this.newInputRef.value;
      if (!newEmail) {
        this.newInputRef.style.borderColor = 'red';
        return;
      } else {
        this.newInputRef.style.borderColor = null;
      }
      await baseUrlFetch('/superadmin-api/insert-admin', 'POST', {
        newEmail,
        groupId: this.state.newAdminGroupId,
      });
      await this.fetchAdmins();
      this.newInputRef.value = null;
      this.setState({ newAdminGroupId: null });
    } catch (e) {
      console.error(e);
    } finally {
      this.props.setIsLoading(false);
    }
  };
  updateAdminGroup = async (adminId, groupId) => {
    try {
      this.props.setIsLoading(true);
      await baseUrlFetch('/superadmin/api/update-admin-group', 'POST', { adminId, groupId });
      await this.fetchAdmins();
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
        await baseUrlFetch(`/superadmin-api/delete-admin/${id}`, 'POST', null);
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
            style={{ width: 300, marginRight: 10 }}
          />
          <GroupSelect
            groups={this.props.groups}
            currentGroupId={this.state.newAdminGroupId}
            onChange={(newGroupId) => {
              this.setState({ newAdminGroupId: newGroupId });
            }}
          />
          <div className="action" style={{ marginLeft: 10 }} onClick={this.insertSuperAdmin}>
            {i18n.t('sasettings_superadmins_invite')}
          </div>
        </div>
        {this.state.admins.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>{i18n.t('settings_admin_email')}</th>
                <th>{i18n.t('settings_admin_created_at')}</th>
                <th>{i18n.t('settings_admin_group')}</th>
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
                      <GroupSelect
                        groups={this.props.groups}
                        currentGroupId={admin.group_id}
                        onChange={(newGroupId) => {
                          this.updateAdminGroup(admin.id, newGroupId);
                        }}
                      />
                    </td>
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

const GroupSelect = (props) => {
  const { groups, currentGroupId, onChange } = props;
  return (
    <select
      value={currentGroupId || ''}
      onChange={(v) => {
        onChange(v.target.value);
      }}
    >
      <option value="">{i18n.t('menu_superadmin')}</option>
      {groups?.map((g) => {
        return (
          <option key={g.id} value={g.id}>
            {g.name}
          </option>
        );
      })}
    </select>
  );
};
