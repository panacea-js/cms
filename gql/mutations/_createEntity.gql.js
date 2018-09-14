import gql from 'graphql-tag'

export default function (params) {
  return gql`
    mutation ($fields: ${params.entityType}Input!) {
      create${params.entityType} (fields: $fields) {
        id,
        name
      }
    }
  `
}
