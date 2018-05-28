<template>
<div class="EntityEdit">

    <v-dialog v-model="opened" persistent max-width="75%">

      <a href="#" v-if="!isNew" onclick="return false" slot="activator" class="EntityEdit__activator--edit">
        <v-icon v-ripple>edit</v-icon>
      </a>

      <v-btn fab small dark color="primary" v-if="isNew" slot="activator" class="EntityEdit__activator--new">
        <v-icon color="grey darken-4">add</v-icon>
      </v-btn>

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
          <v-btn color="green darken-1" flat @click="submit">{{ $t('cms.entities.fields.edit.save') }}</v-btn>
          <v-btn color="grey darken-1" flat @click="cancel">{{ $t('cms.entities.fields.edit.cancel') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </div>
</template>

<script>
export default {
  data() {
    return {
      opened: false,
      valid: false,
      isNew: !this.entityData,
    }
  },
  methods: {
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