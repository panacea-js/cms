import _ from 'lodash'

// When changing cache defaults, be sure to clear the browser's apollo-cache-persist local storage.
const keyValues = {
  scheme: 'dark',
  openEntities: []
}

export default _(keyValues).reduce((acc, value, key) => {
  acc[key] = {
    key,
    value,
    __typename: 'keyValue'
  }
  return acc
}, {})
