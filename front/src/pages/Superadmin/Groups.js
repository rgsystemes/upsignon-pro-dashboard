import React from 'react';
import { EditableCell } from '../../helpers/EditableCell';
import { adminFetchTemplate } from '../../helpers/fetchTemplate';
import { i18n } from '../../i18n/i18n';

// Props : setIsLoading
class Groups extends React.Component {
  state = {
    groups: [],
    groupToDeleteId: null,
  };
  newInputRef = null;

  fetchGroups = async () => {
    try {
      const groups = await adminFetchTemplate('/superadmin-api/groups', 'GET', null);
      this.setState({ groups });
    } catch (e) {
      console.error(e);
    }
  };
  insertGroup = async () => {
    try {
      this.props.setIsLoading(true);
      const newGroup = this.newInputRef.value;
      if (!newGroup) {
        this.newInputRef.style.borderColor = 'red';
        return;
      } else {
        this.newInputRef.style.borderColor = null;
      }
      await adminFetchTemplate('/superadmin-api/insert-group', 'POST', { name: newGroup });
      await this.fetchGroups();
      this.newInputRef.value = null;
    } catch (e) {
      console.error(e);
    } finally {
      this.props.setIsLoading(false);
    }
  };
  updateGroup = async (groupId, newName) => {
    try {
      this.props.setIsLoading(true);
      await adminFetchTemplate('/superadmin-api/update-group', 'POST', {
        name: newName,
        id: groupId,
      });
      await this.fetchGroups();
    } catch (e) {
      console.error(e);
    } finally {
      this.props.setIsLoading(false);
    }
  };
  deleteGroup = async (id) => {
    try {
      this.props.setIsLoading(true);
      await adminFetchTemplate(`/superadmin-api/delete-group/${id}`, 'POST', null);
      await this.fetchGroups();
    } catch (e) {
      console.error(e);
    } finally {
      this.props.setIsLoading(false);
    }
  };
  componentDidMount() {
    this.fetchGroups();
  }
  render() {
    const groupToDelete = this.state.groups.find((g) => g.id === this.state.groupToDeleteId);
    if (groupToDelete) {
      return (
        <div style={{ marginTop: 50 }}>
          <h2>{i18n.t('sasettings_groups')}</h2>
          <div style={{ border: '5px solid red', padding: 20 }}>
            <h3>{i18n.t('sasettings_group_delete_warning')}</h3>
            <div style={{ marginBottom: 10 }}>
              {i18n.t('sasetting_confirm_group_delete', {
                name: groupToDelete.name,
              })}
            </div>
            <input ref={(r) => (this.deleteGroupInputRef = r)} />
            <div
              className="danger-button"
              style={{ marginLeft: 20 }}
              onClick={() => {
                if (this.deleteGroupInputRef.value === groupToDelete.name) {
                  this.deleteGroup(groupToDelete.id);
                } else {
                  this.deleteGroupInputRef.style.borderColor = 'red';
                }
              }}
            >
              {i18n.t('validate')}
            </div>
            <div
              className="button"
              style={{ marginLeft: 20 }}
              onClick={() => this.setState({ groupToDeleteId: null })}
            >
              {i18n.t('cancel')}
            </div>
          </div>
        </div>
      );
    }
    return (
      <div style={{ marginTop: 50 }}>
        <h2>{i18n.t('sasettings_groups')}</h2>
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
            placeholder={i18n.t('sasettings_group_name')}
            style={{ width: 300 }}
          />
          <div className="action" style={{ marginLeft: 10 }} onClick={this.insertGroup}>
            {i18n.t('add')}
          </div>
        </div>
        <div>{i18n.t('sasettings_group_name_change_warning')}</div>
        {this.state.groups.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>{i18n.t('sasettings_group_name')}</th>
                <th>{i18n.t('sasettings_nb_users')}</th>
                <th>{i18n.t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {this.state.groups.map((group) => {
                return (
                  <tr key={group.id}>
                    <EditableCell
                      value={group.name}
                      onChange={(newVal) => {
                        if (!newVal) return;
                        this.updateGroup(group.id, newVal);
                      }}
                    />
                    <td>{group.nb_users}</td>
                    <td>
                      <div
                        className="action"
                        onClick={() => this.setState({ groupToDeleteId: group.id })}
                      >
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

export { Groups };
