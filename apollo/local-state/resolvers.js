export default {
  Mutation: {
    setCmsUiSetting: (_, { key, value }, { cache }) => {
      const data = {}
      data[key] = {
        __typename: 'cmsUiSetting',
        key,
        value
      },

      cache.writeData({ data })
      return null
    },
  },
  Query: {
    getCmsUiSetting: (_, { key }, { cache }) => {
      const settingKey = `cmsUiSetting:${key}`
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