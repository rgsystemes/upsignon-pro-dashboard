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
    extracts_duplicates: null,
    extracts_weak: null,
    extracts_medium: null,
    extracts_long_unused: null,
    extracts_shared_device: null,
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

  extractDuplicates = async () => {
    try {
      this.props.setIsLoading(true);
      const res = await fetchTemplate('/api/extract-emails-for-duplicate-passwords', 'GET', null);
      this.setState({ extracts_duplicates: res });
    } catch (e) {
      console.error(e);
    } finally {
      this.props.setIsLoading(false);
    }
  };
  extractWeak = async () => {
    try {
      this.props.setIsLoading(true);
      const res = await fetchTemplate('/api/extract-emails-for-weak-passwords', 'GET', null);
      this.setState({ extracts_weak: res });
    } catch (e) {
      console.error(e);
    } finally {
      this.props.setIsLoading(false);
    }
  };
  extractMedium = async () => {
    try {
      this.props.setIsLoading(true);
      const res = await fetchTemplate('/api/extract-emails-for-medium-passwords', 'GET', null);
      this.setState({ extracts_medium: res });
    } catch (e) {
      console.error(e);
    } finally {
      this.props.setIsLoading(false);
    }
  };
  extractLongUnused = async () => {
    try {
      this.props.setIsLoading(true);
      const res = await fetchTemplate('/api/extract-emails-for-long-unused', 'GET', null);
      this.setState({ extracts_long_unused: res });
    } catch (e) {
      console.error(e);
    } finally {
      this.props.setIsLoading(false);
    }
  };
  extractSharedDevice = async () => {
    try {
      this.props.setIsLoading(true);
      const res = await fetchTemplate('/api/extract-emails-for-shared-device', 'GET', null);
      this.setState({ extracts_shared_device: res });
    } catch (e) {
      console.error(e);
    } finally {
      this.props.setIsLoading(false);
    }
  };

  render() {
    return (
      <div className="page">
        <h1>{i18n.t('menu_overview')}</h1>
        <p>{i18n.t('suggestion')}</p>

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
        <h2>{i18n.t('extracts')}</h2>
        <div>{i18n.t('extract_emails_text')}</div>
        <ul>
          <li>
            <div className="extractAction" onClick={this.extractDuplicates}>
              {i18n.t('extract_emails_duplicates')}
            </div>
            {this.state.extracts_duplicates !== null &&
              this.state.extracts_duplicates.length === 0 && <div>-</div>}
            <div>{this.state.extracts_duplicates?.map((u) => u.email).join(' ; ')}</div>
          </li>
          <li>
            <div className="extractAction" onClick={this.extractWeak}>
              {i18n.t('extract_emails_weak')}
            </div>
            {this.state.extracts_weak !== null && this.state.extracts_weak.length === 0 && (
              <div>-</div>
            )}
            <div>{this.state.extracts_weak?.map((u) => u.email).join(' ; ')}</div>
          </li>
          <li>
            <div className="extractAction" onClick={this.extractMedium}>
              {i18n.t('extract_emails_medium')}
            </div>
            {this.state.extracts_medium !== null && this.state.extracts_medium.length === 0 && (
              <div>-</div>
            )}
            <div>{this.state.extracts_medium?.map((u) => u.email).join(' ; ')}</div>
          </li>
          <li>
            <div className="extractAction" onClick={this.extractLongUnused}>
              {i18n.t('extract_emails_long_unused')}
            </div>
            {this.state.extracts_long_unused !== null &&
              this.state.extracts_long_unused.length === 0 && <div>-</div>}
            <div>{this.state.extracts_long_unused?.map((u) => u.email).join(' ; ')}</div>
          </li>
          <li>
            <div className="extractAction" onClick={this.extractSharedDevice}>
              {i18n.t('extract_emails_shared_device')}
            </div>
            {this.state.extracts_shared_device !== null &&
              this.state.extracts_shared_device.length === 0 && <div>-</div>}
            <div>{this.state.extracts_shared_device?.join(' ; ')}</div>
          </li>
        </ul>
      </div>
    );
  }
}

export { Overview };
