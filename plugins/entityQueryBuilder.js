import Vue from 'vue'
import gql from 'graphql-tag'

function transformQueryParams (queryParams) {
  if (Object.keys(queryParams).length) {
    const paramsList = []
    Object.keys(queryParams).forEach(key => {
      paramsList.push(`${key}: "${queryParams[key]}"`)
    })
    return ` (${paramsList.join(', ')})`
  }
  return ''
}

function generateFieldNest (fields) {
  return Object.keys(fields).map(field => {
    switch (fields[field].type) {
      case 'object':
        if (!fields[field].fields) {
          // Skip where an object field is missing sub-fields.
          delete fields[field]
          return
        }
        return `${field} { ${generateFieldNest(fields[field].fields)} }`
      case 'reference':
        return `${field} { name }`
        // @todo references require all entityTypes to lookup target entity type. Also, prevent recursion to the source entityType.

      default:
        return field
    }
  }).filter(x => !!x)
}

Vue.mixin({
  methods: {
    /**
     * Builds a GraphQL query string with all nested fields requested.
     *
     * @param {string} queryName
     *   The initial query string.
     * @param {object} entityTypeData
     *   An entity type object.
     * @param {object} queryParams
     *   An optional object of query parameters as key/value pairs.
     */
    entityQueryBuilder (queryName, entityTypeData, queryParams = {}) {
      const data = entityTypeData.data
      const fields = generateFieldNest(data.fields).join(', ')
      const params = transformQueryParams(queryParams)

      return gql(`{ ${queryName}${params} { ${fields} } }`)
    }
  }
})
