<template>
  <div class="chat-bubble" :class="messageClass">
    <div class="bubble-content">
      <div class="message-text" v-if="message.role === 'user'">{{ message.content }}</div>
      <div class="message-text ai-markdown" v-else v-html="renderedMarkdown"></div>
    </div>
    <div class="message-time" v-if="showTime">{{ formatTime }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { marked } from 'marked'

const props = defineProps({
  message: {
    type: Object,
    required: true
  }
})

marked.setOptions({
  breaks: true,
  gfm: true
})

const renderedMarkdown = computed(() => {
  if (!props.message.content) return ''
  return marked.parse(props.message.content)
})

const messageClass = computed(() => {
  return props.message.role === 'user' ? 'user-message' : 'ai-message'
})

const showTime = computed(() => {
  return props.message.timestamp && props.message.content
})

const formatTime = computed(() => {
  if (!props.message.timestamp) return ''
  const date = new Date(props.message.timestamp)
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
})
</script>

<style scoped>
.chat-bubble {
  display: flex;
  flex-direction: column;
  max-width: 80%;
}

.user-message {
  align-self: flex-end;
  align-items: flex-end;
}

.ai-message {
  align-self: flex-start;
  align-items: flex-start;
}

.bubble-content {
  padding: 12px 16px;
  border-radius: 16px;
  font-size: 15px;
  line-height: 1.6;
  word-break: break-word;
}

.user-message .bubble-content {
  background: #22c55e;
  color: #fff;
  border-bottom-right-radius: 4px;
  white-space: pre-wrap;
}

.ai-message .bubble-content {
  background: #f5f5f5;
  color: #323233;
  border-bottom-left-radius: 4px;
}

.message-time {
  font-size: 11px;
  color: #999;
  margin-top: 4px;
  padding: 0 4px;
}

.typing {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ai-markdown :deep(p) {
  margin: 0 0 8px;
}

.ai-markdown :deep(p:last-child) {
  margin-bottom: 0;
}

.ai-markdown :deep(h1),
.ai-markdown :deep(h2),
.ai-markdown :deep(h3),
.ai-markdown :deep(h4) {
  margin: 12px 0 6px;
  font-weight: 600;
  line-height: 1.4;
}

.ai-markdown :deep(h1) {
  font-size: 18px;
}

.ai-markdown :deep(h2) {
  font-size: 16px;
}

.ai-markdown :deep(h3) {
  font-size: 15px;
}

.ai-markdown :deep(ul),
.ai-markdown :deep(ol) {
  margin: 4px 0;
  padding-left: 22px;
}

.ai-markdown :deep(li) {
  margin: 2px 0;
}

.ai-markdown :deep(strong) {
  font-weight: 600;
}

.ai-markdown :deep(em) {
  font-style: italic;
}

.ai-markdown :deep(code) {
  background: rgba(0, 0, 0, 0.08);
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 13px;
  font-family: 'Menlo', 'Consolas', monospace;
}

.ai-markdown :deep(pre) {
  background: #2b2b2b;
  color: #e6e6e6;
  padding: 12px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 8px 0;
}

.ai-markdown :deep(pre code) {
  background: none;
  padding: 0;
  color: inherit;
  font-size: 13px;
}

.ai-markdown :deep(blockquote) {
  border-left: 3px solid #22c55e;
  padding: 4px 12px;
  margin: 8px 0;
  color: #666;
  background: rgba(34, 197, 94, 0.08);
  border-radius: 0 4px 4px 0;
}

.ai-markdown :deep(a) {
  color: #22c55e;
  text-decoration: none;
}

.ai-markdown :deep(a:hover) {
  text-decoration: underline;
}

.ai-markdown :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 8px 0;
  font-size: 13px;
}

.ai-markdown :deep(th),
.ai-markdown :deep(td) {
  border: 1px solid #e0e0e0;
  padding: 6px 10px;
  text-align: left;
}

.ai-markdown :deep(th) {
  background: rgba(0, 0, 0, 0.04);
  font-weight: 600;
}

.ai-markdown :deep(hr) {
  border: none;
  border-top: 1px solid #e0e0e0;
  margin: 12px 0;
}

.ai-markdown :deep(img) {
  max-width: 100%;
  border-radius: 6px;
}
</style>
