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

  t(key, options) {
    let translation = I18n.translations[key];
    if (options) {
      Object.keys(options).forEach((optionKey) => {
        const regex = new RegExp(`\\$${optionKey}`, 'g');
        translation = translation.replace(regex, options[optionKey]);
      });
    }
    return translation;
  }
}

const i18n = I18n.getInstance();

export { i18n };
