export const state = () => ({
  availableLocales: [],
  locale: ''
})

export const mutations = {
  SET_LOCALE(state, locale) {
    if (state.availableLocales.indexOf(locale) !== -1) {
      state.locale = locale
    }
  },
  SET_AVAILABLE_LOCALES(state, locales) {
    state.availableLocales = locales
  }
}