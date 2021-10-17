import { useState } from 'react';
import { i18n } from '../i18n/i18n';

export function EditableCell(props) {
  const { value, onChange, placeholder } = props;
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState('');

  if (isEditing) {
    return (
      <td>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <input
            style={{ width: `${Math.max(currentValue?.length || placeholder?.length || 0, 15)}ch` }}
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
          />
          <span
            style={{ marginLeft: 10 }}
            className="action"
            onClick={() => {
              onChange(currentValue);
            }}
          >
            {i18n.t('validate')}
          </span>
        </div>
      </td>
    );
  }
  return (
    <td
      style={{ cursor: 'pointer' }}
      onClick={() => {
        setIsEditing(true);
        setCurrentValue(value);
      }}
    >
      {value}
    </td>
  );
}
