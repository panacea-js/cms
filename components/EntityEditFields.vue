<template>
  <div class="EntityEditFields" v-if="fields">
    <div class="EntityEditFields__field" v-for="field in fields" :key="field.key">
      <!-- TODO: Bind to required (and other rules?) using v-model -->
      <!-- TODO: Allow drag reodering of many fields-->
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
                  <v-icon class="EntityEditFields__field-many-remove-item" v-if="values[field._meta.camel].length > 1 || !field.required" @click="values[field._meta.camel].splice(index, 1)">clear</v-icon>
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
          <v-card class="EntityEditFields__field-object-card">
            <!-- TODO: Add many objects with drag reordering -->
            <!-- TODO: Add + more link for objects -->
            <v-card-text>
              <div v-if="Array.isArray(values[field._meta.camel])" class="EntityEditFields__field-object-item" v-for="(item, delta) in (ensureNestedFields(values[field._meta.camel], field.fields))">
                <EntityEditFields :fields="field.fields" :values="item" />
              </div>

            </v-card-text>
          </v-card>
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
    ensureNestedFields(values, fields) {

      values = values || {}

      _(fields).forEach(field => {
        _(values).forEach((value, index) => {
          if (!value.hasOwnProperty(field._meta.camel)) {
            values[index][field._meta.camel] = field.many ? [] : ''
            if (field.fields) {
              // TODO: Fix this to prepopulate blank nested values
              values[index][field._meta.camel] = this.ensureNestedFields({}, field.fields)
            }
          }
        })
      })

      return values
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
    },
    recurseValues: Object | Array,
  }
}
</script>
<style lang="stylus">
.EntityEditFields
  &__field-object, &__field-many
    margin-top 1rem
    margin-bottom 1rem
    .expansion-panel__container
      :root .theme--dark &
        background-color: $grey.darken-2
      :root .theme--light &
        background-color: $grey.lighten-3
  &__field-many-remove-item
    padding-top 0.5rem
    &:hover
      cursor pointer
      color: $red.darken-1 !important
</style>