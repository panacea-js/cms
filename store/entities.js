import _ from 'lodash'
import CREATE_ENTITY_GQL from '@/gql/mutations/createENTITY.gql'
import ENTITIES_ALL_GQL from '@/gql/queries/ENTITIES.gql'
import ENTITY_GQL from '@/gql/queries/ENTITY.gql'

export const state = () => {
  return {
    entityData: {},
    entitiesData: {},
    fieldsDisplayed: [],
    fieldPathActive: 'all',
    fieldPaths: [
      {
        path: 'all',
        label: 'cms.entities.fields.breadcrumb.allFields'
      }
    ],
    fieldTypes: {}
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

  SET_DISPLAYED_FIELDS (state, fields) {
    state.fieldsDisplayed = fields
  },

  SET_DISPLAYED_FIELDS_FROM_REORDERING (state, fieldsDisplayed) {
    state.fieldsDisplayed = fieldsDisplayed

    let weight = 1
    const fields = fieldsDisplayed.reduce((acc, field) => {
      field._meta.weight = weight++
      acc[field._meta.camel] = field
      return acc
    }, {})

    const fieldsFromFieldActivePath = _(state.fieldPathActive).split('.')
      .filter(p => p !== 'all')
      .map(p => ['fields', p])
      .push('fields')
      .flatten()
      .value()
      .join('.')

    _.set(state.entityData, fieldsFromFieldActivePath, fields)
  },

  UPDATE_ENTITY_DATA (state, entityData) {
    entityData.fields = addPlaceholderAttributes(entityData.fields)
    state.entityData = entityData
  },

  UPDATE_ENTITIES_DATA (state, entitiesData) {
    state.entitiesData = entitiesData
  },

  SET_FIELD_PATH_ACTIVE (state, path) {
    state.fieldPathActive = path
  },

  RESET_FIELD_PATH_STATES (state) {
    state.fieldPathActive = 'all'
    state.fieldPaths = [
      {
        path: 'all',
        label: 'cms.entities.fields.breadcrumb.allFields'
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
  },

  SET_FIELD_TYPES (state, fieldTypes) {
    state.fieldTypes = fieldTypes
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
    const fieldsValues = _(fields).values().value()

    commit('SET_DISPLAYED_FIELDS', fieldsValues)

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

  GET_ENTITY ({ commit, dispatch }) {
    const entityName = this.app.router.currentRoute.params.name

    const query = this.app.apolloProvider.defaultClient.query({
      query: ENTITY_GQL,
      variables: {
        name: entityName
      }
    })

    query.then(result => {
      const entityData = JSON.parse(result.data.ENTITY.data)
      commit('UPDATE_ENTITY_DATA', entityData)
      dispatch('GET_FIELDS')
    })
  },

  GET_ENTITIES ({ commit, dispatch }) {
    const query = this.app.apolloProvider.defaultClient.query({query: ENTITIES_ALL_GQL})

    query.then(result => {
      const entitiesData = result.data.ENTITIES
      commit('UPDATE_ENTITIES_DATA', entitiesData)
    })
  },

  SAVE_ENTITY ({ state }) {
    this.app.apolloProvider.defaultClient.mutate({
      mutation: CREATE_ENTITY_GQL,
      variables: {
        name: state.entityData._meta.camel,
        data: JSON.stringify(state.entityData)
      }
    })
    .catch(error => console.error(error))
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
