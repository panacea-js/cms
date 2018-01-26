import Vue from 'vue'
import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import VueApollo from 'vue-apollo'
import fetch from 'node-fetch'
import { createHttpLink } from 'apollo-link-http'

Vue.use(VueApollo)

export default ({ app, store }) => {
  const httpLink = createHttpLink({ uri: 'http://localhost:3000/graphql', fetch })

  const apolloClient = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
    connectToDevTools: true
  })

  const apolloProvider = new VueApollo({
    defaultClient: apolloClient
  })

  app.apolloProvider = apolloProvider
}
