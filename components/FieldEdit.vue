<template>
  <v-dialog v-model="opened" persistent max-width="75%">
    <v-btn fab dark small color="amber darken-1" slot="activator">
      <v-icon color="grey darken-4">edit</v-icon>
    </v-btn>
    <v-card>
      <v-card-title>
        <span class="headline">Field Edit</span>
      </v-card-title>
      <v-card-text>
        <v-container grid-list-md>
          <v-layout wrap>
            <v-flex xs12 sm6 md4>
              <v-text-field label="Legal first name" required></v-text-field>
            </v-flex>
            <v-flex xs12 sm6 md4>
              <v-text-field label="Legal middle name" hint="example of helper text only on focus"></v-text-field>
            </v-flex>
            <v-flex xs12 sm6 md4>
              <v-text-field label="Legal last name" hint="example of persistent helper text" persistent-hint required></v-text-field>
            </v-flex>
          </v-layout>
        </v-container>
        <small>*indicates required field</small>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="green darken-1" flat @click.native="opened = false">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
  export default {
    data() {
      return {
        opened: false
      }
    }
  }
</script>