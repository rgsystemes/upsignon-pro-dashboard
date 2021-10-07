import React from 'react';
import { fetchTemplate } from '../../helpers/fetchTemplate';
import { i18n } from '../../i18n/i18n';
import './userDevice.css';

class UserDevices extends React.Component {
  deleteDeviceWithWarning = async (deviceId) => {
    const confirmation = window.confirm(i18n.t('device_delete_warning'));
    if (confirmation) {
      if (confirmation) {
        try {
          await fetchTemplate(`/api/delete-device/${deviceId}`, 'POST', null);
          await this.props.reloadDevices();
        } catch (e) {
          console.error(e);
        }
      }
    }
  };
  deactivateDeviceWithWarning = async (deviceId) => {
    const confirmation = window.confirm(i18n.t('device_deactivate_warning'));
    if (confirmation) {
      try {
        await fetchTemplate(`/api/deactivate-device/${deviceId}`, 'POST', null);
        await this.props.reloadDevices();
      } catch (e) {
        console.error(e);
      }
    }
  };
  authorizeDeviceWithWarning = async (deviceId) => {
    const confirmation = window.confirm(i18n.t('device_authorize_warning'));
    if (confirmation) {
      if (confirmation) {
        try {
          await fetchTemplate(`/api/authorize-device/${deviceId}`, 'POST', null);
          await this.props.reloadDevices();
        } catch (e) {
          console.error(e);
        }
      }
    }
  };

  render() {
    return (
      <div style={{ margin: '0 20px 20px 20px' }}>
        <h5 style={{ margin: 0, lineHeight: '20px' }}>
          {i18n.t('devices_for_user', { email: this.props.email })}
        </h5>
        <table>
          <thead>
            <tr>
              <th>{i18n.t('device_name')}</th>
              <th>{i18n.t('device_app_version')}</th>
              <th>{i18n.t('device_type')}</th>
              <th>{i18n.t('device_status')}</th>
              <th>{i18n.t('device_last_session')}</th>
              <th>{i18n.t('device_actions')}</th>
            </tr>
          </thead>
          <tbody>
            {this.props.devices.map((d) => {
              const isAuthorized = d.authorization_status === 'AUTHORIZED';
              const isRevokedByUser = d.authorization_status === 'REVOKED_BY_USER';
              return (
                <tr key={d.id}>
                  <td>{d.device_name}</td>
                  <td>{d.app_version}</td>
                  <td>
                    <div>{d.device_type}</div>
                    <div>{d.os_version}</div>
                  </td>
                  <td>
                    <div className={!isAuthorized ? 'unauthorizedDevice' : ''}>
                      {d.authorization_status}
                    </div>
                    {!isAuthorized && d.revocation_date != null && (
                      <div>{new Date(d.revocation_date).toLocaleString()}</div>
                    )}
                  </td>
                  <td>{new Date(d.last_session).toLocaleString()}</td>
                  <td>
                    <div className="action" onClick={() => this.deleteDeviceWithWarning(d.id)}>
                      {i18n.t('device_delete')}
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
