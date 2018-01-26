<template>
  <v-card dark color="secondary">
    <v-card-text class="pa-0">
      <v-list two-line class="pa-0">
        <v-card dark color="secondary">
          <v-card-text class="pa-0">
            <template v-for="(entity, index) in entities">
              <v-tooltip v-bind:key="`tooltip-${index}`" right>
                <v-list-tile slot="activator" v-bind:key="`entity-${index}`" :class="isActive(entity.name)" @click="redirectToEntity(entity.name)">
                  <v-list-tile-content>
                    <v-list-tile-title v-html="entity.name"></v-list-tile-title>
                  </v-list-tile-content>
                </v-list-tile>
                <span class="tooltip-text">{{ entity.data | json('description') }}</span>
              </v-tooltip>
              <v-divider v-bind:key="`entity-divider-${index}`" v-if="index + 1 !== entities.length"></v-divider>
            </template>
          </v-card-text>
        </v-card>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script>
import ENTITIES_ALL from '../gql/queries/EntitiesAll.gql'
export default {
  methods: {
    redirectToEntity: function(entityName) {
      this.$router.push({
        name: "lang-entities-name",
        params: { name: entityName }
      })
    },
    isActive: function(entityName) {
      return entityName === this.$route.params.name ? "active" : ""
    }
  },
  apollo: {
    entities: {
      query: ENTITIES_ALL,
      fetchPolicy: 'cache-and-network',
      update: data => data.ENTITIES
    },
  },
  data() {
    return {
      entities: []
    }
  }
}
</script>

<style lang="scss" scoped>
li {
  border-left: 3px solid transparent;
  opacity: 0.5;
}
li.active {
  border-left-color: $color-accent;
  opacity: 1;
}
.tooltip-text {
  display: inline-block;
  max-width: 200px;
  font-size: 1.2em;
}
</style>
