<template>
<v-container grid-list-md fluid>
  <v-layout row wrap>
    <v-flex xs12 lg3>
      <v-card dark color="secondary">
        <v-card-text>
          <p>List of entities</p>
        </v-card-text>
      </v-card>
    </v-flex>
    <v-flex xs12 lg9>
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
  export default {
    head () {
      return {
        title: 'Entities',
      }
    },
    data () {
      return {
        graphqlEndpoint: ''
      }
    },
    asyncData ({ env }) {
      return {
        graphqlEndpoint: env.panacea.main.endpoint
      }
    }
  }
</script>