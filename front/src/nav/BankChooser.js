import React from 'react';
import { baseFrontUrl, bankId } from '../helpers/env';
import { i18n } from '../i18n/i18n';

// Props: banks, isSuperadmin, isSuperadminPage
class BankChooser extends React.Component {
  state = {
    showList: false,
  };

  toggleBankList = () => {
    this.setState((s) => ({ ...s, showList: !s.showList }));
  };
  render() {
    // eslint-disable-next-line eqeqeq
    const currentBank = this.props.banks.find((g) => g.id == bankId);
    return (
      <div
        style={{
          padding: 20,
          display: 'flex',
          position: 'relative',
          overflow: 'visible',
        }}
      >
        {this.props.isSuperadminPage ? (
          <div className="currentBank superadmin" onClick={this.toggleBankList}>
            {i18n.t('menu_superadmin')}
          </div>
        ) : (
          <div className="currentBank" onClick={this.toggleBankList}>
            {currentBank?.name}
          </div>
        )}
        {this.state.showList && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% - 20px)',
              backgroundColor: 'white',
              border: '1px solid #eee',
              boxShadow: '0 0 5px rgb(44, 83, 132)',
              maxHeight: '80vh',
              overflow: 'scroll',
            }}
          >
            {this.props.isSuperadmin && (
              <a className="bankLink superadmin" href={baseFrontUrl + '/superadmin/'}>
                {i18n.t('menu_superadmin')}
              </a>
            )}
            {this.props.banks.map((g) => {
              return (
                <a key={g.id} className="bankLink" href={baseFrontUrl + '/' + g.id + '/'}>
                  {g.name}
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
