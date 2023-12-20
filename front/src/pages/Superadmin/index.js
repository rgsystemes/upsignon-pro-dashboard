import React from 'react';
import { i18n } from '../../i18n/i18n';
import { Admins } from './Admins';
import './superadmin.css';
import { Groups } from './Groups';
import { ProServerUrl } from './ProServerUrl';
import { groupUrlFetch } from '../../helpers/urlFetch';
import { EmailConfig } from './EmailConfig';

// Props setIsLoading, updateMenuGroups
class Superadmin extends React.Component {
  state = {
    groups: [],
  };
  fetchGroups = async () => {
    try {
      const groups = await groupUrlFetch('/api/groups', 'GET', null);
      this.setState({ groups });
      this.props.updateMenuGroups(groups);
    } catch (e) {
      console.error(e);
    }
  };
  componentDidMount() {
    this.fetchGroups();
  }
  render() {
    return (
      <div className="page">
        <h1>{i18n.t('menu_superadmin')}</h1>
        <ProServerUrl />
        <Groups
          setIsLoading={this.props.setIsLoading}
          groups={this.state.groups}
          fetchGroups={this.fetchGroups}
        />
        <Admins setIsLoading={this.props.setIsLoading} groups={this.state.groups} />
        <EmailConfig setIsLoading={this.props.setIsLoading} />
      </div>
    );
  }
}

export { Superadmin };
