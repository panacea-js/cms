<template>
  <div class="EntityList">
    <v-card dark color="secondary" flat>
      <v-card-text class="pa-0">
        <v-list class="pa-0">
          <template v-for="(entity, index) in entities" class="EntityList__items">
            <v-tooltip v-bind:key="`tooltip-${index}`" right>
              <v-list-tile slot="activator" v-bind:key="`entity-${index}`" :class="itemClasses(entity.name)" @click="redirectToEntity(entity.name)">
                <v-list-tile-content>
                  <v-list-tile-title v-html="entity.name"></v-list-tile-title>
                </v-list-tile-content>
              </v-list-tile>
              <span class="tooltip-text">{{ entity.description }}</span>
            </v-tooltip>
            <v-divider v-bind:key="`entity-divider-${index}`" v-if="index + 1 !== entities.length"></v-divider>
          </template>
        </v-list>
      </v-card-text>
    </v-card>
    <EntityListActions />
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import EntityListActions from './EntityListActions'

export default {
  components: {
    EntityListActions
  },
  methods: {
    itemClasses: function(entityName) {
      const classes = ['EntityList__item']
      entityName === this.$route.params.name && classes.push('EntityList__item--active')
      return classes.join(' ')
    },
    ...mapActions({
      redirectToEntity: 'entities/REDIRECT_TO_ENTITY'
    })
  },
  mounted() {
    this.$store.dispatch('entities/GET_ENTITIES')
  },
  computed: {
    entities() {
      if (Array.isArray(this.$store.state.entities.entitiesData)) {
        return this.$store.state.entities.entitiesData.map(e => {
          const entityData = JSON.parse(e.data)
          return {
            name: e.name,
            description: entityData.description
          }
        })
      }
    },
  }
}
</script>

<style lang="scss">
.EntityList__item {
  border-left: 3px solid transparent;
  opacity: 0.5;
}
.EntityList__item--active {
  border-left-color: $color-accent;
  opacity: 1;
}
</style>
