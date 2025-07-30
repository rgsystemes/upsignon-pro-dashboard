import React from 'react';
import { baseUrlFetch, groupUrlFetch } from '../../helpers/urlFetch';
import { bankId } from '../../helpers/env';
import { i18n } from '../../i18n/i18n';
import qrcodeGenerator from 'qrcode-generator';

export class ProSetupLink extends React.Component {
  base64Img = null;

  setupLinRef = null;
  proSetupLink = null;

  state = {
    bankUrl: null,
  };
  fetchSetupUrlComponents = async () => {
    try {
      const { url } = await groupUrlFetch('/api/bank_url', 'GET');
      if (url) {
        this.proSetupLink = url;

        // create QR code
        const size = 150;
        const typeNumber = 0; // auto
        const errorCorrectionLevel = 'L';
        const qr = qrcodeGenerator(typeNumber, errorCorrectionLevel);
        qr.addData(this.proSetupLink);
        qr.make();
        const nbPixels = qr.getModuleCount();
        const cellSize = Math.round(size / nbPixels);
        const margin = 0;
        this.base64Img = qr.createDataURL(cellSize, margin);

        // Force rendering
        this.setState({
          bankUrl: url,
        });
      }
    } catch (e) {
      console.error(e);
    }
  };
  componentDidMount() {
    this.fetchSetupUrlComponents();
  }

  getScript = () => `## RUN AS ADMIN !
$cUsersPath = "C:\Users"
$usersPaths = (Get-ChildItem -Path $cUsersPath -Directory -ErrorAction SilentlyContinue).FullName
$bankUrl = "${this.state.bankUrl}";
Foreach($u in $usersPaths){
    if (Get-AppxPackage -Name 'dataSmine.UpSignOn' -AllUsers) {
        # Store package case
        New-Item "$u\AppData\Local\Packages\dataSmine.UpSignOn_fqgssej11bscy\LocalState\v6-gpo-configuration.json" -ItemType File -Value "{\`"proConfigUrl\`":\`"$bankUrl\`"}" -Force
    } else {
        # MSI package case
        New-Item "$u\AppData\Local\UpSignOn\v6-gpo-configuration.json" -ItemType File -Value "{\`"proConfigUrl\`":\`"$bankUrl\`"}" -Force
    }
}`;

  render() {
    if (!this.proSetupLink) return null;
    return (
      <div>
        <h2>{i18n.t('setup_link')}</h2>
        <div>{i18n.t('setup_link_is_group_specific')}</div>
        <div
          style={{
            margin: 20,
            borderRadius: 10,
            border: '1px solid #eee',
            padding: 20,
            width: 400,
            maxWidth: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: '0 0 3px #eee',
          }}
        >
          <div style={{ fontWeight: 'bold', textDecoration: 'none', color: 'black' }}>
            {i18n.t('link_to_communicate')}
            <span
              className="action"
              style={{ marginLeft: 20 }}
              onClick={() => {
                navigator.clipboard.writeText(this.proSetupLink).then(() => {
                  this.setupLinRef.style.backgroundColor = '#ccc';
                  setTimeout(() => {
                    this.setupLinRef.style.backgroundColor = 'initial';
                  }, 250);
                });
              }}
            >
              {i18n.t('copy_to_pasteboard')}
            </span>
          </div>
          <a
            href={this.proSetupLink}
            ref={(r) => {
              this.setupLinRef = r;
            }}
            className="link"
            target="_blank"
            rel="noreferrer"
            style={{
              textAlign: 'center',
              display: 'inline',
              marginBottom: 20,
              alignSelf: 'center',
              wordWrap: 'break-word',
            }}
          >
            {this.proSetupLink}
          </a>
          <img src={this.base64Img} style={{ height: 150, width: 150 }} alt="" />
        </div>
        <details>
          <summary style={{ fontWeight: 'bold' }}>{i18n.t('preconfig_title')}</summary>
          <div>
            {i18n.t('preconfig_line1')}
            <br />
            <pre
              style={{
                backgroundColor: 'lightgrey',
                padding: 10,
                borderRadius: 5,
                display: 'inline-block',
              }}
            >{`{"proConfigUrl":"${this.state.bankUrl}"}`}</pre>
            <br />
            {i18n.t('preconfig_line2')}
            <ul>
              <li>
                {i18n.t('preconfig_case1')}
                <br />
                <pre>
                  C:\Users\xxx\AppData\Local\Packages\dataSmine.UpSignOn_fqgssej11bscy\LocalState\v6-gpo-configuration.json
                </pre>
              </li>
              <li>
                {i18n.t('preconfig_case2')}
                <br />
                <pre>C:\Users\xxx\AppData\Local\UpSignOn\v6-gpo-configuration.json</pre>
              </li>
            </ul>
          </div>
          <div>{i18n.t('preconfig_script_example')}</div>
          <div style={{ maxWidth: '100%', overflowX: 'scroll' }}>
            <pre
              style={{
                backgroundColor: 'lightgrey',
                padding: 10,
                borderRadius: 5,
                display: 'inline-block',
              }}
            >
              {this.getScript()}
            </pre>
          </div>
        </details>
      </div>
    );
  }
}
