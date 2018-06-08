<template>
  <div class="EntityTypesList">
    <v-card flat>
      <v-card-text class="pa-0">
        <v-list class="pa-0">
          <template v-for="(entityType, index) in entityTypes" class="EntityTypesList__items">
            <v-tooltip v-bind:key="`tooltip-${index}`" right>
              <v-list-tile slot="activator" v-bind:key="`entity-type-${index}`" :class="itemClasses(entityType.name)" @click="redirectToEntityType(entityType.name)">
                <v-list-tile-content>
                  <v-list-tile-title v-html="entityType.name"></v-list-tile-title>
                </v-list-tile-content>
              </v-list-tile>
              <span class="tooltip-text">{{ entityType.data.description }}</span>
            </v-tooltip>
            <v-divider v-bind:key="`entity-type-divider-${index}`" v-if="index + 1 !== entityTypes.length"></v-divider>
          </template>
        </v-list>
      </v-card-text>
    </v-card>
    <EntityTypesListActions />
  </div>
</template>

<script>
import EntityTypesListActions from './EntityTypesListActions'

import ENTITY_TYPES from '@/gql/queries/ENTITY_TYPES.gql'

export default {
  components: {
    EntityTypesListActions
  },
  methods: {
    itemClasses: function (entityTypeName) {
      const classes = ['EntityTypesList__item']
      entityTypeName === this.$route.params.name && classes.push('EntityTypesList__item--active')
      return classes.join(' ')
    },
    redirectToEntityType: function (entityTypeName) {
      this.$router.push({
        name: 'entities-name',
        params: { name: entityTypeName }
      })
    }
  },
  mounted() {
    this.$apollo.watchQuery({ query: ENTITY_TYPES }).subscribe(result => {
      const entityTypes = _.cloneDeep(result.data.ENTITY_TYPES).map(et => {
        et.data = JSON.parse(et.data)
        return et
      })
      this.entityTypes = entityTypes
    })
  },
  data() {
    return {
      entityTypes: []
    }
  }
}
</script>

<style lang="stylus">
.EntityTypesList
  &__item
    border-left 3px solid transparent
    opacity 0.5
    &--active
      border-left-color $color-accent
      opacity 1
</style>
