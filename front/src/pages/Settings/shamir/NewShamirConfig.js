import React from 'react';
import { i18n } from '../../../i18n/i18n';
import './NewShamirConfig.css';
import { TableColSortIcon } from '../../../helpers/icons/TableColSortIcon';
import { CountingIcon } from '../../../helpers/icons/CountingIcon';
import { PersonRoundIcon } from '../../../helpers/icons/PersonRoundIcon';
import { MailIcon } from '../../../helpers/icons/MailIcon';
import { FileIcon } from '../../../helpers/icons/FileIcon';
import { SearchBar } from '../../../helpers/SearchBar';
import { bankUrlFetch } from '../../../helpers/urlFetch';
import { toast } from 'react-toastify';
import { Modal } from '../../../helpers/Modal/Modal';
import { WarningIcon } from '../../../helpers/icons/WarningIcon';
import { ExternalLink } from '../../../helpers/ExternalLink/ExternalLink';
import { NameAndVersion } from './components/NameAndVersion';
import { MinSharesSecurityComment } from './components/MinSharesSecurityComment';
import { ShareholdersResilienceComment } from './components/ShareholdersResilienceComment';
import { ConfigSummary } from './components/ConfigSummary';
import { TextWithBold } from '../../../helpers/TextWithBold';
import { InfoIcon } from '../../../helpers/icons/InfoIcon';

// Props : setIsLoading, onConfigCreated, onCancel, hasPreviousConfig
export class NewShamirConfig extends React.Component {
  state = {
    nextShamirConfigIndex: null,
    minShares: 3,
    search: '',
    selectedHolders: [],
    searchedHolders: [],
    supportEmail: '',
    sortShareholder: 0, // 0 (no sorting), -1 (desc), 1 (asc)
    sortBank: 0, // 0 (no sorting), -1 (desc), 1 (asc)
    showSubmitValidation: false,
    adminEmail: '',
  };
  isSubmitable = () => {
    if (!this.state.nextShamirConfigIndex) {
      return false;
    }
    if (!this.state.minShares || this.state.minShares < 1) {
      return false;
    }
    if (!this.state.supportEmail || this.state.supportEmail.length === 0) {
      return false;
    }
    if (this.state.selectedHolders.length < this.state.minShares) {
      return false;
    }
    return true;
  };

  onCancel = () => {
    this.props.onCancel();
  };
  onSubmit = () => {
    if (!this.isSubmitable()) {
      return;
    }
    if (this.state.nextShamirConfigIndex === 1) {
      document.getElementById('submitValidationModal').showModal();
    } else {
      this.onValidateSubmit();
    }
  };
  onValidationCancel = () => {
    document.getElementById('submitValidationModal').close();
  };
  onValidateSubmit = async () => {
    try {
      this.props.setIsLoading(true);
      await bankUrlFetch('/api/shamir-create-config', 'POST', {
        minShares: this.state.minShares,
        selectedHolderIds: this.state.selectedHolders.map((h) => h.id),
        supportEmail: this.state.supportEmail,
      });
      this.props.onConfigCreated();
    } catch (e) {
      console.error(e);
      toast.error(e.toString());
    } finally {
      this.props.setIsLoading(false);
    }
  };
  onHolderSearchChange = async (search) => {
    try {
      const { searchedHolders, adminEmail } = await bankUrlFetch(
        '/api/shamir-search-users',
        'POST',
        {
          search,
        },
      );
      this.setState((s) => ({
        ...s,
        search,
        searchedHolders,
        adminEmail,
      }));
    } catch (e) {
      console.error(e);
      toast.error(e.toString());
    }
  };

  fetchNextShamirConfigIndex = async () => {
    try {
      const { nextShamirConfigIndex } = await bankUrlFetch('/api/shamir-index', 'POST', null);
      this.setState({ nextShamirConfigIndex });
    } catch (e) {
      console.error(e);
      toast.error(e.toString());
    }
  };

  componentDidMount() {
    this.fetchNextShamirConfigIndex();
    this.onHolderSearchChange();
  }

  onSortHoldersByEmail = () => {
    if (this.state.sortShareholder === 0) {
      this.setState({ sortShareholder: 1, sortBank: 0 });
    } else if (this.state.sortShareholder === 1) {
      this.setState({ sortShareholder: -1, sortBank: 0 });
    } else {
      this.setState({ sortShareholder: 0, sortBank: 0 });
    }
  };
  onSortHoldersByBank = () => {
    if (this.state.sortBank === 0) {
      this.setState({ sortBank: 1, sortShareholder: 0 });
    } else if (this.state.sortBank === 1) {
      this.setState({ sortBank: -1, sortShareholder: 0 });
    } else {
      this.setState({ sortBank: 0, sortShareholder: 0 });
    }
  };

  toggleSelectAll = (selectAll) => {
    if (selectAll) {
      this.setState((s) => {
        return {
          ...s,
          selectedHolders: [
            ...s.selectedHolders,
            ...s.searchedHolders.filter(
              (h) => !s.selectedHolders.find((s) => s.id === h.id) && h.hasSharingPublicKey,
            ),
          ],
        };
      });
    } else {
      this.setState({ selectedHolders: [] });
    }
  };
  toggleShareholder = (id, checked) => {
    if (checked) {
      this.setState((s) => {
        return {
          ...s,
          selectedHolders: [...s.selectedHolders, s.searchedHolders.find((h) => h.id === id)],
        };
      });
    } else {
      this.setState((s) => {
        return {
          ...s,
          selectedHolders: s.selectedHolders.filter((h) => h.id !== id),
        };
      });
    }
  };

  getResultingHolderList = () => {
    const { selectedHolders, searchedHolders, sortShareholder, sortBank } = this.state;
    const res = [
      ...searchedHolders.filter((h) => !selectedHolders.find((s) => s.id === h.id)),
      ...selectedHolders.map((h) => {
        return {
          ...h,
          isSelected: true,
        };
      }),
    ];
    if (sortShareholder !== 0) {
      return res.sort((a, b) => {
        if (a.email === b.email) {
          if (a.bankName < b.bankName) return -sortShareholder;
          if (a.bankName > b.bankName) return sortShareholder;
          return 0;
        } else if (a.email < b.email) return -sortShareholder;
        return sortShareholder;
      });
    }
    if (sortBank !== 0) {
      return res.sort((a, b) => {
        if (a.bankName === b.bankName) {
          if (a.email < b.email) return -sortBank;
          if (a.email > b.email) return sortBank;
          return 0;
        } else if (a.bankName < b.bankName) return -sortBank;
        return sortBank;
      });
    }
    return res;
  };

  render() {
    const {
      nextShamirConfigIndex,
      minShares,
      selectedHolders,
      searchedHolders,
      supportEmail,
      search,
      sortShareholder,
      sortBank,
      showSubmitValidation,
      adminEmail,
    } = this.state;

    const resultingHolderList = this.getResultingHolderList();

    const areAllSelected =
      resultingHolderList.filter((h) => h.hasSharingPublicKey).length > 0 &&
      !resultingHolderList.find((h) => !h.isSelected && h.hasSharingPublicKey);
    const shouldShowShareHoldersTable = searchedHolders.length > 0 || selectedHolders.length > 0;
    const isAdminAShareholder = selectedHolders.find((h) => h.email === adminEmail) != null;

    const minSharesWarning = <MinSharesSecurityComment minShares={minShares} />;
    const resilience = (
      <ShareholdersResilienceComment minShares={minShares} totalHolders={selectedHolders.length} />
    );
    const configName = `Shamir ${nextShamirConfigIndex || '_'}`;
    const creationDate = new Date();
    return (
      <>
        <h2>
          {this.props.hasPreviousConfig
            ? i18n.t('shamir_change_title')
            : i18n.t('shamir_config_title')}
          ;
        </h2>
        <ExternalLink href="https://upsignon.eu/shamir-doc">
          {i18n.t('shamir_doc_link')}
        </ExternalLink>

        {this.props.hasPreviousConfig && (
          <div className="shamirChangeWarning">
            <div className="infoIconContainer">
              <InfoIcon size={16} />
            </div>
            <TextWithBold text={i18n.t('shamir_change_info')} />
          </div>
        )}

        <NameAndVersion name={configName} creationDate={creationDate} withTitle />

        <h3 className={`titleWithIcon`}>
          <CountingIcon size={20} />
          <span>{i18n.t('shamir_config_min_shares')}*</span>
        </h3>
        <p>{i18n.t('shamir_config_min_shares_explanation')}</p>
        <input
          type="number"
          min={1}
          value={minShares || ''}
          onChange={(e) =>
            this.setState({ minShares: e.target.value ? Number(e.target.value) : null })
          }
        />
        {minSharesWarning}

        <h3 className={`titleWithIcon`}>
          <PersonRoundIcon size={20} />
          <span>{i18n.t('shamir_config_holders')}*</span>
        </h3>
        <p>{i18n.t('shamir_config_holders_explanation')}</p>

        <SearchBar
          placeholder={i18n.t('shamir_config_holder_search')}
          onChange={(ev) => this.onHolderSearchChange(ev.target.value)}
          className="shareholderSearch"
        />
        {shouldShowShareHoldersTable && (
          <div>
            <table className={`table`}>
              <thead className={`tableHeader`}>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={areAllSelected}
                      onChange={(ev) => this.toggleSelectAll(ev.target.checked)}
                    />
                  </th>
                  <th>
                    <span>{i18n.t('shamir_config_holder_email')}</span>
                    <TableColSortIcon
                      size={12}
                      onClick={this.onSortHoldersByEmail}
                      sorting={sortShareholder}
                    />
                  </th>
                  <th>
                    <span>{i18n.t('shamir_config_holder_bank_name')}</span>
                    <TableColSortIcon
                      size={12}
                      onClick={this.onSortHoldersByBank}
                      sorting={sortBank}
                    />
                  </th>
                </tr>
              </thead>
              <tbody>
                {resultingHolderList.map((h) => {
                  return (
                    <tr key={h.id}>
                      <td>
                        {h.hasSharingPublicKey ? (
                          <input
                            type="checkbox"
                            checked={!!h.isSelected}
                            onChange={(ev) => this.toggleShareholder(h.id, ev.target.checked)}
                          />
                        ) : (
                          <em style={{ fontSize: 12 }}>
                            {i18n.t('shamir_config_holders_in_creation')}
                          </em>
                        )}
                      </td>
                      <td>{h.email}</td>
                      <td>{h.bankName}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div style={{ marginTop: 10 }}>
              {i18n.t('shamir_config_holders_number', {
                n: selectedHolders.length,
                adminWarning: isAdminAShareholder
                  ? ''
                  : i18n.t('shamir_config_summary_details_admin_not_shareholder'),
              })}
            </div>
            {resilience}
          </div>
        )}
        <h3 className={`titleWithIcon`}>
          <MailIcon size={20} />
          <span>{i18n.t('shamir_config_support_email')}*</span>
        </h3>
        <p>{i18n.t('shamir_config_support_email_explanation')}</p>
        <input
          type="email"
          className="contactEmailInput"
          value={supportEmail}
          placeholder="contact@mail.com"
          onChange={(e) => this.setState({ supportEmail: e.target.value })}
        />

        <h3 className={`titleWithIcon`}>
          <FileIcon size={20} />
          <span>{i18n.t('shamir_config_summary')}</span>
        </h3>
        <ConfigSummary
          creationDesign={true}
          isActive={false}
          isPending={false}
          name={configName}
          creationDate={creationDate}
          creatorEmail={adminEmail}
          minShares={minShares}
          holders={selectedHolders.map((sh) => {
            return {
              id: sh.id,
              email: sh.email,
              bankName: sh.bankName,
            };
          })}
          supportEmail={supportEmail}
          showCreatorNotHolderWarning={!isAdminAShareholder}
        />

        <div className="shamirFormButtons">
          <button onClick={this.onCancel} className="whiteButton">
            {i18n.t('cancel')}
          </button>
          <button
            onClick={this.onSubmit}
            className="submitButton"
            disabled={this.isSubmitable() ? false : true}
          >
            {i18n.t('shamir_config_submit')}
          </button>
        </div>
        <Modal id="submitValidationModal" title={i18n.t('shamir_config_validate_title')}>
          <div className="shamirValidationWarning">
            <span className="shamirValidationWarningIconContainer">
              <WarningIcon size={12} />
            </span>
            <span>{i18n.t('shamir_config_validate_warning')}</span>
          </div>
          <div>{i18n.t('shamir_config_validate_info')}</div>
          <div className="shamirFormValidateButtons">
            <button onClick={this.onValidationCancel} className="whiteButton">
              {i18n.t('cancel')}
            </button>
            <button onClick={this.onValidateSubmit} className="submitButton">
              {i18n.t('shamir_config_validate_submit')}
            </button>
          </div>
        </Modal>
      </>
    );
  }
}
