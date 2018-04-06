import { ApolloLink, concat, split } from 'apollo-link'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache, defaultDataIdFromObject } from 'apollo-cache-inmemory'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'
import 'subscriptions-transport-ws' // this is the default of apollo-link-ws

export default (ctx) => {
  const httpLink = new HttpLink({uri: 'http://localhost:3000/graphql'})
  const authMiddleware = new ApolloLink((operation, forward) => {
    const token = process.server ? ctx.req.session : window.__NUXT__.state.session
    operation.setContext({
      headers: {
        Authorization: token ? `Bearer ${token}` : null
      }
    })
    return forward(operation)
  })

  const enableSubscriptions = false
  let link

  // Set up subscription
  if (enableSubscriptions) {
    const wsLink = process.client ? new WebSocketLink({
      uri: `wss://localhost:3000/graphql`,
      options: {
        reconnect: true,
        connectionParams: () => {
          const token = process.server ? ctx.req.session : window.__NUXT__.state.session
          return {
            Authorization: token ? `Bearer ${token}` : null
          }
        }
      }
    }) : null

    link = split(
      ({query}) => {
        const {kind, operation} = getMainDefinition(query)
        return kind === 'OperationDefinition' && operation === 'subscription'
      },
      wsLink,
      httpLink
    )
  } else {
    link = httpLink
  }

  return {
    link: concat(authMiddleware, link),
    cache: new InMemoryCache({
      dataIdFromObject: object => {
        switch (object.__typename) {
          case 'ENTITY_TYPE': return `ENTITY_TYPE:${object.name}` // use `name` as the primary key
          default: return defaultDataIdFromObject(object) // fall back to default handling
        }
      }
    }),
    connectToDevTools: true
  }
}
