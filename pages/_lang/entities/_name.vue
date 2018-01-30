<template>
  <v-container grid-list-md fluid>
    <v-layout row wrap>
      <v-flex xs12 lg2>
        <EntityList />
      </v-flex>
      <v-flex xs12 lg10>
        <v-card dark color="secondary" v-if="graphqlError">
          <v-alert color="error" icon="warning" value="true">
            There was an error loading {{ entity }}
          </v-alert>
        </v-card>
        <v-card dark color="secondary" v-if="!graphqlError">
          <v-card-title>
            <div>
              <h1 class="headline mb-0">{{ entity }}</h1>
              <div>{{ entityDescription }}</div>
            </div>
          </v-card-title>
          <v-card-text>
            <v-breadcrumbs>
              <v-breadcrumbs-item v-for="(fieldPath, index) in fieldPaths" :key="fieldPath.path" @click.native="setFieldPathActive(fieldPath.path)" :disabled="index +1 === fieldPaths.length">
                {{ fieldPath.label }}
              </v-breadcrumbs-item>
              <v-icon slot="divider">forward</v-icon>
            </v-breadcrumbs>

            <div class="fields-table-container">
              <v-data-table :class="fieldsTableClasses" :headers="fieldHeaders" :items="fields" hide-actions class="elevation-1">
                <template slot="items" slot-scope="props">
                  <td class="field-label">
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
                  <td class="field-type">
                    <span>
                      {{ props.item.type }}
                      <span class="field-type--cardinality">{{ !!props.item.many ? 'Many' : 'One' }}</span>
                    </span>
                    <span v-if="props.item.type === 'reference'">
                      <v-icon color="grey lighten-1">keyboard_arrow_right</v-icon>
                      <v-btn small flat dark color="primary" @click="redirectToEntity(props.item.references)">{{ props.item.references }}</v-btn>
                    </span>
                    <span v-if="props.item.type === 'object'">
                      <v-icon color="grey lighten-1">keyboard_arrow_right</v-icon>
                      <v-btn small flat dark color="primary" @click="gotoField(`${fieldPathActive}.${props.item._meta.camel}`, props.item.label)">{{ props.item.label }}</v-btn>
                    </span>
                  </td>
                  <td>
                    <v-icon color="grey lighten-1" v-if="!!props.item.required">check</v-icon>
                    <v-icon color="grey lighten-1" v-if="!props.item.required">clear</v-icon>
                  </td>
                </template>
              </v-data-table>
            </div>

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
    ensureFieldsContainerHeight: function () {
      if (document) {
        const fieldsTable = document.getElementsByClassName('fields-table')
        const fieldsTableContainer = document.getElementsByClassName('fields-table-container')
        fieldsTableContainer[0].style.height = fieldsTable[0].clientHeight + 'px'
      }
    },
    setFieldPathActive: function (path) {

      // Ignore changing path if it's already active.
      if (path === this.fieldPathActive) {
        return
      }

      this.ensureFieldsContainerHeight()

      // Determine the slide action direction.
      const deeperPath = path.length > this.fieldPathActive.length
      const initialTransition = deeperPath ? 'left' : 'right'
      const resolveTransition = deeperPath ? 'right' : 'left'

      this.fieldsTableTransition = initialTransition

      // Initial slide out and update table.
      setTimeout(() => {
        this.fieldPathActive = path
        this.fieldPaths = this.fieldPaths.filter(fp => _(path).startsWith(fp.path))
        this.fieldsTableTransition = resolveTransition
      }, 400)

      // Slide back into view.
      setTimeout(() => {
        this.fieldsTableTransition = null
        this.ensureFieldsContainerHeight()
      }, 800)
    },
    gotoField: function (path, label) {
      this.fieldPaths.push({
        path: path,
        label: label
      })
      this.setFieldPathActive(path)
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
    },
    fieldsTableClasses: function () {
      const classes = ['fields-table']
      if (this.fieldsTableTransition) {
        classes.push('transitioning')
        classes.push(this.fieldsTableTransition)
      }
      return classes
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
          text: 'Field path',
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
          path: 'all',
          label: 'All fields',
        }
      ],
      fieldPathActive: 'all',
      fieldsTableTransition: null,
      graphqlError: false,
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
        update: (data) => {
          if (data.ENTITY) {
            return data.ENTITY.data
          }
          this.graphqlError = true
        },
        error(error) {
          graphqlError = error
        },
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

<style lang="scss">
.field-label {
  white-space: nowrap;
}
.field-type {
  text-transform: uppercase;
  font-size: 0.9em;
  white-space: nowrap;
}
.field-type--cardinality {
  color: $color-primary;
  font-weight: bold;
  vertical-align: super;
  font-size: 0.8em;
}

.fields-table-container {
  transition: all 0.3s ease;
}
.fields-table {
  transition: all 0.4s ease;
  opacity: 1;
  overflow-x: hidden;
  .datatable {
    transition: all 0.4s ease;
    transform: translateX(0);
  }
  &.transitioning {
    opacity: 0;
    &.left .datatable {
      transform: translateX(-50%);
    }
    &.right .datatable {
      transform: translateX(50%);
    }
  }
}
</style>