import React from 'react';
import { bankUrlFetch } from '../urlFetch';
import { i18n } from '../../i18n/i18n';
import { classNameForLicence } from './classNameForLicence';

export class LicencesSummary extends React.Component {
  state = {
    resellers: [],
    directBanks: [],
  };
  fetchLicenceSummary = async () => {
    try {
      const res = await bankUrlFetch('/api/licence-summary', 'POST', null);
      if (res) {
        this.setState({
          resellers: res.resellers,
          directBanks: res.directBanks,
        });
      }
    } catch (e) {
      console.error(e);
    }
  };
  componentDidMount() {
    this.fetchLicenceSummary();
  }

  render() {
    return (
      <div>
        {this.state.resellers.map((r) => {
          return (
            <div key={r.id}>
              <h3>{r.name}</h3>
              <Licences licences={r.licences} />
            </div>
          );
        })}
        {this.state.directBanks.map((b) => {
          return (
            <div key={b.id}>
              <h3>{b.name}</h3>
              <Licences licences={b.licences} />
            </div>
          );
        })}
      </div>
    );
  }
}

const Licences = (p) => {
  return (
    <table>
      <thead>
        <tr>
          <th>{i18n.t('licences_nb')}</th>
          <th>{i18n.t('licences_is_montly')}</th>
          <th>{i18n.t('licences_valid_from')}</th>
          <th>{i18n.t('licences_valid_until')}</th>
          <th>{i18n.t('licences_to_be_renewed')}</th>
        </tr>
      </thead>
      <tbody>
        {p.licences &&
          p.licences.map((l) => {
            return (
              <tr key={l.id} className={classNameForLicence(l)}>
                <td>{l.nb_licences}</td>
                <td>
                  <input type="checkbox" disabled checked={l.is_monthly} />
                </td>
                <td>{new Date(l.valid_from).toLocaleDateString()}</td>
                <td>{l.valid_until ? new Date(l.valid_until).toLocaleDateString() : '-'}</td>
                <td>{l.to_be_renewed ? i18n.t('yes') : i18n.t('no')}</td>
              </tr>
            );
          })}
      </tbody>
    </table>
  );
};
