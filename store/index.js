export const state = () => ({
  availableLocales: [],
  locale: ''
})

export const mutations = {
  SET_LOCALE (state, locale) {
    if (state.availableLocales.indexOf(locale) !== -1) {
      state.locale = locale
    }
  },
  SET_AVAILABLE_LOCALES (state, locales) {
    state.availableLocales = locales
  }
}

const updateCoreLocale = function (commit, route) {
  const { entities, hooks, i18n } = Panacea.container

  const routeLocale = route.params.lang
  const coreLocale = i18n.locale

  if (routeLocale && coreLocale !== routeLocale) {
    hooks.invoke('core.locale.change', routeLocale)
    // Entities field types need to be recomputed with new translations.
    entities.registerFieldTypes()
  }

  commit('entities/SET_FIELD_TYPES', entities.fieldTypes)
}

export const actions = {
  nuxtServerInit ({ commit }, { route }) {
    updateCoreLocale(commit, route)
  }
}
