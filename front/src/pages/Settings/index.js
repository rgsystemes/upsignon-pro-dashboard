import React from 'react';
import { i18n } from '../../i18n/i18n';
import { Admins } from './Admins';
import { AllowedEmails } from './AllowedEmails';
import { ProSetupLink } from './ProSetupLink';
import { SecuritySettings } from './SecuritySettings';
import './settings.css';
import { Urls } from './Urls';

// Props setIsLoading
class Settings extends React.Component {
  render() {
    return (
      <div className="page">
        <h1>{i18n.t('menu_settings')}</h1>
        <ProSetupLink />
        <SecuritySettings setIsLoading={this.props.setIsLoading} />
        <Admins setIsLoading={this.props.setIsLoading} />
        <AllowedEmails setIsLoading={this.props.setIsLoading} />
        <Urls setIsLoading={this.props.setIsLoading} />
      </div>
    );
  }
}

export { Settings };
