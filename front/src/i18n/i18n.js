class I18n {
  static instance = null;
  static getInstance() {
    if (I18n.instance == null) {
      I18n.instance = new I18n();
    }
    return I18n.instance;
  }

  constructor() {
    const languages = ['en', 'fr'];
    const lang = navigator.language.split('-')[0];
    if (languages.includes(lang)) {
      I18n.translations = require(`./${lang}.js`).default;
    } else {
      I18n.translations = require(`./en.js`).default;
    }
  }

  t(key) {
    return I18n.translations[key];
  }
}

const i18n = I18n.getInstance();

export { i18n };
