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
              <v-data-table :class="fieldsTableClasses" :headers="fieldHeaders" :items="fieldsDisplayed" hide-actions class="elevation-1" ref="sortableTable">

                <template slot="items" slot-scope="props">
                  <tr :class="`sortable-row field-type-${props.item.type}`" :key="fieldOrderKey(props.item)">
                    <td :class="props.item.type !== 'id' ? 'sort-handle' : 'sort-locked'">

                      <v-tooltip left>
                        <v-icon slot="activator" v-if="props.item.type !== 'id'">drag_handle</v-icon>
                        <span>{{ $t('cms.entities.fields.actions.move') }}</span>
                      </v-tooltip>

                      <v-tooltip left>
                        <v-icon slot="activator" small color="grey" v-if="props.item.type === 'id'">lock</v-icon>
                        <span>{{ $t('cms.entities.fields.actions.idNoMove') }}</span>
                      </v-tooltip>


                    </td>
                    <td class="field-label">
                      {{ props.item.label }}
                      <v-tooltip top v-if="!!props.item.description">
                        <sup slot="activator"><v-icon small color="grey lighten-1">info</v-icon></sup>
                        <span>{{ props.item.description }}</span>
                      </v-tooltip>
                    </td>
                    <td class="hidden-sm-and-down">
                      <code v-html="getFieldPropertyPath(props.item)"></code>
                    </td>
                    <td class="field-type">

                      <span>{{ fieldTypes[props.item.type].label }}</span>

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
                  </tr>
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
import EntityList from '@/components/EntityList.vue'
import FieldEdit from '@/components/FieldEdit.vue'
import Sortable from 'sortablejs'
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
  mounted () {
    this.sortableInstance = this.initialiseSortableTable()
    this.$store.dispatch('entities/GET_ENTITY')
  },
  methods: {
    // Local methods.
    initialiseSortableTable () {
      return new Sortable(
        this.$refs.sortableTable.$el.getElementsByTagName('tbody')[0],
        {
          draggable: '.sortable-row',
          handle: '.sort-handle',
          onEnd: this.dragReorder,
          onMove: function (event, originalEvent) {
            // Don't allow move (visible when draggable) of any items above the ID field.
            return originalEvent.toElement.parentNode.classList.value.indexOf('field-type-id') === -1
          },
          animation: 250,
        }
      )
    },
    dragReorder ({item, oldIndex, newIndex}) {
      // Copy computed fieldsDisplayed to prevent mutating store.
      const clonedFieldsDisplayed = _.cloneDeep(this.fieldsDisplayed)

      // Update the order of the displayed fields based on what just moved.
      const movedItem = clonedFieldsDisplayed.splice(oldIndex, 1)[0]
      clonedFieldsDisplayed.splice(newIndex, 0, movedItem)

      // Ensure ID field remains as the first item in the list.
      const idIndex = clonedFieldsDisplayed.findIndex(x => x.type === 'id')
      if (idIndex !== -1) {
        const idField = clonedFieldsDisplayed.splice(idIndex, 1)[0]
        clonedFieldsDisplayed.unshift(idField)
      }

      this.$store.commit('entities/SET_DISPLAYED_FIELDS_FROM_REORDERING', clonedFieldsDisplayed)
      this.$store.dispatch('entities/SAVE_ENTITY')
    },
    fieldOrderKey (item) {
      if (!this.fieldOrderKeys.has(item)) {
        this.fieldOrderKeys.set(item, ++this.currentfieldOrderKey)
      }
      return this.fieldOrderKeys.get(item)
    },
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
    entityData() {
      return this.$store.state.entities.entityData
    },
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
    fieldsDisplayed() {
      return this.$store.state.entities.fieldsDisplayed
    },
    fieldTypes () {
      return this.$store.state.entities.fieldTypes
    },

    // Store getters.
    ...mapGetters({
      getFieldPropertyPath: 'entities/GET_FIELD_PROPERTY_PATH',
    })
  },
  data() {
    return {
      sortableInstance: {},
      fieldOrderKeys: new WeakMap(),
      currentfieldOrderKey: 0,
      fieldHeaders: [
        {
          class: 'sort-handle'
        },
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
      // @todo link graphql error with store.
      graphqlError: false,
    }
  },
  asyncData({ env, store }) {
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
tr.field-type-id {
  border-bottom-width: 5px !important;
  border-bottom-style: double !important;
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

.sort-locked {
  text-align: center;
  padding-left: 1.5em !important;
  padding-right: 0 !important;
  .icon {
    cursor: not-allowed;
  }
}

.sort-handle {
  text-align: center;
  padding-left: 1.5em !important;
  padding-right: 0 !important;
  .icon {
    cursor: move;
  }
}

.entity-field-actions {
  margin: 1em auto 0 auto;
  text-align: center;
}
</style>