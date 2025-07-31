import React from 'react';
import { bankUrlFetch } from './urlFetch';
import { i18n } from '../i18n/i18n';

class ResellerSelector extends React.Component {
  render() {
    const { value, onChange, className, resellers } = this.props;

    return (
      <select
        value={value || ''}
        onChange={(e) => onChange && onChange(e.target.value)}
        className={className}
        style={{ width: '100%', maxWidth: 200 }}
      >
        <option value=""></option>
        {resellers.map((reseller) => (
          <option key={reseller.id} value={reseller.id}>
            {reseller.name}
          </option>
        ))}
      </select>
    );
  }
}

export { ResellerSelector };
