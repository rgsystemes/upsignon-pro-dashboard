import React from 'react';
import { fetchTemplate } from '../../helpers/fetchTemplate';
import { i18n } from '../../i18n/i18n';
import './overview.css';

class Overview extends React.Component {
  state = {
    nb_accounts_weak: 0,
    nb_accounts_medium: 0,
    nb_accounts_strong: 0,
    nb_accounts_duplicates: 0,
  };
  fetchStats = async () => {
    try {
      const stats = await fetchTemplate('/api/get-password-stats', 'GET', null);
      this.setState({
        nb_accounts_weak: stats.nb_weak,
        nb_accounts_medium: stats.nb_medium,
        nb_accounts_strong: stats.nb_strong,
        nb_accounts_duplicates: stats.nb_duplicates,
      });
    } catch (e) {
      console.error(e);
    }
  };
  componentDidMount() {
    this.fetchStats();
  }
  render() {
    return (
      <div className="page">
        <h1>{i18n.t('menu_overview')}</h1>

        <div style={{ display: 'flex' }}>
          <div className={`card ${this.state.nb_accounts_duplicates > 0 ? 'duplicatePwd' : ''}`}>
            <div className="statTitle">{i18n.t('stats_duplicate_pwd')}</div>
            <div className="statNumber">{this.state.nb_accounts_duplicates}</div>
          </div>
          <div className={`card ${this.state.nb_accounts_weak > 0 ? 'weakPwd' : ''}`}>
            <div className="statTitle">{i18n.t('stats_weak_pwd')}</div>
            <div className="statNumber">{this.state.nb_accounts_weak}</div>
          </div>
          <div className={`card ${this.state.nb_accounts_medium > 0 ? 'mediumPwd' : ''}`}>
            <div className="statTitle">{i18n.t('stats_medium_pwd')}</div>
            <div className="statNumber">{this.state.nb_accounts_medium}</div>
          </div>
          <div className={`card ${this.state.nb_accounts_strong > 0 ? 'strongPwd' : ''}`}>
            <div className="statTitle">{i18n.t('stats_strong_pwd')}</div>
            <div className="statNumber">{this.state.nb_accounts_strong}</div>
          </div>
        </div>
      </div>
    );
  }
}

export { Overview };
