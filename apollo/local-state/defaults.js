import _ from 'lodash'

// When changing cache defaults, be sure to clear the browser's apollo-cache-persist local storage.
const cmsUiSettings = {
  scheme: 'dark',
}

export default _(cmsUiSettings).reduce((acc, value, key) => {
  acc[key] = {
    key,
    value,
    __typename: 'cmsUiSetting'
  }
  return acc
}, {})
