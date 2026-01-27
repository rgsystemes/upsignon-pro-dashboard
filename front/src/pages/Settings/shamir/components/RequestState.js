import { i18n } from '../../../../i18n/i18n';

// {status: 'PENDING', 'COMPLETED', 'ABORTED' , 'EXPIRED', 'REFUSED'}
export const RequestState = (p) => {
  const { status } = p;

  let label = '';
  let color = '';
  switch (status) {
    case 'PENDING':
      label = i18n.t('shamir_requests_state_pending');
      color = '#7EA1FF';
      break;
    case 'COMPLETED':
      label = i18n.t('shamir_requests_state_completed');
      color = '#C0C3D0';
      break;
    case 'ABORTED':
      label = i18n.t('shamir_requests_state_aborted');
      color = '#C0C3D0';
      break;
    case 'EXPIRED':
      label = i18n.t('shamir_requests_state_expired');
      color = '#E53E3E';
      break;
    case 'REFUSED':
      label = i18n.t('shamir_requests_state_refused');
      color = '#E53E3E';
      break;
  }
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
