import { ApolloLink } from 'apollo-link'
import { withClientState } from 'apollo-link-state'
import { InMemoryCache, defaultDataIdFromObject } from 'apollo-cache-inmemory'
import { persistCache } from 'apollo-cache-persist'

import localStateResolvers from '../local-state/resolvers'
import localStateDefaults from '../local-state/defaults'

export default (ctx) => {
  const cacheForLocalState = new InMemoryCache({
    dataIdFromObject: object => {
      switch (object.__typename) {
        case 'cmsUiSetting': return `cmsUiSetting:${object.key}`
        default: return defaultDataIdFromObject(object) // fall back to default handling
      }
    }
  })

  // Persist cache to local storage is window is available (i.e. client render).
  if (typeof window !== 'undefined') {
    persistCache({
      cache: cacheForLocalState,
      storage: window.localStorage
    })
  }

  const clientStateLink = withClientState({
    cache: cacheForLocalState,
    resolvers: localStateResolvers,
    defaults: localStateDefaults
  })

  return {
    link: ApolloLink.from([clientStateLink]),
    cache: cacheForLocalState,
    connectToDevTools: ctx.isDev
  }
}
