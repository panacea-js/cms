<template>
  <div>
    <h1>{{ title }}</h1>
    <router-link :to="{ name: 'Root' }">Home</router-link>
  </div>
</template>

<script>
export default {
  name: 'PageNotFound',
  data () {
    return {
      title: 'Page Not Found'
    }
  }
}
</script>
