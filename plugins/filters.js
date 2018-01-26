import Vue from 'vue'
import lodashGet from 'lodash.get'

Vue.filter('json', function (value, key) {
  if (!value) {
    return ''
  }
  return lodashGet(JSON.parse(value), key)
})
