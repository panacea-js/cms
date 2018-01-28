<template>
  <v-container grid-list-md fluid>
    <v-layout row wrap>
      <v-flex xs12 lg2>
        <EntityList />
      </v-flex>
      <v-flex xs12 lg10>
        <v-card dark color="secondary">
          <v-card-title>
            <div>
              <h1 class="headline mb-0">{{ entity }}</h1>
              <div>{{ entityDescription }}</div>
            </div>
          </v-card-title>
          <v-card-text>

            <v-breadcrumbs>
              <v-breadcrumbs-item v-for="(fieldPath, index) in fieldPaths" :key="fieldPath.id" @click.native="setFieldPathActive(fieldPath.id)" :disabled="index +1 === fieldPaths.length">
                {{ fieldPath.label }}
              </v-breadcrumbs-item>
              <v-icon slot="divider">forward</v-icon>
            </v-breadcrumbs>

            <v-data-table v-bind:headers="fieldHeaders" :items="fields" hide-actions class="elevation-1">
              <template slot="items" slot-scope="props">
                <td>
                  {{ props.item.label }}
                  <v-tooltip v-model="show" top v-if="!!props.item.description">
                    <v-btn icon slot="activator">
                      <v-icon color="grey lighten-1">info</v-icon>
                    </v-btn>
                    <span>{{ props.item.description }}</span>
                  </v-tooltip>
                </td>
                <td>
                  <code v-html="getFieldPropertyPath(props.item)"></code>
                </td>
                <td>
                  <span class="field-type">
                    {{ props.item.type }}
                    <span class="field-type--cardinality ml-2">{{ !!props.item.many ? 'Many' : 'One' }}</span>
                  </span>
                  <span class="field-type--reference" v-if="props.item.type === 'reference'">
                    <v-icon color="grey lighten-1" class="ml-4">keyboard_arrow_right</v-icon>
                    <v-btn small flat dark color="primary" @click="redirectToEntity(props.item.references)">{{ props.item.references }}</v-btn>
                  </span>
                  <span class="field-type--reference" v-if="props.item.type === 'object'">
                    <v-icon color="grey lighten-1" class="ml-4">keyboard_arrow_right</v-icon>
                    <v-btn small flat dark color="primary" @click="gotoField(props.item._meta.camel, props.item.label)">{{ props.item.label }}</v-btn>
                  </span>
                </td>
                <td>
                  <v-icon color="grey lighten-1" v-if="!!props.item.required">check</v-icon>
                  <v-icon color="grey lighten-1" v-if="!props.item.required">clear</v-icon>
                </td>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import _ from 'lodash'
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
        name: "lang-entities-name",
        params: { name: entityName }
      })
      return false
    },
    setFieldPathActive: function (path) {
      if (path) {
        this.fieldPathActive = path
        this.fieldPaths = this.fieldPaths.filter(fp => _(path).startsWith(fp.id))
      }
    },
    appendAndSetFieldPathActive: function (id, label) {
      const appendedFieldPath = `${this.fieldPathActive}.${id}`
      this.setFieldPathActive(appendedFieldPath)
      this.fieldPaths.push({
        path: appendedFieldPath,
        label: label
      })
    },
    gotoField: function (id, label) {
      this.appendAndSetFieldPathActive(id, label)
    },
    getFieldPropertyPath: function (field) {
      return [
        this.entity,
        this.fieldPathActive
          .split('.')
          .filter(p => p !== 'all')
          .join('.'),
        field._meta.camel
      ].filter(i => !!i).join('.')
    }
  },
  validate({ params }) {
    // @todo Must be a valid entity
    // return /^Cat+$/.test(params.name)
    return true
  },
  computed: {
    fields: function () {
      if (this.entityData.length === 0) {
        return []
      }

      const allFields = _(JSON.parse(this.entityData))

      const fieldPathOnEntitityData = _(this.fieldPathActive).split('.')
        .filter(p => p !== 'all')
        .map(p => ['fields', p])
        .push('fields')
        .flatten()
        .value()
        .join('.')

      return _(allFields.get(fieldPathOnEntitityData)).values().value()

    },
    entityDescription: function () {
      if (this.entityData.length === 0) {
        return ''
      }
      return JSON.parse(this.entityData).description
    }
  },
  data() {
    return {
      entity: this.$route.params.name,
      entityData: [],
      fieldHeaders: [
        {
          text: 'Label',
          value: 'label'
        },
        {
          text: 'Property path',
          value: 'id'
        },
        {
          text: 'Type',
          value: 'type'
        },
        {
          text: 'Required',
          value: 'required'
        }
      ].map(h => {
        h.align = 'left'
        h.sortable = false
        return h
      }),
      fieldPaths: [
        {
          id: 'all',
          label: 'All fields',
        }
      ],
      fieldPathActive: 'all'
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

<style lang="scss" scoped>
.field-type {
  text-transform: uppercase;
  font-size: 0.9em;
}
.field-type--cardinality {
  color: $color-primary;
  font-weight: bold;
  vertical-align: super;
  font-size: 0.8em;
}
</style>