const form = document.getElementById('trialRequestForm');
const mspBtn = document.getElementById('mspBtn');
const enterpriseBtn = document.getElementById('enterpriseBtn');
const languageSelect = document.getElementById('languageSelect');
const activityGroup = document.querySelector('.activity');
const headingNode = document.querySelector('.card h1');
const subtitleNode = document.querySelector('.subtitle');
const activityTypeInput = document.getElementById('activityType');
const enterpriseFields = document.getElementById('enterpriseFields');
const enterpriseEmployees = document.getElementById('enterpriseEmployees');
const businessSector = document.getElementById('businessSector');
const employeeCount = document.getElementById('employeeCount');
const marketingConsentText = document.getElementById('marketingConsentText');
const marketingIntro = document.getElementById('marketingIntro');
const privacyConsentText = document.getElementById('privacyConsentText');
const privacyConsentError = document.getElementById('privacyConsentError');
const submitButton = document.getElementById('submitButton');
const statusNode = document.getElementById('status');
const trialRequestContent = document.getElementById('trialRequestContent');
const successPanel = document.getElementById('successPanel');
const successMessageNode = document.getElementById('successMessage');
const showFormButton = document.getElementById('showFormButton');

const labels = {
  languageSelect: document.querySelector('label[for="languageSelect"]'),
  firstname: document.querySelector('label[for="firstname"]'),
  lastname: document.querySelector('label[for="lastname"]'),
  email: document.querySelector('label[for="email"]'),
  phone: document.querySelector('label[for="phone"]'),
  company: document.querySelector('label[for="company"]'),
  zip: document.querySelector('label[for="zip"]'),
  businessSector: document.querySelector('label[for="businessSector"]'),
  employeeCount: document.querySelector('label[for="employeeCount"]'),
};

const UI_TEXTS = {
  fr: {
    pageTitle: 'Tester 1 mois gratuitement',
    heading: 'Tester 1 mois gratuitement',
    subtitle: 'Quelle est votre activité ?',
    activityAriaLabel: "Type d'activité",
    mspButton: 'MSP, Revendeur, Infogérance',
    enterpriseButton: 'Entreprise privée ou publique',
    languageLabel: 'Langue',
    languageOptions: {
      fr: 'Français',
      en: 'Anglais',
    },
    labels: {
      firstname: 'Prénom*',
      lastname: 'Nom*',
      email: 'E-mail*',
      phone: 'Numéro de téléphone*',
      company: "Nom de l'entreprise*",
      zip: 'Code postal*',
      businessSector: "Secteur d'activité*",
      employeeCount: 'Nombre de salariés',
    },
    errors: {
      required: 'Ce champ est requis.',
      invalidEmail: 'Veuillez saisir une adresse e-mail valide.',
      privacyRequired: 'Vous devez accepter cette condition.',
    },
    businessSectorPlaceholder: 'Veuillez sélectionner',
    businessSectorOptions: [
      { value: 'industry', label: 'Industrie' },
      { value: 'retail_distribution', label: 'Commerce / Distribution' },
      {
        value: 'construction_real_estate_civil_engineering',
        label: 'Bâtiment / Immobilier / Travaux publics',
      },
      { value: 'transport_logistics', label: 'Transport / Logistique' },
      { value: 'arts_medias_communication', label: 'Arts / Médias / Communication' },
      { value: 'it_telecom', label: 'IT/Telecom' },
      { value: 'public_sector', label: 'Secteur Public' },
      { value: 'education', label: 'Education' },
      { value: 'health', label: 'Santé' },
      { value: 'bank', label: 'Banque et Finance' },
      { value: 'managed_service_provider', label: 'MSP Infogérance' },
      { value: 'non_profit_organization', label: 'Association' },
      { value: 'student', label: 'Étudiant' },
      { value: 'individual', label: 'Particulier' },
    ],
    employeeCountPlaceholder: 'Veuillez sélectionner',
    employeeCountOptions: [
      { value: '1-49', label: '1 à 49' },
      { value: '50-99', label: '50 à 99' },
      { value: '100-249', label: '100 à 249' },
      { value: '250-499', label: '250 à 499' },
      { value: '500-999', label: '500 à 999' },
      { value: '1000-4999', label: '1000 à 4999' },
      { value: '5000-9999', label: '5000 à 9999' },
      { value: '10000+', label: '10 000 et plus' },
    ],
    submitButton: 'Envoyer',
    sendingStatus: 'Envoi en cours...',
    successStatus:
      'Demande reçue. Vérifiez votre boîte email pour valider votre adresse et finaliser la création de la banque test.',
    showFormButton: 'Revenir au formulaire',
    errorStatus:
      "Impossible d'envoyer la demande pour le moment. Merci de réessayer dans quelques instants.",
    serverErrors: {
      INVALID_EMAIL_DOMAIN:
        "Veuillez utiliser une adresse email valide provenant de votre entreprise ou d'un fournisseur personnel.",
      ACCOUNT_ALREADY_EXISTS: 'Un compte existe déjà pour cette adresse email.',
      TRIAL_REQUEST_SUBMIT_FAILED:
        "Impossible d'envoyer la demande pour le moment. Merci de réessayer dans quelques instants.",
    },
    consent: {
      msp: {
        marketingIntro: "Septeo IT Solutions s'engage à protéger et à respecter votre vie privée.",
        marketing:
          'Je souhaite recevoir les actualités, invitations à des webinaires, informations et événements de Septeo IT Solutions.',
        privacy:
          'En cliquant sur « Envoyer » ci-dessous, j\'accepte que Septeo IT Solutions stocke et traite mes données personnelles. Pour plus d\'informations veuillez consulter notre page « <a href="https://www.rgsystem.septeo.com/politique-de-confidentialite" target="_blank" rel="noopener noreferrer">politique de confidentialité</a> ». *',
      },
      enterprise: {
        marketingIntro: '',
        marketing:
          "J'accepte de recevoir les actualités, invitations à des webinaires, informations et événements de Septeo IT SOLUTIONS.",
        privacy:
          'En cliquant sur « Envoyer » ci-dessous, j\'accepte que le Groupe Septeo stocke et traite mes données personnelles. Pour plus d\'informations veuillez consulter notre page « <a href="https://upsignon.eu/fr/privacyPolicy" target="_blank" rel="noopener noreferrer">politique de confidentialité</a> ». *',
      },
    },
  },
  en: {
    pageTitle: 'Start your 1-month free trial',
    heading: 'Start your 1-month free trial',
    subtitle: 'What is your activity?',
    activityAriaLabel: 'Activity type',
    mspButton: 'MSP, Reseller, Managed Services',
    enterpriseButton: 'Private or public organization',
    languageLabel: 'Language',
    languageOptions: {
      fr: 'French',
      en: 'English',
    },
    labels: {
      firstname: 'First name*',
      lastname: 'Last name*',
      email: 'Email*',
      phone: 'Phone number*',
      company: 'Company name*',
      zip: 'ZIP / Postal code*',
      businessSector: 'Business sector*',
      employeeCount: 'Number of employees',
    },
    errors: {
      required: 'This field is required.',
      invalidEmail: 'Please enter a valid email address.',
      privacyRequired: 'You must accept this condition.',
    },
    businessSectorPlaceholder: 'Please select',
    businessSectorOptions: [
      { value: 'industry', label: 'Industry' },
      { value: 'retail_distribution', label: 'Retail / Distribution' },
      {
        value: 'construction_real_estate_civil_engineering',
        label: 'Construction / Real estate / Public works',
      },
      { value: 'transport_logistics', label: 'Transport / Logistics' },
      { value: 'arts_medias_communication', label: 'Arts / Media / Communication' },
      { value: 'it_telecom', label: 'IT / Telecom' },
      { value: 'public_sector', label: 'Public sector' },
      { value: 'education', label: 'Education' },
      { value: 'health', label: 'Healthcare' },
      { value: 'bank', label: 'Banking and Finance' },
      { value: 'managed_service_provider', label: 'MSP Managed Services' },
      { value: 'non_profit_organization', label: 'Non-profit' },
      { value: 'student', label: 'Student' },
      { value: 'individual', label: 'Individual' },
    ],
    employeeCountPlaceholder: 'Please select',
    employeeCountOptions: [
      { value: '1-49', label: '1 to 49' },
      { value: '50-99', label: '50 to 99' },
      { value: '100-249', label: '100 to 249' },
      { value: '250-499', label: '250 to 499' },
      { value: '500-999', label: '500 to 999' },
      { value: '1000-4999', label: '1000 to 4999' },
      { value: '5000-9999', label: '5000 to 9999' },
      { value: '10000+', label: '10,000 and above' },
    ],
    submitButton: 'Submit',
    sendingStatus: 'Sending...',
    successStatus:
      'Request received. Please check your email inbox to validate your email address and complete the test vault creation.',
    showFormButton: 'Back to the form',
    errorStatus: 'Unable to submit your request right now. Please try again in a few moments.',
    serverErrors: {
      INVALID_EMAIL_DOMAIN:
        'Please use a valid email address from your company or a personal email provider.',
      ACCOUNT_ALREADY_EXISTS: 'An account already exists for this email address.',
      TRIAL_REQUEST_SUBMIT_FAILED:
        'Unable to submit your request right now. Please try again in a few moments.',
    },
    consent: {
      msp: {
        marketingIntro:
          'Septeo IT Solutions is committed to protecting and respecting your privacy.',
        marketing:
          'I would like to receive news, webinar invitations, information and events from Septeo IT Solutions.',
        privacy:
          'By clicking “Submit” below, I agree that Septeo IT Solutions may store and process my personal data. For more information, please see our “<a href="https://www.rgsystem.septeo.com/politique-de-confidentialite" target="_blank" rel="noopener noreferrer">privacy policy</a>”. *',
      },
      enterprise: {
        marketingIntro: '',
        marketing:
          'I agree to receive news, webinar invitations, information and events from Septeo IT SOLUTIONS.',
        privacy:
          'By clicking “Submit” below, I agree that Septeo Group may store and process my personal data. For more information, please see our “<a href="https://upsignon.eu/fr/privacyPolicy" target="_blank" rel="noopener noreferrer">privacy policy</a>”. *',
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

let currentLanguage = detectLanguage();
let currentActivity = null;
let isSuccessState = false;

const rebuildSelect = (selectNode, placeholder, options) => {
  const previousValue = selectNode.value;
  selectNode.innerHTML = '';

  const placeholderOption = document.createElement('option');
  placeholderOption.value = '';
  placeholderOption.textContent = placeholder;
  selectNode.appendChild(placeholderOption);

  options.forEach((optionInput) => {
    const optionValue = typeof optionInput === 'string' ? optionInput : optionInput.value;
    const optionLabel = typeof optionInput === 'string' ? optionInput : optionInput.label;
    const option = document.createElement('option');
    option.value = optionValue;
    option.textContent = optionLabel;
    selectNode.appendChild(option);
  });

  if (
    previousValue &&
    options.some((optionInput) => {
      const optionValue = typeof optionInput === 'string' ? optionInput : optionInput.value;
      return optionValue === previousValue;
    })
  ) {
    selectNode.value = previousValue;
  } else {
    selectNode.value = '';
  }
};

const applyStaticTranslations = () => {
  const t = UI_TEXTS[currentLanguage];
  document.documentElement.lang = currentLanguage;
  document.title = t.pageTitle;
  headingNode.textContent = t.heading;
  subtitleNode.textContent = t.subtitle;
  activityGroup.setAttribute('aria-label', t.activityAriaLabel);
  mspBtn.textContent = t.mspButton;
  enterpriseBtn.textContent = t.enterpriseButton;

  labels.languageSelect.textContent = t.languageLabel;
  languageSelect.options[0].textContent = t.languageOptions.fr;
  languageSelect.options[1].textContent = t.languageOptions.en;
  languageSelect.value = currentLanguage;

  labels.firstname.textContent = t.labels.firstname;
  labels.lastname.textContent = t.labels.lastname;
  labels.email.textContent = t.labels.email;
  labels.phone.textContent = t.labels.phone;
  labels.company.textContent = t.labels.company;
  labels.zip.textContent = t.labels.zip;
  labels.businessSector.textContent = t.labels.businessSector;
  labels.employeeCount.textContent = t.labels.employeeCount;

  rebuildSelect(businessSector, t.businessSectorPlaceholder, t.businessSectorOptions);
  rebuildSelect(employeeCount, t.employeeCountPlaceholder, t.employeeCountOptions);

  submitButton.textContent = t.submitButton;
  showFormButton.textContent = t.showFormButton;
  if (isSuccessState) {
    successMessageNode.textContent = t.successStatus;
  }
};

const setStatus = (message, isError = false) => {
  statusNode.textContent = message;
  statusNode.style.color = isError ? '#9f1d1d' : '#54617d';
};

const showSuccessPanel = () => {
  isSuccessState = true;
  trialRequestContent.style.display = 'none';
  successMessageNode.textContent = UI_TEXTS[currentLanguage].successStatus;
  successPanel.style.display = 'block';
};

const hideSuccessPanel = () => {
  isSuccessState = false;
  successPanel.style.display = 'none';
  trialRequestContent.style.display = 'block';
  setActivity(currentActivity);
};

const getSubmitErrorMessage = (errorCode) => {
  if (!errorCode) {
    return UI_TEXTS[currentLanguage].errorStatus;
  }

  return UI_TEXTS[currentLanguage].serverErrors[errorCode] || UI_TEXTS[currentLanguage].errorStatus;
};

const getCookieValue = (name) => {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = document.cookie.match(new RegExp(`(?:^|; )${escapedName}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : '';
};

const getFieldContainer = (fieldName) => {
  const input = form.elements[fieldName];
  return input?.closest('.field') || null;
};

const ensureFieldErrorNode = (fieldName) => {
  const fieldContainer = getFieldContainer(fieldName);
  if (!fieldContainer) return null;

  let errorNode = fieldContainer.querySelector('.fieldError');
  if (!errorNode) {
    errorNode = document.createElement('div');
    errorNode.className = 'fieldError';
    fieldContainer.appendChild(errorNode);
  }
  return errorNode;
};

const clearFieldError = (fieldName) => {
  const fieldContainer = getFieldContainer(fieldName);
  const errorNode = fieldContainer?.querySelector('.fieldError');
  if (fieldContainer) fieldContainer.classList.remove('error');
  if (errorNode) errorNode.textContent = '';
};

const setFieldError = (fieldName, message) => {
  const fieldContainer = getFieldContainer(fieldName);
  const errorNode = ensureFieldErrorNode(fieldName);
  if (fieldContainer) fieldContainer.classList.add('error');
  if (errorNode) errorNode.textContent = message;
};

const clearAllErrors = () => {
  ['firstname', 'lastname', 'email', 'phone', 'company', 'zip', 'businessSector'].forEach(
    clearFieldError,
  );
  privacyConsentError.textContent = '';
  privacyConsentError.previousElementSibling?.classList.remove('error');
};

const validateForm = () => {
  clearAllErrors();
  const t = UI_TEXTS[currentLanguage].errors;
  let hasError = false;

  const requiredFields = ['firstname', 'lastname', 'email', 'phone', 'company', 'zip'];
  requiredFields.forEach((fieldName) => {
    const value = form.elements[fieldName].value.trim();
    if (!value) {
      setFieldError(fieldName, t.required);
      hasError = true;
    }
  });

  const emailValue = form.elements.email.value.trim();
  if (emailValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
    setFieldError('email', t.invalidEmail);
    hasError = true;
  }

  if (activityTypeInput.value === 'enterprise' && !form.elements.businessSector.value) {
    setFieldError('businessSector', t.required);
    hasError = true;
  }

  if (!form.elements.privacyConsent.checked) {
    privacyConsentError.textContent = t.privacyRequired;
    privacyConsentError.previousElementSibling?.classList.add('error');
    hasError = true;
  }

  return !hasError;
};

const setActivity = (activity) => {
  currentActivity = activity;
  const consentTexts = UI_TEXTS[currentLanguage].consent;
  const isEnterprise = activity === 'enterprise';
  const isValidChoice = activity === 'msp' || activity === 'enterprise';

  activityTypeInput.value = isValidChoice ? activity : '';
  mspBtn.classList.toggle('active', activity === 'msp');
  enterpriseBtn.classList.toggle('active', activity === 'enterprise');

  if (!isValidChoice) {
    form.style.display = 'none';
    businessSector.required = false;
    employeeCount.required = false;
    return;
  }

  if (isSuccessState) {
    form.style.display = 'none';
    return;
  }

  form.style.display = 'block';
  enterpriseFields.style.display = isEnterprise ? 'flex' : 'none';
  enterpriseEmployees.style.display = isEnterprise ? 'flex' : 'none';
  businessSector.required = isEnterprise;
  employeeCount.required = false;
  marketingIntro.textContent = consentTexts[activity].marketingIntro;
  marketingIntro.style.display = consentTexts[activity].marketingIntro ? 'block' : 'none';
  marketingConsentText.textContent = consentTexts[activity].marketing;
  privacyConsentText.innerHTML = consentTexts[activity].privacy;
};

mspBtn.addEventListener('click', () => setActivity('msp'));
enterpriseBtn.addEventListener('click', () => setActivity('enterprise'));

languageSelect.addEventListener('change', (event) => {
  const nextLanguage = event.target.value === 'en' ? 'en' : 'fr';
  currentLanguage = nextLanguage;
  applyStaticTranslations();
  setActivity(currentActivity);
});

showFormButton.addEventListener('click', () => {
  hideSuccessPanel();
  form.elements.firstname?.focus();
});

// Track submission state to prevent double submission
let isSubmitting = false;
form.addEventListener('submit', async (event) => {
  event.preventDefault();

  // Prevent double submission
  if (isSubmitting) {
    return;
  }

  if (!validateForm()) {
    return;
  }

  isSubmitting = true;
  setStatus(UI_TEXTS[currentLanguage].sendingStatus);
  submitButton.disabled = true;

  const payload = {
    language: languageSelect.value,
    activityType: activityTypeInput.value,
    firstname: form.firstname.value.trim(),
    lastname: form.lastname.value.trim(),
    email: form.email.value.trim().toLowerCase(),
    phone: form.phone.value.trim(),
    company: form.company.value.trim(),
    zip: form.zip.value.trim(),
    businessSector: form.businessSector.value,
    employeeCount: form.employeeCount.value,
    marketingConsent: form.marketingConsent.checked,
    privacyConsent: form.privacyConsent.checked,
    hutk: getCookieValue('hubspotutk'),
  };

  try {
    const response = await fetch('/trial-request/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorCode = null;
      try {
        const errorBody = await response.json();
        errorCode = errorBody?.code || null;
      } catch {
        // Ignore parsing errors and fallback to generic message.
      }
      setStatus(getSubmitErrorMessage(errorCode), true);
      return;
    }

    setStatus('');
    showSuccessPanel();
  } catch (error) {
    setStatus(UI_TEXTS[currentLanguage].errorStatus, true);
  } finally {
    isSubmitting = false;
    submitButton.disabled = false;
  }
});

applyStaticTranslations();
setActivity(null);

// SEND CONTENT HEIGHT TO PARENT FOR IFRAME RESIZING
var sentHeight = null;

const sendHeight = () => {
  if (window.parent) {
    const height = document.body.offsetHeight;
    if (sentHeight !== height) {
      // keep the "+50" to avoid scrollbars appearing in case of minor miscalculations
      window.parent.postMessage({ frameHeight: height + 50 }, '*');
      sentHeight = height;
    }
  }
};

window.addEventListener('load', sendHeight);
window.addEventListener('resize', sendHeight);

if (typeof MutationObserver !== 'undefined') {
  const mutationObserver = new MutationObserver(sendHeight);
  mutationObserver.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
  });
}

// Initial height send in case content is already loaded
sendHeight();
