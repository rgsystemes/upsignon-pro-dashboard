import React from 'react';
import { groupId } from '../../helpers/env';
import { i18n } from '../../i18n/i18n';
import { groupUrlFetch } from '../../helpers/urlFetch';

// Props setIsLoading, totalCount, isSuperAdmin

export class Licences extends React.Component {
  state = {
    licences: [],
  };
  fetchLicences = async () => {
    try {
      const res = await groupUrlFetch('/api/get-licences', 'POST', null);
      this.setState({
        licences: res.sort((a, b) => {
          if (a.bankName < b.bankName) return -1;
          if (a.bankName > b.bankName) return 1;
          if (a.masterBank < b.masterBank) return -1;
          if (a.masterBank > b.masterBank) return 1;
          if (a.valid_until < b.valid_until) return -1;
          if (a.valid_until > b.valid_until) return -1;
          if (a.valid_from < b.valid_from) return -1;
          if (a.valid_from > b.valid_from) return -1;
          return 0;
        }),
      });
    } catch (e) {
      console.error(e);
    }
  };
  componentDidMount() {
    this.fetchLicences();
  }

  render() {
    const hasLicences =
      this.state.licences?.length > 0 && this.state.licences.some((l) => l.licences.length > 0);
    return (
      <div className="page">
        <h1>{i18n.t('menu_licences')}</h1>
        {!hasLicences ? (
          <div>
            <p>{i18n.t('licences_none')}</p>
            {window.location.path.indexOf('/superadmin') >= 0 && (
              <p>{i18n.t('licences_none_explanation')}</p>
            )}
          </div>
        ) : (
          <div>
            <p>{i18n.t('licences_all')}</p>
            <table style={{ marginBottom: 20 }}>
              <thead>
                <tr>
                  <th></th>
                  <th>{i18n.t('licences_bank_name')}</th>
                  <th>{i18n.t('licences_nb')}</th>
                  <th>{i18n.t('licences_valid_from')}</th>
                  <th>{i18n.t('licences_valid_until')}</th>
                  <th>{i18n.t('licences_to_be_renewed')}</th>
                </tr>
              </thead>
              <tbody>
                {this.state.licences.map((l, i) => {
                  return (
                    <React.Fragment key={i}>
                      {l.licences.map((ll, ii) => {
                        const isExpiredNotRenewed =
                          new Date(ll.valid_until).getTime() < Date.now() && ll.to_be_renewed;
                        let expDateMinus3Month = new Date(ll.valid_until);
                        expDateMinus3Month.setMonth(expDateMinus3Month.getMonth() - 3);
                        const willExpireSoon =
                          expDateMinus3Month.getTime() < Date.now() && ll.to_be_renewed;
                        let className = null;
                        if (isExpiredNotRenewed) className = 'redrow';
                        else if (willExpireSoon) className = 'orangerow';
                        else if (!ll.to_be_renewed) className = 'greyrow';
                        return (
                          <tr key={i} className={className}>
                            <td>{l.masterBank}</td>
                            <td>{l.bankName}</td>
                            <td>{ll.nb_licences}</td>
                            <td>{new Date(ll.valid_from).toLocaleDateString()}</td>
                            <td>{new Date(ll.valid_until).toLocaleDateString()}</td>
                            <td>{ll.to_be_renewed ? i18n.t('yes') : i18n.t('no')}</td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }
}
