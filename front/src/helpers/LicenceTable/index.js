import React, { useState } from 'react';
import { i18n } from '../../i18n/i18n';
import { bankUrlFetch } from '../urlFetch';
import { baseServerUrl, isSaasServer } from '../env';
import { isRestrictedSuperadmin } from '../isRestrictedSuperadmin';

export class LicenceTable extends React.Component {
  state = {
    externalLicences: [],
    internalLicences: [],
    banks: [],
  };
  showResellerCol = isSaasServer && window.location.pathname.indexOf('/superadmin') >= 0;
  isResellerPage = isSaasServer && window.location.pathname.indexOf('/reseller') >= 0;
  isBankPage =
    window.location.pathname.indexOf('/reseller') === -1 &&
    window.location.pathname.indexOf('/superadmin') === -1;

  fetchLicences = async () => {
    try {
      const res = await bankUrlFetch('/api/licences', 'GET', null);
      if (res) {
        this.setState({
          internalLicences: res.internalLicences,
          externalLicences: res.externalLicences,
          banks: res.banks,
        });
      }
    } catch (e) {
      console.error(e);
    }
  };
  assignInternalLicence = async (licencesExtId, bankId, nbLicences) => {
    try {
      const res = await bankUrlFetch('/api/licences-assign', 'POST', {
        licencesExtId,
        bankId,
        nbLicences,
      });
      await this.fetchLicences();
    } catch (e) {
      console.error(e);
    }
  };
  componentDidMount() {
    this.fetchLicences();
  }
  classNameForLicence = (l) => {
    try {
      const isExpiredNotRenewed =
        l.to_be_renewed && !l.is_monthly && new Date(l.valid_until).getTime() < Date.now();
      let willExpireSoon = false;
      if (l.valid_until && l.to_be_renewed) {
        let expDateMinus3Month = new Date(l.valid_until);
        expDateMinus3Month.setMonth(expDateMinus3Month.getMonth() - 3);
        willExpireSoon = expDateMinus3Month.getTime() < Date.now() && l.to_be_renewed;
      }
      const isExpiredNotToRenew =
        !l.to_be_renewed && new Date(l.valid_until).getTime() < Date.now();
      let className = null;
      if (isExpiredNotRenewed) className = 'redrow';
      else if (willExpireSoon) className = 'orangerow';
      else if (isExpiredNotToRenew) className = 'greyrow';
      return className;
    } catch (e) {
      console.error(e, l);
      return null;
    }
  };
  licenceDistributionCell = (l) => {
    if (l.reseller_id && !this.isResellerPage) {
      return (
        <a className="action" href={`/reseller/${l.reseller_id}`}>
          {i18n.t('licences_bank_distribution_see_reseller')}
        </a>
      );
    }
    if (l.bank_id) {
      return <div>{i18n.t('licences_bank_distribution_na')}</div>;
    }

    const licenceAssignmnentsForThisExtLicence = this.state.internalLicences.filter(
      (il) => il.external_licences_id === l.id,
    );
    const alreadyAssignedLicences = licenceAssignmnentsForThisExtLicence.reduce(
      (ac, n) => ac + n.nb_licences,
      0,
    );
    const remainingLicencesToAssign = l.nb_licences - alreadyAssignedLicences;
    const allUnssignedBanks = this.state.banks.filter(
      (b) => !licenceAssignmnentsForThisExtLicence.some((il) => il.bank_id === b.id),
    );

    return (
      <div>
        {licenceAssignmnentsForThisExtLicence.map((il) => {
          return (
            <EditableLicenceAssignment
              key={il.id}
              l={il}
              max={remainingLicencesToAssign}
              onSubmit={this.assignInternalLicence}
            />
          );
        })}
        <LicenceAssignmentForm
          onSubmit={(bankId, nbLicences) => this.assignInternalLicence(l.id, bankId, nbLicences)}
          max={remainingLicencesToAssign}
          banks={allUnssignedBanks}
        />
      </div>
    );
  };

  licenceRow = (l) => {
    const className = this.classNameForLicence(l);
    return (
      <tr key={l.id} className={className}>
        {this.showResellerCol && <td>{l.reseller_name}</td>}
        {!this.isResellerPage && !this.isBankPage && <td>{l.bank_name}</td>}
        <td>{l.nb_licences}</td>
        <td>
          <input type="checkbox" checked={l.is_monthly} disabled />
        </td>
        <td>{new Date(l.valid_from).toLocaleDateString()}</td>
        <td>{l.valid_until ? new Date(l.valid_until).toLocaleDateString() : '-'}</td>
        <td>{l.to_be_renewed ? i18n.t('yes') : i18n.t('no')}</td>
        {!this.isBankPage && <td>{this.licenceDistributionCell(l)}</td>}
      </tr>
    );
  };
  render() {
    const hasLicences =
      this.state.internalLicences?.length > 0 || this.state.externalLicences?.length > 0;
    if (!hasLicences)
      return (
        <div>
          <p>{i18n.t('licences_none')}</p>
          {window.location.pathname.indexOf('/superadmin') >= 0 && (
            <p>{i18n.t('licences_none_explanation')}</p>
          )}
          <PullButton setIsLoading={this.props.setIsLoading} refreshLicences={this.fetchLicences} />
        </div>
      );
    return (
      <div>
        <p>{i18n.t('licences_all')}</p>
        <PullButton setIsLoading={this.props.setIsLoading} refreshLicences={this.fetchLicences} />
        <table style={{ marginBottom: 20 }}>
          <thead>
            <tr>
              {this.showResellerCol && <th>{i18n.t('licences_reseller_name')}</th>}
              {!this.isResellerPage && !this.isBankPage && <th>{i18n.t('licences_bank_name')}</th>}
              <th>{i18n.t('licences_nb')}</th>
              <th>{i18n.t('licences_is_montly')}</th>
              <th>{i18n.t('licences_valid_from')}</th>
              <th>{i18n.t('licences_valid_until')}</th>
              <th>{i18n.t('licences_to_be_renewed')}</th>
              {!this.isBankPage && <th>{i18n.t('licences_bank_distribution')}</th>}
            </tr>
          </thead>
          <tbody>{this.state.externalLicences.map((l, i) => this.licenceRow(l))}</tbody>
        </table>
      </div>
    );
  }
}

const EditableLicenceAssignment = (props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [nbLicences, setNbLicences] = useState(props.l.nb_licences);
  const actualMax = props.max + props.l.nb_licences;
  const remainingText = `${actualMax} ${i18n.t('licences_bank_distribution_remaining')}`;
  const lineStyle = { display: 'flex', height: 25, alignItems: 'center', margin: '5px 0' };
  const inputStyle = {
    marginLeft: 10,
    marginRight: 10,
  };
  if (!isEditing) {
    return (
      <div
        style={{ cursor: 'pointer', ...lineStyle }}
        onClick={() => {
          setIsEditing(true);
          setNbLicences(props.l.nb_licences);
        }}
      >
        <div>{props.l.bank_name}:</div>
        <div style={inputStyle}>{`${props.l.nb_licences} licences`}</div>
      </div>
    );
  }
  return (
    <div style={lineStyle}>
      <div>{props.l.bank_name}:</div>
      <input
        type="number"
        style={{ color: nbLicences > actualMax ? 'red' : 'inherit', width: 100, ...inputStyle }}
        value={nbLicences || ''}
        min={0}
        onChange={(ev) => {
          setNbLicences(parseInt(ev.target.value));
        }}
        max={actualMax}
        placeholder={remainingText}
        autoFocus
        onBlur={() => setIsEditing(false)}
      />
      <div
        className="action"
        onMouseDown={(ev) => {
          ev.preventDefault(); // Prevents the blur on input
          props.onSubmit(props.l.external_licences_id, props.l.bank_id, nbLicences);
          setIsEditing(false);
        }}
      >
        {i18n.t('licences_bank_distribution_assign')}
      </div>
    </div>
  );
};

const LicenceAssignmentForm = (props) => {
  const [selectedBankId, setSelectedBankId] = useState(null);
  const [nbLicences, setNbLicences] = useState('');

  const remainingText = `${props.max} ${i18n.t('licences_bank_distribution_remaining')}`;

  return (
    <div className={isRestrictedSuperadmin ? 'disabled' : null} style={{ display: 'flex' }}>
      <select
        name="bankSelect"
        style={{ marginRight: 10, minWidth: 50 }}
        value={selectedBankId || ''}
        onChange={(e) => setSelectedBankId(parseInt(e.target.value) || null)}
      >
        <option value=""></option>
        {props.banks.map((b) => {
          return (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          );
        })}
      </select>
      <input
        type="number"
        style={{ marginRight: 10, width: 150, color: nbLicences > props.max ? 'red' : 'inherit' }}
        value={nbLicences || ''}
        min={1}
        onChange={(ev) => {
          setNbLicences(parseInt(ev.target.value));
        }}
        max={props.max}
        placeholder={remainingText}
      ></input>
      <div
        className="action"
        onClick={() => {
          if (!selectedBankId || !nbLicences) return;
          props.onSubmit(selectedBankId, nbLicences);
          setNbLicences(0);
        }}
      >
        {i18n.t('licences_bank_distribution_assign')}
      </div>
    </div>
  );
};

const PullButton = (p) => {
  if (window.location.pathname.indexOf('/superadmin') === -1) {
    return null;
  }
  const doStartLicencePulling = async () => {
    p.setIsLoading(true);
    try {
      await bankUrlFetch('/api/start-pull-licences', 'POST', null);
      await p.refreshLicences();
    } catch (e) {
      console.error(e);
    } finally {
      p.setIsLoading(false);
    }
  };
  return (
    <button
      className="action"
      onClick={doStartLicencePulling}
      style={{
        marginBottom: 20,
        background: 'none',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
      }}
    >
      {i18n.t('refresh')}
    </button>
  );
};
