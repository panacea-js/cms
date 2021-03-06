<template>
  <div class="EntityTypeEdit">
    <v-dialog v-model="opened" persistent max-width="75%">

      <v-btn @click="loadEntityFormData()" fab dark small :color="iconBackgroundColor" slot="activator" class="EntityTypeEdit__activator">
        <v-icon color="grey darken-4">{{ this.icon }}</v-icon>
      </v-btn>

      <v-card class="EntityTypeEdit__dialog">
        <v-card-title>
          <span class="headline" v-if="!isNew">{{ $t('cms.entities.types.actions.edit') }} - {{ entityType }}</span>
          <span class="headline" v-if="isNew">{{ $t('cms.entities.types.actions.add') }}</span>
        </v-card-title>
        <v-card-text>
          <v-form v-model="valid" ref="EntityTypeEditForm">
            <v-container fluid grid-list-xl>
              <p><RequiredAsterisk />{{ $t('cms.forms.indicatesRequiredField')}}</p>

              <RequiredAsterisk type="form-element" />
              <v-text-field box
                v-model="entityDataForm.name"
                :label="$t('cms.entities.types.attributes.name.label')"
                required
                :rules="rules.name" />

              <v-combobox box autofocus
                v-model="entityDataForm.data.group"
                :items="existingGroups"
                :label="$t('cms.entities.types.attributes.group.label')"
                :hint="$t('cms.entities.types.attributes.group.hint')" />

              <v-text-field box
                :label="$t('cms.entities.types.attributes.description.label')"
                v-model="entityDataForm.data.description"
                v-if="!!entityDataForm.data"
                :hint="$t('cms.entities.types.attributes.description.hint')" />

              <RequiredAsterisk type="form-element" />
              <v-text-field box
                :label="$t('cms.entities.types.attributes.plural.label')"
                required
                v-model="entityDataForm.data.plural"
                v-if="!!entityDataForm.data"
                :hint="$t('cms.entities.types.attributes.plural.hint')"
                :rules="rules.plural" />

              <v-text-field box
                :label="$t('cms.entities.types.attributes.idLabel.label')"
                v-model="entityDataForm.data.fields.id.label"
                v-if="!!entityDataForm.data"
                :hint="$t('cms.entities.types.attributes.idLabel.hint')" />

              <v-switch label="Enable revisions" v-model="entityDataForm.data.revisions" color="success" hide-details></v-switch>

            </v-container>
          </v-form>
        </v-card-text>
        <v-card-actions class="EntityTypeEdit__actions">
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" flat @click="submit">{{ $t('cms.entities.types.fields.edit.save') }}</v-btn>
          <v-btn color="grey darken-1" flat @click="cancel">{{ $t('cms.entities.types.fields.edit.cancel') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
  import _ from 'lodash'
  import _createEntityType from '@/gql/mutations/_createEntityType.gql'
  import _entityTypes from '@/gql/queries/_entityTypes.gql'
  import _entityType from '@/gql/queries/_entityType.gql'
  import RequiredAsterisk from './RequiredAsterisk.vue'

  const entityDataForm = {
    name: '',
    data: {
      storage: 'db',
      group: '',
      revisions: false,
      description: '',
      plural: '',
      fields: {
        id: {
          label: 'Unique identifier',
          type: 'id'
        }
      }
    },
  }

  export default {
    components: {
      RequiredAsterisk
    },
    data() {

      const validations = {
        required: v => !!v || this.$t('cms.entities.types.attributes.validations.required'),
        entityNameExists: v => {
          v = v || ''
          const entityTypeNames = _(this.entityTypes)
            .filter(entity => entity.name !== this.entityType)
            .map(entity => entity.name.toLowerCase())
          const entityTypeNameAvailable = !entityTypeNames.find(x => x === v.toLowerCase().trim())
          return entityTypeNameAvailable || this.$t('cms.entities.types.attributes.validations.exists', { entityTypeName : v })
        },
        entityNameReserved: v => {
          v = v || ''
          const endMatches = ['Revision']
          return !v || !_(endMatches).some(m => _(v.toLowerCase()).endsWith(m.toLowerCase())) || this.$t('cms.entities.types.attributes.validations.reservedSuffix', { entityTypeName : v }) // `{entityTypeName} ends in a reserved word required by Panacea`
        }
      }

      const entityDataFormOriginal = _.cloneDeep(entityDataForm)

      return {
        opened: false,
        valid: false,
        icon: this.isNew ? 'add' : 'edit',
        iconBackgroundColor: this.isNew ? 'primary' : 'amber darken-1',
        entityDataForm,
        entityDataFormOriginal,
        entityTypes: {},
        rules: {
          plural: [validations.required],
          name: [
            validations.required,
            validations.entityNameExists,
            validations.entityNameReserved
          ]
        }
      }

    },
    computed: {
      existingGroups() {
        return _(this.entityTypes).reduce((acc, entityType) => {
          const group = JSON.parse(entityType.data).group
          if (group && !acc.includes(group)) {
            acc.push(group)
          }
          return acc
        }, [])
      }
    },
    methods: {
      loadEntityFormData() {
        if (!this.isNew) {
          this.$apollo.watchQuery({ query: _entityType, variables: {name: this.entityType} }).subscribe(result => {
            const entityType = _.cloneDeep(result.data._entityType)
            entityType.data = JSON.parse(entityType.data)
            this.entityDataForm = entityType
            this.entityDataFormOriginal = entityType
          })
        }
        this.$apollo.watchQuery({ query: _entityTypes }).subscribe(result => {
          this.entityTypes = result.data._entityTypes
        })
      },
      submit() {

        if (!this.$refs.EntityTypeEditForm.validate()) {
          return
        }

        const entityName = _.upperFirst(_.camelCase(this.entityDataForm.name))

        const preparedEntityTypeDefinition = {
          name: entityName,
          data: JSON.stringify(this.entityDataForm.data)
        }

        this.$apollo.mutate({
          mutation: _createEntityType,
          variables: preparedEntityTypeDefinition,
          update: (store, { data: {_createEntityType} }) => {

            const data = store.readQuery({ query: _entityTypes })

            // Remove old cache entry.
            data._entityTypes.map((element, index) => {
              if (element.name === entityName) {
                data._entityTypes.splice(index, 1)
              }
            })

            // Insert new cache entry.
            data._entityTypes.push({
              ...preparedEntityTypeDefinition,
              __typename: '_entityType'
            })

            data._entityTypes = _.sortBy(data._entityTypes, et => et.name)

            store.writeQuery({
              query: _entityTypes,
              data
            })
          }
        })

        if (this.isNew) {
          this.$refs.EntityTypeEditForm.reset()
          this.entityDataForm = _.cloneDeep(this.entityDataFormOriginal)

          this.$router.push({
            name: 'entities-name',
            params: { name: entityName }
          })

        }

        // Saved data should now be considered the original data.
        this.entityDataFormOriginal = _.cloneDeep(this.entityDataForm)

        this.opened = false
      },
      cancel() {
        if (this.isNew) {
          this.$refs.EntityTypeEditForm.reset()
        }
        this.entityDataForm = _.cloneDeep(this.entityDataFormOriginal)
        this.opened = false
      },
    },
    props: {
      entityType: {
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
