<template>
  <v-container grid-list-md fluid>
    <v-layout row wrap>
      <v-flex xs12 lg2>
        <EntityList />
      </v-flex>
      <v-flex xs12 lg10>
        <v-card dark color="secondary">
          <v-card-text>
            <h1 class="title">All entities dashboard</h1>
            <p>Graphql endpoint: {{ graphqlEndpoint }}</p>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import EntityList from "../../../components/EntityList.vue"

export default {
  components: {
    EntityList
  },
  head() {
    return {
      title: "Entities"
    }
  },
  data() {
    return {
      graphqlEndpoint: ""
    }
  },
  asyncData({ env }) {
    return {
      graphqlEndpoint: env.panacea.main.endpoint
    }
  }
}
</script>
