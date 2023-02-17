import Vue from 'vue'
import App from './App.vue'
import SimpleMicroApp from 'simple-micro-app'

SimpleMicroApp.start();

Vue.config.productionTip = false

window.globalStr = 'parent'

new Vue({
  render: h => h(App),
}).$mount('#app')
