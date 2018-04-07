export const state = () => {
  return {
    fieldTypes: {}
  }
}

export const getters = {

}

export const mutations = {
  // @todo Create a GraphQL query to specifically retrieve field types.
  SET_FIELD_TYPES (state, fieldTypes) {
    state.fieldTypes = fieldTypes
  }
}

export const actions = {

}
