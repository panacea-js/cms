<template>
  <div class="EntitiesList">

    <v-data-table :headers="tableHeaders" :items="entities" ref="sortableTable">

      <template slot="items" slot-scope="props">
        <tr class="EntitiesList__row" :key="`row__${props.item.id}`">
          <template v-for="field in columns">
            <td :class="`EntitiesList__field-${field}`" :key="`field-${field}__${props.item.id}`">
              {{ formatFieldValue(props.item[field]) }}
            </td>
          </template>
          <td class="EntitiesList__actions">
            Actions
          </td>
        </tr>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import _ from 'lodash'

import ENTITY_TYPE from '@/gql/queries/ENTITY_TYPE.gql'
import gql from 'graphql-tag'

export default {
  components: {
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

        this.setColumns()
        this.getEntitiesList()
      })
    },
    setColumns() {
      // @todo - Create setting in UI to include fields in list. Objects and reference will require special handling.
      this.columns = ['id', 'name', 'breed']
    },
    getEntitiesList() {
      const pluralQueryToken = this.entityTypeData.data._meta.pluralCamel

      const getAllEntitiesQuery = `{ ${pluralQueryToken} { ${this.columns} } }`
      const getAllEntitiesGql = gql(getAllEntitiesQuery)

      this.$apollo.watchQuery({ query: getAllEntitiesGql }).subscribe(result => {
        this.updateTableHeaders()
        this.entities = result.data[pluralQueryToken]
      })
    },
    updateTableHeaders() {
      if (this.columns.length === 0) {
        this.tableHeaders = []
        return
      }

      const headers = this.columns.map(field => {
        const fieldDefinition = this.entityTypeData.data.fields[field]
        return {
          text: fieldDefinition.label,
          value: field,
          align: 'left'
        }
      })

      headers.push({
        text: '',
        value: 'actions',
        sortable: false
      })

      this.tableHeaders = headers
    },
    formatFieldValue(value) {
      if (Array.isArray(value)) {
        return value.join(', ')
      }
      return value
    }
  },
  data() {
    return {
      entityTypeData: {},
      entities: [],
      columns: [],
      tableHeaders: []
    }
  },
  props: {
    entityType: {
      type: String,
      required: true
    }
  },
}
</script>

<style lang="stylus">
</style>