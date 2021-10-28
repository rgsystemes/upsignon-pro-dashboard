import React from 'react';
import { i18n } from '../../i18n/i18n';
import './ServerStatus.css';

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
    if (this.state.proServerStatus === 'FETCHING') return <div className="fetchingStatus">...</div>;
    if (this.state.proServerStatus === 'RUNNING')
      return <div className="runningStatus">{i18n.t('pro_server_status_running')}</div>;
    if (this.state.proServerStatus === 'STOPPED')
      return <div className="stoppedStatus">{i18n.t('pro_server_status_stopped')}</div>;
  }
}
