<template>
  <div class="EntityListActions">
    <EntityEdit :isNew="true" />
  </div>
</template>

<script>
import EntityEdit from './EntityEdit'

export default {
  components: {
    EntityEdit
  }
}
</script>

<style lang="scss">
.EntityListActions {
  margin: 1em auto;
  text-align: center;
}
</style>