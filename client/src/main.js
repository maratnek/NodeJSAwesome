import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

import VueRouter from 'vue-router'
Vue.use(VueRouter)
const router = new VueRouter({
  mode: 'history',
  // base: __dirname,
  routes: [
    { path: '/' },
  ]
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
