<template>
  <section class="container">
    <div>
      <h1 class="title">Settings</h1>
      <p>Graphql endpoint: {{ graphqlEndpoint }}</p>
    </div>
  </section>
</template>

<script>
  export default {
    head () {
      return {
        title: 'Settings',
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