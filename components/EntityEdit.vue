<template>
<div class="EntityEdit">

  <a href="#" v-if="!isNew" @click="openEntityTab" :title="$t('cms.entities.tabs.ctrlOpenTip')" class="EntityEdit__activator--edit">
    <v-icon v-ripple>edit</v-icon>
  </a>

  <v-btn fab small dark color="primary" v-if="isNew" @click="openEntityTab" :title="$t('cms.entities.tabs.ctrlOpenTip')" class="EntityEdit__activator--new">
    <v-icon color="grey darken-4">add</v-icon>
  </v-btn>

  <!-- <v-dialog v-model="opened" persistent max-width="75%">

    <v-card class="EntityEdit__dialog">
      <v-card-title>
        <span class="headline" v-if="isNew">New {{ entityTypeData.name }}</span>
        <span class="headline" v-if="!isNew">Edit {{ entityTypeData.name }}</span>
      </v-card-title>
      <v-card-text>
        <v-form v-model="valid" ref="entityEditForm" lazy-validation>
          <v-container fluid grid-list-xl>
            <p>*{{ $t('cms.forms.indicatesRequiredField')}}</p>
            <v-layout wrap>

            </v-layout>
          </v-container>
        </v-form>
      </v-card-text>
      <v-card-actions class="EntityEdit__actions">
        <v-spacer></v-spacer>
        <v-btn color="green darken-1" flat @click="submit">{{ $t('cms.entities.types.fields.edit.save') }}</v-btn>
        <v-btn color="grey darken-1" flat @click="cancel">{{ $t('cms.entities.types.fields.edit.cancel') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog> -->

  </div>
</template>

<script>
import { linkToLocalStateMixin } from '@/apollo/local-state'

export default {
  data() {
    return {
      opened: false,
      valid: false,
      isNew: !this.entityData,
    }
  },
  mixins: [
    linkToLocalStateMixin([
      { localStateKey: 'openEntities', dataPath: 'openEntities' }
    ])
  ],
  methods: {
    openEntityTab($event) {
      if (this.isNew && this.openEntities.findIndex(entity => entity.id === 'new') === -1) {
        // Create 'new' placeholder entity tab.
        this.openEntities.push({
          title: '* ' + this.$t('cms.entities.actions.add', { entityType: this.entityTypeData.name }),
          id: 'new',
          __typename: this.entityTypeData.name
        })
      }
      else if (!this.isNew && this.openEntities.findIndex(entity => entity.id === this.entityData.id) === -1) {
        // Create edit tab for existing entity.
        this.openEntities.push(this.entityData)
      }
      // Holding ctrl prevent navigation to the tab if the user wants to open
      // several entities.
      if (!$event.ctrlKey) {
        this.gotoTab()
      }

      $event.preventDefault()

      return false
    },
    gotoTab() {
      setTimeout(() => {
        const tabId = this.isNew ? 'new' : this.entityData.id
        const tab = document.querySelector(`[href="#tab-entity-${tabId}"]`)
        tab.click()
      }, 100)
    },
    cancel() {
      if (this.isNew) {
        this.$refs.entityEditForm.reset()
      }
      this.fieldFormData = _.cloneDeep(this.fieldFormDataOriginal)
      this.opened = false
    },
    submit() {
      this.opened = false
      alert('Fake Saved!')
    }
  },
  props: {
    entityTypeData: {
      type: Object,
      required: true
    },
    entityData: {
      type: Object,
      required: false
    },
  }
}
</script>

<style lang="stylus">
.EntityEdit
  display inline
  &__activator--edit
    display inline
    text-decoration none
    .icon
      padding 0.5rem
      border-radius 10rem
      :root .theme--dark &
        color: $amber.darken-2
        &:hover
          color: $amber.darken-1
      :root .theme--light &
        background-color: $amber.lighten-1
        &:hover
          background-color: $amber.darken-1
</style>