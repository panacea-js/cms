<template>
  <div class="EntityTypesList">
    <v-expansion-panel expand>
      <v-expansion-panel-content v-for="(_entityTypes, group) in groupedEntityTypes" :key="group" class="EntityTypesList__items" value="true">
        <div slot="header" class="primary--text" v-html="group"></div>
        <template v-for="(entityType, index) in _entityTypes" class="EntityTypesList__items">
          <v-tooltip v-bind:key="`entity-type-tooltip-${group}-${index}`" right>
            <v-list-tile slot="activator" v-bind:key="`entity-type-${index}`" :class="itemClasses(entityType.name)" @click="redirectToEntityType(entityType.name)">
              <v-list-tile-content class="pl-1">
                <v-list-tile-title v-html="entityType.name" />
                <v-list-tile-sub-title v-if="!!entityTypeSubTitle(entityType)"><sup>{{ entityTypeSubTitle(entityType) }}</sup></v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
            <span class="tooltip-text">{{ entityType.data.description }}</span>
          </v-tooltip>
        </template>
      </v-expansion-panel-content>
    </v-expansion-panel>

    <EntityTypesListActions />
  </div>
</template>

<script>
import EntityTypesListActions from './EntityTypesListActions'

import _entityTypes from '@/gql/queries/_entityTypes.gql'

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
    },
    entityTypeSubTitle: function (entityType) {
      return entityType.data._locationKey !== 'app' && entityType.data._locationKey !== 'core' ? entityType.data._locationKey : ''
    }
  },
  mounted () {
    this.$apollo.watchQuery({ query: _entityTypes }).subscribe(result => {
      const entityTypes = _.cloneDeep(result.data._entityTypes).map(et => {
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
  },
  computed: {
    groupedEntityTypes () {
      if (this.entityTypes.length > 0) {
        return this.entityTypes.reduce((acc, et) => {
          const locationKey = et.data._locationKey
          let group = et.data.group

          if (!group) {
            if (locationKey === 'app') {
              group = this.$t('cms.entities.types.locations.app')
            }
            else if (locationKey === 'core') {
              group = this.$t('cms.entities.types.locations.core')
            }
            else {
              group = this.$t('cms.entities.types.locations.plugin')
            }
          }

          acc[group] = acc[group] || []
          acc[group].push(et)
          return acc
        }, {})
      }

      return []
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
