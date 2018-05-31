<template>
  <a href="#" class="EntityDelete" onclick="return false"><v-icon v-ripple>delete</v-icon></a>
</template>

<script>
export default {
  data() {
    return {

    }
  },
  props: {
    entityType: {
      type: String,
      required: true
    },
    entityId: {
      type: String,
      required: true
    },
  }
}
</script>

<style lang="stylus">
.EntityDelete
  text-decoration none
  .icon
    padding 0.5rem
    border-radius 10rem
    :root .theme--dark &
      color: $red.darken-2
      &:hover
        color: $red.darken-1
    :root .theme--light &
      background-color: $red.lighten-1
      &:hover
        background-color: $red.darken-1
</style>