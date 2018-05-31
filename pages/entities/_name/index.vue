<template>
  <v-container grid-list-md fluid>
    <v-layout row wrap>
      <v-flex xs12 lg2>
        <EntityTypesList />
      </v-flex>
      <v-flex xs12 lg10>
        <EntityTabs :entityType="entityType" />
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import EntityTypesList from '@/components/EntityTypesList.vue'
import EntityTabs from '@/components/EntityTabs.vue'

export default {
  components: {
    EntityTypesList,
    EntityTabs
  },
  head() {
    return {
      title: this.$t('cms.sections.entities')
    }
  },
  data() {
    return {}
  },
  asyncData({ env, store, params }) {
    return {
      entityType: params.name
    }
  }
}
</script>
