import Vue from 'vue'
import VueSVGIcon from 'vue-svgicon'
import VueMDCAdapter from 'vue-mdc-adapter'
import Tooltip from 'vue-directive-tooltip'
import Toasted from 'vue-toasted'

import localforage from 'localforage'

import App from './App'
import router from './router/'
import store from './store/'
import ContextMenu from '@/components/editor/common/ContextMenu'

import './theme.scss'

import 'normalize.css'
import 'dialog-polyfill/dialog-polyfill.css'
// import 'vue-directive-tooltip/css/index.css'

import global_ from './global'

localforage.config({ name: 'edrops-cad' })

Vue.use(VueSVGIcon)
Vue.use(VueMDCAdapter)
Vue.use(Toasted)
Vue.use(Tooltip, {
  class: 'tooltip-vuegg',
  placement: 'bottom',
  delay: 50
})
Vue.use(ContextMenu)

Vue.config.productionTip = false
Vue.prototype.GLOBAL = global_

/* eslint-disable no-new */
const vm = new Vue({
  el: '#app',
  store,
  router,
  template: '<App/>',
  components: { App }
})

export default vm
