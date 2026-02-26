import React from 'react';
import { baseFrontUrl, bankId, resellerId } from '../helpers/env';
import { i18n } from '../i18n/i18n';
import { Search } from '../components/Search';
import { SearchByFields } from '../helpers/SearchByFields';

// Props: banks, resellers, isSuperadminPage, isSuperadmin
class BankChooser extends React.Component {
  state = {
    showList: false,
    bankSearch: '',
  };

  toggleBankList = () => {
    this.setState((s) => ({ ...s, showList: !s.showList }));
  };

  handleBankSearchChange = (value) => {
    this.setState({ bankSearch: value });
  };

  render() {
    const currentBank = this.props.banks.find((b) => b.id === parseInt(bankId));
    const currentReseller = this.props.resellers.find((r) => r.id == resellerId);
    
    const directBanks = this.props.banks.filter(
      (b) => this.props.resellers.find((r) => r.id === b.reseller_id) == null,
    );

    const banks = this.props.banks ?? [];
    const bankSearch = (this.state.bankSearch ?? '').trim().toLowerCase();
    const filteredDirectBanks = SearchByFields(directBanks, bankSearch, ['id', 'name']);
    const filteredBanks = SearchByFields(banks, bankSearch, ['id', 'name']);

    return (
      <div
        style={{
          padding: 20,
          display: 'flex',
          position: 'relative',
          userSelect: 'none',
        }}
      >
        {this.props.isSuperadminPage ? (
          <div className="currentBank superadmin" onClick={this.toggleBankList}>
            {i18n.t('menu_superadmin')}
          </div>
        ) : currentBank ? (
          <div className="currentBank" onClick={this.toggleBankList}>
            {currentBank?.name}
          </div>
        ) : (
          currentReseller && (
            <div className="currentBank reseller" onClick={this.toggleBankList}>
              {currentReseller?.name}
            </div>
          )
        )}
        {this.state.showList && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% - 20px)',
              zIndex: 1000,
              backgroundColor: 'white',
              border: '1px solid #eee',
              boxShadow: '0 0 5px rgb(44, 83, 132)',
              maxHeight: '80vh',
              overflow: 'auto',
            }}
          >
            {this.props.isSuperadmin && (
              <a className="bankLink superadmin" href={baseFrontUrl + '/superadmin/'}>
                {i18n.t('menu_superadmin')}
              </a>
            )}
            <Search
              placeholder={i18n.t('search_placeholder')}
              onChange={this.handleBankSearchChange}
              value={this.state.bankSearch || ''}
              tooltip={i18n.t('search_tooltip')}
            />
            {this.props.resellers &&
              this.props.resellers.map((r) => {
                return (
                  <React.Fragment key={r.id}>
                    <a
                      className="bankLink reseller"
                      href={baseFrontUrl + '/reseller/' + r.id + '/'}
                    >
                      {r.name}
                    </a>
                    {filteredBanks &&
                      filteredBanks
                          .filter((b) => b.reseller_id === r.id)
                        .map((b) => {
                          return (
                            <a
                              key={b.id}
                              className="bankLink resellerBank"
                              href={baseFrontUrl + '/' + b.id + '/'}
                            >
                              {b.name}
                            </a>
                          );
                        })}
                  </React.Fragment>
                );
              })}
            {filteredDirectBanks.map((b) => {
              return (
                <a key={b.id} className="bankLink" href={baseFrontUrl + '/' + b.id + '/'}>
                  {b.name}
                </a>
              );
            })}
          </div>
        )}
      </div>
    );
  }
}

export { BankChooser };
