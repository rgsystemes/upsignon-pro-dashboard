import React from 'react';
import { fetchTemplate } from '../../helpers/fetchTemplate';
import { i18n } from '../../i18n/i18n';
import './ServerStatus.css';

export class ServerStatus extends React.Component {
  state = {
    proServerStatus: 'FETCHING',
  };
  fetchStatus = async () => {
    try {
      const settings = await fetchTemplate('/api/settings', 'GET', null);
      if (settings.PRO_SERVER_URL_CONFIG) {
        // GET STATUS
        try {
          const response = await fetch(`${settings.PRO_SERVER_URL_CONFIG.url}/config`, {
            method: 'GET',
            cache: 'no-store',
            mode: 'cors',
          });
          const config = await response.json();
          if (response.ok && config.displayName) {
            this.setState({ proServerStatus: 'RUNNING' });
          } else {
            this.setState({ proServerStatus: 'STOPPED' });
          }
        } catch (e) {
          this.setState({ proServerStatus: 'STOPPED' });
        }
      } else {
        this.setState({ proServerStatus: 'UNKNOWN' });
      }
    } catch (e) {
      console.error(e);
    }
  };
  componentDidMount() {
    this.fetchStatus();
  }
  render() {
    return (
      <React.Fragment>
        <div>
          {this.state.proServerStatus === 'FETCHING' && <span className="fetchingStatus">...</span>}
          {this.state.proServerStatus === 'UNKNOWN' && (
            <span className="fetchingStatus">{i18n.t('pro_server_unknown_status')}</span>
          )}
          {this.state.proServerStatus === 'RUNNING' && (
            <span className="runningStatus">{i18n.t('pro_server_status_running')}</span>
          )}
          {this.state.proServerStatus === 'STOPPED' && (
            <span className="stoppedStatus">{i18n.t('pro_server_status_stopped')}</span>
          )}
        </div>
      </React.Fragment>
    );
  }
}
