export default {
  Mutation: {
    setKeyValue: (_, { key, value }, { cache }) => {
      const data = {}
      data[key] = {
        __typename: 'keyValue',
        key,
        value
      }

      cache.writeData({ data })
      return null
    }
  },
  Query: {
    getKeyValue: (_, { key }, { cache }) => {
      const settingKey = `keyValue:${key}`
      if (!cache.data.data.hasOwnProperty(settingKey)) {
        console.error(Error(`Setting key ${key} doesn't exist`))
      }
      const setting = cache.data.data[settingKey]

      return {
        key: setting.key,
        value: setting.value,
        __typename: setting.__typename
      }
    }
  }
}
