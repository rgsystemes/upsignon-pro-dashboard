import React from 'react';
import { fetchTemplate } from '../helpers/fetchTemplate';

class GroupChooser extends React.Component {
  state = {
    groups: [],
  };
  fetchGroups = async () => {
    try {
      const groups = await fetchTemplate('/get_available_groups', 'GET', null, {
        useBaseUrl: true,
      });
      this.setState({ groups });
    } catch (e) {
      console.error(e);
    }
  };
  componentDidMount() {
    this.fetchGroups();
  }
  render() {
    if (this.state.groups.length === 1) {
      return <div>{this.state.groups[0].name}</div>;
    }
    return (
      <div>
        {this.state.groups.map((g) => {
          return <div>{g.name}</div>;
        })}
      </div>
    );
  }
}

export { GroupChooser };
