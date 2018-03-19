<template>
  <div class="EntityListActions">
    <v-tooltip right>
      <v-btn slot="activator" small fab color="primary secondary--text">
        <v-icon>add</v-icon>
      </v-btn>
      <span class="tooltip-text">{{ $t('cms.entities.actions.add') }}</span>
    </v-tooltip>
  </div>

</template>

<style lang="scss">
.EntityListActions {
  margin: 1em auto;
  text-align: center;
}
</style>