import React from 'react';
import { fetchTemplate } from '../helpers/fetchTemplate';
import { baseFrontUrl, group } from '../helpers/env';

class GroupChooser extends React.Component {
  state = {
    groups: [],
    isSuperadmin: false,
    showList: false,
  };
  fetchGroups = async () => {
    try {
      const groupsRes = await fetchTemplate('/get_available_groups', 'GET', null, {
        useBaseUrl: true,
      });
      this.setState({ groups: groupsRes.groups, isSuperadmin: groupsRes.isSuperadmin });
    } catch (e) {
      console.error(e);
    }
  };
  componentDidMount() {
    this.fetchGroups();
  }
  toggleGroupList = () => {
    this.setState((s) => ({ ...s, showList: !s.showList }));
  };
  selectGroup = (groupId) => {
    window.location.href = baseFrontUrl + '/' + groupId + '/';
  };
  render() {
    return (
      <div
        style={{
          padding: 20,
          display: 'flex',
          position: 'relative',
          overflow: 'visible',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            borderRadius: 5,
            padding: '5px 10px',
            color: 'white',
            backgroundColor: 'rgb(44, 83, 132)',
            cursor: 'pointer',
            width: '100%',
          }}
          onClick={this.toggleGroupList}
        >
          {this.state.groups.find((g) => g.id == group)?.name}
        </div>
        {this.state.showList && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% - 20px)',
              backgroundColor: 'white',
              border: '1px solid #eee',
              boxShadow: '0 0 5px rgb(44, 83, 132)',
              maxHeight: '80vh',
              overflow: 'scroll',
            }}
          >
            {this.state.groups.map((g) => {
              return (
                <div key={g.id} className="group" onClick={() => this.selectGroup(g.id)}>
                  {g.name}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }
}

export { GroupChooser };
