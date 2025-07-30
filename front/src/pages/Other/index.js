import React from 'react';
import { i18n } from '../../i18n/i18n';
import { bankUrlFetch } from '../../helpers/urlFetch';
import { bankServerUrl } from '../../helpers/env';

import './other.css';
import { isReadOnlySuperadmin } from '../../helpers/isReadOnlySuperadmin';

// Props = setIsLoading, isSuperadminPage
class Other extends React.Component {
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

    sendMailToAll: true,
    mailContent: '',
    mailSubject: '',
  };

  componentDidMount() {
    this.setState({
      mailContent: localStorage.getItem('mailContent') || '',
      mailSubject: localStorage.getItem('mailSubject') || '',
    });
  }

  chooseMailRecipients = (ev) => {
    this.setState({ sendMailToAll: ev.target.value === 'all' });
  };

  onMailContentChange = (ev) => {
    const content = ev.target.value;
    this.setState({ mailContent: content });
    localStorage.setItem('mailContent', content);
  };
  onMailSubjectChange = (ev) => {
    const subject = ev.target.value;
    this.setState({ mailSubject: subject });
    localStorage.setItem('mailSubject', subject);
  };

  sendMail = async () => {
    if (!this.state.mailContent || !this.state.mailSubject) {
      alert(i18n.t('mail_writer_empty_fields'));
      return;
    }
    if (this.state.extractedEmails) {
      try {
        this.props.setIsLoading(true);
        const res = await bankUrlFetch('/api/send-email', 'POST', {
          emailList: this.state.extractedEmails,
          mailContent: this.state.mailContent,
          mailSubject: this.state.mailSubject,
        });
        this.setState({ mailContent: '', mailSubject: '' });
        localStorage.removeItem('mailContent');
        localStorage.removeItem('mailSubject');
        alert(i18n.t('mail_writer_success', { n: res.n }));
      } catch (e) {
        console.error(e);
        alert(i18n.t('mail_writer_error', { e }));
      } finally {
        this.props.setIsLoading(false);
      }
      return;
    }
    const resPrecheck = await bankUrlFetch('/api/send-email-precheck', 'POST', {
      extractorDuplicateSelect: this.state.extractorDuplicateSelect,
      extractorWeakSelect: this.state.extractorWeakSelect,
      extractorMediumSelect: this.state.extractorMediumSelect,
      extractorLongUnusedSelect: this.state.extractorLongUnusedSelect,
      extractorSharingDeviceSelect: this.state.extractorSharingDeviceSelect,
      extractorDuplicateMin: this.state.extractorDuplicateMin,
      extractorWeakMin: this.state.extractorWeakMin,
      extractorMediumMin: this.state.extractorMediumMin,
      extractorUnusedDaysMin: this.state.extractorUnusedDaysMin,
      sendMailToAll: this.state.sendMailToAll,
      mailContent: this.state.mailContent,
      mailSubject: this.state.mailSubject,
    });
    if (window.confirm(i18n.t('mail_writer_confirm_send', { n: resPrecheck.n }))) {
      try {
        this.props.setIsLoading(true);
        const res = await bankUrlFetch('/api/send-email', 'POST', {
          extractorDuplicateSelect: this.state.extractorDuplicateSelect,
          extractorWeakSelect: this.state.extractorWeakSelect,
          extractorMediumSelect: this.state.extractorMediumSelect,
          extractorLongUnusedSelect: this.state.extractorLongUnusedSelect,
          extractorSharingDeviceSelect: this.state.extractorSharingDeviceSelect,
          extractorDuplicateMin: this.state.extractorDuplicateMin,
          extractorWeakMin: this.state.extractorWeakMin,
          extractorMediumMin: this.state.extractorMediumMin,
          extractorUnusedDaysMin: this.state.extractorUnusedDaysMin,
          sendMailToAll: this.state.sendMailToAll,
          mailContent: this.state.mailContent,
          mailSubject: this.state.mailSubject,
        });
        this.setState({ mailContent: '', mailSubject: '' });
        localStorage.removeItem('mailContent');
        localStorage.removeItem('mailSubject');
        alert(i18n.t('mail_writer_success', { n: res.n }));
      } catch (e) {
        console.error(e);
        alert(i18n.t('mail_writer_error', { e }));
      } finally {
        this.props.setIsLoading(false);
      }
    }
  };

  fetchSelectionEmails = async () => {
    const requests = [];
    if (this.state.extractorDuplicateSelect) {
      requests.push(
        bankUrlFetch(
          `/api/extract-emails-for-duplicate-passwords?minDuplicates=${this.state.extractorDuplicateMin}`,
          'GET',
          null,
        ),
      );
    }
    if (this.state.extractorWeakSelect) {
      requests.push(
        bankUrlFetch(
          `/api/extract-emails-for-weak-passwords?minWeak=${this.state.extractorWeakMin}`,
          'GET',
          null,
        ),
      );
    }
    if (this.state.extractorMediumSelect) {
      requests.push(
        bankUrlFetch(
          `/api/extract-emails-for-medium-passwords?minMedium=${this.state.extractorMediumMin}`,
          'GET',
          null,
        ),
      );
    }
    if (this.state.extractorLongUnusedSelect) {
      requests.push(
        bankUrlFetch(
          `/api/extract-emails-for-long-unused?unusedDays=${this.state.extractorUnusedDaysMin}`,
          'GET',
          null,
        ),
      );
    }
    if (this.state.extractorSharingDeviceSelect) {
      requests.push(bankUrlFetch('/api/extract-emails-for-shared-device', 'GET', null));
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
    return uniqueEmails;
  };

  extractEmails = async () => {
    try {
      this.props.setIsLoading(true);
      const emailList = await this.fetchSelectionEmails();
      this.setState({ extractedEmails: emailList.join(' ; ') });
    } catch (e) {
      console.error(e);
    } finally {
      this.props.setIsLoading(false);
    }
  };

  extractEmailsMsiInstall = async () => {
    try {
      this.props.setIsLoading(true);
      const emailList = await bankUrlFetch('/api/extract-emails-msi-install', 'GET', null);
      this.setState({ extractedEmails: emailList.join(' ; ') });
    } catch (e) {
      console.error(e);
    } finally {
      this.props.setIsLoading(false);
    }
  };

  render() {
    return (
      <div className="page">
        <h1>{i18n.t('menu_other')}</h1>
        <div>
          <h2>{i18n.t('extracts')}</h2>
          <div>
            <a
              className="extractAction"
              style={{ marginBottom: 20 }}
              href={`${bankServerUrl}/api/extract-database`}
            >
              {i18n.t('extract_database')}
            </a>
          </div>
          <div>
            <a
              className="extractAction"
              style={{ marginBottom: 20 }}
              href={`${bankServerUrl}/api/extract-admins`}
            >
              {i18n.t('extract_admins')}
            </a>
          </div>

          <h2>{i18n.t('extract_emails_text')}</h2>
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
              onChange={() =>
                this.setState((s) => ({ extractorWeakSelect: !s.extractorWeakSelect }))
              }
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
          <div style={{ width: 300, borderTop: '1px solid grey', margin: '5px 0' }} />
          <br />
          <div
            style={{ marginTop: 10 }}
            className="extractAction"
            onClick={this.extractEmailsMsiInstall}
          >
            {i18n.t('extract_emails_msi')}
          </div>
          {this.state.extractedEmails !== null && (
            <div
              style={{ cursor: 'pointer', textDecoration: 'underline' }}
              onClick={() => {
                navigator.clipboard.writeText(this.state.extractedEmails).then(() => {
                  this.emailExtractRef.style.backgroundColor = '#ccc';
                  setTimeout(() => {
                    this.emailExtractRef.style.backgroundColor = 'initial';
                  }, 250);
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

        {/* MAIL WRITER */}
        <div className={isReadOnlySuperadmin ? 'disabledUI' : null}>
          <h2>{i18n.t('mail_writer')}</h2>
          <div>
            <input
              type="radio"
              id="all"
              name="mailRecipients"
              value="all"
              checked={this.state.sendMailToAll}
              onChange={this.chooseMailRecipients}
            />
            <label htmlFor="all">{i18n.t('mail_writer_to_all')}</label>
          </div>
          <div style={{ marginBottom: 20 }}>
            <input
              type="radio"
              id="selection"
              name="mailRecipients"
              value="selectionOnly"
              checked={!this.state.sendMailToAll}
              onChange={this.chooseMailRecipients}
              disabled={isReadOnlySuperadmin}
            />
            <label htmlFor="selection">{i18n.t('mail_writer_to_selection')}</label>
          </div>
          <input
            type="text"
            placeholder={i18n.t('mail_writer_subject_placeholder')}
            value={this.state.mailSubject}
            onChange={this.onMailSubjectChange}
            disabled={isReadOnlySuperadmin}
          />
          <textarea
            value={this.state.mailContent}
            style={{ width: '100%', height: 300, marginTop: 10 }}
            placeholder={i18n.t('mail_writer_placeholder')}
            onChange={this.onMailContentChange}
            disabled={isReadOnlySuperadmin}
          ></textarea>
          <div
            style={{ marginTop: 10 }}
            className="extractAction"
            onClick={isReadOnlySuperadmin ? null : this.sendMail}
          >
            {i18n.t('mail_writer_send')}
          </div>
        </div>
      </div>
    );
  }
}

export { Other };
