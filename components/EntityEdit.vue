<template>
  <div class="EntityEdit" v-if="entityTypeData">
    <div class="EntityEdit_form--new" v-if="!entityData">
      <h3>This is a new entity</h3>
    </div>
    <div class="EntityEdit_form" v-if="entityData">
      <EntityEditFields v-if="fields" :fields="fields" />
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
      fields: []
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
      const recurseFields = (parentPath, fields) => {
        const transposedFields = []
        const depth = parentPath.split('.').length

        Object.keys(fields).forEach(fieldId => {
          const fieldPath = parentPath ? `${parentPath}.${fieldId}` : fieldId
          const fieldData = fields[fieldId]

          if (fieldData.fields) {
            fieldData.fields = recurseFields(fieldPath, fieldData.fields)
          }

          const data = {
            depth,
            key: fieldPath,
            ...fieldData
          }

          let values = _(this.entityData).get(fieldPath)
          if (Array.isArray(values) && values.length === 0) {
            values = null
          }
          data.values = Array.isArray(values) ? values : [values]

          transposedFields.push(data)
        })
        return transposedFields
      }

      this.fields = recurseFields('', this.entityTypeData.data.fields)
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
