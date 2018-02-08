<template>
  <v-dialog v-model="opened" persistent max-width="75%">
    <v-btn fab dark small color="amber darken-1" slot="activator">
      <v-icon color="grey darken-4">edit</v-icon>
    </v-btn>
    <v-card>
      <v-card-title>
        <span class="headline">{{ $t('entities.fields.edit.title') }} - {{ field.label }}</span>
      </v-card-title>
      <v-card-text>
        <v-container grid-list-md>
          <v-layout wrap>
            <v-flex xs12 sm6 md4>
              <v-text-field label="Label" required></v-text-field>
            </v-flex>
            <v-flex xs12 sm6 md4>
              <v-text-field label="Machine Name" hint="The addressable key for the field. Will be converted to camelCase" required></v-text-field>
            </v-flex>
            <v-flex xs12 sm6 md4>
              <v-text-field textarea label="Description" hint="A short description about the context of this field"></v-text-field>
            </v-flex>
          </v-layout>
        </v-container>
        <small>*{{ $t('entities.fields.edit.indicatesRequiredField')}}</small>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="green darken-1" flat @click.native="opened = false">{{ $t('entities.fields.edit.save') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
  export default {
    data() {
      console.log(this.fieldPath)
      console.log(this.field)
      console.log(this.$store.state.entities.entityData.fields)
      return {
        opened: false,
        label: ''
      }
    },
    props: {
      fieldPath: String,
      field: Object
    }
  }
</script>