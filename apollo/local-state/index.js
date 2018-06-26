import getKeyValue from './gql/queries/getKeyValue.gql'
import setKeyValue from './gql/mutations/setKeyValue.gql'
import defaultKeyValues from './defaults'
import _ from 'lodash'

const convertMappingItemStringToObject = function (item) {
  if (typeof item === 'string') {
    item = {
      localStateKey: item,
      dataPath: item
    }
  }
  return item
}

const isJsonString = function (string) {
  try {
    JSON.parse(string)
  } catch (error) {
    return false
  }
  return true
}

/**
 * Mapper to link a components data object with an apollo local state setting.
 *
 * When a local store setting changes, the component's data will be reactively updated.
 *
 * @param VueComponent component
 *   A Vue Component
 *
 * @param [Object] mappings
 *   An array of objects, each with the keys:
 *   - localStateKey: The key on the local state cache
 *   - dataPath: The dot separated path to the item being mapped in the components data object
 *
 * @param String clientConfigKey
 *   The apollo client config key
 *
 * @return void
 *   The component object is mutated directly
 */
const linkToLocalState = function (component, mappings, clientConfigKey) {
  if (typeof component.$apolloProvider.clients[clientConfigKey] === 'undefined') {
    console.error(`${clientConfigKey} is not a valid client config key`)
    return
  }

  const localStateApollo = component.$apolloProvider.clients[clientConfigKey]

  mappings.map(item => {
    item = convertMappingItemStringToObject(item)

    const localStateCache = localStateApollo.cache.data.data
    const cacheKey = `keyValue:${item.localStateKey}`

    if (!localStateCache.hasOwnProperty(cacheKey)) {
      console.error(Error(`Could not link ${item.dataPath} to local state because ${item.localStateKey} doesn't exist as a local setting key`))
      return
    }

    // When apollo local state changes, update the data item on the component.
    localStateApollo.watchQuery({ query: getKeyValue, variables: { key: item.localStateKey } }).subscribe(result => {
      let value = result.data.getKeyValue.value
      if (isJsonString(value)) {
        value = JSON.parse(value)
      }
      if (value.hasOwnProperty('type') && value.type === 'json') {
        value = value.json
      }
      _.set(component, item.dataPath, value)
    })

    // When the component data item changes, update (mutate) the apollo local state.
    component.$watch(item.dataPath, function (newVal, oldVal) {
      const cacheValue = localStateCache[cacheKey].value

      // Ensure cache mutation only happens once
      // - i.e. when the cached item doesn't match the updated value.
      if (cacheValue !== JSON.stringify(newVal)) {
        localStateApollo.mutate({
          mutation: setKeyValue,
          variables: { key: item.localStateKey, value: JSON.stringify(newVal) }
        })
      }
    }, {
      deep: true
    })
  })
}

/**
 * Reduce apollo-link-state cache store to a key/value based object.
 */
const localStateDefaults = _.reduce(defaultKeyValues, (acc, item, key) => {
  acc[key] = item.value
  return acc
}, {})

/**
 * Creates a data object populated from the provided
 * mappings and imported local state default values.
 *
 * @param [Object] mappings
 *   An array of objects, each with the keys:
 *   - localStateKey: The key on the local state cache.
 *   - dataPath: The dot separated path to the item being mapped in the components data object.
 *
 * @return Object
 *   Vue data object.
 */
const createDataDefaultFromMappings = function (mappings) {
  const data = {}

  mappings.map(item => {
    item = convertMappingItemStringToObject(item)

    if (!localStateDefaults.hasOwnProperty(item.localStateKey)) {
      console.error(Error(`Could not create data ${item.dataPath} because ${item.localStateKey} doesn't exist as a local state setting with a default value`))
      return
    }

    _.set(data, item.dataPath, localStateDefaults[item.localStateKey])
  })

  return data
}

const sharedDataMixin = function () {}

sharedDataMixin.install = function (Vue, options) {
  if (!options || !options.clientConfigKey) {
    console.error('sharedDataMixin must define a clientConfigKey')
    return
  }
  Vue.mixin({
    data () {
      if (typeof this.$options.sharedData === 'function') {
        const mappings = this.$options.sharedData()
        return Object.assign(this.$options.data, createDataDefaultFromMappings(mappings))
      }
      return {}
    },
    mounted () {
      if (typeof this.$options.sharedData === 'function') {
        const mappings = this.$options.sharedData()
        linkToLocalState(this, mappings, options.clientConfigKey)
      }
    }
  })
}

export { sharedDataMixin }
