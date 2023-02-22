<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <p>基座应用vue@2.7.14</p>
    <p class="text">基座应用内容</p>
    <button @click="handleToggle">展示/隐藏</button>
    <micro-app
      v-if="isShow"
      name="app"
      url="http://localhost:3000"
      id="micro-app-app1"
      :data="data"
      @datachange="handleDataChange"
    >
    </micro-app>
  </div>
</template>

<script>
export default {
  name: 'App',
  components: {
  },
  data() {
    return {
      isShow: true,
      data: {}
    };
  },
  methods: {
    handleToggle() {
      this.isShow = !this.isShow
    },
    handleDataChange(e) {
      console.log('接收数据', e)
    }
  },
  mounted() {
    setTimeout(() => {
      this.data = {
        name: '来自基座应用的数据'
      }
    }, 2000)
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.text {
  color: red;
}
</style>
