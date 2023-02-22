const { defineConfig } = require('@vue/cli-service')
const path = require("path");

module.exports = defineConfig({
  transpileDependencies: true,
  chainWebpack: config => {
    // 配置别名
    config.resolve.alias
      .set('simple-micro-app', path.join(__dirname, '../../src/index.js'))
  },
  // 跨域代理
  devServer: {
    https: false,
    proxy: 'http://127.0.0.1:3000'
  }
})
