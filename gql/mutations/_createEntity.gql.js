import gql from 'graphql-tag'

export default function (params) {
  console.log(`mutation create${params.entityType} ($fields: ${params.entityType}Input!) {
    create${params.entityType} (fields: $fields) {
      id
    }
  }`)
  return gql`
    mutation create${params.entityType} ($fields: ${params.entityType}Input!) {
      create${params.entityType} (fields: $fields) {
        id
      }
    }
  `
}
