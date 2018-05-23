<template>
  <div class="EntityTypesList">
    <v-card flat>
      <v-card-text class="pa-0">
        <v-list class="pa-0">
          <template v-for="(entity, index) in entities" class="EntityTypesList__items">
            <v-tooltip v-bind:key="`tooltip-${index}`" right>
              <v-list-tile slot="activator" v-bind:key="`entity-${index}`" :class="itemClasses(entity.name)" @click="redirectToEntity(entity.name)">
                <v-list-tile-content>
                  <v-list-tile-title v-html="entity.name"></v-list-tile-title>
                </v-list-tile-content>
              </v-list-tile>
              <span class="tooltip-text">{{ entity.data.description }}</span>
            </v-tooltip>
            <v-divider v-bind:key="`entity-divider-${index}`" v-if="index + 1 !== entities.length"></v-divider>
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
    itemClasses: function (entityName) {
      const classes = ['EntityTypesList__item']
      entityName === this.$route.params.name && classes.push('EntityTypesList__item--active')
      return classes.join(' ')
    },
    redirectToEntity: function (entityName) {
      this.$router.push({
        name: 'entities-name',
        params: { name: entityName }
      })
    }
  },
  mounted() {
    this.$apollo.watchQuery({ query: ENTITY_TYPES }).subscribe(result => {
      const entityTypes = _.cloneDeep(result.data.ENTITY_TYPES).map(et => {
        et.data = JSON.parse(et.data)
        return et
      })
      this.entities = entityTypes
    })
  },
  data() {
    return {
      entities: []
    }
  }
}
</script>

<style lang="scss">
.EntityTypesList__item {
  border-left: 3px solid transparent;
  opacity: 0.5;
}
.EntityTypesList__item--active {
  border-left-color: $color-accent;
  opacity: 1;
}
</style>
