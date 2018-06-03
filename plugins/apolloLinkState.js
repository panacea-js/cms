// Allows components to set a 'sharedData' instance property to set the linked
// data to local state.

import Vue from 'vue'
import { sharedDataMixin } from '@/apollo/local-state'
Vue.use(sharedDataMixin, { clientConfigKey: 'cmsLocalState' })
