import React from 'react';
import { groupUrlFetch } from '../../helpers/urlFetch';
import { i18n } from '../../i18n/i18n';
import './userDevice.css';

// PROPS = setIsLoading, devices, email, reloadDevices, close
class UserDevices extends React.Component {
  deleteDeviceWithWarning = async (deviceId) => {
    const confirmation = window.confirm(i18n.t('device_delete_warning'));
    if (confirmation) {
      try {
        this.props.setIsLoading(true);
        await groupUrlFetch(`/api/delete-device/${deviceId}`, 'POST', null);
        await this.props.reloadDevices();
      } catch (e) {
        console.error(e);
      } finally {
        this.props.setIsLoading(false);
      }
    }
  };
  deactivateDeviceWithWarning = async (deviceId) => {
    const confirmation = window.confirm(i18n.t('device_deactivate_warning'));
    if (confirmation) {
      try {
        this.props.setIsLoading(true);
        await groupUrlFetch(`/api/deactivate-device/${deviceId}`, 'POST', null);
        await this.props.reloadDevices();
      } catch (e) {
        console.error(e);
      } finally {
        this.props.setIsLoading(false);
      }
    }
  };
  deactivateAllUsersForDevice = async (deviceId) => {
    const confirmation = window.confirm(i18n.t('device_deactivate_warning'));
    if (confirmation) {
      try {
        this.props.setIsLoading(true);
        await groupUrlFetch(`/api/deactivate-device-all-users/${deviceId}`, 'POST', null);
        await this.props.reloadDevices();
      } catch (e) {
        console.error(e);
      } finally {
        this.props.setIsLoading(false);
      }
    }
  };
  authorizeDeviceWithWarning = async (deviceId) => {
    const confirmation = window.confirm(i18n.t('device_authorize_warning'));
    if (confirmation) {
      try {
        this.props.setIsLoading(true);
        await groupUrlFetch(`/api/authorize-device/${deviceId}`, 'POST', null);
        await this.props.reloadDevices();
      } catch (e) {
        console.error(e);
      } finally {
        this.props.setIsLoading(false);
      }
    }
  };

  deletePwdResetReqWithWarning = async (pwdResetId) => {
    const confirmation = window.confirm(i18n.t('password_reset_request_delete_warning'));
    if (confirmation) {
      try {
        this.props.setIsLoading(true);
        await groupUrlFetch(`/api/delete-pwd-reset-request/${pwdResetId}`, 'POST', null);
        await this.props.reloadDevices();
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
        await this.props.reloadDevices();
      } catch (e) {
        console.error(e);
      } finally {
        this.props.setIsLoading(false);
      }
    }
  };

  render() {
    const passwordResetRequests = this.props.devices.filter((d) => d.pwd_reset_id);
    return (
      <div style={{ margin: '0 20px 20px 20px', position: 'relative' }}>
        <div
          style={{ position: 'absolute', top: 0, left: -20, cursor: 'pointer' }}
          onClick={this.props.close}
        >
          X
        </div>
        {passwordResetRequests.length > 0 && (
          <div>
            <h5 className="detailsTitle">{i18n.t('password_reset_requests')}</h5>
            <table style={{ marginBottom: 20 }}>
              <thead>
                <tr>
                  <th>{i18n.t('password_reset_request_date')}</th>
                  <th>{i18n.t('device_name')}</th>
                  <th>{i18n.t('password_reset_request_status')}</th>
                  <th>{i18n.t('device_shared_with')}</th>
                  <th>{i18n.t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {passwordResetRequests.map((d) => {
                  const expTime = new Date(d.pwd_reset_token_expiration_date);
                  const isExpired = !!d.pwd_reset_token_expiration_date
                    ? expTime < new Date().getTime()
                    : false;
                  return (
                    <tr key={d.pwd_reset_id}>
                      <td>{new Date(d.pwd_reset_created_at).toLocaleString()}</td>
                      <td>{d.device_name}</td>
                      <td>
                        <div>{d.pwd_reset_status}</div>
                        {d.pwd_reset_token_expiration_date && (
                          <div>
                            {isExpired
                              ? i18n.t('password_reset_request_expired')
                              : i18n.t('password_reset_request_valid_until', {
                                  date: expTime.toLocaleString(),
                                })}
                          </div>
                        )}
                      </td>
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
        )}
        <h5 className="detailsTitle">{i18n.t('devices_for_user', { email: this.props.email })}</h5>
        <table>
          <thead>
            <tr>
              <th>{i18n.t('device_name')}</th>
              <th>{i18n.t('device_app_version')}</th>
              <th>{i18n.t('device_type')}</th>
              <th>{i18n.t('device_status')}</th>
              <th>{i18n.t('device_last_sync_date')}</th>
              <th>{i18n.t('device_shared_with')}</th>
              <th>{i18n.t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {this.props.devices.map((d) => {
              const isAuthorized = d.authorization_status === 'AUTHORIZED';
              const isRevokedByUser = d.authorization_status === 'REVOKED_BY_USER';
              return (
                <tr key={d.id}>
                  <td>{d.device_name}</td>
                  <td>
                    {d.app_version}
                    <br />
                    {d.install_type}
                  </td>
                  <td>
                    <div>{d.os_family}</div>
                    <div>{d.os_version}</div>
                    <div>{d.device_type}</div>
                  </td>
                  <td>
                    <div className={!isAuthorized ? 'unauthorizedDevice' : ''}>
                      {d.authorization_status}
                    </div>
                    {!isAuthorized && d.revocation_date != null && (
                      <div>{new Date(d.revocation_date).toLocaleString()}</div>
                    )}
                  </td>
                  <td>{d.last_sync_date && new Date(d.last_sync_date).toLocaleString()}</td>
                  {!!d.shared_with ? (
                    <td>
                      {d.shared_with.split(';').map((email) => (
                        <div key={email}>{email}</div>
                      ))}
                      <div
                        className="action"
                        onClick={() => this.deactivateAllUsersForDevice(d.id)}
                      >
                        {i18n.t('device_deactive_all')}
                      </div>
                    </td>
                  ) : (
                    <td></td>
                  )}
                  <td>
                    <div className="action" onClick={() => this.deleteDeviceWithWarning(d.id)}>
                      {i18n.t('delete')}
                    </div>
                    {isAuthorized && (
                      <div
                        className="action"
                        onClick={() => this.deactivateDeviceWithWarning(d.id)}
                      >
                        {i18n.t('device_deactivate')}
                      </div>
                    )}
                    {!isAuthorized && !isRevokedByUser && (
                      <div className="action" onClick={() => this.authorizeDeviceWithWarning(d.id)}>
                        {i18n.t('device_authorize')}
                      </div>
                    )}
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

export { UserDevices };
