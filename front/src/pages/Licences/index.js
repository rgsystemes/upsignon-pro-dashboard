import React from 'react';
import { bankId, isSaasServer } from '../../helpers/env';
import { i18n } from '../../i18n/i18n';
import { bankUrlFetch } from '../../helpers/urlFetch';

// Props setIsLoading, totalCount, isSuperAdmin

export class Licences extends React.Component {
  state = {
    licences: [],
  };
  fetchLicences = async () => {
    try {
      const res = await bankUrlFetch('/api/get-licences', 'POST', null);
      if (res) {
        this.setState({
          internalLicences: res.internalLicences,
          externalLicences: res.externalLicences,
        });
      }
    } catch (e) {
      console.error(e);
    }
  };
  componentDidMount() {
    this.fetchLicences();
  }

  classNameForLicence = (l) => {
    try {
      const isExpiredNotRenewed =
        l.to_be_renewed && !l.is_monthly && new Date(l.valid_until).getTime() < Date.now();
      let willExpireSoon = false;
      if (l.valid_until && l.to_be_renewed) {
        let expDateMinus3Month = new Date(l.valid_until);
        expDateMinus3Month.setMonth(expDateMinus3Month.getMonth() - 3);
        willExpireSoon = expDateMinus3Month.getTime() < Date.now() && l.to_be_renewed;
      }
      const isExpiredNotToRenew =
        !l.to_be_renewed && new Date(l.valid_until).getTime() < Date.now();
      let className = null;
      if (isExpiredNotRenewed) className = 'redrow';
      else if (willExpireSoon) className = 'orangerow';
      else if (isExpiredNotToRenew) className = 'greyrow';
      return className;
    } catch (e) {
      console.error(e, l);
      return null;
    }
  };
  licenceRow = (l, idPrefix) => {
    const className = this.classNameForLicence(l);
    return (
      <tr key={`${idPrefix}${l.id}`} className={className}>
        {isSaasServer && <td>{l.reseller_name}</td>}
        <td>{l.bank_name}</td>
        <td>{l.nb_licences}</td>
        <td>
          <input type="checkbox" checked={l.is_monthly} disabled />
        </td>
        <td>{new Date(l.valid_from).toLocaleDateString()}</td>
        <td>{l.valid_until ? new Date(l.valid_until).toLocaleDateString() : '-'}</td>
        <td>{l.to_be_renewed ? i18n.t('yes') : i18n.t('no')}</td>
      </tr>
    );
  };
  render() {
    const hasLicences =
      this.state.internalLicences?.length > 0 || this.state.externalLicences?.length > 0;
    return (
      <div className="page">
        <h1>{i18n.t('menu_licences')}</h1>
        {!hasLicences ? (
          <div>
            <p>{i18n.t('licences_none')}</p>
            {window.location.pathname.indexOf('/superadmin') >= 0 && (
              <p>{i18n.t('licences_none_explanation')}</p>
            )}
          </div>
        ) : (
          <div>
            <p>{i18n.t('licences_all')}</p>
            <table style={{ marginBottom: 20 }}>
              <thead>
                <tr>
                  {isSaasServer && <th>{i18n.t('licences_reseller_name')}</th>}
                  <th>{i18n.t('licences_bank_name')}</th>
                  <th>{i18n.t('licences_nb')}</th>
                  <th>{i18n.t('licences_is_montly')}</th>
                  <th>{i18n.t('licences_valid_from')}</th>
                  <th>{i18n.t('licences_valid_until')}</th>
                  <th>{i18n.t('licences_to_be_renewed')}</th>
                </tr>
              </thead>
              <tbody>
                {this.state.internalLicences.map((l, i) => this.licenceRow(l, 'IL'))}
                {this.state.externalLicences.map((l, i) => this.licenceRow(l, 'EL'))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }
}
