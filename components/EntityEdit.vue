<template>
  <div class="EntityEdit" v-if="entityTypeData">
    <v-layout justify-end>
      <v-flex xs3 class="EntityEdit__toolbar">
        <v-switch v-model="expandAllPanels" :title="expandAllPanels ? 'Click to close all fields with nested information' : 'Click to open all fields with nested information'" :label="expandAllPanels ? 'Close all panels' : 'Open all panels'" />
      </v-flex>
    </v-layout>

    <div class="EntityEdit__form" v-if="!entityData">
      <h3>This is a new entity</h3>
    </div>

    <div class="EntityEdit__form" v-if="entityData">
      <v-card flat>
        <v-card-text>
          <EntityEditFields v-if="fields" :fields="fields" :values="fieldValues" />
        </v-card-text>
      </v-card>
    </div>

  </div>
</template>

<script>
import _ from 'lodash'
import ENTITY_TYPE from '@/gql/queries/ENTITY_TYPE.gql'
import EntityEditFields from '@/components/EntityEditFields.vue'

export default {
  components: {
    EntityEditFields
  },
  sharedData: ['openEntities'],
  data() {
    return {
      isNew: !this.entityID,
      entityTypeData: {},
      entityData: null,
      fields: [],
      fieldValues: {},
      expandAllPanels: false
    }
  },
  mounted() {
    this.getEntityTypeData()
  },
  methods: {
    getEntityTypeData() {
      this.$apollo.watchQuery({ query: ENTITY_TYPE, variables: {name: this.entityType} }).subscribe(result => {
        const entityType = _.cloneDeep(result.data.ENTITY_TYPE)
        entityType.data = JSON.parse(entityType.data)
        this.entityTypeData = entityType

        if (!this.isNew) {
          this.getEntityData()
        }
      })
    },
    getEntityData() {
      const queryName = this.entityTypeData.data._meta.camel
      const queryParams = {
        id: this.entityID
      }
      const getEntityQuery = this.entityQueryBuilder(queryName, this.entityTypeData, queryParams)

      this.$apollo.watchQuery({ query: getEntityQuery }).subscribe(result => {
        this.entityData = result.data[queryName]
        this.transposeFields()
      })
    },
    transposeFields() {

      const fieldValues = {}

      const recurseFields = (parentPath, fields) => {
        const transposedFields = []
        const depth = parentPath.split('.').length

        Object.keys(fields).forEach(fieldId => {
          const fieldPath = parentPath ? `${parentPath}.${fieldId}` : fieldId

          const fieldData = fields[fieldId]

          if (fieldData.fields) {
            fieldData.fields = recurseFields(`${fieldPath}`, fieldData.fields)
          }

          const recurseValues = (fieldPath) => {
            const values = _(this.entityData).get(fieldPath)

            if (typeof values === 'object') {
              _(values).forEach((value, fieldName) => {
                if (fieldName === '__typename') {
                  return
                }
                const fieldPathNested = `${fieldPath}.${fieldName}`
                recurseValues(fieldPathNested)
              })
            }

            if (Array.isArray(values)) {
              values.forEach((value, delta) => {
                const fieldPathWithDelta = `${fieldPath}.${delta}`
                if (typeof value === 'object') {
                  recurseValues(fieldPathWithDelta)
                }
              })
            }

            if (!Array.isArray(values) && typeof values !== 'object' && typeof values !== 'undefined') {
              _.set(fieldValues, fieldPath, values)
            }

          }

          recurseValues(fieldPath)

          transposedFields.push({
            depth,
            key: fieldPath,
            ...fieldData
          })

        })

        return transposedFields
      }

      const transposedFields = recurseFields('', this.entityTypeData.data.fields)

      this.fieldValues = fieldValues
      this.fields = transposedFields
    },
  },
  watch: {
    expandAllPanels: function(value) {
      if (value === true) {
        this.$el
          .querySelectorAll('.expansion-panel__container:not(.expansion-panel__container--active) .expansion-panel__header')
          .forEach(element => element.click())
      }
      else {
        this.$el
          .querySelectorAll('.expansion-panel__container--active .expansion-panel__header')
          .forEach(element => element.click())
      }
    }
  },
  props: {
    entityType: {
      type: String,
      required: true
    },
    entityID: {
      type: String,
      required: false
    },
  },
}
</script>
<style lang="stylus">
.EntityEdit
  margin 2rem
</style>