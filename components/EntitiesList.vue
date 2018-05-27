<template>
  <div class="EntitiesList">

    <v-data-table :headers="tableHeaders" :items="entities" ref="sortableTable" v-model="selected" select-all :rows-per-page-items="rowsPerPageItems">

      <template slot="items" slot-scope="props">
        <tr class="EntitiesList__row" :key="`row__${props.item.id}`">
          <td>
            <v-checkbox
              v-model="props.selected"
              primary
              hide-details
            />
          </td>
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

      <template slot="footer">
        <td colspan="100%" :class="footerClasses">
          <v-container>
            <v-layout row class="EntitiesList__bulk-operations">
              <v-flex xs12 lg3>
                <v-select
                  class="EntitiesList__bulk-operations-select"
                  :items="availableBulkOperations"
                  v-model="selectedBulkOperation"
                  label="Select bulk operation"
                  single-line
                ></v-select>
              </v-flex>
              <v-flex xs12 lg2>
                <div :class="bulkOperationsCountClasses">{{ selected.length }} selected items</div>
              </v-flex>
              <v-flex xs12 lg1>
                <v-btn small round :class="bulkOperationsSubmitClasses">Next<v-icon>arrow_right</v-icon></v-btn>
              </v-flex>
            </v-layout>
          </v-container>
        </td>
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
    },
  },
  data() {
    return {
      entityTypeData: {},
      entities: [],
      columns: [],
      tableHeaders: [],
      rowsPerPageItems: [10,25,50,{"text":"All","value":-1}],
      selected: [],
      availableBulkOperations: [
        { value: 'cms.delete', text: 'Delete'},
        { value: 'cms.publish', text: 'Publish'},
        { value: 'cms.unpublish', text: 'Unpublish'},
      ],
      selectedBulkOperation: null,
    }
  },
  computed: {
    footerClasses() {
      const classes = ['EntitiesList__footer']
      if (this.selected.length > 0) {
        classes.push('EntitiesList__footer--visible')
      }
      return classes
    },
    bulkOperationsCountClasses() {
      const classes = ['EntitiesList__bulk-operations-count']
      if (!!this.selectedBulkOperation) {
        classes.push('EntitiesList__bulk-operations-count--visible')
      }
      return classes
    },
    bulkOperationsSubmitClasses() {
      const classes = ['EntitiesList__bulk-operations-submit']
      if (!!this.selectedBulkOperation) {
        classes.push('EntitiesList__bulk-operations-submit--visible')
      }
      return classes
    },
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
.EntitiesList
  &__footer
    transition all 1s
    opacity 0
    padding 0
    height 0
    transform: translateX(-2rem)
    &--visible
      opacity 1
      padding 16px
      transform: translateX(0)
  &__bulk-operations-submit
    background-color: $color-primary !important
    color: $grey.darken-4 !important
  &__bulk-operations-count
    padding 1.9rem
    text-align: center
    transition all 1s
    opacity 0
    transform: translateX(-2rem)
    &--visible
      opacity 1
      transform: translateX(0)
  &__bulk-operations-submit
    margin 1.7rem 0
    transition all 1s
    transition-delay 0.5s
    opacity 0
    transform: translateX(-2rem)
    &--visible
      opacity 1
      transform: translateX(0)

</style>