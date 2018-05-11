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
            class="EntityTabs__tab EntityTabs__tab--fixed"
          >
            <v-icon small class="pr-2">{{ tab.icon }}</v-icon>
            {{ tab.label }}
          </v-tab>

          <!-- Entity tabs -->
          <v-tab
            v-for="entity in openEntities"
            :key="entity.id"
            :href="`#tab-entity-${entity.id}`"
            :data-tab="`tab-entity-${entity.id}`"
            class="EntityTabs__tab EntityTabs__tab--open-entities"
          >
            <v-dialog v-model="closeTabConfirmDialog" persistent max-width="50%">
              <v-card>
                <v-card-title class="headline">{{ $t('cms.entities.page.closeDialog.headline') }}</v-card-title>
                <v-card-text>{{ $t('cms.entities.page.closeDialog.text') }}</v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="grey darken-1" flat @click.native="closeTabCancel()">{{ $t('cms.entities.page.closeDialog.actions.cancel') }}</v-btn>
                  <v-btn color="red darken-1" flat @click.native="closeTab()">{{ $t('cms.entities.page.closeDialog.actions.close') }}</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>

            <v-tooltip bottom>
              <div slot="activator" class="EntityTabs__tab-wrapper">
                <span class="EntityTabs__tab-text">{{ entity.title }}</span>
                <v-icon class="EntityTabs__closer pr-0" slot="activator" @click="closeTabConfirm(entity.id)">clear</v-icon>
              </div>
              <div>
                <strong>{{ entity.title }}</strong><br />
                <em>ID: {{ entity.id }}</em><br />
                Last updated: 25th Feb 2018
              </div>
            </v-tooltip>
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
    closeTabConfirm (id) {
      this.originatingTab = this.activeTab

      this.closeTabId = 'tab-entity-' + id

      const closingTabIndex = this.openEntities.findIndex(entity => entity.id === id)
      const closingTabIsActive = 'tab-entity-' + this.openEntities[closingTabIndex].id === this.activeTab

      // Wait 500ms to allow tab content to pan into view before asking
      // confimation to close.
      setTimeout(() => {
        this.closeTabConfirmDialog = true
      }, closingTabIsActive ? 0 : 500)

    },
    closeTabCancel () {
      this.closeTabId = false
      this.closeTabConfirmDialog = false
      this.originatingTab = false
    },
    closeTab () {

      const closingTabIndex = this.openEntities.findIndex(entity => 'tab-entity-' + entity.id === this.closeTabId)
      const isFinalTabClosing = closingTabIndex === this.openEntities.length -1 ? true : false
      const closingTabIsActive = this.originatingTab === this.activeTab

      document.querySelectorAll(`[data-tab="${this.closeTabId}"]`)[0].classList.add('EntityTabs__tab--closing')

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
          this.activeTab = this.originatingTab
        }

        this.closeTabId = false
        this.originatingTab = false

      }, 1000)

      this.closeTabConfirmDialog = false

    }
  },
  computed: {
  },
  data() {
    return {
      // @todo link graphql error with store.
      closeTabConfirmDialog: false,
      closeTabId: false,
      originatingTab: false,
      graphqlError: false,
      fixedTabs: [
        // @todo add translate string
        {id: 'list', label: 'List', icon: 'list'},
        {id: 'config', label: 'Config', icon: 'settings'},
      ],
      activeTab: 'tab-list',
      openEntities: [
        {id: '1', title: 'Beautiful Case Study', content: 'Test 123'},
        {id: '2', title: 'Large Case Study', content: 'Test 456'},
        {id: '3', title: 'Covent Garden Exhibition 2018', content: 'Test 789'},
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

<style lang="stylus">
// https://vuetifyjs.com/en/style/colors
@import '~vuetify/src/stylus/settings/_colors.styl'

.EntityTabs

  &__closer
    padding 0 0.5rem
    &:hover
      color: $red.darken-1

  &__tab
    transition all 1s
    overflow-x hidden
    text-transform none

    &--closing
      transform scale(0);
      opacity 0
      max-width: 0

    &--open-entities
      :root .theme--dark &
        background-color: $grey.darken-2

    &--open-entities
      :root .theme--light &
        background-color: $grey.lighten-2

    &--fixed
      :root .theme--dark &
        background-color: $grey.darken-3

    &--fixed
      :root .theme--light &
        background-color: $grey.lighten-3

  &__tab-text
    white-space nowrap
    overflow hidden
    text-overflow ellipsis
    max-width 200px
    display inline
    align-self center

  &__tab-wrapper
    display inline-flex
    max-width 220px

</style>