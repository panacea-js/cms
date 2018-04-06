<template>
  <div class="EntityEdit">
    <v-dialog v-model="opened" persistent max-width="75%">

      <v-btn @click="loadEntityFormData()" fab dark small :color="iconBackgroundColor" slot="activator" class="EntityEdit__activator">
        <v-icon color="grey darken-4">{{ this.icon }}</v-icon>
      </v-btn>

      <v-card class="EntityEdit__dialog">
        <v-card-title>
          <span class="headline" v-if="!isNew">{{ $t('cms.entities.actions.edit') }} - {{ entity }}</span>
          <span class="headline" v-if="isNew">{{ $t('cms.entities.actions.add') }}</span>
        </v-card-title>
        <v-card-text>
          <v-form v-model="valid" ref="EntityEditForm">
            <v-container fluid grid-list-xl>
              <p>*{{ $t('cms.forms.indicatesRequiredField')}}</p>
              <v-layout wrap>
                <v-flex xs12>
                  <v-text-field box
                    v-model="entityDataForm.name"
                    :label="$t('cms.entities.attributes.name.label')"
                    required
                    :rules="rules.name" />
                </v-flex>
              </v-layout>

              <v-text-field box
                :label="$t('cms.entities.attributes.description.label')"
                v-model="entityDataForm.data.description"
                v-if="!!entityDataForm.data"
                :hint="this.$t('cms.entities.attributes.description.hint')" />

              <v-text-field box
                :label="$t('cms.entities.attributes.plural.label')"
                required
                v-model="entityDataForm.data.plural"
                v-if="!!entityDataForm.data"
                :hint="this.$t('cms.entities.attributes.plural.hint')"
                :rules="rules.plural" />

              <v-text-field box
                :label="$t('cms.entities.attributes.idLabel.label')"
                v-model="entityDataForm.data.fields.id.label"
                v-if="!!entityDataForm.data"
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
  import createENTITY_TYPE from '@/gql/mutations/createENTITY_TYPE.gql'
  import ENTITY_TYPES from '@/gql/queries/ENTITY_TYPES.gql'
  import ENTITY_TYPE from '@/gql/queries/ENTITY_TYPE.gql'

  const entityDataForm = {
    name: '',
    data: {
      storage: 'db',
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
    data() {

      const validations = {
        required: (v) => !!v || this.$t('cms.entities.attributes.validations.required'),
        entityNameExists: (v) => {
          if (!v || !this.isNew || !Array.isArray(this.$store.state.entities.entitiesData)) {
            return true
          }

          const entityNames = this.$store.state.entities.entitiesData.map(entity => entity.name.toLowerCase())
          const entityNameAvailable = !entityNames.find((x) => x === v.toLowerCase().trim())
          return entityNameAvailable || `Entity name ${v} already exists`

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
        rules: {
          plural: [validations.required],
          name: [validations.required, validations.entityNameExists]
        },
      }

    },
    methods: {
      loadEntityFormData() {
        if (!this.isNew) {
          this.$apollo.query({ query: ENTITY_TYPE, variables: {name: this.entity} })
            .then(({data: { ENTITY_TYPE }}) => {
              const entityType = _.cloneDeep(ENTITY_TYPE)
              entityType.data = JSON.parse(entityType.data)
              this.entityDataForm = entityType
              this.entityDataFormOriginal = entityType
            })
            .catch(error => console.log(error))
        }
      },
      submit() {

        if (!this.$refs.EntityEditForm.validate()) {
          return
        }

        const entityName = _.upperFirst(_.camelCase(this.entityDataForm.name))

        const preparedEntityTypeDefinition = {
          name: entityName,
          data: JSON.stringify(this.entityDataForm.data)
        }

        this.$apollo.mutate({
          mutation: createENTITY_TYPE,
          variables: preparedEntityTypeDefinition,
          update: (store, { data: {createENTITY_TYPE} }) => {

            const data = store.readQuery({ query: ENTITY_TYPES })

            // Remove old cache entry.
            data.ENTITY_TYPES.map((element, index) => {
              if (element.name === entityName) {
                data.ENTITY_TYPES.splice(index, 1)
              }
            })

            // Insert new cache entry.
            data.ENTITY_TYPES.push({
              ...preparedEntityTypeDefinition,
              __typename: 'ENTITY_TYPE'
            })

            data.ENTITY_TYPES = _.sortBy(data.ENTITY_TYPES, et => et.name)

            store.writeQuery({
              query: ENTITY_TYPES,
              data
            })
          }
        })

        if (this.isNew) {
          this.$refs.EntityEditForm.reset()
          this.entityDataForm = _.cloneDeep(this.entityDataFormOriginal)
          this.$store.dispatch('entities/REDIRECT_TO_ENTITY', entityName)
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