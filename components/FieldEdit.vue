<template>
  <v-dialog v-model="opened" persistent max-width="75%">

    <v-btn fab dark small :color="iconBackgroundColor" slot="activator">
      <v-icon color="grey darken-4">{{ this.icon }}</v-icon>
    </v-btn>

    <v-card>
      <v-card-title>
        <span class="headline" v-if="!isNew">{{ $t('entities.fields.edit.title') }} - {{ fieldFormData.label }}</span>
        <span class="headline" v-if="isNew">{{ $t('entities.fields.actions.add') }}</span>
      </v-card-title>
      <v-card-text>
        <v-form v-model="valid" ref="fieldEditForm" lazy-validation>
          <v-container fluid grid-list-xl>
            <p>*{{ $t('entities.fields.edit.indicatesRequiredField')}}</p>
            <v-layout wrap>
              <v-flex xs12 lg6>
                <v-text-field box v-model="fieldFormData.label" label="Label" v-if="showFormElement('label')" :disabled="disableFormElement('label')" :rules="rules.required" required @keyup="deriveMachineNameFromLabel()"></v-text-field>
              </v-flex>
              <v-flex xs12 lg6>

                <v-text-field box :label="$t('entities.fields.attributes.machineName')" v-if="showFormElement('machineName')" :disabled="disableFormElement('machineName')" v-model="fieldFormData.machineName" @keyup="machineNameChanged()" hint="The addressable key for the field. Will be converted to camelCase" :rules="rules.required" required spellcheck="false"></v-text-field>

                <div class="text-lg-center pa-2">
                  <div v-if="machineNameAlterable">
                    <v-icon color="green">brightness_auto</v-icon>
                    <span v-if="showFormElement('machineNameAutoText')" class="pl-2">Machine name auto generated from label.</span>
                  </div>
                  <div v-if="!machineNameAlterable">
                    <v-icon color="red">lock</v-icon>
                    <span v-if="showFormElement('machineNameLockText')" class="pl-2">Machine name locked from label changes. Delete it to re-sync.</span>
                    <span v-if="showFormElement('machineNameLockIdText')" class="pl-2">Machine name cannot be changed for
                      <code>id</code> field.</span>
                  </div>
                </div>

              </v-flex>

            </v-layout>

            <v-text-field box :label="$t('entities.fields.attributes.description')" v-if="showFormElement('description')" :disabled="disableFormElement('description')" v-model="fieldFormData.description" hint="A short description about the context of this field"></v-text-field>

            <v-layout wrap>
              <v-flex xs12 lg6>

                <v-layout>
                  <v-flex xs11>
                    <v-select :label="$t('entities.fields.attributes.type')" v-if="showFormElement('type')" :disabled="disableFormElement('type')" :items="fieldTypesSelect" v-model="fieldFormData.type" :rules="rules.required" required></v-select>
                  </v-flex>
                  <v-flex xs1 text-xs-center mt-4>
                    <v-tooltip left content-class="field-type-help__tooltip">
                      <v-icon dark color="primary" slot="activator">help</v-icon>
                      <v-data-table :headers="fieldTypesSelectHelpHeaders" :items="fieldTypesSelectHelp" hide-actions class="field-type-help__table elevation-1">
                        <template slot="items" slot-scope="props">
                          <td>
                            {{ props.item.label }}
                          </td>
                          <td>
                            {{ props.item.description }}
                          </td>
                        </template>
                      </v-data-table>
                    </v-tooltip>

                  </v-flex>
                </v-layout>

                <v-layout>
                  <v-flex x11>
                    <v-select :label="$t('entities.fields.attributes.references')" v-if="showFormElement('references')" :disabled="disableFormElement('references')" :items="entityTypes" v-model="fieldFormData.references" :rules="rules.references"></v-select>
                  </v-flex>
                  <v-flex xs1>
                  </v-flex>
                </v-layout>

              </v-flex>
              <v-flex xs12 lg6>
                <v-switch :label="$t('entities.fields.attributes.required')" v-if="showFormElement('required')" :disabled="disableFormElement('required')" v-model="fieldFormData.required" color="success" hide-details></v-switch>
                <v-switch :label="$t('entities.fields.cardinality.many')" v-if="showFormElement('many')" :disabled="disableFormElement('many')" v-model="fieldFormData.many" color="success" hide-details></v-switch>
              </v-flex>
            </v-layout>

          </v-container>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="green darken-1" flat @click="submit">{{ $t('entities.fields.edit.save') }}</v-btn>
        <v-btn color="grey darken-1" flat @click="cancel">{{ $t('entities.fields.edit.cancel') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
  import { mapGetters } from 'vuex'
  import _ from 'lodash'

  export default {
    data() {

      const fieldFormData = {
        type: this.field.type,
        label: this.field.label,
        machineName: this.field._meta.camel,
        description: this.field.description,
        required: this.field.required,
        many: this.field.many,
        references: this.field.references
      }

      const fieldFormDataOriginal = _.cloneDeep(fieldFormData)

      return {
        opened: false,
        valid: false,
        rules: {
          required: [
            (v) => !!v || this.$t('entities.fields.validations.required')
          ],
          references: [
            (v) => (this.fieldFormData.type !== 'reference' || !!v) || this.$t('entities.fields.validations.selectReference')
          ]
        },
        icon: this.isNew ? 'add' : 'edit',
        iconBackgroundColor: this.isNew ? 'primary' : 'amber darken-1',
        fieldFormData,
        fieldFormDataOriginal,
        // @todo get entities from store once EntityList component stores its state in vuex.
        entityTypes: ['Dog', 'Cat'],
        machineNameAlterable: this.isNew,

        fieldTypesSelectHelpHeaders: [
          {
            text: "Field type",
            value: 'label'
          },
          {
            text: "Description",
            value: 'description'
          }
        ].map(h => {
          h.align = 'left'
          h.sortable = false
          return h
        })
      }
    },
    computed: {
      fieldTypesSelect () {
        return _.map(this.$store.state.entities.fieldTypes, (fieldTypeData, fieldType) => {
          return {
            value: fieldType,
            text: fieldTypeData.label
          }
        })
      },
      fieldTypesSelectHelp () {
        return _.map(this.$store.state.entities.fieldTypes, (fieldTypeData, fieldType) => {
          return {
            fieldType,
            label: fieldTypeData.label,
            description: fieldTypeData.description
          }
        })
      },
    },
    methods: {
      disableFormElement(element) {
        let disable = false

        // Disable rules.
        if (this.fieldFormData.type === 'id' && element === 'machineName') {
          disable = true
        }

        return disable
      },
      showFormElement(element) {
        let show = true

        // Hide rules.
        if ( this.fieldFormData.type !== 'reference' && element === 'references'
          || this.fieldFormData.type === 'id' && element === 'type'
          || this.fieldFormData.type === 'id' && element === 'required'
          || this.fieldFormData.type === 'id' && element === 'many'
          || this.fieldFormData.type === 'id' && element === 'machineNameLockText'
          || this.fieldFormData.type === 'id' && element === 'machineNameAutoText'
          || this.fieldFormData.type !== 'id' && element === 'machineNameLockIdText'
        ) {
          show = false
        }

        return show
      },
      submit() {

        if (!this.$refs.fieldEditForm.validate()) {
          return
        }

        const machineNameCamel = _(this.fieldFormData.machineName).camelCase()

        if (!this.isNew && machineNameCamel !== this.field._meta.camel) {
          this.$store.commit('entities/RENAME_FIELD', {
            oldId: this.field._meta.camel,
            newId: machineNameCamel
          })
        }

        this.$store.commit('entities/UPDATE_FIELD', {
          id: machineNameCamel,
          fieldData: {
            type: this.fieldFormData.type,
            label: this.fieldFormData.label,
            description: this.fieldFormData.description,
            many: this.fieldFormData.many,
            required: this.fieldFormData.required,
            references: this.fieldFormData.type === 'reference' ? this.fieldFormData.references : null,
          }
        })

        // @todo async save.
        this.$store.dispatch('entities/SAVE_ENTITY')
        this.$store.dispatch('entities/GET_FIELDS')

        if (this.isNew) {
          this.$refs.fieldEditForm.reset()
        }

        // Saved data should now be considered the original data.
        this.fieldFormDataOriginal = _.cloneDeep(this.fieldFormData)

        this.machineNameAlterable = false
        this.opened = false
      },
      cancel() {
        if (this.isNew) {
          this.$refs.fieldEditForm.reset()
        }
        else {
          this.fieldFormData = _.cloneDeep(this.fieldFormDataOriginal)
        }
        this.opened = false
      },
      deriveMachineNameFromLabel() {
        // Only proceed with auto population if the machine name hasn't been manually altered.
        if (this.fieldFormData.machineName === '') {
          this.machineNameAlterable = true
        }
        if (this.machineNameAlterable) {
          this.fieldFormData.machineName = _(this.fieldFormData.label).camelCase()
        }
      },
      machineNameChanged() {
        this.fieldFormData.machineName === '' ? this.deriveMachineNameFromLabel() : (this.machineNameAlterable = false)
      }
    },
    props: {
      fieldPath: {
        type: String,
        required: true
      },
      field: {
        type: Object,
        default: function() {
          return {
            type: '',
            label: '',
            _meta: {
              camel: ''
            },
            description: '',
            required: false,
            many: false,
            references: ''
          }
        }
      },
      isNew: {
        type: Boolean,
        default: false
      }
    }
  }
</script>

<style lang="scss">
.field-type-help__tooltip {
  opacity: 1 !important;
}
.field-type-help__table table {
  background-color: $color-secondary !important;
  thead tr {
    height: 32px;
  }
  tbody td {
    height: 24px;
  }
}
</style>