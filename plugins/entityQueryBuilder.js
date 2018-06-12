import Vue from 'vue'
import gql from 'graphql-tag'

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

      const generateFieldNest = function (fields) {
        return Object.keys(fields).map(field => {
          switch (fields[field].type) {
            case 'object':
              return `${field} { ${generateFieldNest(fields[field].fields)} }`
            case 'reference':
              // @todo references require all entityTypes to lookup target entity type. Also, prevent recursion to the source entityType.
              return
            default:
              return field
          }
        }).filter(x => !!x)
      }
      const fields = generateFieldNest(data.fields).join(', ')

      let params = ''
      if (Object.keys(queryParams).length) {
        const paramsList = []
        Object.keys(queryParams).forEach(key => {
          paramsList.push(`${key}: "${queryParams[key]}"`)
        })
        params = ` (${paramsList.join(' ,')})`
      }

      return gql(`{ ${queryName}${params} { ${fields} } }`)
    }
  }
})
