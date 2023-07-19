import React from 'react';
import { i18n } from '../i18n/i18n';

export class StatsCell extends React.Component {
  render() {
    const {
      rowSpan,
      nb_accounts_strong,
      nb_accounts_medium,
      nb_accounts_weak,
      nb_accounts_with_duplicated_password,
      nb_accounts_red,
      nb_accounts_orange,
      nb_accounts_green,
    } = this.props;
    return (
      <td rowSpan={rowSpan || 1}>
        <div style={{ display: 'flex', flexWrap: 'nowrap', flexDirection: 'row' }}>
          <div
            style={{
              paddingRight: 10,
              borderRight: '1px solid #eee',
              whiteSpace: 'nowrap',
            }}
          >
            <div className={`tag ${nb_accounts_strong > 0 && 'positiveStrong'}`}>
              {i18n.t('user_passwords_strong', { nb: nb_accounts_strong || 0 })}
            </div>
            <div className={`tag ${nb_accounts_medium > 0 && 'positiveMedium'}`}>
              {i18n.t('user_passwords_medium', { nb: nb_accounts_medium || 0 })}
            </div>
            <div className={`tag ${nb_accounts_weak > 0 && 'positiveWeak'}`}>
              {i18n.t('user_passwords_weak', { nb: nb_accounts_weak || 0 })}
            </div>
          </div>
          <div style={{ paddingLeft: 10, whiteSpace: 'nowrap' }}>
            <div className={`tag ${nb_accounts_green > 0 && 'positiveStrong'}`}>
              {i18n.t('user_passwords_green', { nb: nb_accounts_green || 0 })}
            </div>
            <div className={`tag ${nb_accounts_orange > 0 && 'positiveMedium'}`}>
              {i18n.t('user_passwords_orange', { nb: nb_accounts_orange || 0 })}
            </div>
            <div className={`tag ${nb_accounts_red > 0 && 'positiveWeak'}`}>
              {i18n.t('user_passwords_red', { nb: nb_accounts_red || 0 })}
            </div>
          </div>
        </div>
        <div
          style={{ borderTop: '1px solid #eee' }}
          className={`tag ${nb_accounts_with_duplicated_password > 0 && 'positiveReused'}`}
        >
          {i18n.t('user_passwords_duplicated', {
            nb: nb_accounts_with_duplicated_password || 0,
          })}
        </div>
      </td>
    );
  }
}
