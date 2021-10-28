import React from 'react';
import { groupUrlFetch } from '../../helpers/urlFetch';
import { i18n } from '../../i18n/i18n';

// Props setIsLoading

class PendingPasswordResetRequests extends React.Component {
  state = {
    pendingRequests: [],
  };
  fetchPendingPasswordResetRequests = async () => {
    try {
      const res = await groupUrlFetch('/api/get-pending-password-reset-requests', 'GET', null);
      this.setState({
        pendingRequests: res,
      });
    } catch (e) {
      console.error(e);
    }
  };
  componentDidMount() {
    this.fetchPendingPasswordResetRequests();
  }

  deletePwdResetReqWithWarning = async (pwdResetId) => {
    const confirmation = window.confirm(i18n.t('password_reset_request_delete_warning'));
    if (confirmation) {
      try {
        this.props.setIsLoading(true);
        await groupUrlFetch(`/api/delete-pwd-reset-request/${pwdResetId}`, 'POST', null);
        await this.fetchPendingPasswordResetRequests();
      } catch (e) {
        console.error(e);
      } finally {
        this.props.setIsLoading(false);
      }
    }
  };

  grantPwdResetReqWithWarning = async (pwdResetId) => {
    const confirmation = window.confirm(i18n.t('password_reset_request_grant_warning'));
    if (confirmation) {
      try {
        this.props.setIsLoading(true);
        await groupUrlFetch(`/api/grant-pwd-reset-request/${pwdResetId}`, 'POST', null);
        await this.fetchPendingPasswordResetRequests();
      } catch (e) {
        console.error(e);
      } finally {
        this.props.setIsLoading(false);
      }
    }
  };

  render() {
    if (this.state.pendingRequests.length === 0) return null;
    return (
      <div>
        <h2>{i18n.t('password_reset_requests_pending')}</h2>
        <table style={{ marginBottom: 20 }}>
          <thead>
            <tr>
              <th>{i18n.t('password_reset_request_date')}</th>
              <th>{i18n.t('user_email')}</th>
              <th>{i18n.t('device_name')}</th>
              <th>{i18n.t('device_type')}</th>
              <th>{i18n.t('device_shared_with')}</th>
              <th>{i18n.t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {this.state.pendingRequests.map((d) => {
              return (
                <tr key={d.pwd_reset_id}>
                  <td>{new Date(d.pwd_reset_created_at).toLocaleString()}</td>
                  <td>{d.email}</td>
                  <td>{d.device_name}</td>
                  <td>{d.device_type}</td>
                  {!!d.shared_with ? (
                    <td className="warningCell">
                      {d.shared_with.split(';').map((email) => (
                        <div key={email}>{email}</div>
                      ))}
                    </td>
                  ) : (
                    <td></td>
                  )}
                  <td>
                    <div
                      className="action"
                      onClick={() => this.deletePwdResetReqWithWarning(d.pwd_reset_id)}
                    >
                      {i18n.t('delete')}
                    </div>
                    <div
                      className="action"
                      onClick={() => this.grantPwdResetReqWithWarning(d.pwd_reset_id)}
                    >
                      {i18n.t('password_reset_request_grant')}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
}

export { PendingPasswordResetRequests };
