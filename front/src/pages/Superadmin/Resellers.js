import React from 'react';
import { bankUrlFetch } from '../../helpers/urlFetch';
import { i18n } from '../../i18n/i18n';
import { isRestrictedSuperadmin } from '../../helpers/isRestrictedSuperadmin';
import { baseFrontUrl } from '../../helpers/env';
import { toast } from 'react-toastify';

// Props : setIsLoading, updateMenuResellers
class Resellers extends React.Component {
  state = {
    resellers: [],
  };
  newInputRef = null;

  fetchResellers = async () => {
    try {
      const resellers = await bankUrlFetch('/api/resellers', 'GET', null);
      this.setState({ resellers: resellers });
      this.props.updateMenuResellers(resellers);
    } catch (e) {
      console.error(e);
    }
  };

  insertReseller = async () => {
    try {
      this.props.setIsLoading(true);
      const resellerName = this.newInputRef.value;
      if (!resellerName) {
        this.newInputRef.style.borderColor = 'red';
        return;
      } else {
        this.newInputRef.style.borderColor = null;
      }
      await bankUrlFetch('/api/add-reseller', 'POST', {
        resellerName,
      });
      await this.fetchResellers();
      this.newInputRef.value = null;
    } catch (e) {
      console.error(e);
    } finally {
      this.props.setIsLoading(false);
    }
  };

  updateResellerName = async (resellerId, newName) => {
    try {
      this.props.setIsLoading(true);
      await bankUrlFetch('/api/update-reseller', 'POST', {
        resellerId,
        resellerName: newName,
      });
      await this.fetchResellers();
    } catch (e) {
      console.error(e);
    } finally {
      this.props.setIsLoading(false);
    }
  };

  deleteReseller = async (id) => {
    const confirmation = window.confirm(i18n.t('sasettings_reseller_delete_warning'));
    if (confirmation) {
      try {
        this.props.setIsLoading(true);
        await bankUrlFetch(`/api/delete-reseller/${id}`, 'POST', null);
        await this.fetchResellers();
      } catch (e) {
        console.error(e);
        if (e.message.includes('400')) {
          toast.error(i18n.t('sasettings_reseller_delete_error_banks_associated'));
        }
      } finally {
        this.props.setIsLoading(false);
      }
    }
  };

  componentDidMount() {
    this.fetchResellers();
  }

  render() {
    return (
      <div style={{ marginTop: 20 }}>
        <h2>{i18n.t('sasettings_resellers')}</h2>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 20,
          }}
          className={`${isRestrictedSuperadmin ? 'disabledUI' : ''}`}
        >
          <input
            ref={(r) => {
              this.newInputRef = r;
            }}
            placeholder={i18n.t('sasettings_reseller_name_placeholder')}
            style={{ width: 300, marginRight: 10 }}
          />
          <div
            className={`action ${isRestrictedSuperadmin ? 'disabledUI' : ''}`}
            style={{ marginLeft: 10 }}
            onClick={this.insertReseller}
          >
            {i18n.t('add')}
          </div>
        </div>
        {this.state.resellers.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>{i18n.t('sasettings_reseller_name')}</th>
                <th>{i18n.t('sasettings_reseller_created_at')}</th>
                <th>{i18n.t('sasettings_reseller_banks')}</th>
                <th>{i18n.t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {this.state.resellers.map((reseller) => {
                return (
                  <tr key={reseller.id}>
                    <td>
                      <EditableCellContent
                        value={reseller.name}
                        onChange={(newVal) => {
                          if (!newVal) return;
                          this.updateResellerName(reseller.id, newVal);
                        }}
                      />
                    </td>
                    <td>{new Date(reseller.created_at).toLocaleDateString()}</td>
                    <td>
                      <div>
                        {reseller.banks &&
                          reseller.banks.map((b) => {
                            return (
                              <div
                                key={b.id}
                                className="action"
                                onClick={() => {
                                  window.location.href = baseFrontUrl + '/' + b.id + '/';
                                }}
                              >
                                {b.name}
                              </div>
                            );
                          })}
                      </div>
                    </td>
                    <td className={`${isRestrictedSuperadmin ? 'disabledUI' : ''}`}>
                      {parseInt(reseller.bank_count) === 0 && (
                        <div className="action" onClick={() => this.deleteReseller(reseller.id)}>
                          {i18n.t('delete')}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    );
  }
}

const EditableCellContent = ({ value, onChange, type = 'text' }) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(value);

  React.useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleSave = () => {
    onChange(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <input
          type={type}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyPress}
          style={{ marginRight: 5 }}
          autoFocus
          disabled={isRestrictedSuperadmin}
        />
        <button onClick={handleSave} style={{ marginRight: 5 }} disabled={isRestrictedSuperadmin}>
          ✓
        </button>
        <button onClick={handleCancel}>✗</button>
      </div>
    );
  }

  return (
    <div
      style={{ cursor: isRestrictedSuperadmin ? 'default' : 'pointer' }}
      onClick={() => !isRestrictedSuperadmin && setIsEditing(true)}
    >
      {value}
    </div>
  );
};

export { Resellers };
