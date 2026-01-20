import React from 'react';
import { EditableCell } from '../../helpers/EditableCell';
import { EditableResellerCell } from '../../helpers/EditableResellerCell';
import { ResellerSelector } from '../../helpers/ResellerSelector';
import { Toggler } from '../../helpers/Toggler';
import { baseFrontUrl } from '../../helpers/env';
import { autolockDelaySettings, settingsConfig } from '../../helpers/settingsConfig';
import { bankUrlFetch } from '../../helpers/urlFetch';
import { i18n } from '../../i18n/i18n';
import { isRestrictedSuperadmin } from '../../helpers/isRestrictedSuperadmin';

// Props : setIsLoading, banks, fetchBanks
class ResellerBanks extends React.Component {
  state = {
    bankToDeleteId: null,
  };
  newBankNameInputRef = null;
  newAdminEmailInputRef = null;

  insertBank = async () => {
    try {
      this.props.setIsLoading(true);
      const newBankName = this.newBankNameInputRef.value;
      const newAdminEmail = this.newAdminEmailInputRef.value;
      if (!newBankName || newBankName.length < 2 || newBankName.length > 50) {
        this.newBankNameInputRef.style.borderColor = 'red';
        toast.error(i18n.t('sasettings_new_bank_form_bank_name_too_long_or_short'));
        return;
      } else {
        this.newBankNameInputRef.style.borderColor = null;
      }
      await bankUrlFetch('/api/insert-bank', 'POST', {
        name: newBankName,
        adminEmail: newAdminEmail,
      });
      await this.props.fetchBanks();
      this.newBankNameInputRef.value = null;
      this.newAdminEmailInputRef.value = null;
    } catch (e) {
      console.error(e);
    } finally {
      this.props.setIsLoading(false);
    }
  };
  updateBankName = async (bankId, newName) => {
    try {
      this.props.setIsLoading(true);
      await bankUrlFetch('/api/update-bank', 'POST', {
        name: newName,
        id: bankId,
      });
      await this.props.fetchBanks();
    } catch (e) {
      console.error(e);
    } finally {
      this.props.setIsLoading(false);
    }
  };
  deleteBank = async (id) => {
    try {
      this.props.setIsLoading(true);
      await bankUrlFetch(`/api/delete-bank/${id}`, 'POST', null);
      await this.props.fetchBanks();
    } catch (e) {
      console.error(e);
    } finally {
      this.props.setIsLoading(false);
    }
  };

  render() {
    const bankToDelete = this.props.banks.find((g) => g.id === this.state.bankToDeleteId);
    if (bankToDelete) {
      return (
        <div>
          <h2>{i18n.t('sasettings_banks')}</h2>
          <div
            className={`delete-confirmation-container ${isRestrictedSuperadmin ? 'disabledUI' : ''}`}
          >
            <h3>{i18n.t('sasettings_bank_delete_warning')}</h3>
            <div style={{ marginBottom: 10 }}>
              {i18n.t('sasetting_confirm_bank_delete', {
                name: bankToDelete.name,
              })}
            </div>
            <input ref={(r) => (this.deleteBankInputRef = r)} />
            <div className="button-group">
              <div
                className="danger-button"
                onClick={() => {
                  if (this.deleteBankInputRef.value === bankToDelete.name) {
                    this.deleteBank(bankToDelete.id);
                  } else {
                    this.deleteBankInputRef.style.borderColor = 'red';
                  }
                }}
              >
                {i18n.t('validate')}
              </div>
              <div className="button" onClick={() => this.setState({ bankToDeleteId: null })}>
                {i18n.t('cancel')}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div>
        <h2>{i18n.t('sasettings_banks')}</h2>
        <p>{i18n.t('sasettings_banks_explanation')}</p>
        <div className="newBankForm">
          <div className="newBankFormTitle">{i18n.t('sasettings_new_bank_form_title')}</div>
          <div className="newBankInputContainer">
            <label htmlFor="bankNameInput">{i18n.t('sasettings_new_bank_form_bank_name')}*</label>
            <input
              id="bankNameInput"
              ref={(r) => {
                this.newBankNameInputRef = r;
              }}
              placeholder={i18n.t('sasettings_new_bank_form_bank_name')}
            />
          </div>
          <div
            className="newBankInputContainer"
            style={this.state.selectedResellerIdForNewBank ? { display: 'none' } : null}
          >
            <div>
              <label htmlFor="adminEmailInput">
                {i18n.t('sasettings_new_bank_form_admin_email_label')}
              </label>
              <input
                id="adminEmailInput"
                ref={(r) => {
                  this.newAdminEmailInputRef = r;
                }}
                placeholder={i18n.t('sasettings_new_bank_form_admin_email')}
              />
            </div>
          </div>
          <div className="action" onClick={this.insertBank}>
            {i18n.t('add')}
          </div>
        </div>

        {this.props.banks.length > 0 && (
          <table>
            <thead>
              <tr>
                <th></th>
                <th>{i18n.t('sasettings_bank_id')}</th>
                <th
                  className="sortable-header"
                  style={{ minWidth: 100 }}
                  title={i18n.t('sasettings_click_to_sort')}
                >
                  {i18n.t('sasettings_bank_name')}
                </th>
                <th>{i18n.t('sasettings_nb_users')}</th>
                <th>{i18n.t('sasettings_bank_created_at')}</th>
                {!isRestrictedSuperadmin && <th>{i18n.t('actions')}</th>}
              </tr>
            </thead>
            <tbody>
              {this.props.banks.map((bank) => {
                return (
                  <tr key={bank.id}>
                    <td>
                      <span
                        className="action"
                        onClick={() => {
                          window.location.href = baseFrontUrl + '/' + bank.id + '/';
                        }}
                      >
                        {i18n.t('sasettings_bank_open')}
                      </span>
                    </td>
                    <td>{bank.id}</td>

                    <EditableCell
                      value={bank.name}
                      onChange={(newVal) => {
                        if (!newVal) return;
                        this.updateBankName(bank.id, newVal);
                      }}
                    />
                    <td className={bank.nb_users > bank.nb_licences ? 'user-count-warning' : ''}>
                      {bank.nb_users}
                    </td>
                    <td>{new Date(bank.created_at).toLocaleDateString()}</td>
                    {!isRestrictedSuperadmin && (
                      <td>
                        <div
                          className={`action ${isRestrictedSuperadmin ? 'disabledUI' : ''}`}
                          onClick={() => this.setState({ bankToDeleteId: bank.id })}
                        >
                          {i18n.t('delete')}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
              <tr className="total-row">
                <td>{i18n.t('total')}</td>
                <td></td>
                <td></td>
                <td>{this.props.banks.reduce((r, b) => r + parseInt(b.nb_users), 0)}</td>
                <td></td>
                {!isRestrictedSuperadmin && <td></td>}
              </tr>
            </tbody>
          </table>
        )}
      </div>
    );
  }
}

export { ResellerBanks };
