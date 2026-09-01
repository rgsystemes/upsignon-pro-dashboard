import React from 'react';
import { i18n } from '../../i18n/i18n';
import { LicenceTable } from '../../helpers/LicenceTable';

// Props setIsLoading

export class Licences extends React.Component {
  render() {
    return (
      <div className="page">
        <h1>{i18n.t('menu_licences')}</h1>
        <LicenceTable setIsLoading={this.props.setIsLoading} />
      </div>
    );
  }
}
