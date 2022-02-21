import React from 'react';
import { i18n } from '../../i18n/i18n';
import { AllowedEmails } from './AllowedEmails';
import { GroupAdmins } from './GroupAdmins';
import { ProSetupLink } from './ProSetupLink';
import { Urls } from './Urls';

// Props setIsLoading, isSuperAdmin, otherGroups
class Settings extends React.Component {
  render() {
    return (
      <div className="page">
        <h1>{i18n.t('menu_settings')}</h1>
        <ProSetupLink />
        <AllowedEmails setIsLoading={this.props.setIsLoading} />
        <GroupAdmins setIsLoading={this.props.setIsLoading} />
        <Urls
          setIsLoading={this.props.setIsLoading}
          isSuperAdmin={this.props.isSuperAdmin}
          otherGroups={this.props.otherGroups}
        />
      </div>
    );
  }
}

export { Settings };
