import { EditIcon } from '../../../../helpers/icons/EditIcon';
import { i18n } from '../../../../i18n/i18n';

export const NameAndVersion = (p) => {
  const { name, creationDate } = p;
  return (
    <div>
      <h3 className={`titleWithIcon`}>
        <EditIcon size={20} />
        <span>{i18n.t('shamir_config_name_title')}</span>
      </h3>
      <div className="twoCol">
        <div>
          <label className={'bodyMedium'}>{i18n.t('shamir_config_name')}</label>
          <br />
          <span>{name}</span>
        </div>
        <div>
          <label className={'bodyMedium'}>{i18n.t('shamir_config_creation_date')}</label>
          <br />
          <span>{creationDate.toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};
