<template>
  <div class="EntityEdit" v-if="entityTypeData">
    <div class="EntityEdit_form--new" v-if="!entityData">
      <h3>This is a new entity</h3>
    </div>
    <div class="EntityEdit_form" v-if="entityData">
      <h3>Entity ID: {{ entityData.id }}</h3>
      <h3>Entity name: {{ entityData.name }}</h3>
      {{ entityData }}
    </div>
  </div>
</template>

<script>
import ENTITY_TYPE from '@/gql/queries/ENTITY_TYPE.gql'

export default {
  sharedData: ['openEntities'],
  data() {
    return {
      isNew: !this.entityID,
      entityTypeData: {},
      entityData: null
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
      })
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
