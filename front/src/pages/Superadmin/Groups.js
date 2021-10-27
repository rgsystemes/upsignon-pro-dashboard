import React from 'react';
import { EditableCell } from '../../helpers/EditableCell';
import { adminFetchTemplate } from '../../helpers/fetchTemplate';
import { i18n } from '../../i18n/i18n';

// Props : setIsLoading
class Groups extends React.Component {
  state = {
    groups: [],
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
    const confirmation = window.confirm(i18n.t('sasettings_group_delete_warning'));
    if (confirmation) {
      try {
        this.props.setIsLoading(true);
        await adminFetchTemplate(`/superadmin-api/delete-group/${id}`, 'POST', null);
        await this.fetchGroups();
      } catch (e) {
        console.error(e);
      } finally {
        this.props.setIsLoading(false);
      }
    }
  };
  componentDidMount() {
    this.fetchGroups();
  }
  render() {
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
                      <div className="action" onClick={() => this.deleteGroup(group.id)}>
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
