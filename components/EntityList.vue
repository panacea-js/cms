<template>
  <v-card dark color="secondary">
    <v-card-text class="pa-0">
      <v-list two-line class="pa-0">
        <v-card dark color="secondary">
          <v-card-text class="pa-0">
            <v-list two-line class="pa-0">
            <template v-for="(entity, index) in entities">
              <v-list-tile :class="isActive(entity.name)" v-bind:key="`entity-${index}`" @click="redirectToEntity(entity.name)">
                <v-list-tile-content>
                  <v-list-tile-title v-html="entity.name"></v-list-tile-title>
                  <v-list-tile-sub-title v-html="entity.description" :title="entity.description"></v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
              <v-divider v-bind:key="`entity-divider-${index}`" v-if="index + 1 !== entities.length"></v-divider>
            </template>
          </v-list>
          </v-card-text>
        </v-card>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script>
  export default {
    methods: {
      redirectToEntity: function (entityName) {
        this.$router.push({ name: 'entities-name', params: { name: entityName }})
      },
      isActive: function (entityName) {
        return entityName === this.$route.params.name ? 'active' : ''
      }
    },
    data () {
      return {
        entities: [
          {
            name: 'Cat',
            description: 'A furry thing',
          },
          {
            name: 'Dog',
            description: 'A woofer. Here\'s a very long description to test what it will look like if somebody decides to put something really really long as the description',
          },
        ]
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
  border-left-color: #bada55;
  opacity: 1;
}
</style>