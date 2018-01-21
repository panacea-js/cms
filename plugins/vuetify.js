import Vue from 'vue'
import Vuetify from 'vuetify'
import vars from '../assets/vars.json'

Vue.use(Vuetify, {
  theme: {
    ...vars.colors
  }
})
