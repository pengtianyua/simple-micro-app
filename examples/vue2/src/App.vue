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
      isShow: true
    };
  },
  methods: {
    handleToggle() {
      this.isShow = !this.isShow
    }
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
