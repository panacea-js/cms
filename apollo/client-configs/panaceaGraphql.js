import { ApolloLink, split } from 'apollo-link'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache, defaultDataIdFromObject } from 'apollo-cache-inmemory'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'
import 'subscriptions-transport-ws' // this is the default of apollo-link-ws

export default (ctx) => {
  const server = ctx.env.panacea.main
  const httpLink = new HttpLink({
    uri: `${server.protocol}://${server.host}:${server.port}/${server.endpoint}`,
    credentials: 'include'
  })

  const authTokenId = 'panacea-cms-auth'

  const getBrowserAuthToken = function () {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(authTokenId)
    }
    console.error(`Attempting to get browser auth token from local storage within the server environment`)
  }

  const authMiddleware = new ApolloLink((operation, forward) => {
    const token = process.server ? ctx.req[authTokenId] : getBrowserAuthToken()
    operation.setContext({
      headers: {
        Authorization: token ? `Bearer ${token}` : null
      }
    })
    return forward(operation)
  })

  const enableSubscriptions = false
  let remoteLink

  // Set up subscription
  if (enableSubscriptions) {
    const wsLink = process.client ? new WebSocketLink({
      // @todo Implement subscriptions and get websocket details from .env variables
      uri: `wss://localhost:3000/graphql`,
      options: {
        reconnect: true,
        connectionParams: () => {
          const token = process.server ? ctx.req[authTokenId] : getBrowserAuthToken()
          return {
            Authorization: token ? `Bearer ${token}` : null
          }
        }
      }
    }) : null

    remoteLink = split(
      ({query}) => {
        const {kind, operation} = getMainDefinition(query)
        return kind === 'OperationDefinition' && operation === 'subscription'
      },
      wsLink,
      httpLink
    )
  } else {
    remoteLink = httpLink
  }

  const cacheForRemote = new InMemoryCache({
    dataIdFromObject: object => {
      switch (object.__typename) {
        case '_entityType': return `_entityType:${object.name}` // use `name` as the primary key
        case '_fieldType': return `_fieldType:${object.type}` // use `type` as the primary key
        default: return defaultDataIdFromObject(object) // fall back to default handling
      }
    }
  })

  return {
    link: ApolloLink.from([authMiddleware, remoteLink]),
    cache: cacheForRemote,
    connectToDevTools: ctx.isDev
  }
}
