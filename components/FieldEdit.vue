<template>
  <div class="FieldEdit">
    <v-dialog v-model="opened" persistent max-width="75%">

      <v-btn fab dark small :color="iconBackgroundColor" slot="activator" class="FieldEdit__activator">
        <v-icon color="grey darken-4">{{ this.icon }}</v-icon>
      </v-btn>

      <v-card class="FieldEdit__dialog">
        <v-card-title>
          <span class="headline" v-if="!isNew">{{ $t('cms.entities.fields.edit.title') }} - {{ fieldFormData.label }}</span>
          <span class="headline" v-if="isNew">{{ $t('cms.entities.fields.actions.add') }}</span>
        </v-card-title>
        <v-card-text>
          <v-form v-model="valid" ref="fieldEditForm" lazy-validation>
            <v-container fluid grid-list-xl>
              <p>*{{ $t('cms.forms.indicatesRequiredField')}}</p>
              <v-layout wrap>
                <v-flex xs12 lg6>
                  <v-text-field box v-model="fieldFormData.label" label="Label" v-if="showFormElement('label')" :disabled="disableFormElement('label')" :rules="rules.required" required @keyup="deriveMachineNameFromLabel()"></v-text-field>
                </v-flex>
                <v-flex xs12 lg6>

                  <v-text-field box :label="$t('cms.entities.fields.attributes.machineName')" v-if="showFormElement('machineName')" :disabled="disableFormElement('machineName')" v-model="fieldFormData.machineName" @keyup="machineNameChanged()" :hint="this.$t('cms.entities.fields.machineName.hint')" :rules="rules.required" required spellcheck="false"></v-text-field>

                  <div class="text-lg-center pa-2">
                    <div v-if="machineNameAlterable">
                      <v-icon color="green">brightness_auto</v-icon>
                      <span v-if="showFormElement('machineNameAutoText')" class="pl-2" v-html="$t('cms.entities.fields.machineName.synced')"></span>
                    </div>
                    <div v-if="!machineNameAlterable">
                      <v-icon color="red">lock</v-icon>
                      <span v-if="showFormElement('machineNameLockText')" class="pl-2" v-html="$t('cms.entities.fields.machineName.locked')"></span>
                      <span v-if="showFormElement('machineNameLockIdText')" class="pl-2" v-html="this.$t('cms.entities.fields.machineName.noChangeId')"></span>
                    </div>
                  </div>

                </v-flex>

              </v-layout>

              <v-text-field box :label="$t('cms.entities.fields.attributes.description')" v-if="showFormElement('description')" :disabled="disableFormElement('description')" v-model="fieldFormData.description" :hint="this.$t('cms.entities.fields.description.hint')"></v-text-field>

              <v-layout wrap v-if="fieldFormData.type !== 'id'">

                <v-flex xs12 lg6>

                  <v-layout>
                    <v-flex xs11>
                      <v-select :label="$t('cms.entities.fields.attributes.type')" :disabled="disableFormElement('type')" :items="fieldTypesSelect" v-model="fieldFormData.type" :rules="rules.required" required></v-select>
                    </v-flex>
                    <v-flex xs1 text-xs-center mt-4>
                      <v-tooltip left content-class="FieldEdit__help-tooltip">
                        <v-icon dark color="primary" slot="activator" class="FieldEdit__help-activator">help</v-icon>
                        <v-data-table :headers="fieldTypesSelectHelpHeaders" :items="fieldTypes" hide-actions class="FieldEdit__help-table elevation-1">
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
                      <v-select :label="$t('cms.entities.fields.attributes.references')" v-if="showFormElement('references')" :disabled="disableFormElement('references')" :items="entityTypeNames" v-model="fieldFormData.references" :rules="rules.references"></v-select>
                    </v-flex>
                    <v-flex xs1>
                    </v-flex>
                  </v-layout>

                </v-flex>

                <v-flex xs12 lg6>
                  <v-switch :label="$t('cms.entities.fields.attributes.required')" v-if="showFormElement('required')" :disabled="disableFormElement('required')" v-model="fieldFormData.required" color="success" hide-details></v-switch>
                  <v-switch :label="$t('cms.entities.fields.cardinality.many')" v-if="showFormElement('many')" :disabled="disableFormElement('many')" v-model="fieldFormData.many" color="success" hide-details></v-switch>
                </v-flex>

              </v-layout>

            </v-container>
          </v-form>
        </v-card-text>
        <v-card-actions class="FieldEdit__actions">

            <v-dialog v-model="deleteConfirmOpened" max-width="350" v-if="!isNew">

              <v-btn color="red darken-1" flat slot="activator">{{ $t('cms.entities.fields.edit.delete') }}</v-btn>

              <v-card>
                <v-card-title class="headline">{{ $t('cms.entities.fields.edit.delete') }} {{ field._meta.camel }}?</v-card-title>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="grey darken-1" flat="flat" @click="deleteConfirmOpened = false">Cancel</v-btn>
                  <v-btn color="red darken-1" flat @click="remove">{{ $t('cms.entities.fields.edit.confirm') }}</v-btn>
                </v-card-actions>
              </v-card>

            </v-dialog>

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
  import ENTITY_TYPES from '@/gql/queries/ENTITY_TYPES.gql'
  import ENTITY_TYPE from '@/gql/queries/ENTITY_TYPE.gql'
  import FIELD_TYPES from '@/gql/queries/fieldTypes.gql'

  import CREATE_ENTITY_TYPE from '@/gql/mutations/createENTITY_TYPE.gql'

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
        deleteConfirmOpened: false,
        valid: false,
        rules: {
          required: [
            (v) => !!v || this.$t('cms.entities.fields.validations.required')
          ],
          references: [
            (v) => (this.fieldFormData.type !== 'reference' || !!v) || this.$t('cms.entities.fields.validations.selectReference')
          ]
        },
        icon: this.isNew ? 'add' : 'edit',
        iconBackgroundColor: this.isNew ? 'primary' : 'amber darken-1',
        fieldFormData,
        fieldFormDataOriginal,
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
        }),

        entityTypes: [],
        fieldTypes: [],
      }
    },
    computed: {
      fieldTypesSelect () {
        return _.map(this.fieldTypes, (fieldType) => {
          return {
            value: fieldType.type,
            text: fieldType.label
          }
        }).filter(field => field.value !== 'id')
      },
      entityTypeNames() {
        return this.entityTypes.map(et => et.name)
      }
    },
    mounted() {
      this.$apollo.watchQuery({ query: ENTITY_TYPES }).subscribe(result => {
        const entityTypes = _.cloneDeep(result.data.ENTITY_TYPES).map(et => {
          et.data = JSON.parse(et.data)
          return et
        })
        this.entityTypes = entityTypes
      })

      this.$apollo.watchQuery({ query: ENTITY_TYPE, variables: {name: this.entity} }).subscribe(result => {
        const entityType = _.cloneDeep(result.data.ENTITY_TYPE)
        entityType.data = JSON.parse(entityType.data)
        this.entityData = entityType
      })

      this.$apollo.watchQuery({ query: FIELD_TYPES }).subscribe(result => {
        this.fieldTypes = result.data.fieldTypes
      })
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
        if (
          (this.fieldFormData.type !== "reference" && element === "references") ||
          (this.fieldFormData.type === "id" && element === "machineNameLockText") ||
          (this.fieldFormData.type === "id" && element === "machineNameAutoText") ||
          (this.fieldFormData.type !== "id" && element === "machineNameLockIdText")
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

        // Rename field actions, if machine name has changed.
        if (!this.isNew && machineNameCamel !== this.field._meta.camel) {

          // The old machine name is reserved in the _meta.camel attribute.
          const oldId = this.field._meta.camel
          const newId = machineNameCamel

          const allFieldsPathOnEntityData = _(this.fieldPath).split('.')
            .filter(p => p !== 'all')
            .map(p => ['fields', p])
            .push('fields')
            .flatten()
            .value()
            .join('.')

          const oldField = _(this.entityData).get(`${allFieldsPathOnEntityData}.${oldId}`)

          // Create new field entry on entityData keyed by the new machine name.
          _.set(this.entityData, `${allFieldsPathOnEntityData}.${newId}`, oldField)
          // Update the ._meta.camel attribute to match the new machine name.
          _.set(this.entityData, `${allFieldsPathOnEntityData}.${newId}._meta.camel`, newId)
          // Remove the old field entry.
          _.unset(this.entityData, `${allFieldsPathOnEntityData}.${oldId}`)
        }

        // Update field actions.

        // Serialize field data from the submitted form data.
        const fieldData = {
          type: this.fieldFormData.type,
          label: this.fieldFormData.label,
          description: this.fieldFormData.description,
          many: this.fieldFormData.many,
          required: this.fieldFormData.required,
          references: this.fieldFormData.type === 'reference' ? this.fieldFormData.references : null,
        }

        const fieldPathOnEntityData = _(this.fieldPath).split('.')
          .filter(p => p !== 'all')
          .map(p => ['fields', p])
          .push('fields')
          .push(machineNameCamel)

        _(fieldData).forEach((value, attribute) => {
          const fieldAttributePathOnEntityData = fieldPathOnEntityData
            .push(attribute)
            .flatten()
            .value()
            .join('.')

          _.set(this.entityData.data, fieldAttributePathOnEntityData, value)
        })

        const metaCamelAttributePathOnEntityData = fieldPathOnEntityData
          .push('_meta')
          .push('camel')
          .flatten()
          .value()
          .join('.')

        _.set(this.entityData.data, metaCamelAttributePathOnEntityData, machineNameCamel)

        this.$apollo.mutate({
          mutation: CREATE_ENTITY_TYPE,
          variables: {
            name: this.entityData.name,
            data: JSON.stringify(this.entityData.data)
          }
        })
        .catch(error => console.error(error))

        if (this.isNew) {
          this.$refs.fieldEditForm.reset()
          this.fieldFormData = _.cloneDeep(this.fieldFormDataOriginal)
          this.machineNameAlterable = true
        }
        else {
          this.machineNameAlterable = false
        }

        // Saved data should now be considered the original data.
        this.fieldFormDataOriginal = _.cloneDeep(this.fieldFormData)

        this.opened = false
      },
      remove() {
        const fieldPathOnEntityData = _(this.fieldPath).split('.')
          .filter(p => p !== 'all')
          .map(p => ['fields', p])
          .push('fields')
          .push(this.field._meta.camel)
          .flatten()
          .value()
          .join('.')

        _.unset(this.entityData.data, fieldPathOnEntityData)

        this.$apollo.mutate({
          mutation: CREATE_ENTITY_TYPE,
          variables: {
            name: this.entityData.name,
            data: JSON.stringify(this.entityData.data)
          }
        })
        .catch(error => console.error(error))

        this.deleteConfirmOpened = false
      },
      cancel() {
        if (this.isNew) {
          this.$refs.fieldEditForm.reset()
        }
        this.fieldFormData = _.cloneDeep(this.fieldFormDataOriginal)
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
      entity: {
        type: String,
        required: true
      },
      fieldPath: {
        type: String,
        required: true
      },
      field: {
        type: Object,
        default: function() {
          return {
            type: 'string',
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
.FieldEdit__help-tooltip {
  opacity: 1 !important;
}
.FieldEdit__help-table table {
  background-color: $color-secondary !important;
  thead tr {
    height: 32px;
  }
  tbody td {
    height: 24px;
  }
}
</style>