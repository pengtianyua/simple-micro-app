import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

window.globalStr = 'child'

window.addEventListener('scroll', () => {
  console.log('scroll')
})

new Vue({
  render: h => h(App),
}).$mount('#app')
