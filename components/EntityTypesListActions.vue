<template>
  <div class="EntityTypesListActions">
    <EntityTypeEdit :isNew="true" />
  </div>
</template>

<script>
import EntityTypeEdit from './EntityTypeEdit'

export default {
  components: {
    EntityTypeEdit
  }
}
</script>

<style lang="stylus">
.EntityTypesListActions
  margin 1em auto
  text-align center
</style>