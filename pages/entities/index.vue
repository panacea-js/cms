<template>
  <v-container grid-list-md fluid>
    <v-layout row wrap>
      <v-flex xs12 lg2>
        <EntityTypesList />
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
import EntityTypesList from "@/components/EntityTypesList.vue"

export default {
  components: {
    EntityTypesList
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
