<template>
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
      v-for="entity in matchedOpenEntities"
      :key="entity.id"
      :href="`#tab-entity-${entityType}-${entity.id}`"
      :data-tab="`tab-entity-${entityType}-${entity.id}`"
      :class="entityTabClasses(entity)"
    >
      <v-dialog v-model="closeTabConfirmDialog" persistent max-width="50%">
        <v-card>
          <v-card-title class="headline">{{ $t('cms.entities.tabs.closeDialog.headline') }}</v-card-title>
          <v-card-text>{{ $t('cms.entities.tabs.closeDialog.text') }}</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="grey darken-1" flat @click.native="closeTabCancel()">{{ $t('cms.entities.tabs.closeDialog.actions.cancel') }}</v-btn>
            <v-btn color="red darken-1" flat @click.native="closeTab()">{{ $t('cms.entities.tabs.closeDialog.actions.close') }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-tooltip bottom>
        <div slot="activator" class="EntityTabs__tab-wrapper">
          <span class="EntityTabs__tab-text">{{ getTitle(entity) }}</span>
          <v-icon class="EntityTabs__closer pr-0" slot="activator" @click="closeTabConfirm(entity.id)">clear</v-icon>
        </div>
        <div>
          <strong>{{ getTitle(entity) }}</strong><br />
          <em>ID: {{ entity.id }}</em><br />
          Last updated: 25th Feb 2018
        </div>
      </v-tooltip>
    </v-tab>

    <v-tabs-items>

      <!-- Fixed tabs content -->
      <v-tab-item :key="`tab-list`" id="tab-list" class="EntityTabs__content">
        <EntitiesList :entityType="entityType" />
      </v-tab-item>
      <v-tab-item :key="`tab-config`" id="tab-config" class="EntityTabs__content">
        <EntityTypeFieldsConfig :entityType="entityType" />
      </v-tab-item>

      <!-- Entity tabs content -->
      <v-tab-item
        v-for="entity in matchedOpenEntities"
        :key="`tab-${entityType}-${entity.id}`"
        :id="`tab-entity-${entityType}-${entity.id}`"
        class="EntityTabs__content"
      >
        <EntityEdit :entityType="entityType" :entityID="entity.id !== 'new' ? entity.id : null" />
      </v-tab-item>

    </v-tabs-items>

  </v-tabs>

</template>

<script>
import EntityTypeFieldsConfig from '@/components/EntityTypeFieldsConfig.vue'
import EntitiesList from '@/components/EntitiesList.vue'
import EntityEdit from '@/components/EntityEdit.vue'
import _ from 'lodash'

import _entityType from '@/gql/queries/_entityType.gql'

export default {
  components: {
    EntityTypeFieldsConfig,
    EntitiesList,
    EntityEdit
  },
  methods: {
    closeTabConfirm (id) {
      this.originatingTab = this.activeTab

      this.closeTabId = `tab-entity-${this.entityType}-${id}`

      const closingTabIndex = this.openEntities[this.entityType].findIndex(entity => entity.id === id)
      const closingTabIsActive = `tab-entity-${this.entityType}-${this.openEntities[this.entityType][closingTabIndex].id}` === this.activeTab

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

      const tabs = this.openEntities[this.entityType]

      const closingTabIndex = tabs.findIndex(entity => `tab-entity-${this.entityType}-${entity.id}` === this.closeTabId)
      const isFinalTabClosing = closingTabIndex === (tabs.length -1) ? true : false
      const closingTabIsActive = this.originatingTab === this.activeTab

      document.querySelector(`[data-tab="${this.closeTabId}"]`).classList.add('EntityTabs__tab--closing')

      setTimeout(() => {

        tabs.splice(closingTabIndex, 1)

        if (closingTabIsActive) {

          if (tabs.length > 0) {
            // Set active tab to nearest open entity.
            const newFinalTab = tabs[tabs.length-1]
            const samePositionTab = tabs[closingTabIndex]
            const newActiveTab = isFinalTabClosing ? newFinalTab : samePositionTab
            this.activeTab = `tab-entity-${this.entityType}-${newActiveTab.id}`
          }
          else {
            // Set active tab to first fixed tab.
            this.activeTab = `tab-${this.fixedTabs[0].id}`
          }
        }
        else {
          this.activeTab = this.originatingTab
        }

        this.closeTabId = false
        this.originatingTab = false

      }, 500)

      this.closeTabConfirmDialog = false

    },
    getTitle(entity) {
      const titleFieldCandidates = ['title', 'name', 'headline', 'key']
      let title
      titleFieldCandidates.forEach(test => {
        if (entity.hasOwnProperty(test)) {
          title = entity[test]
          return
        }
      })
      // Fallback to the entity's ID which is always present.
      return !!title ? title : entity.id
    },
    entityTabClasses(entity) {
      const classes = ['EntityTabs__tab', 'EntityTabs__tab--open-entity']
      if (entity.id === 'new') {
        classes.push('EntityTabs__tab--new-entity')
      }
      return classes
    }
  },
  computed: {
    matchedOpenEntities() {
      if (!this.openEntities || !this.openEntities[this.entityType]) {
        return []
      }
      return this.openEntities[this.entityType]
    }
  },
  sharedData() {
    return ['openEntities']
  },
  data() {
    return {
      // @todo link graphql error with store.
      closeTabConfirmDialog: false,
      closeTabId: false,
      originatingTab: false,
      fixedTabs: [
        // @todo add translate string
        {id: 'list', label: this.$t('cms.entities.tabs.list'), icon: 'list'},
        {id: 'config', label: this.$t('cms.entities.tabs.config'), icon: 'settings'},
      ],
      activeTab: 'tab-list',
    }
  },
  props: {
    entityType: {
      type: String,
      required: true
    },
  },
}
</script>

<style lang="stylus">
.EntityTabs
  &__closer
    padding 0 0.5rem
    &:hover
      color: $red.darken-1 !important
  &__tab
    transition all 1s
    overflow-x hidden
    text-transform none

    &--closing
      transform scale(0);
      opacity 0
      max-width: 0

    &--open-entity
      :root .theme--dark &
        background-color: $grey.darken-2

    &--open-entity
      :root .theme--light &
        background-color: $grey.lighten-2

    &--new-entity {
      color: $color-primary !important
    }

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