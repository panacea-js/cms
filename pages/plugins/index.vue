<template>
  <section class="container">
    <div>
      <h1 class="title">Plugins</h1>
      <p>Graphql endpoint: {{ graphqlEndpoint }}</p>
    </div>
  </section>
</template>

<script>
  export default {
    head () {
      return {
        title: 'Plugins',
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