import React from 'react';
import { baseFrontUrl, groupId } from '../helpers/env';
import { i18n } from '../i18n/i18n';

// Props: groups, isSuperadmin, isSuperadminPage
class GroupChooser extends React.Component {
  state = {
    showList: false,
  };

  toggleGroupList = () => {
    this.setState((s) => ({ ...s, showList: !s.showList }));
  };
  render() {
    // eslint-disable-next-line eqeqeq
    const currentGroup = this.props.groups.find((g) => g.id == groupId);
    return (
      <div
        style={{
          padding: 20,
          display: 'flex',
          position: 'relative',
          overflow: 'visible',
        }}
      >
        {this.props.isSuperadminPage ? (
          <div className="currentGroup superadmin" onClick={this.toggleGroupList}>
            {i18n.t('menu_superadmin')}
          </div>
        ) : (
          <div className="currentGroup" onClick={this.toggleGroupList}>
            {currentGroup?.name}
          </div>
        )}
        {this.state.showList && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% - 20px)',
              backgroundColor: 'white',
              border: '1px solid #eee',
              boxShadow: '0 0 5px rgb(44, 83, 132)',
              maxHeight: '80vh',
              overflow: 'scroll',
            }}
          >
            {this.props.isSuperadmin && (
              <a className="groupLink superadmin" href={baseFrontUrl + '/superadmin/'}>
                {i18n.t('menu_superadmin')}
              </a>
            )}
            {this.props.groups.map((g) => {
              return (
                <a key={g.id} className="groupLink" href={baseFrontUrl + '/' + g.id + '/'}>
                  {g.name}
                </a>
              );
            })}
          </div>
        )}
      </div>
    );
  }
}

export { GroupChooser };
