import axios from 'axios'

const request = axios.create({
  baseURL: '/api',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json'
  }
})

request.interceptors.request.use(
  config => {
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

request.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    return Promise.reject(error)
  }
)


export function post(url, data) {
  return request.post(url, data)
}

export function get(url, params) {
  return request.get(url, { params })
}

// onChunk 收到数据块时的回调函数
// onComplete 请求完成时的回调函数
// onError 发生错误时的回调函数
export async function fetchStream(url, data, onChunk, onComplete, onError) {
  // 创建请求控制器,支持中断流式连接。
  const controller = new AbortController()

  try {
    const response = await fetch(`/api${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
      signal: controller.signal // 关联取消信号
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // 获取响应体的 可读流读取器
    const reader = response.body.getReader()
    // 将二进制数据解码为字符串
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n').filter(line => line.trim())

      for (const line of lines) {
        try {
          // 处理 SSE 格式：data: {"type": "chunk", ...}
          if (line.startsWith('data: ')) {
            const jsonStr = line.substring(6) // 去掉 "data: " 前缀
            const json = JSON.parse(jsonStr)
            console.log(json)
            if (json.type === 'chunk') {
              onChunk(json.content) // 收到数据块
            } else if (json.done === true) {
               console.log(json)
              onComplete(json.data) // 请求完成
            } else if (json.error) {
              onError(json.error) // 发生错误
            }
          }
        } catch (e) {
          console.warn('JSON parse error:', e)
        }
      }
    }

    return controller.abort() // 完成后主动关闭连接
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Stream aborted')
    } else {
      onError(error.message || '请求失败')
    }
    throw error
  }
}


export default request