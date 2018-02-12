<template>
  <v-container grid-list-md fluid>
    <v-layout row wrap>
      <v-flex xs12 lg2>
        <EntityList />
      </v-flex>
      <v-flex xs12 lg10>
        <v-card dark color="secondary" v-if="graphqlError" flat>
          <v-alert color="error" icon="warning" value="true">
            {{ $t('cms.entities.errors.error-loading-entity', {entityName : entity}) }}
          </v-alert>
        </v-card>
        <v-card dark color="secondary" v-if="!graphqlError" flat>
          <v-card-title>
            <div>
              <h1 class="headline mb-0">{{ entity }}</h1>
              <div>{{ entityDescription }}</div>
            </div>
          </v-card-title>
          <v-card-text>
            <v-breadcrumbs>
              <v-breadcrumbs-item v-for="fieldPath in fieldPaths" :key="fieldPath.path" @click.native="gotoField(fieldPath.path)">
                {{ fieldPath.path === 'all' ? $t(fieldPath.label) : fieldPath.label }}
              </v-breadcrumbs-item>
              <v-icon slot="divider">forward</v-icon>
            </v-breadcrumbs>

            <div class="fields-table-container">
              <v-data-table :class="fieldsTableClasses" :headers="fieldHeaders" :items="fieldsDisplayed" hide-actions class="elevation-1">
                <template slot="items" slot-scope="props">
                  <td class="field-label">
                    {{ props.item.label }}
                    <v-tooltip top v-if="!!props.item.description">
                      <v-btn icon slot="activator">
                        <v-icon color="grey lighten-1">info</v-icon>
                      </v-btn>
                      <span>{{ props.item.description }}</span>
                    </v-tooltip>
                  </td>
                  <td class="hidden-sm-and-down">
                    <code v-html="getFieldPropertyPath(props.item)"></code>
                  </td>
                  <td class="field-type">
                    <span>{{ $t(`cms.entities.fields.types.${props.item.type}`) }}</span>
                    <span class="field-type--cardinality" v-html="cardinalityText(props.item.many)"></span>

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
                  <td>
                    <FieldEdit :fieldPath="fieldPathActive" :field="props.item" :key="`${fieldPathActive}.${props.item._meta.camel}`" />
                  </td>
                </template>
              </v-data-table>
            </div>

            <div class="entity-field-actions">
              <FieldEdit :fieldPath="fieldPathActive" isNew :key="`entity-field-create-${fieldPathActive}`" />
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
import FieldEdit from "../../../components/FieldEdit.vue"
import ENTITY from '../../../gql/queries/Entity.gql'
import { mapMutations, mapActions, mapGetters } from 'vuex'

export default {
  components: {
    EntityList,
    FieldEdit
  },
  head() {
    return {
      title: this.$t('cms.sections.entities')
    }
  },
  methods: {
    // Local methods.
    gotoField(path, label = '') {

      // Ignore if gotoField request is already active.
      if (path === this.$store.state.entities.fieldPathActive) {
        return
      }

      this.$store.dispatch('entities/ensureFieldsContainerHeight')

      // Determine the slide action direction.
      const deeperPath = path.length > this.$store.state.entities.fieldPathActive.length
      const initialTransition = deeperPath ? 'left' : 'right'
      const resolveTransition = deeperPath ? 'right' : 'left'

      this.fieldsTableTransition = initialTransition

      // Initial slide out and update table.
      setTimeout(() => {
        if (label) {
          this.$store.dispatch('entities/GOTO_NEW_FIELD_PATH', {path, label})
        }
        else {
          this.$store.dispatch('entities/GOTO_EXISTING_FIELD_PATH', path)
        }

        this.$store.dispatch('entities/GET_FIELDS')

        this.fieldsTableTransition = resolveTransition
      }, 400)

      // Slide back into view.
      setTimeout(() => {
        this.fieldsTableTransition = null
        this.$store.dispatch('entities/ensureFieldsContainerHeight')
      }, 800)
    },

    cardinalityText(isMany) {
      return !!isMany ? this.$t('cms.entities.fields.cardinality.many') : this.$t('cms.entities.fields.cardinality.one')
    },

    // Store actions.
    ...mapActions({
      redirectToEntity: 'entities/REDIRECT_TO_ENTITY'
    })
  },
  computed: {
    entity() {
      const storeEntityData = this.$store.state.entities.entityData
      return Object.keys(storeEntityData).length !== 0 ? storeEntityData._meta.pascal : this.$route.params.name
    },
    entityDescription() {
      const storeEntityData = this.$store.state.entities.entityData
      return Object.keys(storeEntityData).length !== 0 ? storeEntityData.description : ''
    },
    fieldsTableClasses() {
      const classes = ['fields-table']
      if (this.fieldsTableTransition) {
        classes.push('transitioning')
        classes.push(this.fieldsTableTransition)
      }
      return classes
    },
    fieldPaths() {
      return this.$store.state.entities.fieldPaths
    },
    fieldPathActive() {
      return this.$store.state.entities.fieldPathActive
    },
    fieldsDisplayed () {
      return this.$store.state.entities.fieldsDisplayed
    },

    // Store getters.
    ...mapGetters({
      getFieldPropertyPath: 'entities/GET_FIELD_PROPERTY_PATH',
    })
  },
  data() {
    return {
      apolloEntityData: {}, // Assigned to Apollo.
      fieldHeaders: [
        {
          text: this.$t('cms.entities.fields.attributes.label'),
          value: 'label'
        },
        {
          text: this.$t('cms.entities.fields.attributes.path'),
          value: 'id',
          class: 'hidden-sm-and-down'
        },
        {
          text: this.$t('cms.entities.fields.attributes.type'),
          value: 'type'
        },
        {
          text: this.$t('cms.entities.fields.attributes.required'),
          value: 'required'
        },
        {
          text: '',
          value: 'actions'
        }
      ].map(h => {
        h.align = 'left'
        h.sortable = false
        return h
      }),
      fieldsTableTransition: null,
      graphqlError: false,
    }
  },
  apollo: {
    apolloEntityData() {
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
            const parsedEntityData = JSON.parse(data.ENTITY.data)
            // Add entity data to Vuex store so it can be mutated independently from Apollo data.
            this.$store.commit('entities/UPDATE_ENTITY_DATA', parsedEntityData)
            this.$store.dispatch('entities/GET_FIELDS')
            return parsedEntityData
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
.entity-field-actions {
  margin: 1em auto 0 auto;
  text-align: center;
}
</style>