<template>
  <v-container grid-list-md fluid>
    <v-layout row wrap>
      <v-flex xs12 lg2>
        <EntityList />
      </v-flex>
      <v-flex xs12 lg10>
        <v-card dark color="secondary">
          <v-card-text>
            <h1 class="title">{{ entity }}</h1>
            <h2>Fields:</h2>
            <ul>
              <template v-for="field in fields()">
                <li v-bind:key="field.id">{{ field.label }}</li>
              </template>
            </ul>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import EntityList from "../../../components/EntityList.vue"
import ENTITY from '../../../gql/queries/Entity.gql'

export default {
  components: {
    EntityList
  },
  head() {
    return {
      title: "Entities"
    }
  },
  methods: {
    redirectToEntity: function(entityName) {
      this.$router.push({
        name: "entities-name",
        params: { name: entityName }
      })
    },
    fields: function () {
      if (this.entityData.length === 0) {
        return []
      }
      return JSON.parse(this.entityData).fields
    }
  },
  validate({ params }) {
    // @todo Must be a valid entity
    // return /^Cat+$/.test(params.name)
    return true
  },
  data() {
    return {
      graphqlEndpoint: "",
      entity: this.$route.params.name,
      entityData: []
    }
  },
  apollo: {
    entityData() {
      return {
        query: ENTITY,
        variables() {
          return {
            name: this.$route.params.name,
          }
        },
        fetchPolicy: 'cache-and-network',
        update: data => data.ENTITY.data
      }
    },
  },
  asyncData({ env }) {
    return {
      graphqlEndpoint: env.panacea.main.endpoint
    }
  }
}
</script>