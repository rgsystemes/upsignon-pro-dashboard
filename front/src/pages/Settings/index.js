import React from 'react';
import { i18n } from '../../i18n/i18n';
import { AllowedEmails } from './AllowedEmails';
import { SecuritySettings } from './SecuritySettings';
import './settings.css';
import { Urls } from './Urls';

class Settings extends React.Component {
  render() {
    return (
      <div className="page">
        <h1>{i18n.t('menu_settings')}</h1>
        <SecuritySettings />
        <AllowedEmails />
        <Urls />
      </div>
    );
  }
}

export { Settings };
