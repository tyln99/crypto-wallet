import i18n from 'i18next'
import { LANGUAGE_CODE } from '@shared/constant/language'
import { initReactI18next } from 'react-i18next'

const { VI, EN } = LANGUAGE_CODE

i18n.use(initReactI18next).init({
  fallbackLng: VI,
  lng: localStorage.getItem('language') || VI,
  resources: {
    [VI]: {
      translations: require('./locales/vi/translations.json')
    },
    [EN]: {
      translations: require('./locales/en/translations.json')
    }
  },
  ns: ['translations'],
  defaultNS: 'translations'
})

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('language', lng)
})

i18n.languages = [VI, EN]

export default i18n
