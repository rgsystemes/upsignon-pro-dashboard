var preventMultipleClicksLock = null;
var timer = null;
var csrfTokenPromise = null;

function resetCsrfTokenCache() {
  csrfTokenPromise = null;
}

async function getCsrfToken() {
  if (!csrfTokenPromise) {
    csrfTokenPromise = fetch(`${window.location.href.replace('login.html', 'csrf-token')}`, {
      method: 'GET',
      cache: 'no-store',
      mode: 'same-origin',
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error('CSRF token request failed');
        }
        const body = await res.json();
        if (!body.csrfToken) {
          throw new Error('Missing CSRF token');
        }
        return body.csrfToken;
      })
      .catch((error) => {
        resetCsrfTokenCache();
        throw error;
      });
  }

  return csrfTokenPromise;
}

async function isInvalidCsrfTokenResponse(res) {
  if (res.status !== 403) {
    return false;
  }

  try {
    const body = await res.clone().json();
    return body?.message === 'Invalid CSRF token';
  } catch (error) {
    return false;
  }
}

async function sendAdminInvite(adminEmail, csrfToken, allowRetry = true) {
  const res = await fetch(`${window.location.href.replace('login.html', 'get_admin_invite')}`, {
    method: 'POST',
    body: JSON.stringify({ adminEmail }),
    cache: 'no-store',
    mode: 'same-origin',
    headers: new Headers({
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
    }),
    keepalive: false,
  });

  if (allowRetry && (await isInvalidCsrfTokenResponse(res))) {
    resetCsrfTokenCache();
    return sendAdminInvite(adminEmail, await getCsrfToken(), false);
  }

  return res;
}

document.getElementById('loginForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const adminEmail = document.getElementById('adminEmail').value;
  if (preventMultipleClicksLock === adminEmail) return;
  preventMultipleClicksLock = adminEmail;
  clearTimeout(timer);
  timer = setTimeout(() => {
    preventMultipleClicksLock = null;
  }, 10000);
  const csrfToken = await getCsrfToken();
  const res = await sendAdminInvite(adminEmail, csrfToken);
  const content = await res.text();
  if (!content || !res.ok) {
    window.alert("ÉCHEC ! une erreur est survenue. Cet email n'est peut-être pas autorisé.");
    return;
  }
  const body = JSON.parse(content);
  if (body.success) {
    window.alert('SUCCÈS ! vous allez recevoir un email.');
  } else {
    window.alert("ÉCHEC ! une erreur est survenue. Cet email n'est peut-être pas autorisé.");
  }
});

var UpSignOn = (function () {
  var UPSIGNON_BLUE = '#2E3862';
  var UPSIGNON_DEEP_LINK = 'upsignon://';
  var translations = {
    confidentialConnection: {
      fr: 'Connexion confidentielle',
      es: 'Conexión confidencial',
      en: 'Confidential connection',
    },
    download: {
      fr: "Télécharger l'application UpSignOn",
      es: 'Descargar la aplicación UpSignOn',
      en: 'Download the UpSignOn app',
    },
  };
  var getProtocolURI = function (request) {
    var protocolURI =
      UPSIGNON_DEEP_LINK +
      'protocol/?url=' +
      encodeURIComponent(request.url) +
      '&buttonId=' +
      encodeURIComponent(request.buttonId);
    if (request.connectionToken) {
      protocolURI += '&connectionToken=' + encodeURIComponent(request.connectionToken);
    }
    return protocolURI;
  };
  var getSVGLogo = function (width) {
    return `<div style="height:${width}px; width:${width}px; padding: 5px;">
          <svg style="height: 100%;width:100%;" viewBox="0 0 75 77" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M55.7553 24.0229L3.40527 76.9829H10.7753L59.5053 27.8429C59.6453 27.7029 59.7053 27.4329 59.5053 27.2329L56.3653 24.1629C56.2253 23.8929 55.9553 23.8929 55.7553 24.0229Z" fill="#FFFFFF"/>
<path d="M4.36512 38.4229L41.8351 0.542908H34.4651L0.685118 34.6629C0.545118 34.8029 0.485118 35.0729 0.685118 35.2729L3.75512 38.3429C3.95512 38.5429 4.23512 38.5429 4.36512 38.4129V38.4229Z" fill="#FFFFFF"/>
<path d="M63.1956 31.5229L18.2256 76.9729H25.5956L66.8856 35.3429C67.0256 35.1429 67.0256 34.8629 66.8856 34.7329L63.8156 31.6629C63.6756 31.3229 63.4056 31.3229 63.2056 31.5229H63.1956Z" fill="#FFFFFF"/>
<path d="M70.6347 39.0329L33.0947 76.9829H40.4647L74.3847 42.7929C74.5247 42.5929 74.5247 42.3129 74.3847 42.1829L71.3147 39.1129C71.1147 38.9129 70.8347 38.9129 70.6347 39.0429V39.0329Z" fill="#FFFFFF"/>
<path d="M8.12559 42.7129L11.1956 45.7829C11.3956 45.9229 11.6756 45.9229 11.8056 45.7829L56.7156 0.462891H49.3456L8.12559 42.0929C7.92559 42.2929 7.92559 42.5729 8.12559 42.7029V42.7129Z" fill="#FFFFFF"/>
<path d="M15.4946 50.2229L18.5646 53.2929C18.7646 53.4329 19.0446 53.4329 19.1746 53.2929L71.5246 0.4729H64.1547L15.4946 49.6129C15.3546 49.8129 15.3546 50.0929 15.4946 50.2229Z" fill="#FFFFFF"/>
</svg>
</div>
`;
  };
  var getButtonText = function () {
    var lang = navigator.language || navigator.userLanguage;
    return (
      translations.confidentialConnection[lang.substring(0, 2)] ||
      translations.confidentialConnection.en
    );
  };
  var getDownloadText = function () {
    var lang = navigator.language || navigator.userLanguage;
    return translations.download[lang.substring(0, 2)] || translations.download.en;
  };
  var addButtonContent = function (buttonContainer, protocolURI, uiConfig) {
    var linkElement = document.createElement('a');
    linkElement.href = protocolURI;
    linkElement.style.backgroundColor = UPSIGNON_BLUE;
    linkElement.style.padding = uiConfig.padding || '5px 15px 5px 5px';
    linkElement.style.display = 'flex';
    linkElement.style.flexDirection = 'row';
    linkElement.style.flexWrap = 'nowrap';
    linkElement.style.alignItems = 'center';
    linkElement.style.justifyContent = 'flex-start';
    linkElement.style.textDecoration = 'none';
    linkElement.style.borderRadius = uiConfig.borderRadius || '5px';

    var logoContainer = document.createElement('div');
    logoContainer.style.display = 'flex';
    logoContainer.style.justifyContent = 'center';
    logoContainer.innerHTML = getSVGLogo(uiConfig.logoWidth || 40);

    var textContainer = document.createElement('div');
    var brandDiv = document.createElement('div');
    brandDiv.textContent = 'UpSignOn by Septeo';
    var buttonTextDiv = document.createElement('div');
    buttonTextDiv.textContent = getButtonText();
    textContainer.appendChild(brandDiv);
    textContainer.appendChild(buttonTextDiv);
    textContainer.style.lineHeight = '1.3em';
    textContainer.style.textAlign = 'left';
    textContainer.style.color = 'white';
    textContainer.style.flex = '1';
    var padding = uiConfig.spaceBetween || '5px';
    textContainer.style.paddingLeft = padding;
    textContainer.style.paddingRight = padding;

    linkElement.appendChild(logoContainer);
    linkElement.appendChild(textContainer);

    // Clear container safely
    while (buttonContainer.firstChild) {
      buttonContainer.removeChild(buttonContainer.firstChild);
    }
    buttonContainer.appendChild(linkElement);

    var websiteLinkNode = document.createElement('a');
    websiteLinkNode.innerText = getDownloadText();
    websiteLinkNode.target = '_blank';
    websiteLinkNode.href = 'https://upsignon.eu/downloads';
    buttonContainer.appendChild(websiteLinkNode);
  };

  return {
    addButtonContent: addButtonContent,
    getProtocolURI: getProtocolURI,
    getSVGLogo: getSVGLogo,
    getButtonText: getButtonText,
    getDownloadText: getDownloadText,
    color: UPSIGNON_BLUE,
  };
})();

const btn = document.getElementById('UpSignOn');
if (window.location.search.length > 1) {
  var appLink = 'upsignon://protocol' + window.location.search;
  UpSignOn.addButtonContent(btn, appLink, {});
  document.getElementById('automaticAppOpener').src = appLink;
} else {
  const request = {
    url: window.location.href.replace('login.html', '') + 'login',
    buttonId: 'signin',
  };
  const protocolURI = UpSignOn.getProtocolURI(request);
  UpSignOn.addButtonContent(btn, protocolURI, {});
}
