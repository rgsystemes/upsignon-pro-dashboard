export const ShamirState = (p) => {
  const { label, color } = p;
  return (
    <div
      style={{
        display: 'flex',
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
