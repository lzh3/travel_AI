import { defineStore } from 'pinia'

export const useChatStore = defineStore('chat', {
  state: () => ({
    messages: [],
    isLoading: false,
    streaming: false,
    currentMessage: ''
  }),

  actions: {
    addMessage(message) {
      this.messages.push(message)
    },

    clearMessages() {
      this.messages = []
    },

    setLoading(loading) {
      this.isLoading = loading
    },

    setStreaming(streaming) {
      this.streaming = streaming
    },

    setCurrentMessage(message) {
      this.currentMessage = message
    }
  },

  persist: {
    enabled: true,
    strategies: [
      {
        key: 'chat-messages',
        storage: localStorage,
        paths: ['messages']
      }
    ]
  }
})