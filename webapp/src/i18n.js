import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from './locales/EN.json';
import esTranslation from './locales/ES.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      EN: {
        translation: enTranslation, // English messages
      },
      ES: {
        translation: esTranslation, // Spanish messages
      },
    },
    lng: 'EN', // Default language
    fallbackLng: 'EN', // Fallback language if the selected one isn't available

  });

export default i18n;