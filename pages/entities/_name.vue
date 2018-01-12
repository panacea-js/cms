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
        </v-card-text>
      </v-card>
    </v-flex>
  </v-layout>
</v-container>
</template>

<script>
  import EntityList from '../../components/EntityList.vue'

  export default {
    components: {
      EntityList
    },
    head () {
      return {
        title: 'Entities',
      }
    },
    methods: {
      redirectToEntity: function (entityName) {
        this.$router.push({ name: 'entities-name', params: { name: entityName }})
      }
    },
    validate ({ params }) {
      // @todo Must be a valid entity
      // return /^Cat+$/.test(params.name)
      return true
    },
    data () {
      return {
        graphqlEndpoint: '',
        entity: this.$route.params.name,
      }
    },
    asyncData ({ env }) {
      return {
        graphqlEndpoint: env.panacea.main.endpoint
      }
    }
  }
</script>