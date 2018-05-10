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

        <!-- Fixed tabs -->
        <v-tab
          v-for="tab in fixedTabs"
          :key="tab.id"
          :href="`#tab-${tab.id}`"
          class="EntityTabs__tab"
        >
          <v-icon class="pr-2">{{ tab.icon }}</v-icon>
          {{ tab.label }}
        </v-tab>

        <!-- Entity tabs -->
        <v-tab
          v-for="entity in openEntities"
          :key="entity.id"
          :href="`#tab-entity-${entity.id}`"
          class="EntityTabs__tab"
        >
          <v-icon class="pr-2">web_asset</v-icon>
          <span class="EntityTabs__tab-text">{{ entity.title }}</span>
          <v-icon class="EntityTabs__closer" @click="closeTab(entity.id, $event)">clear</v-icon>
        </v-tab>

        <v-tabs-items>

          <!-- Fixed tabs content -->
          <v-tab-item :key="`tab-list`" id="tab-list" class="EntityTabs__content">
            A list of entities
          </v-tab-item>
          <v-tab-item :key="`tab-config`" id="tab-config" class="EntityTabs__content">
            <EntityFields :entityType="entityType" :graphqlEndpoint="graphqlEndpoint" />
          </v-tab-item>

          <!-- Entity tabs content -->
          <v-tab-item
            v-for="entity in openEntities"
            :key="`tab-${entity.id}`"
            :id="`tab-entity-${entity.id}`"
            class="EntityTabs__content"
          >
            Content: {{ entity.content }}
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
import _ from 'lodash'

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
    closeTab(id, event) {

      const originatingTab = this.activeTab

      const closingTabIndex = this.openEntities.findIndex(entity => entity.id === id)
      const isFinalTabClosing = closingTabIndex === this.openEntities.length -1 ? true : false
      const closingTabIsActive = 'tab-entity-' + this.openEntities[closingTabIndex].id === this.activeTab

      this.$root.$nextTick(() => {

        // Wait a second to allow tab content to pan into
        // view before asking confimation to close.
        setTimeout(() => {

          // @todo replace with v-dialog confirmation
          const action = confirm("Are you sure you want to close this tab?")
          if (!action) {
            this.activeTab = originatingTab
            return
          }

          event.target.parentElement.parentElement.classList.add('EntityTabs__tab--closing')

          setTimeout(() => {

            this.openEntities.splice(closingTabIndex, 1)

            if (closingTabIsActive) {

              if (this.openEntities.length > 0) {
                // Set active tab to nearest open entity.
                const newFinalTab = this.openEntities[this.openEntities.length-1]
                const samePositionTab = this.openEntities[closingTabIndex]
                const newActiveTab = isFinalTabClosing ? newFinalTab : samePositionTab
                this.activeTab = 'tab-entity-' + newActiveTab.id
              }
              else {
                // Set active tab to last fixed tab.
                this.activeTab = 'tab-' + this.fixedTabs[this.fixedTabs.length-1].id
              }

            }
            else {
              this.activeTab = originatingTab
            }

          }, 200)

        }, closingTabIsActive ? 0 : 1000)

      })

    }
  },
  computed: {
  },
  data() {
    return {
      // @todo link graphql error with store.
      graphqlError: false,
      fixedTabs: [
        // @todo add translate string
        {id: 'list', label: 'List', icon: 'list'},
        {id: 'config', label: 'Config', icon: 'settings'},
      ],
      activeTab: 'tab-list',
      openEntities: [
        // {id: '1', title: 'Beautiful Case Study', content: 'Test 123'},
        // {id: '2', title: 'Large Case Study', content: 'Test 456'},
        // {id: '3', title: 'Covent Garden Exhibition 2018', content: 'Test 789'},
        // {id: '4', title: 'Brunch on Tuesday', content: 'Test 789'},
        // {id: '5', title: 'Another case study', content: 'Test 789'},
        // {id: '6', title: 'This is a very long title to see what happens when a long title is set', content: 'Test 789'},
        // {id: '7', title: 'Yet another case study', content: 'Test 789'},
        // {id: '8', title: 'And another for good luck', content: 'Test 789'},
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

.EntityTabs {

  &__closer {
    padding: 0 0.5rem;
    &:hover {
      color: red;
    }
  }

  &__tab {
    transition: all 0.2s;
    overflow-x: hidden;

    &--closing {
      transform: translateX(-100%);
      opacity: 0;
    }
  }

  &__tab-text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 200px;
  }

}

</style>