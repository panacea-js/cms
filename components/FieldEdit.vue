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
          <small>*{{ $t('entities.fields.edit.indicatesRequiredField')}}</small>
          <v-container grid-list-md>
            <v-layout wrap>
              <v-flex xs12 sm6>
                <v-text-field v-model="fieldFormData.label" label="Label" :rules="rules.required" required @keyup="autoPopulateMachineName()"></v-text-field>
              </v-flex>
              <v-flex xs12 sm6>
                <v-text-field :label="$t('entities.fields.attributes.machineName')" v-model="fieldFormData.machineName" @keyup="machineNameManuallyAltered = true" hint="The addressable key for the field. Will be converted to camelCase" :rules="rules.required" required></v-text-field>
              </v-flex>
            </v-layout>
            <v-text-field :label="$t('entities.fields.attributes.description')" v-model="fieldFormData.description" textarea hint="A short description about the context of this field"></v-text-field>

            <v-select :label="$t('entities.fields.attributes.type')" :items="fieldTypes" v-model="fieldFormData.type" :rules="rules.required" required></v-select>
            <v-select :label="$t('entities.fields.attributes.references')" v-if="fieldFormData.type === 'reference'" :items="entityTypes" v-model="fieldFormData.references" :rules="rules.references"></v-select>
            <v-switch :label="$t('entities.fields.attributes.required')" v-model="fieldFormData.required" color="success" hide-details></v-switch>
            <v-switch :label="$t('entities.fields.cardinality.many')" v-model="fieldFormData.many" color="success" hide-details></v-switch>

          </v-container>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="green darken-1" flat @click.native="save()">{{ $t('entities.fields.edit.save') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
  import { mapGetters } from 'vuex'
  import _ from 'lodash'

  export default {
    data() {
      return {
        opened: false,
        valid: false,
        rules: {
          required: [
            (v) => !!v || 'Required' // @todo replace with $t
          ],
          references: [
            (v) => (this.fieldFormData.type !== 'reference' || !!v) || 'Select an entity to reference' // @todo replace with $t
          ]
        },
        icon: this.isNew ? 'add' : 'edit',
        iconBackgroundColor: this.isNew ? 'primary' : 'amber darken-1',
        fieldFormData: {
          type: this.field.type,
          label: this.field.label,
          machineName: this.field._meta.camel,
          description: this.field.description,
          required: this.field.required,
          many: this.field.many,
          references: this.field.references
        },
        // @todo get field types via API call rather than statically defined.
        fieldTypes: [
          {value: 'id', text: this.$t('entities.fields.types.id')},
          {value: 'int', text: this.$t('entities.fields.types.int')},
          {value: 'string', text: this.$t('entities.fields.types.string')},
          {value: 'reference', text: this.$t('entities.fields.types.reference')},
          {value: 'object', text: this.$t('entities.fields.types.object')},
          {value: 'float', text: this.$t('entities.fields.types.float')},
        ],
        // @todo get entities from store once EntityList component stores its state in vuex.
        entityTypes: ['Dog', 'Cat'],
        machineNameManuallyAltered: false
      }
    },
    methods: {
      save() {

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
            references: this.fieldFormData.references,
          }
        })

        // @todo async save.
        this.$store.dispatch('entities/SAVE_ENTITY')
        this.$store.dispatch('entities/GET_FIELDS')

        if (this.isNew) {
          this.$refs.fieldEditForm.reset()
        }

        this.machineNameManuallyAltered = false
        this.opened = false
      },
      autoPopulateMachineName() {
        // Prevent altering machine names when editing fields.
        if (!this.isNew) {
          return
        }
        // Allow auto population if machine name is empty, even if has been manually altered (likely deleted).
        if (!this.fieldFormData.machineName) {
          this.machineNameManuallyAltered = false
        }
        // Only proceed with auto population if the machine name hasn't been manually altered.
        if (!this.machineNameManuallyAltered) {
          this.fieldFormData.machineName = _(this.fieldFormData.label).camelCase()
        }
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