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
      'Industrie',
      'Commerce / Distribution',
      'Bâtiment / Immobilier / Travaux publics',
      'Transport / Logistique',
      'Arts / Médias / Communication',
      'IT/Telecom',
      'Secteur Public',
      'Education',
      'Santé',
      'Banque et Finance',
      'MSP Infogérance',
      'Association',
      'Étudiant',
      'Particulier',
    ],
    employeeCountPlaceholder: 'Veuillez sélectionner',
    employeeCountOptions: [
      '1 à 49',
      '50 à 99',
      '100 à 249',
      '250 à 499',
      '500 à 999',
      '1000 à 4999',
      '5000 à 9999',
      '10 000 et plus',
    ],
    submitButton: 'Envoyer',
    sendingStatus: 'Envoi en cours...',
    successStatus:
      'Demande reçue. Vérifiez votre boîte email pour valider votre adresse et finaliser la création de la banque test.',
    errorStatus:
      "Impossible d'envoyer la demande pour le moment. Merci de réessayer dans quelques instants.",
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
      'Industry',
      'Retail / Distribution',
      'Construction / Real estate / Public works',
      'Transport / Logistics',
      'Arts / Media / Communication',
      'IT / Telecom',
      'Public sector',
      'Education',
      'Healthcare',
      'Banking and Finance',
      'MSP Managed Services',
      'Non-profit',
      'Student',
      'Individual',
    ],
    employeeCountPlaceholder: 'Please select',
    employeeCountOptions: [
      '1 to 49',
      '50 to 99',
      '100 to 249',
      '250 to 499',
      '500 to 999',
      '1000 to 4999',
      '5000 to 9999',
      '10,000 and above',
    ],
    submitButton: 'Submit',
    sendingStatus: 'Sending...',
    successStatus:
      'Request received. Please check your email inbox to validate your email address and complete the test vault creation.',
    errorStatus: 'Unable to submit your request right now. Please try again in a few moments.',
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

const rebuildSelect = (selectNode, placeholder, options) => {
  const previousValue = selectNode.value;
  selectNode.innerHTML = '';

  const placeholderOption = document.createElement('option');
  placeholderOption.value = '';
  placeholderOption.textContent = placeholder;
  selectNode.appendChild(placeholderOption);

  options.forEach((optionText) => {
    const option = document.createElement('option');
    option.value = optionText;
    option.textContent = optionText;
    selectNode.appendChild(option);
  });

  if (previousValue && options.includes(previousValue)) {
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
};

const setStatus = (message, isError = false) => {
  statusNode.textContent = message;
  statusNode.style.color = isError ? '#9f1d1d' : '#54617d';
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

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!validateForm()) {
    return;
  }

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
      throw new Error('request_failed');
    }

    setStatus(UI_TEXTS[currentLanguage].successStatus);
    form.reset();
    setActivity(null);
  } catch (error) {
    setStatus(UI_TEXTS[currentLanguage].errorStatus, true);
  } finally {
    submitButton.disabled = false;
  }
});

applyStaticTranslations();
setActivity(null);
