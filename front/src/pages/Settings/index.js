import React from 'react';
import { i18n } from '../../i18n/i18n';
import { AllowedEmails } from './AllowedEmails';
import { GroupAdmins } from './GroupAdmins';
import { OtherSettings } from './OtherSettings';
import { ProSetupLink } from './ProSetupLink';
import { Urls } from './Urls';
import { ServerRedirection } from './ServerRedirection';
import { MicrosoftEntraConfig } from './MicrosoftEntraConfig';

// Props setIsLoading, isSuperAdmin, otherGroups
class Settings extends React.Component {
  render() {
    return (
      <div className="page">
        <h1>{i18n.t('menu_settings')}</h1>
        <ProSetupLink />
        <OtherSettings setIsLoading={this.props.setIsLoading} />
        <GroupAdmins setIsLoading={this.props.setIsLoading} />
        <Urls
          setIsLoading={this.props.setIsLoading}
          isSuperAdmin={this.props.isSuperAdmin}
          otherGroups={this.props.otherGroups}
        />
        <MicrosoftEntraConfig setIsLoading={this.props.setIsLoading} />
        <AllowedEmails setIsLoading={this.props.setIsLoading} />
        <ServerRedirection />
      </div>
    );
  }
}

export { Settings };
