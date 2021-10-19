import React from 'react';
import { fetchTemplate } from '../../helpers/fetchTemplate';
import { i18n } from '../../i18n/i18n';
import './Extracts.css';

// Props = setIsLoading
class Extracts extends React.Component {
  emailExtractRef = null;
  state = {
    extractorDuplicateSelect: true,
    extractorWeakSelect: true,
    extractorMediumSelect: true,
    extractorLongUnusedSelect: false,
    extractorSharingDeviceSelect: false,

    extractorDuplicateMin: 1,
    extractorWeakMin: 1,
    extractorMediumMin: 1,
    extractorUnusedDaysMin: 15,

    extractedEmails: null,
  };

  extractEmails = async () => {
    try {
      this.props.setIsLoading(true);
      const requests = [];
      if (this.state.extractorDuplicateSelect) {
        requests.push(
          fetchTemplate(
            `/api/extract-emails-for-duplicate-passwords?minDuplicates=${this.state.extractorDuplicateMin}`,
            'GET',
            null,
          ),
        );
      }
      if (this.state.extractorWeakSelect) {
        requests.push(
          fetchTemplate(
            `/api/extract-emails-for-weak-passwords?minWeak=${this.state.extractorWeakMin}`,
            'GET',
            null,
          ),
        );
      }
      if (this.state.extractorMediumSelect) {
        requests.push(
          fetchTemplate(
            `/api/extract-emails-for-medium-passwords?minMedium=${this.state.extractorMediumMin}`,
            'GET',
            null,
          ),
        );
      }
      if (this.state.extractorLongUnusedSelect) {
        requests.push(
          fetchTemplate(
            `/api/extract-emails-for-long-unused?unusedDays=${this.state.extractorUnusedDaysMin}`,
            'GET',
            null,
          ),
        );
      }
      if (this.state.extractorSharingDeviceSelect) {
        requests.push(fetchTemplate('/api/extract-emails-for-shared-device', 'GET', null));
      }
      const emails = await Promise.all(requests);
      const uniqueEmails = [];
      emails.forEach((list) => {
        list.forEach((email) => {
          if (uniqueEmails.indexOf(email) === -1) {
            uniqueEmails.push(email);
          }
        });
      });
      this.setState({ extractedEmails: uniqueEmails.join(' ; ') });
    } catch (e) {
      console.error(e);
    } finally {
      this.props.setIsLoading(false);
    }
  };

  render() {
    return (
      <div>
        <h2>{i18n.t('extracts')}</h2>
        <a
          className="extractAction"
          style={{ marginBottom: 20 }}
          href={`${
            process.env.NODE_ENV === 'development'
              ? 'http://localhost:3001'
              : process.env.PUBLIC_URL
          }/api/extract-database`}
        >
          {i18n.t('extract_database')}
        </a>
        <div style={{ fontWeight: 'bold' }}>{i18n.t('extract_emails_text')}</div>
        <div className="extractorConfig">
          <input
            type="checkbox"
            checked={this.state.extractorDuplicateSelect}
            onChange={() =>
              this.setState((s) => ({ extractorDuplicateSelect: !s.extractorDuplicateSelect }))
            }
          />
          <div>{i18n.t('extract_emails_duplicates').split('$n')[0]}</div>
          <input
            type="number"
            min={1}
            value={this.state.extractorDuplicateMin}
            onChange={(ev) => this.setState({ extractorDuplicateMin: ev.target.value })}
          />
          <div>{i18n.t('extract_emails_duplicates').split('$n')[1]}</div>
        </div>
        <div className="extractorConfig">
          <input
            type="checkbox"
            checked={this.state.extractorWeakSelect}
            onChange={() => this.setState((s) => ({ extractorWeakSelect: !s.extractorWeakSelect }))}
          />
          <div>{i18n.t('extract_emails_weak').split('$n')[0]}</div>
          <input
            type="number"
            min={1}
            value={this.state.extractorWeakMin}
            onChange={(ev) => this.setState({ extractorWeakMin: ev.target.value })}
          />
          <div>{i18n.t('extract_emails_weak').split('$n')[1]}</div>
        </div>
        <div className="extractorConfig">
          <input
            type="checkbox"
            checked={this.state.extractorMediumSelect}
            onChange={() =>
              this.setState((s) => ({ extractorMediumSelect: !s.extractorMediumSelect }))
            }
          />
          <div>{i18n.t('extract_emails_medium').split('$n')[0]}</div>
          <input
            type="number"
            min={1}
            value={this.state.extractorMediumMin}
            onChange={(ev) => this.setState({ extractorMediumMin: ev.target.value })}
          />
          <div>{i18n.t('extract_emails_medium').split('$n')[1]}</div>
        </div>
        <div className="extractorConfig">
          <input
            type="checkbox"
            checked={this.state.extractorLongUnusedSelect}
            onChange={() =>
              this.setState((s) => ({ extractorLongUnusedSelect: !s.extractorLongUnusedSelect }))
            }
          />
          <div>{i18n.t('extract_emails_long_unused').split('$n')[0]}</div>
          <input
            type="number"
            min={1}
            value={this.state.extractorUnusedDaysMin}
            onChange={(ev) => this.setState({ extractorUnusedDaysMin: ev.target.value })}
          />
          <div>{i18n.t('extract_emails_long_unused').split('$n')[1]}</div>
        </div>
        <div
          className="extractorConfig"
          checked={this.state.extractorSharingDeviceSelect}
          onChange={() =>
            this.setState((s) => ({
              extractorSharingDeviceSelect: !s.extractorSharingDeviceSelect,
            }))
          }
        >
          <input type="checkbox" />
          <div>{i18n.t('extract_emails_shared_device')}</div>
        </div>
        <div style={{ marginTop: 10 }} className="extractAction" onClick={this.extractEmails}>
          {i18n.t('extract_emails')}
        </div>
        {this.state.extractedEmails !== null && (
          <div
            style={{ cursor: 'pointer', textDecoration: 'underline' }}
            onClick={() => {
              navigator.permissions.query({ name: 'clipboard-write' }).then((result) => {
                if (result.state === 'granted' || result.state === 'prompt') {
                  this.emailExtractRef.style.backgroundColor = '#ccc';
                  navigator.clipboard.writeText(this.state.extractedEmails);
                  setTimeout(() => {
                    this.emailExtractRef.style.backgroundColor = 'initial';
                  }, 250);
                }
              });
            }}
          >
            {i18n.t('copy_to_pasteboard')}
          </div>
        )}
        {this.state.extractedEmails !== null && (
          <div
            ref={(r) => (this.emailExtractRef = r)}
            style={{
              border: '1px solid #aaa',
              padding: 10,
              marginTop: 10,
              marginRight: 10,
              flex: 1,
              maxHeight: 200,
              textOverflow: 'ellipsis',
            }}
          >
            {this.state.extractedEmails}
          </div>
        )}
      </div>
    );
  }
}

export { Extracts };
