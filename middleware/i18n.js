export default function ({ isHMR, app, store, route, params, error, redirect }) {
  // If middleware is called from hot module replacement, ignore it
  if (isHMR) return
  // Get locale from params
  const locale = params.lang || 'en'
  const availableLocales = Object.keys(app.i18n.messages)
  store.commit('SET_AVAILABLE_LOCALES', availableLocales)

  if (availableLocales.indexOf(locale) === -1) {
    return error({ message: 'This page locale could not be found.', statusCode: 404 })
  }
  // Set locale
  store.commit('SET_LOCALE', locale)
  app.i18n.locale = store.state.locale
}