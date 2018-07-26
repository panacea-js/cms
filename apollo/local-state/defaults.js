import _ from 'lodash'

// When changing cache defaults, be sure to clear the browser's
// apollo-cache-persist local storage. When using objects to create base default
// values, make sure Vue.$set is used in component code to add nested
// properties. This will ensure reactivity is maintained.
const keyValues = {
  scheme: 'dark',
  openEntities: {},
  openEntityTypeGroups: []
}

export default _(keyValues).reduce((acc, value, key) => {
  // Ensure Apollo Link State doesn't apply its own object handling. Convert
  // objects and arrays to JSON strings, which are automatically packed and
  // unpacked in the Vue mixin provided in index.js
  if (typeof value !== 'string') {
    value = JSON.stringify(value)
  }
  acc[key] = {
    key,
    value,
    __typename: 'keyValue'
  }
  return acc
}, {})
