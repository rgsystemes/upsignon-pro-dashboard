const badgeNode = document.getElementById('badge');
const titleNode = document.getElementById('title');
const messageNode = document.getElementById('message');
const backToSiteNode = document.getElementById('backToSite');

const CONFIRM_STATUS_BY_CODE = {
  INVALID_CONFIRM_LINK: 'error',
  EXPIRED_CONFIRM_LINK: 'error',
  TRIAL_CREATED: 'success',
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
      TRIAL_CREATED: {
        title: 'Environnement de test créé',
        message:
          "Votre adresse email a bien été validée. Votre banque de test a été créée avec succès. Consultez vos emails pour les instructions de connexion et la suite de votre parcours d'onboarding.",
      },
      CONFIRM_UNEXPECTED_ERROR: {
        title: 'Erreur inattendue',
        message:
          'Une erreur est survenue lors du traitement de votre demande. Veuillez réessayer plus tard.',
      },
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
      TRIAL_CREATED: {
        title: 'Trial environment created',
        message:
          'Your email has been confirmed. Your trial bank has been created successfully. Check your emails for login instructions and next steps for your onboarding.',
      },
      CONFIRM_UNEXPECTED_ERROR: {
        title: 'Unexpected error',
        message: 'An error occurred while processing your request. Please try again later.',
      },
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

const setState = ({ language, mode, title, message }) => {
  const texts = UI_TEXTS[language];
  document.documentElement.lang = language;
  document.title = texts.pageTitle;

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
    const params = new URLSearchParams({ token, lang: language });
    const response = await fetch(`/trial-request/confirm-status?${params.toString()}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    let responseCode = null;
    try {
      const body = await response.json();
      responseCode = body?.code || null;
    } catch {
      responseCode = null;
    }

    const safeCode = responseCode || UI_TEXTS[language].fallbackCode;
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
