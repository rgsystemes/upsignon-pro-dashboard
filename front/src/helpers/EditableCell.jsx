import { useState } from 'react';
import { i18n } from '../i18n/i18n';

export function EditableCell(props) {
  const { value, onChange, placeholder, type, style, disabled } = props;
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState('');

  if (isEditing) {
    const submit = () => {
      onChange(currentValue);
    };
    return (
      <td>
        <form
          onSubmit={(ev) => {
            ev.nativeEvent.preventDefault();
            setIsEditing(false);
            submit();
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <input
              style={{
                width: `${Math.max(currentValue?.length || placeholder?.length || 0, 15)}ch`,
                height: 'auto',
              }}
              value={currentValue}
              onChange={(ev) => {
                setCurrentValue(ev.target.value);
              }}
              autoFocus
              placeholder={placeholder}
              onBlur={(ev) => {
                // do make isEditing false but do not prevent onClick on validate
                setTimeout(() => {
                  setIsEditing(false);
                }, 150);
              }}
              type={type || 'text'}
            />
            <span style={{ marginLeft: 10 }} className="action" onClick={submit}>
              {i18n.t('validate')}
            </span>
          </div>
        </form>
      </td>
    );
  }
  return (
    <td
      style={{ cursor: 'pointer', ...style }}
      onClick={() => {
        if (disabled) {
          return;
        }
        setIsEditing(true);
        setCurrentValue(value);
      }}
    >
      {type === 'date'
        ? !!value
          ? new Date(value).toLocaleDateString()
          : i18n.t('sasettings_bank_test_expires_at_never')
        : value}
    </td>
  );
}
