import { useState, useEffect } from 'react';
import { TableColSortIcon } from '../../../helpers/icons/TableColSortIcon';
import { i18n } from '../../../i18n/i18n';
import { toast } from 'react-toastify';
import { bankUrlFetch } from '../../../helpers/urlFetch';
import { RequestState } from './components/RequestState';

const REQUEST_STATE_ORDER = ['PENDING', 'ABORTED', 'EXPIRED', 'COMPLETED'];

export const ShamirRequests = (p) => {
  const { setIsLoading } = p;
  const [requests, setRequests] = useState([]);
  const [sortByEmail, setSortByEmail] = useState(0);
  const [sortByDate, setSortByDate] = useState(0);
  const [sortByExpiryDate, setSortByExpiryDate] = useState(0);
  const [sortByCompletedDate, setSortByCompletedDate] = useState(0);
  const [sortByVersion, setSortByVersion] = useState(0);
  const [sortByState, setSortByState] = useState(0);
  const toggleOrder = (col) => {
    setSortByEmail(col === 'email' ? (sortByEmail === 1 ? -1 : sortByEmail + 1) : 0);
    setSortByDate(col === 'date' ? (sortByDate === 1 ? -1 : sortByDate + 1) : 0);
    setSortByExpiryDate(
      col === 'expiry' ? (sortByExpiryDate === 1 ? -1 : sortByExpiryDate + 1) : 0,
    );
    setSortByCompletedDate(
      col === 'completed' ? (sortByCompletedDate === 1 ? -1 : sortByCompletedDate + 1) : 0,
    );
    setSortByVersion(col === 'version' ? (sortByVersion === 1 ? -1 : sortByVersion + 1) : 0);
    setSortByState(col === 'state' ? (sortByState === 1 ? -1 : sortByState + 1) : 0);
  };

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const { requests } = await bankUrlFetch('/api/shamir-requests', 'POST', null);
      setRequests(requests);
    } catch (e) {
      console.error(e);
      toast.error(e.toString());
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchRequests();
  }, []);

  const sortedRequests = requests.sort((a, b) => {
    // Sort first by selected column
    if (sortByEmail !== 0) {
      if (a.email < b.email) return -sortByEmail;
      if (a.email > b.email) return sortByEmail;
    }
    if (sortByExpiryDate !== 0) {
      if (a.expiresAt < b.expiresAt) return -sortByExpiryDate;
      if (a.expiresAt > b.expiresAt) return sortByExpiryDate;
    }
    if (sortByCompletedDate !== 0) {
      if (a.completedAt && !b.completedAt) return -sortByCompletedDate;
      if (!a.completedAt && b.completedAt) return sortByCompletedDate;
      if (a.completedAt && b.completedAt) {
        if (a.completedAt < b.completedAt) return -sortByCompletedDate;
        if (a.completedAt > b.completedAt) return sortByCompletedDate;
      }
    }
    if (sortByVersion !== 0) {
      if (a.shamirConfigName < b.shamirConfigName) return -sortByVersion;
      if (a.shamirConfigName > b.shamirConfigName) return sortByVersion;
    }
    if (sortByState !== 0) {
      if (REQUEST_STATE_ORDER.indexOf(a.status) < REQUEST_STATE_ORDER.indexOf(b.status))
        return -sortByState;
      if (REQUEST_STATE_ORDER.indexOf(a.status) > REQUEST_STATE_ORDER.indexOf(b.status))
        return sortByState;
    }

    // then sort by creation date
    if (sortByDate !== 0) {
      if (a.createdAt < b.createdAt) return -sortByDate;
      if (a.createdAt > b.createdAt) return sortByDate;
    } else {
      if (a.createdAt < b.createdAt) return -1;
      if (a.createdAt > b.createdAt) return 1;
    }
    return 0;
  });

  return (
    <div>
      <h2 className="elementTitle20Bold">{i18n.t('shamir_requests_title')}</h2>
      <table className={`table`}>
        <thead className={`tableHeader`}>
          <tr>
            <th>
              <span>{i18n.t('shamir_requests_email')}</span>
              <TableColSortIcon
                size={12}
                onClick={() => toggleOrder('email')}
                sorting={sortByEmail}
              />
            </th>
            <th style={{ minWidth: 190 }}>
              <span>{i18n.t('shamir_requests_created_at')}</span>
              <TableColSortIcon
                size={12}
                onClick={() => toggleOrder('date')}
                sorting={sortByDate}
              />
            </th>
            <th style={{ minWidth: 190 }}>
              <span>{i18n.t('shamir_requests_expires_at')}</span>
              <TableColSortIcon
                size={12}
                onClick={() => toggleOrder('expiry')}
                sorting={sortByExpiryDate}
              />
            </th>
            <th style={{ minWidth: 210 }}>
              <span>{i18n.t('shamir_requests_completed_at')}</span>
              <TableColSortIcon
                size={12}
                onClick={() => toggleOrder('completed')}
                sorting={sortByCompletedDate}
              />
            </th>
            <th>
              <span>{i18n.t('shamir_requests_version')}</span>
              <TableColSortIcon
                size={12}
                onClick={() => toggleOrder('version')}
                sorting={sortByVersion}
              />
            </th>
            <th>
              <span>{i18n.t('shamir_requests_state')}</span>
              <TableColSortIcon
                size={12}
                onClick={() => toggleOrder('state')}
                sorting={sortByState}
              />
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedRequests.map((r) => {
            return (
              <tr key={r.id}>
                <td>{r.email}</td>
                <td>{new Date(r.createdAt).toLocaleString()}</td>
                <td>{new Date(r.expiresAt).toLocaleString()}</td>
                <td>{r.completedAt && new Date(r.completedAt).toLocaleString()}</td>
                <td>{r.shamirConfigName}</td>
                <td>
                  <RequestState status={r.status} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
