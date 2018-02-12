<template>
  <div class="entity-list-wrapper">

    <v-card dark color="secondary" flat>
      <v-card-text class="pa-0">
        <v-list class="pa-0">
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
        </v-list>
      </v-card-text>
    </v-card>

    <div class="entity-actions">
      <v-tooltip right>
        <v-btn slot="activator" small fab color="primary secondary--text" class="entity-actions__add">
          <v-icon>add</v-icon>
        </v-btn>
        <span class="tooltip-text">{{ $t('cms.entities.actions.add') }}</span>
      </v-tooltip>
    </div>

  </div>
</template>

<script>
import ENTITIES_ALL from '../gql/queries/EntitiesAll.gql'
import { mapActions } from 'vuex'

export default {
  methods: {
    isActive: function(entityName) {
      return entityName === this.$route.params.name ? "active" : ""
    },
    ...mapActions({
      redirectToEntity: 'entities/REDIRECT_TO_ENTITY'
    })
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
ul {
  background: transparent !important;
}
li {
  border-left: 3px solid transparent;
  opacity: 0.5;
}
li.active {
  border-left-color: $color-accent;
  opacity: 1;
}
.entity-actions {
  margin: 1em auto;
  text-align: center;
}
.tooltip-text {
  display: inline-block;
  max-width: 200px;
  font-size: 1.2em;
}
</style>
