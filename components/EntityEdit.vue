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
              <p>*{{ $t('cms.entities.fields.edit.indicatesRequiredField')}}</p>
              <v-layout wrap>
                <v-flex xs12>
                  <v-text-field box v-model="entityDataForm.name" label="Label" required></v-text-field>
                </v-flex>
              </v-layout>

              <v-text-field box :label="$t('cms.entities.fields.attributes.description')" v-model="entityDataForm.data.description" :hint="this.$t('cms.entities.fields.description.hint')"></v-text-field>

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
                return {
                  name: e.name,
                  data: JSON.parse(e.data)
                }
              })[0]
          }
          else {
            return {
              name: '',
              data: {},
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

        // this.$store.dispatch('entities/SAVE_ENTITY')
        // this.$store.dispatch('entities/GET_FIELDS')

        if (this.isNew) {
          this.$refs.EntityEditForm.reset()
          this.entityDataForm = _.cloneDeep(this.entityDataFormOriginal)
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