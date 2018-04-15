import _ from 'lodash'

const cmsUiSettings = {
  schemeNav: 'dark',
  schemeMain: 'light'
}

export default _(cmsUiSettings).reduce((acc, value, key) => {
  acc[key] = {
    key,
    value,
    __typename: 'cmsUiSetting'
  }
  return acc
}, {})
