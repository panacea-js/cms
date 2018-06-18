<template>
  <div class="EntityEditFields" v-if="fields">
    <div class="EntityEditFields__field" v-for="field in fields" :key="field.key">
      <!-- TODO: Bind to required (and other rules?) using v-model -->
      <div class="EntityEditFields__field-single" v-if="!field.fields && !field.many">
        <component
          class="EntityEditFields__field-one"
          :key="`${field.key}.0`"
          :is="getFieldComponent(field.type)"
          :label="field.label"
          :hint="field.description"
          :value="values[field._meta.camel]"
          v-model="values[field._meta.camel]"
          :disabled="field.type === 'id'"
        />
      </div>

      <v-expansion-panel class="EntityEditFields__field-many" v-if="!field.fields && field.many" :inset="field.depth > 1">
        <v-expansion-panel-content>
          <div class="EntityEditFields__field-many-header" slot="header"><v-icon>list</v-icon> {{ field.label }}</div>
          <v-card class="EntityEditFields__field-many-card">
            <v-card-text>
              <v-subheader v-if="field.description">{{ field.description }}</v-subheader>
              <!-- TODO: Add many items with drag reordering -->
              <v-layout row wrap class="EntityEditFields__field-many-items" v-for="(value, index) in values[field._meta.camel]" :key="`${field.key}.${index}`">
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
                  <v-icon class="EntityEditFields__remove-item" v-if="values[field._meta.camel].length > 1 || !field.required" @click="removeItem(field._meta.camel, values, delta)">clear</v-icon>
                </v-flex>
              </v-layout>

              <v-layout row wrap>
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

      <v-expansion-panel class="EntityEditFields__field-object" v-if="field.fields" :inset="field.depth > 1">
        <v-expansion-panel-content>
          <div class="EntityEditFields__field-object-card-header" slot="header"><v-icon>subdirectory_arrow_right</v-icon> {{ field.label }}</div>
          <v-subheader v-if="field.description">{{ field.description }}</v-subheader>
          <v-layout class="EntityEditFields__field-object-item" v-if="Array.isArray(values[field._meta.camel])" v-for="(item, delta) in values[field._meta.camel]" :key="`${field._meta.camel}.${delta}`">
            <v-flex xs1 d-inline-flex align-center>
              <div class="EntityEditFields__field-object-item-delta-text">{{ delta + 1 }}</div>
              <!-- TODO: Add many objects with drag reordering -->
              <v-icon class="EntityEditFields__item-dragger">drag_handle</v-icon>
            </v-flex>
            <v-flex xs10>
              <v-card>
                <v-card-text>
                  <EntityEditFields :fields="field.fields" :values="item" />
                </v-card-text>
              </v-card>
            </v-flex>
            <v-flex xs1 text-xs-center>
              <v-icon class="EntityEditFields__remove-item" v-if="values[field._meta.camel].length > 1 || !field.required" @click="removeItem(field._meta.camel, values, delta)">clear</v-icon>
            </v-flex>
          </v-layout>

          <v-layout row wrap v-if="field.many" class="EntityEditFields__field-object-add">
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

export default {
  name: 'EntityEditFields',
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
    }
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
  &__field-object, &__field-many
    margin-top 3rem
    margin-bottom 3rem
    .expansion-panel__container
      :root .theme--dark &
        background-color: $grey.darken-2
      :root .theme--light &
        background-color: $grey.lighten-3
  &__field-object-item
    border-top: 4px solid $grey.darken-3
    padding-top 1rem !important
    padding-bottom 1rem !important
    :root .theme--light &
      border-color white
  &__field-object-add
    border-top: 4px solid $grey.darken-3
    margin-bottom 0.3rem !important
    :root .theme--light &
      border-color white
  &__field-object-item-delta-text
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
  &__remove-item
    padding-top 0.5rem
    &:hover
      cursor pointer
      color: $red.darken-1 !important
</style>