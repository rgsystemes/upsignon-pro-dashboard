import { i18n } from '../../../../i18n/i18n';

export const ShamirState = (p) => {
  const { isActive, isPending } = p;
  if (isPending) {
    return <div className="shamirPendingTag">{i18n.t('shamir_change_pending_title')}</div>;
  }

  let label = isActive
    ? i18n.t('shamir_history_state_active')
    : i18n.t('shamir_history_state_inactive');
  let color = isActive ? '#38B2AC' : 'rgba(46, 56, 98, 0.10)';

  return (
    <div
      style={{
        display: 'inline-flex',
        padding: '4px 6px',
        alignItems: 'center',
        gap: '4px',
        borderRadius: '6px',
        border: '1px solid rgba(46, 56, 98, 0.10)',
        background: '#FFF',
        boxShadow: '0 1px 2px 0 rgba(16, 24, 40, 0.05)',
      }}
    >
      <span
        style={{
          display: 'inline-block',
          height: 8,
          width: 8,
          borderRadius: 8,
          marginRight: 5,
          backgroundColor: color,
        }}
      ></span>
      <span>{label}</span>
    </div>
  );
};
