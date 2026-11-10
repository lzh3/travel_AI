<template>
  <div class="page-container chat-page">
    <div class="page-header">
      <van-nav-bar title="AI 旅游助手" left-text="返回" left-arrow @click-left="onBack" fixed placeholder />
    </div>

    <div class="chat-container" ref="chatContainer">
      <div v-if="messages.length === 0" class="chat-empty">
        <van-empty description="开始和 AI 助手对话吧！">
          <template #icon>
            <van-icon name="chat-o" size="64" color="#22c55e" />
          </template>
        </van-empty>
        <div class="quick-questions">
          <div class="quick-title">常见问题</div>
          <van-tag v-for="q in quickQuestions" :key="q" size="large" mark class="quick-tag"
            @click="sendQuickQuestion(q)">
            {{ q }}
          </van-tag>
        </div>
      </div>

      <div v-else class="message-list">
        <ChatBubble v-for="msg in messages" :key="msg.id" :message="msg" />

        <div v-if="isStreaming" class="streaming-indicator">
          <van-loading type="spinner" size="20px" />
          <span>AI 正在思考中...</span>
        </div>
      </div>
    </div>

    <div class="chat-input-area">
      <van-field v-model="inputMessage" placeholder="输入您的问题..." :disabled="isStreaming" @keyup.enter="sendMessage">
        <template #button>
          <van-button size="small" type="primary" :loading="isStreaming" @click="sendMessage"
            :disabled="!inputMessage.trim()">
            发送
          </van-button>
        </template>
      </van-field>
    </div>

    <van-tabbar route fixed placeholder>
      <van-tabbar-item to="/" icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item to="/chat" icon="chat-o">对话</van-tabbar-item>
      <van-tabbar-item to="/profile" icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import { useChatStore } from '@/stores/chat'
import { fetchStream } from '@/utils/request'
import ChatBubble from '@/components/ChatBubble.vue'

const router = useRouter()
const route = useRoute()
const chatStore = useChatStore()

const inputMessage = ref('')
const chatContainer = ref(null)
const messages = ref([])
const isStreaming = ref(false)

const quickQuestions = [
  '北京有哪些必去的景点？',
  '上海美食推荐',
  '成都三日游攻略',
  '如何选择旅行保险？'
]

onMounted(() => {
  if (chatStore.messages.length > 0) {
    messages.value = chatStore.messages
  }

  if (route.query.scene === 'detail' && route.query.city) {
    inputMessage.value = `我想了解一下${route.query.city}的旅游景点`
  }

  scrollToBottom()
})

const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

const sendMessage = () => {
  const msg = inputMessage.value.trim()
  if (!msg || isStreaming.value) return

  addUserMessage(msg)
  inputMessage.value = ''
  fetchAIResponse(msg)
}

const sendQuickQuestion = (question) => {
  if (isStreaming.value) return

  addUserMessage(question)
  fetchAIResponse(question)
}

const addUserMessage = (content) => {
  messages.value.push({
    id: Date.now(),
    role: 'user',
    content: content,
    timestamp: new Date().toISOString()
  })
  scrollToBottom()
}

const fetchAIResponse = (message) => {
  isStreaming.value = true

  const aiMsgId = Date.now() + 1
  messages.value.push({
    id: aiMsgId,
    role: 'ai',
    content: '',
    timestamp: new Date().toISOString()
  })

  let fullResponse = ''

  fetchStream(
    '/travel/chat',
    { message },
    (chunk) => {
      fullResponse += chunk
      const lastMsg = messages.value[messages.value.length - 1]
      if (lastMsg && lastMsg.role === 'ai') {
        lastMsg.content = fullResponse
      }
      scrollToBottom()
    },
    () => {
      // chatStore.messages = messages.value
      // 处理完成事件
      isStreaming.value = false
      scrollToBottom()
    },
    (errMsg) => {
      const lastMsg = messages.value[messages.value.length - 1]
      if (lastMsg && lastMsg.role === 'ai') {
        lastMsg.content = `抱歉，发生了错误: ${errMsg}`
      }
      isStreaming.value = false
      showToast('AI 回复失败')
      scrollToBottom()
    }
  )
}

const onBack = () => {
  chatStore.messages = messages.value
  router.back()
}
</script>

<style scoped>
.chat-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding-bottom: 50px;
}

.chat-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  padding-bottom: 60px;
}

.chat-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.quick-questions {
  margin-top: 32px;
  text-align: center;
}

.quick-title {
  font-size: 14px;
  color: #999;
  margin-bottom: 16px;
}

.quick-tag {
  margin: 8px;
  cursor: pointer;
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.streaming-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  color: #999;
  font-size: 14px;
}

.chat-input-area {
  position: fixed;
  bottom: 50px;
  left: 0;
  right: 0;
  background: #fff;
  padding: 8px 16px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
  max-width: 750px;
  margin: 0 auto;
}

.chat-input-area :deep(.van-field) {
  background: #f7f8fa;
  border-radius: 20px;
  padding: 8px 16px;
}
</style>