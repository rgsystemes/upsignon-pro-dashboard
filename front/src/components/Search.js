import React from 'react';

const styles = {
  container: {
    maxWidth: '18rem',
    margin: '1.25rem 0',
    padding: '0 1rem',
  },
  input: {
    width: '100%',
    padding: '0.5em 0.75em',
    borderRadius: '0.375em',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#d1d5db',
    background: '#f8fafc',
    fontSize: '1em',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
};

export function Search({
  placeholder,
  style,
  onChange,
  value,
  tooltip,
}) {
  const [internalValue, setInternalValue] = React.useState(value !== undefined ? value : '');

  const handleChange = (e) => {
    const value = e.target.value;
    setInternalValue(value);
    if (onChange) onChange(value);
  };

  return (
    <div style={{ ...styles.container, ...style }}>
      <input
        type="search"
        value={internalValue}
        onChange={handleChange}
        placeholder={placeholder}
        title={tooltip}
        aria-label={placeholder}
        autoComplete="off"
        style={{...styles.input}}
      />
    </div>
  );
}
