<template>
  <div class="app-container">
    <router-view />
    <van-tabbar v-if="['Home', 'Chat', 'Profile'].includes(route.name)" route fixed placeholder>
      <van-tabbar-item to="/" icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item to="/chat" icon="chat-o">对话</van-tabbar-item>
      <van-tabbar-item to="/profile" icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'

const route = useRoute()
console.log(route)
// const active = ref(0)
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: #f5f5f5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.app-container {
  max-width: 750px;
  margin: 0 auto;
  background-color: #fff;
  min-height: 100vh;
  position: relative;
  padding-bottom: 50px;
}

#app {
  background-color: #f5f5f5;
  min-height: 100vh;
}
</style>