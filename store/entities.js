import _ from 'lodash'

export const state = () => {
  return {
    entityData: {},
    fieldsDisplayed: [],
    fieldPathActive: 'all',
    fieldPaths: [
      {
        path: 'all',
        label: 'entities.fields.breadcrumb.allFields'
      }
    ]
  }
}

/**
 * Adds placeholder values for undefined field attributes to ensure data
 * reactivity is set when missing attributes are added.
 *
 * For example, many and required attributes should be considered false
 * if they are not defined.
 */
function addPlaceholderAttributes (fields) {
  _(fields).forEach((field, fieldKey) => {
    !field.hasOwnProperty('required') && (fields[fieldKey].required = false)
    !field.hasOwnProperty('many') && (fields[fieldKey].many = false)
    if (field.hasOwnProperty('fields')) {
      fields[fieldKey].fields = addPlaceholderAttributes(fields[fieldKey].fields)
    }
  })
  return fields
}

export const getters = {
  /**
   * Get human readable traversion to get the field data.
   */
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

  SET_FIELDS (state, fields) {
    state.fieldsDisplayed = fields
  },

  UPDATE_ENTITY_DATA (state, entityData) {
    entityData.fields = addPlaceholderAttributes(entityData.fields)
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
        label: 'entities.fields.breadcrumb.allFields'
      }
    ]
  },

  APPEND_FIELD_PATHS (state, pathObject) {
    state.fieldPaths.push(pathObject)
  },

  FILTER_FIELD_PATHS_ACTIVE_AND_ABOVE (state, activePath) {
    state.fieldPaths = state.fieldPaths.filter(fp => _(activePath).startsWith(fp.path))
  },

  CREATE_FIELD (state, { id, fieldData }) {
    // @todo
    console.log(`Field ${id} fake created with data: ${JSON.stringify(fieldData)}`)
  },

  RENAME_FIELD (state, { oldId, newId }) {
    const allFieldsPathOnEntityData = _(state.fieldPathActive).split('.')
      .filter(p => p !== 'all')
      .map(p => ['fields', p])
      .push('fields')
      .flatten()
      .value()
      .join('.')

    const oldField = _(state.entityData).get(`${allFieldsPathOnEntityData}.${oldId}`)

    _.set(state.entityData, `${allFieldsPathOnEntityData}.${newId}`, oldField)
    _.set(state.entityData, `${allFieldsPathOnEntityData}.${newId}._meta.camel`, newId)
    _.unset(state.entityData, `${allFieldsPathOnEntityData}.${oldId}`)
  },

  UPDATE_FIELD (state, { id, fieldData }) {
    const fieldPathOnEntityData = _(state.fieldPathActive).split('.')
      .filter(p => p !== 'all')
      .map(p => ['fields', p])
      .push('fields')
      .push(id)

    _(fieldData).forEach((value, attribute) => {
      const fieldAttributePathOnEntityData = fieldPathOnEntityData
        .push(attribute)
        .flatten()
        .value()
        .join('.')

      _.set(state.entityData, fieldAttributePathOnEntityData, value)
    })

    const metaCamelAttributePathOnEntityData = fieldPathOnEntityData
      .push('_meta')
      .push('camel')
      .flatten()
      .value()
      .join('.')

    _.set(state.entityData, metaCamelAttributePathOnEntityData, id)
  },

  DELETE_FIELD (state, id) {
    // @todo
    console.log(`Field ${id} fake deleted`)
  }
}

export const actions = {
  /**
  * Get all fields from the active field path.
  */
  GET_FIELDS ({ state, commit, dispatch }) {
    const allFieldsPathOnEntityData = _(state.fieldPathActive).split('.')
      .filter(p => p !== 'all')
      .map(p => ['fields', p])
      .push('fields')
      .flatten()
      .value()
      .join('.')

    const fields = _(state.entityData).get(allFieldsPathOnEntityData)

    commit('SET_FIELDS', _(fields).values().value())

    dispatch('ensureFieldsContainerHeight')
  },
  REDIRECT_TO_ENTITY ({ state, commit }, entityName) {
    commit('RESET_FIELD_PATH_STATES')
    this.$router.push({
      name: 'lang-entities-name',
      params: { name: entityName }
    })
    return false
  },

  GOTO_NEW_FIELD_PATH ({ commit }, pathObject) {
    commit('APPEND_FIELD_PATHS', pathObject)
    commit('SET_FIELD_PATH_ACTIVE', pathObject.path)
  },

  GOTO_EXISTING_FIELD_PATH ({ commit }, path) {
    commit('SET_FIELD_PATH_ACTIVE', path)
    commit('FILTER_FIELD_PATHS_ACTIVE_AND_ABOVE', path)
  },

  SAVE_ENTITY ({ state, commit }) {
    // @todo
    console.log(`Entity ${state.entityData._meta.camel} fake saved`)
  },

  ensureFieldsContainerHeight () {
    if (typeof document !== 'undefined') {
      setTimeout(() => {
        const fieldsTable = document.getElementsByClassName('fields-table')
        const fieldsTableContainer = document.getElementsByClassName('fields-table-container')
        fieldsTableContainer[0].style.height = fieldsTable[0].clientHeight + 'px'
      }, 200)
    }
  }

}
