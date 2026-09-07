import React from 'react';
import { i18n } from '../../i18n/i18n';
import './ServerStatus.css';
import { bankUrlFetch } from '../../helpers/urlFetch';

// PROPS proServerUrl
export class ServerStatus extends React.Component {
  state = {
    proServerStatus: 'FETCHING',
  };
  fetchStatus = async () => {
    try {
      if (this.props.proServerUrl) {
        // GET STATUS
        try {
          const response = await fetch(this.props.proServerUrl, {
            method: 'GET',
            cache: 'no-store',
            mode: 'cors',
          });
          if (response.ok) {
            this.setState({ proServerStatus: 'RUNNING' });
          } else {
            this.setState({ proServerStatus: 'STOPPED' });
          }
        } catch (e) {
          this.setState({ proServerStatus: 'STOPPED' });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };
  componentDidMount() {
    this.fetchStatus();
  }
  render() {
    if (!this.props.proServerUrl) return null;

    return (
      <React.Fragment>
        {this.state.proServerStatus === 'FETCHING' && <div className="fetchingStatus">...</div>}
        {this.state.proServerStatus === 'RUNNING' && (
          <div className="runningStatus">{i18n.t('pro_server_status_running')}</div>
        )}
        {this.state.proServerStatus === 'STOPPED' && (
          <div className="stoppedStatus">{i18n.t('pro_server_status_stopped')}</div>
        )}
      </React.Fragment>
    );
  }
}
