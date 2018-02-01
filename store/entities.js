import _ from 'lodash'

export const state = () => ({
  entityData: {},
  fieldPathActive: 'all',
  fieldPaths: [
    {
      path: 'all',
      label: 'All fields'
    }
  ]
})

export const getters = {
  GET_FIELD_PROPERTY_PATH: (state) => (field) => {
    return [
      state.entityData._meta.pascal,
      state.fieldPathActive
        .split('.')
        .filter(p => p !== 'all')
        .join('.'),
      field._meta.camel
    ].filter(i => !!i).join('.')
  }
}

export const mutations = {
  UPDATE_ENTITY_DATA (state, entityData) {
    state.entityData = entityData
  },
  SET_FIELD_PATH_ACTIVE (state, path) {
    state.fieldPathActive = path
  },
  RESET_FIELD_PATH_STATES (state) {
    state.fieldPathActive = 'all'
    state.fieldPaths = [
      {
        path: 'all',
        label: 'All fields'
      }
    ]
  },
  APPEND_FIELD_PATHS (state, pathObject) {
    state.fieldPaths.push(pathObject)
  },
  FILTER_FIELD_PATHS_ACTIVE_AND_ABOVE (state, activePath) {
    state.fieldPaths = state.fieldPaths.filter(fp => _(activePath).startsWith(fp.path))
  }
}

export const actions = {
  REDIRECT_TO_ENTITY ({ state, commit }, entityName) {
    commit('RESET_FIELD_PATH_STATES')
    this.$router.push({
      name: 'lang-entities-name',
      params: { name: entityName }
    })
    return false
  },
  GOTO_NEW_FIELD_PATH ({ state, commit }, pathObject) {
    commit('APPEND_FIELD_PATHS', pathObject)
    commit('SET_FIELD_PATH_ACTIVE', pathObject.path)
  },
  GOTO_EXISTING_FIELD_PATH ({ state, commit }, path) {
    commit('SET_FIELD_PATH_ACTIVE', path)
    commit('FILTER_FIELD_PATHS_ACTIVE_AND_ABOVE', path)
  }
}
