<template>
  <div>
    <h1 class="title">All entities</h1>
    <p>Graphql endpoint: {{ graphqlEndpoint }}</p>
  </div>
</template>

<script>
  export default {
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