import qrcodeGenerator from 'qrcode-generator';

const simpleStateNode = document.getElementById('simpleState');
const badgeNode = document.getElementById('badge');
const titleNode = document.getElementById('title');
const messageNode = document.getElementById('message');
const backToSiteNode = document.getElementById('backToSite');

const successStateNode = document.getElementById('successState');
const successBadgeNode = document.getElementById('successBadge');
const successTitleNode = document.getElementById('successTitle');
const successEmailValidatedLabelNode = document.getElementById('successEmailValidatedLabel');
const successUserEmailNode = document.getElementById('successUserEmail');
const successBankCreatedLabelNode = document.getElementById('successBankCreatedLabel');
const successTrialEndTextNode = document.getElementById('successTrialEndText');
const successStep1TitleNode = document.getElementById('successStep1Title');
const successStep1TextNode = document.getElementById('successStep1Text');
const successActivateLinkNode = document.getElementById('successActivateLink');
const successActivateLabelNode = document.getElementById('successActivateLabel');
const successCopyBtnNode = document.getElementById('successCopyBtn');
const successStep2TitleNode = document.getElementById('successStep2Title');
const successStep2TextNode = document.getElementById('successStep2Text');
const successConsoleLinkNode = document.getElementById('successConsoleLink');
const successConsoleLabelNode = document.getElementById('successConsoleLabel');
const successConsoleTimerNode = document.getElementById('successConsoleTimer');
const successConsoleExpiredHintNode = document.getElementById('successConsoleExpiredHint');
const successConsoleExpiredHintTextNode = document.getElementById('successConsoleExpiredHintText');
const successConsoleLoginPageLinkNode = document.getElementById('successConsoleLoginPageLink');
const successConsoleLoginPageLinkTextNode = document.getElementById(
  'successConsoleLoginPageLinkText',
);
const successQrLabelNode = document.getElementById('successQrLabel');
const successQrImgNode = document.getElementById('successQrImg');
const successQrHintNode = document.getElementById('successQrHint');
const successActivationUrlTextNode = document.getElementById('successActivationUrlText');
const successFooterNote1Node = document.getElementById('successFooterNote1');
const successFooterNote2Node = document.getElementById('successFooterNote2');
const successContactLinkNode = document.getElementById('successContactLink');
const successBackToSiteNode = document.getElementById('successBackToSite');

const CONFIRM_STATUS_BY_CODE = {
  INVALID_CONFIRM_LINK: 'error',
  EXPIRED_CONFIRM_LINK: 'error',
  TRIAL_ALREADY_CONFIRMED: 'success',
  TRIAL_CREATED: 'success',
  TRIAL_RESELLER_NAME_CONFLICT: 'success',
  CONFIRM_UNEXPECTED_ERROR: 'error',
};

const UI_TEXTS = {
  fr: {
    pageTitle: 'Validation de la demande',
    loading: {
      badge: 'Chargement',
      title: 'Validation en cours...',
      message: 'Nous traitons votre demande, veuillez patienter.',
    },
    badges: {
      success: 'Succès',
      error: 'Erreur',
      loading: 'Chargement',
    },
    backToSiteLabel: 'Retour au site',
    fallbackCode: 'CONFIRM_UNEXPECTED_ERROR',
    confirmMessages: {
      INVALID_CONFIRM_LINK: {
        title: 'Lien de validation invalide',
        message: 'Le lien de validation est manquant ou mal formé.',
      },
      EXPIRED_CONFIRM_LINK: {
        title: 'Validation expirée',
        message:
          "Ce lien de validation est invalide ou a expiré. Merci de soumettre une nouvelle demande d'essai.",
      },
      TRIAL_ALREADY_CONFIRMED: {
        title: 'Demande déjà validée',
        message:
          "Cette demande d'essai a déjà été validée. Si besoin, consultez vos emails pour retrouver les informations d'accès.",
      },
      TRIAL_RESELLER_NAME_CONFLICT: {
        title: 'Un environnement existe déjà',
        message:
          "Votre organisation dispose déjà d'un environnement UpSignOn. Aucun nouvel essai n'a été créé. Si vous pensez qu'il s'agit d'une erreur ou souhaitez obtenir un accès, contactez-nous à help@rgsystem.com.",
      },
      CONFIRM_UNEXPECTED_ERROR: {
        title: 'Erreur inattendue',
        message:
          'Une erreur est survenue lors du traitement de votre demande. Veuillez réessayer plus tard.',
      },
    },
    success: {
      title: "Votre environnement d'essai gratuit est prêt",
      emailValidatedLabel: 'Email validé',
      bankCreatedLabel: 'Banque créée',
      trialEndText: (date) => `essai jusqu'au ${date}`,
      step1Title: 'Activez votre banque de coffres-forts',
      step1Text:
        "Ouvrez l'application UpSignOn sur cet ordinateur pour créer votre premier coffre-fort, ou scannez le QR code ci-contre depuis votre mobile.",
      activateLabel: 'Activer ma banque',
      copyLabel: 'Copier le lien',
      copiedLabel: 'Lien copié',
      step2Title: "Accédez à la console d'administration",
      step2Text:
        'Gérez vos utilisateurs et vos politiques de sécurité. Cliquez ici pour importer vos accès administratifs dans votre coffre-fort.',
      consoleLabel: 'Accéder à la console',
      consoleTimerText: (mmss) => `Ce lien expire dans ${mmss}`,
      consoleExpiredHintPrefix: 'Ce lien a expiré, vous pouvez le régénérer depuis la page',
      qrLabel: 'Activation mobile',
      qrHint: 'Scannez ce QR code depuis votre téléphone pour activer votre banque.',
      footerNote1: 'Un email récapitulatif vous a aussi été envoyé, à titre de sauvegarde.',
      footerNote2: 'Si vous suivez les étapes ici, rien à refaire depuis votre boîte mail.',
      contactLabel: 'Une question ?',
    },
  },
  en: {
    pageTitle: 'Request confirmation',
    loading: {
      badge: 'Loading',
      title: 'Confirmation in progress...',
      message: 'We are processing your request, please wait.',
    },
    badges: {
      success: 'Success',
      error: 'Error',
      loading: 'Loading',
    },
    backToSiteLabel: 'Back to website',
    fallbackCode: 'CONFIRM_UNEXPECTED_ERROR',
    confirmMessages: {
      INVALID_CONFIRM_LINK: {
        title: 'Invalid confirmation link',
        message: 'The confirmation link is missing or malformed.',
      },
      EXPIRED_CONFIRM_LINK: {
        title: 'Confirmation expired',
        message:
          'This confirmation link is invalid or has expired. Please submit a new trial request.',
      },
      TRIAL_ALREADY_CONFIRMED: {
        title: 'Request already confirmed',
        message:
          'This trial request has already been confirmed. Please check your emails for access details.',
      },
      TRIAL_RESELLER_NAME_CONFLICT: {
        title: 'An environment already exists',
        message:
          'Your organization already has an UpSignOn environment. No new trial was created. If you think this is a mistake or would like access, contact us at help@rgsystem.com.',
      },
      CONFIRM_UNEXPECTED_ERROR: {
        title: 'Unexpected error',
        message: 'An error occurred while processing your request. Please try again later.',
      },
    },
    success: {
      title: 'Your free trial environment is ready',
      emailValidatedLabel: 'Email confirmed',
      bankCreatedLabel: 'Bank created',
      trialEndText: (date) => `trial until ${date}`,
      step1Title: 'Activate your vault bank',
      step1Text:
        'Open the UpSignOn app on this computer to create your first vault, or scan the QR code from your mobile.',
      activateLabel: 'Activate my bank',
      copyLabel: 'Copy link',
      copiedLabel: 'Link copied',
      step2Title: 'Access the admin console',
      step2Text:
        'Manage your users and security policies. Click here to import your admin access into your vault.',
      consoleLabel: 'Access the console',
      consoleTimerText: (mmss) => `This link expires in ${mmss}`,
      consoleExpiredHintPrefix: 'This link has expired, you can regenerate it from the page',
      qrLabel: 'Mobile activation',
      qrHint: 'Scan this QR code from your phone to activate your bank.',
      footerNote1: 'A summary email has also been sent to you, as a backup.',
      footerNote2: "If you follow the steps here, there's nothing else to do from your inbox.",
      contactLabel: 'Have a question?',
    },
  },
};

const detectLanguage = () => {
  const params = new URLSearchParams(window.location.search);
  const requested =
    params.get('lang') ||
    params.get('locale') ||
    params.get('language') ||
    navigator.language ||
    'fr';

  return String(requested).toLowerCase().startsWith('en') ? 'en' : 'fr';
};

const getToken = () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  return token ? token.trim() : '';
};

// PUBLIC_URL (the API host) may differ from this page's own origin, e.g. in local
// dev where the front is served on :8090 and the backend on :3001. `credentials:
// 'same-origin'` silently drops/ignores the session cookie in that case, which
// makes the CSRF handshake fail every time. Switch to 'include'/'cors' whenever
// the two origins actually differ.
const getPublicOrigin = () => {
  try {
    return new URL(PUBLIC_URL, window.location.href).origin;
  } catch {
    return window.location.origin;
  }
};
const IS_CROSS_ORIGIN = getPublicOrigin() !== window.location.origin;
const FETCH_MODE = IS_CROSS_ORIGIN ? 'cors' : 'same-origin';
const FETCH_CREDENTIALS = IS_CROSS_ORIGIN ? 'include' : 'same-origin';

let csrfTokenPromise = null;

const resetCsrfTokenCache = () => {
  csrfTokenPromise = null;
};

const getCsrfToken = async () => {
  if (!csrfTokenPromise) {
    csrfTokenPromise = fetch(`${PUBLIC_URL}/csrf-token`, {
      method: 'GET',
      cache: 'no-store',
      mode: FETCH_MODE,
      credentials: FETCH_CREDENTIALS,
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
};

const isInvalidCsrfTokenResponse = async (response) => {
  if (response.status !== 403) {
    return false;
  }

  try {
    const body = await response.clone().json();
    return body?.message === 'Invalid CSRF token';
  } catch {
    return false;
  }
};

const formatTrialEndDate = (language, isoDate) => {
  try {
    return new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(isoDate));
  } catch {
    return '';
  }
};

const drawQrCode = (imgNode, url) => {
  try {
    const size = 168;
    const typeNumber = 0; // auto
    const errorCorrectionLevel = 'M';
    const qr = qrcodeGenerator(typeNumber, errorCorrectionLevel);
    qr.addData(url);
    qr.make();
    const nbPixels = qr.getModuleCount();
    const cellSize = Math.max(1, Math.round(size / nbPixels));
    imgNode.src = qr.createDataURL(cellSize, 0);
  } catch {
    // leave placeholder empty
  }
};

let consoleLinkCountdownIntervalId = null;

const formatCountdownMmSs = (remainingMs) => {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

const disableConsoleLink = (successTexts) => {
  successConsoleLinkNode.classList.add('is-disabled');
  successConsoleLinkNode.removeAttribute('href');
  successConsoleLinkNode.setAttribute('aria-disabled', 'true');
  successConsoleTimerNode.hidden = true;
  successConsoleExpiredHintTextNode.textContent = successTexts.consoleExpiredHintPrefix;
  successConsoleExpiredHintNode.hidden = false;
};

const startConsoleLinkCountdown = (successTexts, consoleUrlExpiresAt) => {
  if (consoleLinkCountdownIntervalId) {
    clearInterval(consoleLinkCountdownIntervalId);
    consoleLinkCountdownIntervalId = null;
  }

  const expiresAtMs = new Date(consoleUrlExpiresAt).getTime();
  if (!consoleUrlExpiresAt || Number.isNaN(expiresAtMs)) {
    successConsoleTimerNode.hidden = true;
    return;
  }

  const tick = () => {
    const remainingMs = expiresAtMs - Date.now();
    if (remainingMs <= 0) {
      clearInterval(consoleLinkCountdownIntervalId);
      consoleLinkCountdownIntervalId = null;
      disableConsoleLink(successTexts);
      return;
    }
    successConsoleTimerNode.hidden = false;
    successConsoleTimerNode.textContent = successTexts.consoleTimerText(
      formatCountdownMmSs(remainingMs),
    );
  };

  tick();
  consoleLinkCountdownIntervalId = setInterval(tick, 1000);
};

const applySuccessState = ({
  language,
  activationUrl,
  consoleUrl,
  consoleUrlExpiresAt,
  trialEnd,
  userEmail,
}) => {
  const texts = UI_TEXTS[language];
  const successTexts = texts.success;

  document.documentElement.lang = language;
  document.title = texts.pageTitle;

  simpleStateNode.hidden = true;
  successStateNode.hidden = false;

  successBadgeNode.textContent = texts.badges.success;
  successTitleNode.textContent = successTexts.title;

  successEmailValidatedLabelNode.textContent = successTexts.emailValidatedLabel;
  successUserEmailNode.textContent = userEmail || '';

  successBankCreatedLabelNode.textContent = successTexts.bankCreatedLabel;
  successTrialEndTextNode.textContent = successTexts.trialEndText(
    formatTrialEndDate(language, trialEnd),
  );

  successStep1TitleNode.textContent = successTexts.step1Title;
  successStep1TextNode.textContent = successTexts.step1Text;
  successActivateLinkNode.href = activationUrl;
  successActivateLabelNode.textContent = successTexts.activateLabel;

  successCopyBtnNode.textContent = successTexts.copyLabel;
  successCopyBtnNode.onclick = () => {
    const done = () => {
      successCopyBtnNode.textContent = successTexts.copiedLabel;
      setTimeout(() => {
        successCopyBtnNode.textContent = successTexts.copyLabel;
      }, 2000);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(activationUrl).then(done, done);
    } else {
      done();
    }
  };

  successStep2TitleNode.textContent = successTexts.step2Title;
  successStep2TextNode.textContent = successTexts.step2Text;
  successConsoleLinkNode.classList.remove('is-disabled');
  successConsoleLinkNode.removeAttribute('aria-disabled');
  successConsoleLinkNode.href = consoleUrl;
  successConsoleLabelNode.textContent = successTexts.consoleLabel;
  successConsoleExpiredHintNode.hidden = true;
  startConsoleLinkCountdown(successTexts, consoleUrlExpiresAt);

  const loginPageUrl = `${PUBLIC_URL}/login.html`;
  successConsoleLoginPageLinkNode.href = loginPageUrl;
  successConsoleLoginPageLinkTextNode.textContent = loginPageUrl;

  successQrLabelNode.textContent = successTexts.qrLabel;
  successQrHintNode.textContent = successTexts.qrHint;
  successActivationUrlTextNode.textContent = activationUrl;
  drawQrCode(successQrImgNode, activationUrl);

  successFooterNote1Node.textContent = successTexts.footerNote1;
  successFooterNote2Node.textContent = successTexts.footerNote2;
  successContactLinkNode.textContent = successTexts.contactLabel;
  successBackToSiteNode.textContent = texts.backToSiteLabel;
};

const setState = ({ language, mode, title, message }) => {
  const texts = UI_TEXTS[language];
  document.documentElement.lang = language;
  document.title = texts.pageTitle;

  successStateNode.hidden = true;
  simpleStateNode.hidden = false;

  badgeNode.classList.remove('success', 'error', 'loading');
  badgeNode.classList.add(mode);
  backToSiteNode.classList.remove('success', 'error', 'loading');
  backToSiteNode.classList.add(mode);

  badgeNode.textContent = texts.badges[mode];
  titleNode.textContent = title;
  messageNode.textContent = message;
  backToSiteNode.textContent = texts.backToSiteLabel;
};

const applyLoadingState = (language) => {
  const loading = UI_TEXTS[language].loading;
  setState({
    language,
    mode: 'loading',
    title: loading.title,
    message: loading.message,
  });
};

const resolveFrontMessage = (language, code) => {
  const texts = UI_TEXTS[language];
  return texts.confirmMessages[code] || texts.confirmMessages[texts.fallbackCode];
};

const confirmTrialRequest = async (language, token) => {
  if (!token) {
    const frontMessage = resolveFrontMessage(language, 'INVALID_CONFIRM_LINK');
    setState({
      language,
      mode: 'error',
      title: frontMessage.title,
      message: frontMessage.message,
    });
    return;
  }

  try {
    let response;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const csrfToken = await getCsrfToken();
      response = await fetch(`${PUBLIC_URL}/trial-request/confirm-status`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({ token, lang: language }),
        mode: FETCH_MODE,
        credentials: FETCH_CREDENTIALS,
      });

      if (attempt === 0 && (await isInvalidCsrfTokenResponse(response))) {
        resetCsrfTokenCache();
        continue;
      }

      break;
    }

    let responseBody = null;
    try {
      responseBody = await response.json();
    } catch {
      responseBody = null;
    }

    const responseCode = responseBody?.code || null;
    const safeCode = responseCode || UI_TEXTS[language].fallbackCode;

    if (
      safeCode === 'TRIAL_CREATED' &&
      responseBody?.activationUrl &&
      responseBody?.consoleUrl &&
      responseBody?.trialEnd
    ) {
      applySuccessState({
        language,
        activationUrl: responseBody.activationUrl,
        consoleUrl: responseBody.consoleUrl,
        consoleUrlExpiresAt: responseBody.consoleUrlExpiresAt,
        trialEnd: responseBody.trialEnd,
        userEmail: responseBody.userEmail,
      });
      return;
    }

    const frontMessage = resolveFrontMessage(language, safeCode);
    const mode = CONFIRM_STATUS_BY_CODE[safeCode] || 'error';

    setState({
      language,
      mode,
      title: frontMessage.title,
      message: frontMessage.message,
    });
  } catch {
    const fallbackCode = UI_TEXTS[language].fallbackCode;
    const frontMessage = resolveFrontMessage(language, fallbackCode);
    setState({
      language,
      mode: 'error',
      title: frontMessage.title,
      message: frontMessage.message,
    });
  }
};

const language = detectLanguage();
const token = getToken();

applyLoadingState(language);
confirmTrialRequest(language, token);
