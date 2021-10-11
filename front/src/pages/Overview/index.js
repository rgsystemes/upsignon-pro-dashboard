import React from 'react';
import { fetchTemplate } from '../../helpers/fetchTemplate';
import { i18n } from '../../i18n/i18n';
import './overview.css';

// Props = setIsLoading
class Overview extends React.Component {
  state = {
    nb_accounts_weak: 0,
    nb_accounts_medium: 0,
    nb_accounts_strong: 0,
    nb_accounts_duplicates: 0,
    nb_users: 0,
    nb_shared_accounts: 0,
    nb_shared_devices: 0,
  };
  fetchStats = async () => {
    try {
      this.props.setIsLoading(true);
      const stats = await Promise.all([
        fetchTemplate('/api/get-password-stats', 'GET', null),
        fetchTemplate('/api/count-shared-accounts', 'GET', null),
        fetchTemplate('/api/count-shared-devices', 'GET', null),
        fetchTemplate('/api/count-users', 'GET', null),
      ]);

      this.setState({
        nb_accounts_weak: stats[0].nb_weak,
        nb_accounts_medium: stats[0].nb_medium,
        nb_accounts_strong: stats[0].nb_strong,
        nb_accounts_duplicates: stats[0].nb_duplicates,
        nb_users: stats[3],
        nb_shared_accounts: stats[1],
        nb_shared_devices: stats[2],
      });
    } catch (e) {
      console.error(e);
    } finally {
      this.props.setIsLoading(false);
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
        <div style={{ display: 'flex' }}>
          <div className="card">
            <div className="statTitle">{i18n.t('stats_nb_users')}</div>
            <div className="statNumber">{this.state.nb_users}</div>
          </div>
          <div className="card">
            <div className="statTitle">{i18n.t('stats_nb_shared_accounts')}</div>
            <div className="statNumber">{this.state.nb_shared_accounts}</div>
          </div>
          <div className="card">
            <div className="statTitle">{i18n.t('stats_nb_shared_devices')}</div>
            <div className="statNumber">{this.state.nb_shared_devices}</div>
          </div>
        </div>
      </div>
    );
  }
}

export { Overview };
