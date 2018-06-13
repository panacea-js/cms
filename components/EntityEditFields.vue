<template>
  <div class="EntityEditFields" v-if="fields">
    <div class="EntityEditFields__field" v-for="field in fields" :key="field.key">
      <!-- TODO: Bind to required (and other rules?) using v-model -->
      <!-- TODO: Allow drag reodering of many fields-->
      <component
        class="EntityEditFields__field-single"
        v-if="!field.fields"
        v-for="(value, index) in field.values"
        :key="`${field.key}--delta${index}`"
        :is="getFieldComponent(field.type)"
        :prefix="field.many ? `${index+1}.` : null"
        :label="field.label"
        :hint="field.description"
        :value="value"
      />

      <div v-if="!field.fields && field.many">
        <v-icon>add</v-icon>
      </div>

      <v-expansion-panel class="EntityEditFields__field-nested" v-if="field.fields" :inset="field.depth > 1">
        <v-expansion-panel-content>
          <div class="EntityEditFields__field-nested-card-header" slot="header">{{ field.label }}</div>
          <v-card class="EntityEditFields__field-nested-card">
            <!-- TODO: Add many objects with drag reordering -->
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
  &__field-nested .expansion-panel__header
    background-color $color-secondary
  &__field-nested-card-header
    font-weight bold
</style>