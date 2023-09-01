import React from 'react';
import { i18n } from '../../i18n/i18n';
import { SecurityChart } from './SecurityChart';
import { UsageChart } from './UsageChart';

// Props = setIsLoading, isSuperadminPage
class Overview extends React.Component {
  render() {
    return (
      <div className="page">
        <h1>{i18n.t('menu_overview')}</h1>
        <p>
          {i18n.t('suggestion')} <a href="mailto:contact@upsignon.eu">contact@upsignon.eu</a>
        </p>
        <SecurityChart />
        <UsageChart />
      </div>
    );
  }
}

export { Overview };
