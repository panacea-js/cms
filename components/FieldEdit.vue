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
        <small>*{{ $t('entities.fields.edit.indicatesRequiredField')}}</small>
        <v-container grid-list-md>
          <v-layout wrap>
            <v-flex xs12 sm6 md4>
              <v-text-field v-model="label" label="Label" required></v-text-field>
            </v-flex>
            <v-flex xs12 sm6 md4>
              <v-text-field v-model="machineName" label="Machine Name" hint="The addressable key for the field. Will be converted to camelCase" required></v-text-field>
            </v-flex>
            <v-flex xs12 sm6 md4>
              <v-text-field v-model="description" textarea label="Description" hint="A short description about the context of this field"></v-text-field>
            </v-flex>
          </v-layout>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="green darken-1" flat @click.native="save()">{{ $t('entities.fields.edit.save') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
  import { mapGetters } from 'vuex'

  export default {
    data() {
      return {
        opened: false,
        label: this.field.label,
        machineName: this.field._meta.camel,
        description: this.field.description
      }
    },
    methods: {
      save() {
        if (this.machineName !== this.field._meta.camel) {
          this.$store.commit('entities/RENAME_FIELD', {
            oldId: this.field._meta.camel,
            newId: this.machineName
          })
        }

        this.$store.commit('entities/UPDATE_FIELD', {
          id: this.machineName,
          fieldData: {
            label: this.label,
            description: this.description
          }
        })

        // @todo async save.
        this.$store.dispatch('entities/SAVE_ENTITY')

        this.opened = false
      }
    },
    props: {
      fieldPath: String,
      field: Object
    }
  }
</script>