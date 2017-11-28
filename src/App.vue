<template>
  <div id="app">
    <PanaceaLogo></PanaceaLogo>
    <router-view/>
  </div>
</template>

<script>
  import PanaceaLogo from './components/PanaceaLogo.vue'

  export default {
    name: 'app',
    components: {
      PanaceaLogo
    }
  }
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
