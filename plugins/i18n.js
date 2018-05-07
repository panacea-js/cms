import Vue from 'vue'
import VueI18n from 'vue-i18n'
Vue.use(VueI18n)

export default ({ app, store, req }) => {
  // Set i18n instance on app so it can be used in middleware and pages asyncData/fetch etc.
  let activeLanguage = 'en'
  let cookieJar = ''

  if (process.server && req.headers.cookie) {
    cookieJar = req.headers.cookie
  } else if (typeof document !== 'undefined' && document.cookie) {
    cookieJar = document.cookie
  }

  if (cookieJar.length > 0) {
    cookieJar.split('; ').map(cookie => {
      const [ key, value ] = cookie.split('=')
      if (key === 'PANACEA-CMS-LANGUAGE') {
        activeLanguage = value
      }
    })
  }

  const messages = require(`@/locales/${activeLanguage}.json`)

  app.i18n = new VueI18n({
    locale: activeLanguage,
    fallbackLocale: 'en',
    messages,
    silentTranslationWarn: true
  })

  app.i18n.path = link => {
    if (app.i18n.locale === app.i18n.fallbackLocale) {
      return `/${link}`
    }

    return `/${app.i18n.locale}/${link}`
  }
}
