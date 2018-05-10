<template>
  <v-container grid-list-md fluid>
    <v-layout row wrap>
      <v-flex xs12 lg2>
        <EntityList />
      </v-flex>
      <v-flex xs12 lg10>
        <v-tabs
          slot="extension"
          v-model="activeTab"
          class="EntityTabs"
        >

        <v-tab
          v-for="tab in tabs"
          :key="tab.id"
          :href="`#tab-${tab.id}`"
        >
          {{ tab.label }}
        </v-tab>

        <v-tab
          v-for="entity in openEntities"
          :key="entity.id"
          :href="`#tab-entity-${entity.id}`"
        >
          {{ entity.title }}

          <v-icon small class="EntityTabs__closer" @click="closeTab(entity.id)">clear</v-icon>
        </v-tab>

        <v-tabs-items>
          <v-tab-item :key="`tab-list`" id="tab-list">
            A list of entities
          </v-tab-item>
          <v-tab-item :key="`tab-config`" id="tab-config">
            <EntityFields :entityType="entityType" :graphqlEndpoint="graphqlEndpoint" />
          </v-tab-item>
          <v-tab-item
            v-for="entity in openEntities"
            :key="`tab-${entity.id}`"
            :id="`tab-entity-${entity.id}`">
            Id: {{ entity.id }}
            <br />
            Title: {{ entity.title }}
          </v-tab-item>
        </v-tabs-items>

        </v-tabs>

      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import EntityList from '@/components/EntityList.vue'
import EntityFields from '@/components/EntityFields.vue'

export default {
  components: {
    EntityList,
    EntityFields,
  },
  head() {
    return {
      title: this.$t('cms.sections.entities')
    }
  },
  methods: {
    closeTab(id) {
      const closingTabIndex = this.openEntities.findIndex(entity => entity.id === id)
      const closingTabIsActive = 'tab-entity-' + this.openEntities[closingTabIndex].id === this.activeTab
      this.openEntities.splice(closingTabIndex, 1)

      // @todo fix this
      if (closingTabIsActive) {
        if (this.openEntities.length > 0) {
          this.activeTab = 'tab-entity-' + this.openEntities[closingTabIndex].id
        }
        else {
          this.activeTab = 'tab-' + this.tabs[this.tabs.length-1].id
        }
      }

    }
  },
  computed: {
  },
  data() {
    return {
      // @todo link graphql error with store.
      graphqlError: false,
      tabs: [
        // @todo add translate string
        {id: 'list', label: 'List'},
        {id: 'config', label: 'Config'},
      ],
      activeTab: 'tab-list',
      openEntities: [
        {id: '123456789', title: 'Beautiful Case Study', content: 'Test 123'},
        {id: '24681012', title: 'Large Case Study', content: 'Test 456'},
      ]
    }
  },
  asyncData({ env, store, params }) {
    return {
      graphqlEndpoint: env.panacea.main.endpoint,
      entityType: params.name
    }
  }
}
</script>

<style lang="scss">
.EntityTabs__closer {
  padding: 0 0.5rem;
  &:hover {
    color: red;
  }
}
</style>