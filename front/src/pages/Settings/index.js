import React from 'react';
import { i18n } from '../../i18n/i18n';
import { AllowedEmails } from './AllowedEmails';
import { SecuritySettings } from './SecuritySettings';
import './settings.css';

class Settings extends React.Component {
  render() {
    return (
      <div>
        <h1>{i18n.t('menu_settings')}</h1>
        <SecuritySettings />
        <AllowedEmails />
      </div>
    );
  }
}

export { Settings };
