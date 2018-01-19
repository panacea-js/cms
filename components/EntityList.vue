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
                <span class="tooltip-text">{{ entity.description }}</span>
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
export default {
  methods: {
    redirectToEntity: function(entityName) {
      this.$router.push({
        name: "entities-name",
        params: { name: entityName }
      });
    },
    isActive: function(entityName) {
      return entityName === this.$route.params.name ? "active" : "";
    }
  },
  data() {
    return {
      entities: [
        {
          name: "Cat",
          description: "A furry thing"
        },
        {
          name: "Dog",
          description:
            "A woofer. Here's a very long description to test what it will look like if somebody decides to put something really really long as the description"
        }
      ]
    };
  }
};
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