<template>
  <div class="EntityTypeFieldsConfig">
    <v-card v-if="graphqlError">
      <v-alert color="error" icon="warning" value="true">
        {{ $t('cms.entities.types.errors.error-loading-entity', {entityName : entityType}) }}
      </v-alert>
    </v-card>

    <v-card v-if="!graphqlError">
      <v-card-title>
        <div>
          <h1 class="headline mb-0">{{ entityType }}</h1>
          <div>{{ entityTypeData.data.description }}</div>
        </div>
      </v-card-title>
      <v-card-text>
        <EntityTypeEdit v-if="editable" :isNew="false" :entityType="entityType" />
        <v-breadcrumbs>
          <v-breadcrumbs-item v-for="fieldPath in fieldPaths" :key="fieldPath.path" @click.native="gotoField(fieldPath.path)">
            {{ fieldPath.path === 'all' ? $t(fieldPath.label) : fieldPath.label }}
          </v-breadcrumbs-item>
          <v-icon slot="divider">forward</v-icon>
        </v-breadcrumbs>

        <div class="EntityTypeFieldsConfig__table-container">
          <v-data-table :class="fieldsTableClasses" :headers="fieldHeaders" :items="fieldsDisplayed" hide-actions ref="sortableTable">

            <template slot="items" slot-scope="props">
              <tr :class="`EntityTypeFieldsConfig__row EntityTypeFieldsConfig__row--${props.item.type}`" :key="fieldOrderKey(props.item)">
                <td class="EntityTypeFieldsConfig__column-handles" v-if="editable">

                  <v-tooltip left>
                    <v-icon slot="activator" v-if="editable && props.item.type !== 'id'" class="EntityTypeFieldsConfig__row-handle">drag_handle</v-icon>
                    <span>{{ $t('cms.entities.types.fields.actions.move') }}</span>
                  </v-tooltip>

                  <v-tooltip left>
                    <v-icon slot="activator" small color="grey" v-if="editable && props.item.type === 'id'" class="EntityTypeFieldsConfig__row-handle EntityTypeFieldsConfig__row-handle--locked">lock</v-icon>
                    <span>{{ $t('cms.entities.types.fields.actions.idNoMove') }}</span>
                  </v-tooltip>

                </td>
                <td class="EntityTypeFieldsConfig__column-field-label">
                  {{ props.item.label }}
                  <v-tooltip top v-if="props.item.description || props.item._meta.hookFile">
                    <sup slot="activator"><v-icon small color="grey lighten-1">info</v-icon></sup>
                    <p class="ma-0" v-if="props.item.description">{{ props.item.description }}</p>
                    <p class="ma-0 mt-2" v-if="props.item._meta.hookFile">Defined in: <code>{{ props.item._meta.hookFile }}</code></p>
                  </v-tooltip>
                </td>
                <td class="EntityTypeFieldsConfig__column-field-property-path hidden-sm-and-down">
                  <code v-html="getFieldPropertyPath(props.item)"></code>
                </td>
                <td class="EntityTypeFieldsConfig__column-field-type">

                  <span>{{ fieldTypeLabel(props.item.type) }}</span>

                  <span class="EntityTypeFieldsConfig__indicator-cardinality" v-html="cardinalityText(props.item.many)"></span>

                  <span v-if="props.item.type === 'reference'">
                    <v-icon color="grey lighten-1">keyboard_arrow_right</v-icon>
                    <v-btn small flat color="primary" @click="redirectToEntity(props.item.references)">{{ props.item.references }}</v-btn>
                  </span>
                  <span v-if="props.item.type === 'object'">
                    <v-icon color="grey lighten-1">keyboard_arrow_right</v-icon>
                    <v-btn small flat color="primary" @click="gotoField(`${fieldPathActive}.${props.item._meta.camel}`, props.item.label)">{{ props.item.label }}</v-btn>
                  </span>
                </td>
                <td class="EntityTypeFieldsConfig__column-field-required">
                  <v-icon color="grey lighten-1" v-if="!!props.item.required || props.item.type === 'id'">check</v-icon>
                  <v-icon color="grey lighten-1" v-if="!props.item.required && props.item.type !== 'id'">clear</v-icon>
                </td>
                <td class="EntityTypeFieldsConfig__column-field-actions">
                  <EntityTypeFieldEdit v-if="editable" :entityType="entityType" :fieldPath="fieldPathActive" :field="props.item" :key="`${fieldPathActive}.${props.item._meta.camel}`" />
                </td>
              </tr>
            </template>

          </v-data-table>
        </div>

        <div :class="fieldsActionsClasses" v-if="fieldsDisplayed.length">
          <EntityTypeFieldEdit v-if="editable" :entityType="entityType" :fieldPath="fieldPathActive" isNew :key="`entity-field-create-${fieldPathActive}`" />
        </div>

        <div :class="fieldsActionsClasses" v-if="!fieldsDisplayed.length">
          <EntityTypeFieldEdit v-if="editable" :entityType="entityType" :fieldPath="fieldPathActive" isNew :key="`entity-field-create-${fieldPathActive}`">
            <v-btn large slot="button" color="primary" light>
              <v-icon left>add</v-icon>{{ $t('cms.entities.types.fields.actions.addFirstFieldOnObject', { fieldName: fieldPaths[fieldPaths.length-1].label }) }}
            </v-btn>
          </EntityTypeFieldEdit>
        </div>

      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import _ from 'lodash'
import EntityTypesList from '@/components/EntityTypesList.vue'
import EntityTypeEdit from '@/components/EntityTypeEdit.vue'
import EntityTypeFieldEdit from '@/components/EntityTypeFieldEdit.vue'
import Sortable from 'sortablejs'

import _entityType from '@/gql/queries/_entityType.gql'
import _fieldTypes from '@/gql/queries/_fieldTypes.gql'
import _createEntityType from '@/gql/mutations/_createEntityType.gql'

export default {
  components: {
    EntityTypesList,
    EntityTypeEdit,
    EntityTypeFieldEdit
  },
  mounted () {
    this.initialiseSortableTable()

    this.$apollo.watchQuery({ query: _entityType, variables: {name: this.entityType} }).subscribe(result => {
      const entityType = _.cloneDeep(result.data._entityType)
      entityType.data = JSON.parse(entityType.data)
      // Remove non-editable revisions field.
      entityType.data.fields.revisions && delete entityType.data.fields.revisions
      this.entityTypeData = entityType

      this.setDisplayedFields()
    })

    this.$apollo.watchQuery({ query: _fieldTypes }).subscribe(result => {
      this.fieldTypes = result.data._fieldTypes
    })
  },
  methods: {
    // Local methods.
    initialiseSortableTable () {
      const wrapper = this.$refs.sortableTable.$el.getElementsByTagName('tbody')[0]
      return new Sortable(
        wrapper,
        {
          draggable: '.EntityTypeFieldsConfig__row',
          handle: '.EntityTypeFieldsConfig__row-handle',
          onEnd: this.dragReorder,
          onMove: function (event, originalEvent) {
            // Don't allow move (visible when draggable) of any items above the ID field.
            const parentClassList = originalEvent.toElement.parentNode.classList.value
            const parentClassListIsRow = originalEvent.toElement.parentNode.classList.value.indexOf(`EntityTypeFieldsConfig__row`) !== -1
            const parentClassListIsNotId = originalEvent.toElement.parentNode.classList.value.indexOf(`EntityTypeFieldsConfig__row--id`) === -1
            return parentClassListIsRow && parentClassListIsNotId
          },
          animation: 250,
        }
      )
    },
    setDisplayedFields() {
      const allFieldsPathOnEntityData = _(this.fieldPathActive).split('.')
        .filter(p => p !== 'all')
        .map(p => ['fields', p])
        .push('fields')
        .flatten()
        .value()
        .join('.')

      const fields = _(this.entityTypeData.data).get(allFieldsPathOnEntityData)
      const fieldsValues = _(fields).values().value()
      this.fieldsDisplayed = fieldsValues
    },
    dragReorder ({item, oldIndex, newIndex}) {
      // Copy computed fieldsDisplayed to prevent mutating store.
      const clonedFieldsDisplayed = _.cloneDeep(this.fieldsDisplayed)

      // Update the order of the displayed fields based on what just moved.
      const movedItem = clonedFieldsDisplayed.splice(oldIndex, 1)[0]
      clonedFieldsDisplayed.splice(newIndex, 0, movedItem)

      // Ensure ID field remains as the first item in the list.
      const idIndex = clonedFieldsDisplayed.findIndex(x => x.type === 'id')
      if (idIndex !== -1) {
        const idField = clonedFieldsDisplayed.splice(idIndex, 1)[0]
        clonedFieldsDisplayed.unshift(idField)
      }

      const fields = clonedFieldsDisplayed.reduce((acc, field) => {
        acc[field._meta.camel] = field
        return acc
      }, {})

      const fieldsFromFieldActivePath = _(this.fieldPathActive).split('.')
        .filter(p => p !== 'all')
        .map(p => ['fields', p])
        .push('fields')
        .flatten()
        .value()
        .join('.')

      _.set(this.entityTypeData.data, fieldsFromFieldActivePath, fields)

      this.$apollo.mutate({
        mutation: _createEntityType,
        variables: {
          name: this.entityTypeData.name,
          data: JSON.stringify(this.entityTypeData.data)
        }
      })
      .catch(error => console.error(error))
    },
    ensureFieldsContainerHeight () {
      if (typeof document !== 'undefined') {
        setTimeout(() => {
          const fieldsTable = document.getElementsByClassName('EntityTypeFieldsConfig__fields-table')
          const fieldsTableContainer = document.getElementsByClassName('EntityTypeFieldsConfig__table-container')
          fieldsTableContainer[0].style.height = fieldsTable[0].clientHeight + 'px'
        }, 0)
      }
    },
    fieldOrderKey (item) {
      if (!this.fieldOrderKeys.has(item)) {
        this.fieldOrderKeys.set(item, ++this.currentfieldOrderKey)
      }
      return this.fieldOrderKeys.get(item)
    },
    gotoField(path, label = '') {

      // Ignore if gotoField request is already active.
      if (path === this.fieldPathActive) {
        return
      }

      this.ensureFieldsContainerHeight()

      // Determine the slide action direction.
      const deeperPath = path.length > this.fieldPathActive.length
      const initialTransition = deeperPath ? 'transitioning-left' : 'transitioning-right'
      const resolveTransition = deeperPath ? 'transitioning-right' : 'transitioning-left'

      this.fieldsTableTransition = initialTransition

      // Initial slide out and update table.
      setTimeout(() => {
        if (label) {
          this.fieldPaths.push({path, label})
          this.fieldPathActive = path
        }
        else {
          this.fieldPathActive = path
          this.fieldPaths = this.fieldPaths.filter(fp => _(path).startsWith(fp.path))
        }

        this.setDisplayedFields()

        this.fieldsTableTransition = resolveTransition
      }, 750)

      // Slide back into view.
      setTimeout(() => {
        this.fieldsTableTransition = null
        this.ensureFieldsContainerHeight()
      }, 1500)
    },

    cardinalityText(isMany) {
      return !!isMany ? this.$t('cms.entities.types.fields.cardinality.many') : this.$t('cms.entities.types.fields.cardinality.one')
    },

    getFieldPropertyPath (field) {
      return [
        this.entityTypeData.name,
        this.fieldPathActive
          .split('.')
          .filter(p => p !== 'all')
          .join('.'),
        field._meta.camel
      ].filter(i => !!i).join('.')
    },

    fieldTypeLabel (type) {
      const findType = this.fieldTypes.find(field => field.type === type)

      if (typeof findType !== 'undefined' && findType.hasOwnProperty('label')) {
        return findType.label
      }
    },

    redirectToEntity (entityType) {
      this.fieldPathActive = 'all'

      this.fieldPaths = [
        {
          path: 'all',
          label: 'cms.entities.fields.breadcrumb.allFields'
        }
      ]

      this.$router.push({
        name: 'entities-name',
        params: { name: entityType }
      })

      return false
    },

  },
  provide () {
    return {
      gotoField: this.gotoField
    }
  },
  computed: {
    fieldsTableClasses() {
      const classes = ['EntityTypeFieldsConfig__fields-table']
      if (this.fieldsTableTransition) {
        classes.push('EntityTypeFieldsConfig__fields-table--transitioning')
        classes.push('EntityTypeFieldsConfig__fields-table--' + this.fieldsTableTransition)
      }
      return classes
    },
    fieldsActionsClasses() {
      const classes = ['EntityTypeFieldsConfig__fields-actions']
      if (this.fieldsTableTransition) {
        classes.push('EntityTypeFieldsConfig__fields-actions--transitioning')
      }
      return classes
    },
    editable() {
      return this.entityTypeData.data._locationKey === 'app'
    },
    fieldHeaders() {
      const sortColumn = {
        class: 'sort-handle'
      }
      return [
        this.editable ? sortColumn : null,
        {
          text: this.$t('cms.entities.types.fields.attributes.label'),
          value: 'label'
        },
        {
          text: this.$t('cms.entities.types.fields.attributes.path'),
          value: 'id',
          class: 'hidden-sm-and-down'
        },
        {
          text: this.$t('cms.entities.types.fields.attributes.type'),
          value: 'type'
        },
        {
          text: this.$t('cms.entities.types.fields.attributes.required'),
          value: 'required'
        },
        {
          text: '',
          value: 'actions'
        }
      ]
      .filter(x => !!x)
      .map(h => {
        h.align = 'left'
        h.sortable = false
        return h
      })
    },
  },
  data() {
    return {
      entityTypeData: {
        name: '',
        data: {
          description: '',
          fields: {}
        }
      },
      fieldTypes: [],
      fieldsDisplayed: [],
      fieldPathActive: 'all',
      fieldPaths: [
        {
          path: 'all',
          label: 'cms.entities.types.fields.breadcrumb.allFields'
        }
      ],
      fieldOrderKeys: new WeakMap(),
      currentfieldOrderKey: 0,
      fieldsTableTransition: null,
      // @todo link graphql error with apollo error package.
      graphqlError: false,
    }
  },
  props: {
    entityType: {
      type: String,
      required: true
    },
  },
}
</script>

<style lang="stylus">
.EntityTypeFieldsConfig

  &__table-container
    transition all 0.75s ease
    .table__overflow
      overflow-x hidden

  &__fields-table
    transition transform 0.75s ease, opacity 1s ease
    transform translateX(0)
    opacity 1

    .datatable
      transition transform 0.75s ease, opacity 1s ease

    &--transitioning
      opacity 0
    &--transitioning-left .datatable
      transform translateX(-100%)
    &--transitioning-right .datatable
      transform translateX(100%)

  &__row
    &--id
      border-bottom-width 5px !important
      border-bottom-style double !important

  &__column-handles
    text-align center
    padding-left 1.5em !important
    padding-right 0 !important

  &__row-handle
    cursor move
    &--locked
      cursor not-allowed

  &__column-field-label
    white-space nowrap

  &__column-field-type
    text-transform uppercase
    font-size 0.9em
    white-space nowrap

  &__indicator-cardinality
    color $color-primary
    font-weight bold
    vertical-align super
    font-size 0.8em

  &__fields-actions
    margin 1em auto 0 auto
    text-align center
    transition all 0.5s ease
    opacity 1
    &--transitioning
      opacity 0

</style>