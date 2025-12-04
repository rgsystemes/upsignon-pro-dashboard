import { useState } from 'react';
import { i18n } from '../../../i18n/i18n';
import { TableColSortIcon } from '../../../helpers/icons/TableColSortIcon';
import { ShamirState } from './components/ShamirState';
import { ViewIcon } from '../../../helpers/icons/ViewIcon';
import { RightPanel } from '../../../helpers/RightPanel/RightPanel';
import { ConfigSummary } from './components/ConfigSummary';

export const ConfigurationHistory = (p) => {
  const { configs } = p;

  const [sortByVersion, setSortByVersion] = useState(0);
  const [sortByActivatedOn, setSortByActivatedOn] = useState(0);
  const [sortByCreatedBy, setSortByCreatedBy] = useState(0);
  const [sortByState, setSortByState] = useState(0);
  const onSortByVersion = () => {
    setSortByVersion(sortByVersion === 1 ? -1 : sortByVersion + 1);
    setSortByActivatedOn(0);
    setSortByCreatedBy(0);
    setSortByState(0);
  };
  const onSortByActivatedOn = () => {
    setSortByVersion(0);
    setSortByActivatedOn(sortByActivatedOn === 1 ? -1 : sortByActivatedOn + 1);
    setSortByCreatedBy(0);
    setSortByState(0);
  };
  const onSortByCreatedBy = () => {
    setSortByVersion(0);
    setSortByActivatedOn(0);
    setSortByCreatedBy(sortByCreatedBy === 1 ? -1 : sortByCreatedBy + 1);
    setSortByState(0);
  };
  const onSortByState = () => {
    setSortByVersion(0);
    setSortByActivatedOn(0);
    setSortByCreatedBy(0);
    setSortByState(sortByState === 1 ? -1 : sortByState + 1);
  };

  const [configToShow, setConfigToShow] = useState(null);
  const sortedConfigs = configs.sort((a, b) => {
    if (sortByVersion !== 0) {
      return (a.name < b.name ? -1 : a.name > b.name ? 1 : 0) * sortByVersion;
    }
    if (sortByActivatedOn !== 0) {
      return (
        (a.approvedAt < b.approvedAt ? -1 : a.approvedAt > b.approvedAt ? 1 : 0) * sortByActivatedOn
      );
    }
    if (sortByCreatedBy !== 0) {
      return (
        (a.creatorEmail < b.creatorEmail ? -1 : a.creatorEmail > b.creatorEmail ? 1 : 0) *
        sortByCreatedBy
      );
    }
    if (sortByState !== 0) {
      return (a.isActive < b.isActive ? -1 : a.isActive > b.isActive ? 1 : 0) * sortByState;
    }
  });
  return (
    <div>
      <h2>{i18n.t('shamir_history_title')}</h2>
      <table className={`table shamirTable`}>
        <thead className={`tableHeader`}>
          <tr>
            <th>
              <span>{i18n.t('shamir_history_version')}</span>
              <TableColSortIcon size={12} onClick={onSortByVersion} sorting={sortByVersion} />
            </th>
            <th>
              <span>{i18n.t('shamir_history_activated_on')}</span>
              <TableColSortIcon
                size={12}
                onClick={onSortByActivatedOn}
                sorting={sortByActivatedOn}
              />
            </th>
            <th>
              <span>{i18n.t('shamir_history_created_by')}</span>
              <TableColSortIcon size={12} onClick={onSortByCreatedBy} sorting={sortByCreatedBy} />
            </th>
            <th>
              <span>{i18n.t('shamir_history_state')}</span>
              <TableColSortIcon size={12} onClick={onSortByState} sorting={sortByState} />
            </th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {configs.map((c) => {
            return (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.approvedAt ? new Date(c.approvedAt).toLocaleDateString() : '-'}</td>
                <td>{c.creatorEmail}</td>
                <td>
                  <ShamirState
                    color={c.isActive ? '#38B2AC' : 'rgba(46, 56, 98, 0.10)'}
                    label={
                      c.isActive
                        ? i18n.t('shamir_history_state_active')
                        : i18n.t('shamir_history_state_inactive')
                    }
                  />
                </td>
                <td style={{ verticalAlign: 'middle' }}>
                  <button className="iconButton" onClick={() => setConfigToShow(c)}>
                    <ViewIcon size={20} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {configToShow && (
        <RightPanel onClose={() => setConfigToShow(null)}>
          <div style={{ padding: 20 }}>
            <ConfigSummary
              alternateDesign
              name={configToShow.name}
              creationDate={new Date(configToShow.createdAt)}
              creatorEmail={configToShow.creatorEmail}
              minShares={configToShow.minShares}
              holders={configToShow.shareholders.map((sh) => {
                return {
                  id: `${sh.email}${sh.bankName}`,
                  email: sh.email,
                  bankName: sh.bankName,
                };
              })}
              supportEmail={configToShow.supportEmail}
              showCreatorNotHolderWarning={false}
            />
          </div>
        </RightPanel>
      )}
    </div>
  );
};
