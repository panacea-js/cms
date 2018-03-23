<template>
  <div class="EntityEdit">
    <v-dialog v-model="opened" persistent max-width="75%">

      <v-btn fab dark small :color="iconBackgroundColor" slot="activator" class="EntityEdit__activator">
        <v-icon color="grey darken-4">{{ this.icon }}</v-icon>
      </v-btn>

      <v-card class="EntityEdit__dialog">
        <v-card-title>
          <span class="headline" v-if="!isNew">{{ $t('cms.entities.actions.edit') }} - {{ entity }}</span>
          <span class="headline" v-if="isNew">{{ $t('cms.entities.actions.add') }}</span>
        </v-card-title>
        <v-card-text>
          <v-form v-model="valid" ref="EntityEditForm" lazy-validation>
            <v-container fluid grid-list-xl>
              <p>*{{ $t('cms.forms.indicatesRequiredField')}}</p>
              <v-layout wrap>
                <v-flex xs12>
                  <v-text-field box v-model="entityDataForm.name" :label="$t('cms.entities.attributes.name.label')" required @keyup="populateMetaNamePascalCase()"></v-text-field>
                </v-flex>
              </v-layout>

              <v-text-field box
                :label="$t('cms.entities.attributes.description.label')"
                v-model="entityDataForm.data.description"
                :hint="this.$t('cms.entities.attributes.description.hint')" />

              <v-text-field box
                :label="$t('cms.entities.attributes.plural.label')"
                v-model="entityDataForm.data.plural"
                :hint="this.$t('cms.entities.attributes.plural.hint')" />

              <v-text-field box
                :label="$t('cms.entities.attributes.idLabel.label')"
                v-model="entityDataForm.data.fields.id.label"
                :hint="this.$t('cms.entities.attributes.idLabel.hint')" />

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
  import { mapGetters } from 'vuex'
  import _ from 'lodash'

  export default {
    data() {

      return {
        opened: false,
        valid: false,
        icon: this.isNew ? 'add' : 'edit',
        iconBackgroundColor: this.isNew ? 'primary' : 'amber darken-1',
      }

    },
    computed: {
      entityDataForm: {

        get: function() {

          if (!this.isNew && Array.isArray(this.$store.state.entities.entitiesData)) {
            return this.$store.state.entities.entitiesData
              .filter(e => e.name === this.entity)
              .map(e => {
                const entity = _.cloneDeep(e)
                entity.data = JSON.parse(entity.data)

                return entity
              })[0]
          }
          else {
            return {
              name: '',
              data: {
                _meta: {
                  pascal: ''
                },
                storage: 'db',
                description: '',
                plural: '',
                fields: {
                  id: {
                    label: '',
                    type: 'id'
                  }
                }
              },
            }
          }

        },

        set: function(value) {
          return value
        }
      },
      //entityDataFormOriginal: _.cloneDeep(this.entityDataForm),
    },
    methods: {
      populateMetaNamePascalCase() {
        this.entityDataForm.data._meta.pascal = this.entityDataForm.name
      },
      submit() {

        // if (!this.$refs.EntityEditForm.validate()) {
        //   return
        // }

        // const machineNameCamel = _(this.entityDataForm.machineName).camelCase()

        // if (!this.isNew && machineNameCamel !== this.field._meta.camel) {
        //   this.$store.commit('entities/RENAME_FIELD', {
        //     oldId: this.field._meta.camel,
        //     newId: machineNameCamel
        //   })
        // }

        // this.$store.commit('entities/UPDATE_FIELD', {
        //   id: machineNameCamel,
        //   fieldData: {
        //     type: this.entityDataForm.type,
        //     label: this.entityDataForm.label,
        //     description: this.entityDataForm.description,
        //     many: this.entityDataForm.many,
        //     required: this.entityDataForm.required,
        //     references: this.entityDataForm.type === 'reference' ? this.entityDataForm.references : null,
        //   }
        // })

        this.$store.commit('entities/UPDATE_ENTITY_DATA', this.entityDataForm.data)
        this.$store.dispatch('entities/SAVE_ENTITY')

        if (this.isNew) {
          this.$refs.EntityEditForm.reset()
          this.entityDataForm = _.cloneDeep(this.entityDataFormOriginal)
          this.$store.dispatch('entities/GET_ENTITIES', this.entityDataForm.data._meta.pascal)
          this.$store.dispatch('entities/REDIRECT_TO_ENTITY', this.entityDataForm.data._meta.pascal)

        }

        // Saved data should now be considered the original data.
        this.entityDataFormOriginal = _.cloneDeep(this.entityDataForm)

        this.opened = false
      },
      cancel() {
        if (this.isNew) {
          this.$refs.EntityEditForm.reset()
        }
        this.entityDataForm = _.cloneDeep(this.entityDataFormOriginal)
        this.opened = false
      },
    },
    props: {
      entity: {
        type: String,
        required: false
      },
      isNew: {
        type: Boolean,
        default: false
      }
    }
  }
</script>

<style lang="scss">
</style>