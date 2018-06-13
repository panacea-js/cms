<template>
  <div class="EntityEditFields" v-if="fields">
    <div class="EntityEditFields__field" v-for="field in fields" :key="field.key">
      <!-- TODO: Bind to required (and other rules?) using v-model -->
      <!-- TODO: Allow drag reodering of many fields-->
      <div class="EntityEditFields__field-single" v-if="!field.fields && !field.many">
        <component
          class="EntityEditFields__field-one"
          :key="`${field.key}--delta0`"
          :is="getFieldComponent(field.type)"
          :label="field.label"
          :hint="field.description"
          :value="field.values[0]"
          v-model="field.values[0]"
          :disabled="field.type === 'id'"
        />
      </div>

      <v-expansion-panel class="EntityEditFields__field-many" v-if="!field.fields && field.many" :inset="field.depth > 1">
        <v-expansion-panel-content>
          <div class="EntityEditFields__field-many-header" slot="header"><v-icon>list</v-icon> {{ field.label }}</div>
          <v-card class="EntityEditFields__field-many-card">
            <v-card-text>
              <v-subheader v-if="field.description">{{ field.description }}</v-subheader>

              <v-layout row wrap class="EntityEditFields__field-many-items" v-for="(value, index) in field.values" :key="`${field.key}--delta${index}`">
                <v-flex xs9 offset-xs1>
                  <component
                    :is="getFieldComponent(field.type)"
                    :prefix="`${index+1}.`"
                    :value="value"
                    v-model="field.values[index]"
                    class="pa-0"
                  />
                </v-flex>
                <v-flex xs1 text-xs-center>
                  <v-icon class="EntityEditFields__field-many-remove-item" v-if="field.values.length > 1 || !field.required" @click="field.values.splice(index, 1)">clear</v-icon>
                </v-flex>
              </v-layout>

              <v-layout row wrap>
                <v-flex xs12 text-xs-center>
                  <v-btn fab small color="primary" @click="field.values.push('')">
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
              <EntityEditFields :fields="field.fields" />
            </v-card-text>
          </v-card>
        </v-expansion-panel-content>
      </v-expansion-panel>

    </div>
  </div>
</template>

<script>
export default {
  name: 'EntityEditFields',
  methods: {
    getFieldComponent(fieldType) {
       return 'v-text-field'
    }
  },
  props: {
    fields: {
      type: Array,
      required: true
    }
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