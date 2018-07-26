<template>
  <div class="EntityTypesList">
    <v-expansion-panel expand v-model="openEntityTypeGroups">
      <v-expansion-panel-content v-for="[group, _entityTypes] in groupedEntityTypes" :key="group" class="EntityTypesList__items">
        <div slot="header" class="primary--text" v-html="group"></div>
        <template v-for="(entityType, index) in _entityTypes" class="EntityTypesList__items">
          <v-tooltip :key="`entity-type-tooltip-${group}-${index}`" right>
            <v-list-tile slot="activator" :key="`entity-type-${index}`" :class="itemClasses(entityType.name)" @click="redirectToEntityType(entityType.name)">
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
    },
    groupEntityTypes (entityTypes) {
      // Construct array of tuples where first items are the group name and
      // the second is the list of entity types. This allows sorting on the
      // group names to maintain consistent ordering.
      const groupedEntityTypes = entityTypes.reduce((acc, et) => {
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

        const existingGroup = acc.find(entry => entry[0] === group)
        if (!existingGroup) {
          acc.push([group, [et]])
        }
        else {
          existingGroup[1].push(et)
        }

        return acc
      }, [])

      // Sort alphabetically using the first tuple element (group name) as the
      // comparison.
      groupedEntityTypes.sort((a, b) => a[0] > b[0] ? 1 : -1)

      this.groupedEntityTypes = groupedEntityTypes
    }
  },
  mounted () {
    this.$apollo.watchQuery({ query: _entityTypes }).subscribe(result => {
      const entityTypes = _.cloneDeep(result.data._entityTypes).map(et => {
        et.data = JSON.parse(et.data)
        return et
      })
      this.entityTypes = entityTypes
      this.groupEntityTypes(entityTypes)
    })
  },
  data() {
    return {
      entityTypes: [],
      openEntityTypeGroups: [],
      groupedEntityTypes: []
    }
  },
  sharedData() {
    return ['openEntityTypeGroups']
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
