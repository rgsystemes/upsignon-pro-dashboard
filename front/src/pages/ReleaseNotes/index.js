import React from 'react';
import { i18n } from '../../i18n/i18n';

export class ReleaseNotes extends React.Component {
  render() {
    return (
      <div className="page">
        <h1>{i18n.t('menu_release_notes')}</h1>

        <h2>{i18n.t('release_notes_app')}</h2>
        <strong>{i18n.t('release_notes_app_7_1_0_title')}</strong>
        <p>
          {i18n
            .t('release_notes_app_7_1_0_content')
            .split('<br/>')
            .join(<br />)}
        </p>

        {/* <h2>{`${i18n.t('release_notes_extension')}`}</h2>

        <h2>{`${i18n.t('release_notes_server')}`}</h2>

        <h2>{`${i18n.t('release_notes_dashboard')}`}</h2> */}
      </div>
    );
  }
}
