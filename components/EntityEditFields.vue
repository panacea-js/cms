<template>
  <div class="EntityEditFields" v-if="fields && values">
    <div class="EntityEditFields__field" v-for="field in fields" :data-field="field.key" :key="field.key">

      <!-- Single scalar value -->
      <div class="EntityEditFields__field-scalar-single">
        <component
          v-if="!field.fields && !field.many"
          class="EntityEditFields__value-scalar-single"
          :key="`${field.key}.0`"
          :is="getFieldComponent(field.type)"
          :label="field.label"
          :hint="field.description"
          :value="values[field._meta.camel]"
          v-model="values[field._meta.camel]"
          :disabled="field.type === 'id'"
        />
      </div>

      <!-- Many scalar values panel -->
      <v-expansion-panel class="EntityEditFields__field-scalar-many" v-if="!field.fields && field.many" :inset="field.depth > 1">
        <v-expansion-panel-content>
          <div class="EntityEditFields__field-scalar-many-header" slot="header"><v-icon>list</v-icon> {{ field.label }}</div>
          <v-card class="EntityEditFields__field-scalar-many-card">
            <v-card-text>
              <v-subheader v-if="field.description">{{ field.description }}</v-subheader>
              <!-- TODO: Add many items with drag reordering -->
              <v-layout row wrap class="EntityEditFields__value-scalar-many" v-for="(value, index) in values[field._meta.camel]" :key="`${field.key}.${index}`">
                <v-flex xs9 offset-xs1>
                  <component
                    :is="getFieldComponent(field.type)"
                    :prefix="`${index+1}.`"
                    :value="values[field._meta.camel][index]"
                    v-model="values[field._meta.camel][index]"
                    class="pa-0"
                  />
                </v-flex>
                <v-flex xs1 text-xs-center>
                  <v-icon class="EntityEditFields__remove-scalar-item" v-if="values[field._meta.camel].length > 1 || !field.required" @click="removeItem(field._meta.camel, values, delta)">clear</v-icon>
                </v-flex>
              </v-layout>

              <v-layout row wrap class="EntityEditFields__add-scalar-item">
                <v-flex xs12 text-xs-center>
                  <v-btn fab small color="primary" @click="values[field._meta.camel].push('')">
                    <v-icon color="grey darken-4">add</v-icon>
                  </v-btn>
                </v-flex>
              </v-layout>

            </v-card-text>
          </v-card>
        </v-expansion-panel-content>
      </v-expansion-panel>

      <!-- Object panel -->
      <v-expansion-panel class="EntityEditFields__field-object" v-if="field.fields" :inset="field.depth > 1">
        <v-expansion-panel-content>
          <div class="EntityEditFields__field-object-header" slot="header"><v-icon>subdirectory_arrow_right</v-icon> {{ field.label }}</div>
          <v-subheader v-if="field.description">{{ field.description }}</v-subheader>

          <!-- Single nested object values -->
          <v-layout class="EntityEditFields__value-object-item EntityEditFields__value-object-item--single" v-if="!Array.isArray(values[field._meta.camel])">
            <v-flex xs10 offset-xs1>
              <v-card>
                <v-card-text>
                  <EntityEditFields :fields="field.fields" :values="values[field._meta.camel]" />
                </v-card-text>
              </v-card>
            </v-flex>
          </v-layout>

          <!-- Many nested object values -->
          <div v-if="Array.isArray(values[field._meta.camel])" class="EntityEditFields__sortable-group">
            <v-layout class="EntityEditFields__value-object-item EntityEditFields__value-object-item--many EntityEditFields__sortable-item" v-for="(item, delta) in values[field._meta.camel]" :key="`${field._meta.camel}.${delta}`">
              <v-flex xs1 d-inline-flex justify-center>
                <div class="EntityEditFields__value-object-item-delta-text">{{ delta + 1 }} <v-icon class="EntityEditFields__item-dragger">drag_handle</v-icon></div>
              </v-flex>
              <v-flex xs10>
                <v-card>
                  <v-card-text>
                    <EntityEditFields :fields="field.fields" :values="item" />
                  </v-card-text>
                </v-card>
              </v-flex>
              <v-flex xs1 text-xs-center>
                <v-icon class="EntityEditFields__remove-object-item" v-if="values[field._meta.camel].length > 1 || !field.required" @click="removeItem(field._meta.camel, values, delta)">clear</v-icon>
              </v-flex>
            </v-layout>
          </div>

          <!-- Add another nested object -->
          <v-layout row wrap v-if="field.many" class="EntityEditFields__add-object-item">
            <v-flex xs12 text-xs-center>
              <v-btn fab small color="primary" @click="addAnotherNestedField(values, field)">
                <v-icon color="grey darken-4">add</v-icon>
              </v-btn>
            </v-flex>
          </v-layout>

        </v-expansion-panel-content>
      </v-expansion-panel>

    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import Sortable from 'sortablejs'

export default {
  name: 'EntityEditFields',
  mounted() {
    this.initialiseSortableItems()
  },
  methods: {
    getFieldComponent(fieldType) {
       return 'v-text-field'
    },
    addAnotherNestedField(values, field) {

      const recurseFields = (field) => {
        const structure = {}
        _(field.fields).forEach(subField => {
          if (subField.fields) {
            if (subField.many) {
              structure[subField._meta.camel] = structure[subField._meta.camel] || []
              structure[subField._meta.camel].push(recurseFields(subField))
            }
            else {
              structure[subField._meta.camel] = recurseFields(subField)
            }
          }
          else {
            structure[subField._meta.camel] = subField.many ? [] : ''
          }
        })
        return structure
      }

      const newField = recurseFields(field)

      if (field.many) {
        values[field._meta.camel] = values[field._meta.camel] || []
        values[field._meta.camel].push(newField)
      }
      else {
        values[field._meta.camel] = values[field._meta.camel] || {}
        values[field._meta.camel] = newField
      }

      this.$forceUpdate()

    },
    removeItem (fieldId, values, delta) {
      values[fieldId].splice(delta, 1)
      this.$forceUpdate()
    },
    initialiseSortableItems () {
      const sortableGroups = this.$el.querySelectorAll('.EntityEditFields__sortable-group')
      sortableGroups.forEach(sortableGroup => {
        new Sortable(
          sortableGroup,
          {
            draggable: '.EntityEditFields__sortable-item',
            handle: '.EntityEditFields__item-dragger',
            scrollSensitivity: 0,
            scrollSpeed: 1,
            onEnd: function (event) {
              event.to.querySelectorAll(':scope .EntityEditFields__field--collapsed').forEach(field => field.classList.remove('EntityEditFields__field--collapsed'))
            },
            onStart: function (event) {
              const fieldsToCollapse = event.from.querySelectorAll('.EntityEditFields__sortable-item .EntityEditFields__field:nth-child(n+2)')
              fieldsToCollapse.forEach(field => field.classList.add('EntityEditFields__field--collapsed'))
            },
            animation: 250
          }
        )
      })
    },
  },
  props: {
    fields: {
      type: Array,
      required: true
    },
    values: {
      type: Object,
      required: true
    }
  }
}
</script>
<style lang="stylus">
.EntityEditFields
  &__field
    &--collapsed
      background hotpink
      max-height 0
      overflow hidden
  &__field-object, &__field-scalar-many
    margin-top 3rem
    margin-bottom 3rem
    .expansion-panel__container
      :root .theme--dark &
        background-color: $grey.darken-2
      :root .theme--light &
        background-color: $grey.lighten-3
  &__value-object-item
    border-top: 4px solid $grey.darken-3
    padding-top 1rem !important
    padding-bottom 1rem !important
    :root .theme--light &
      border-color white
  &__value-object-item-delta-text
    flex 0 0 auto !important
    width 25px
    height 25px
    padding-top 3px
    margin-left 1rem
    border-radius 50px
    text-align center
    font-weight bold
    background: $color-primary
    color: $grey.darken-3
  &__item-dragger
    cursor move
  &__add-object-item
    border-top: 4px solid $grey.darken-3
    margin-bottom 0.3rem !important
    :root .theme--light &
      border-color white
  &__remove-object-item, &__remove-scalar-item
    padding-top 0.5rem
    &:hover
      cursor pointer
      color: $red.darken-1 !important
.sortable-ghost
  background: $grey.base
.sortable-chosen
  opacity 0.1
  .EntityEditFields__field:nth-child(n+2)
    display: none
</style>