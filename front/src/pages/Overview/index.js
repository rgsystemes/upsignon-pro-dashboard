import React from 'react';
import { i18n } from '../../i18n/i18n';
import { PendingPasswordResetRequests } from './PendingPasswordResetRequests';
import { SecurityChart } from './SecurityChart';
import { UsageChart } from './UsageChart';
import { Extracts } from './Extracts';
import { ServerStatus } from './ServerStatus';

// Props = setIsLoading
class Overview extends React.Component {
  render() {
    return (
      <div className="page">
        <h1>{i18n.t('menu_overview')}</h1>
        <p>{i18n.t('suggestion')}</p>
        <ServerStatus />
        <PendingPasswordResetRequests setIsLoading={this.props.setIsLoading} />
        <SecurityChart />
        <UsageChart />
        <Extracts isLoading={this.props.isLoading} setIsLoading={this.props.setIsLoading} />
      </div>
    );
  }
}

export { Overview };
