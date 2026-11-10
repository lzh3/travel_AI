# Node + AI 智能旅游推荐系统

基于 **Node.js + Express** 后端 + **Vue 3 + Vant** H5 前端，对接**硅基流动（SiliconFlow）/ DeepSeek** 大模型，提供 AI 旅行规划和智能聊天服务。

---

## 一、项目结构

```
Node+Langchain旅游推荐/
├── server-node/          # 后端服务（Node.js + Express）
│   ├── index.js              # Express 入口
│   ├── routes/
│   │   └── travel.js         # 旅行相关路由（推荐 + 聊天）
│   ├── services/
│   │   ├── travelServiceLLM.js   # 核心 AI 服务（单例）
│   │   └── LLMPromptConstStr.js  # Prompt 模板常量
│   ├── utils/
│   │   └── streamHandler.js      # SSE 流式响应工具
│   ├── .env                  # 环境变量（端口、API Key、模型配置）
│   └── package.json
│
└── travel-h5/            # 前端 H5（Vue 3 + Vite + Vant）
    ├── vite.config.js        # Vite 配置（含 /api 代理）
    ├── src/
    │   ├── main.js
    │   ├── App.vue
    │   ├── router/index.js       # 路由
    │   ├── stores/chat.js        # Pinia 聊天状态
    │   ├── utils/request.js      # axios 请求 + fetchStream SSE
    │   ├── views/
    │   │   ├── Home.vue          # 首页（输入城市/天数/预算 → AI 生成行程）
    │   │   ├── Detail.vue        # 行程详情页
    │   │   ├── Chat.vue          # AI 智能聊天页（流式）
    │   │   └── Profile.vue       # 个人中心
    │   ├── components/
    │   │   ├── ChatBubble.vue    # 聊天气泡（AI 消息 Markdown 渲染）
    │   │   ├── SpotItem.vue      # 景点卡片
    │   │   └── BudgetTable.vue   # 预算明细表格
    │   └── styles/common.css
    └── package.json
```

---

## 二、后端 server-node

### 技术栈

| 依赖 | 用途 |
|---|---|
| `express` | Web 框架 |
| `openai` | 原生 OpenAI SDK（兼容所有 OpenAI 格式的 API） |
| `dotenv` | 读取 `.env` 环境变量 |
| `http-status-codes` | HTTP 状态码常量 |

> 注：`@langchain/core`、`@langchain/openai`、`langchain` 是最初引入的依赖，目前已改为**直接使用原生 `openai` npm 包**，不再经过 LangChain wrapper。

### API 接口

| 方法 | 路径 | 说明 | 响应格式 |
|---|---|---|---|
| POST | `/api/travel/recommend` | 旅行规划推荐（非流式） | JSON |
| POST | `/api/travel/chat` | AI 智能聊天（**SSE 流式**） | `text/event-stream` |

#### 1. `/api/travel/recommend`

请求体：
```json
{
  "city": "深圳",
  "days": 2,
  "budget": 1000
}
```

响应（AI 直接返回结构化 JSON，后端容错解析）：
```json
{
  "success": true,
  "city": "深圳",
  "days": 2,
  "totalBudget": 1000,
  "dailyItinerary": [
    {
      "day": 1,
      "date": "第1天",
      "morning":   { "spot": "...", "duration": "...", "ticket": "...", "transportation": "...", "description": "..." },
      "afternoon": { "spot": "...", "duration": "...", "ticket": "...", "transportation": "...", "description": "..." },
      "evening":   { "spot": "...", "duration": "...", "ticket": "...", "transportation": "...", "description": "..." }
    }
  ],
  "budgetBreakdown": { "accommodation": 300, "food": 200, "transportation": 100, "tickets": 300, "other": 100 },
  "tips": ["..."],
  "warnings": ["..."]
}
```

#### 2. `/api/travel/chat`

请求体：
```json
{ "message": "深圳有什么好玩的" }
```

SSE 流消息格式：
```
data: {"type":"chunk","content":"你"}

data: {"type":"chunk","content":"好"}

data: {"type":"complete","data":{"success":true,"content":"你好..."}}

event: done
data: {"done":true}
```

### 核心模块说明

#### `travelServiceLLM.js` — 单例 AI 服务

- **构造时**根据 `.env` 中 `MODEL_PROVIDER` 选择硅基流动或 DeepSeek，初始化 `OpenAI` client（单例）
- **`recommend(city, days, budget)`**：拼 Prompt → 调用 `chat.completions.create`（非流式）→ `safeParseJson` 容错解析 AI 返回的 JSON
- **`chat(message, streamCallback)`**：调用 `chat.completions.create({ stream: true })`，for-await 遍历 SSE 分片，每片的 `delta.content` 通过回调往外推**增量 delta**（不是累积串）
- **JSON 容错** `sanitizeJson` / `safeParseJson`：自动去除 markdown 代码块标记、补全未加双引号的属性名、替换单引号为双引号，解决 LLM 返回非标准 JSON 的问题

#### `streamHandler.js` — SSE 流式响应

封装 Express `res` 对象，提供 `send(data)`、`end()`、`error()` 三个方法：
- 设置 `Content-Type: text/event-stream`、`cache-control: no-cache`、`connection: keep-alive`、`X-Accel-Buffering: no`
- **关键**：每条消息必须以 `data: ` 开头 + `\n\n` 结尾（SSE 协议要求，缺少 `data:` 前缀浏览器 EventSource 无法解析）

#### `LLMPromptConstStr.js` — 旅行规划 Prompt 模板

明确告诉 LLM 只输出标准 JSON、给出完整 schema 示例、禁止 markdown 标记或额外文字，最大化 AI 输出结构化 JSON 的成功率。

### .env 配置

```env
PORT=4000
MODEL_PROVIDER=siliconflow          # siliconflow | deepseek

# 硅基流动国际站（siliconflow.com）
SILICONFLOW_API_KEY=sk-xxxx
SILICONFLOW_MODEL=Qwen/Qwen3-14B
SILICONFLOW_BASE_URL=https://api.siliconflow.com/v1

# DeepSeek
DEEPSEEK_API_KEY=sk-xxxx
DEEPSEEK_MODEL=deepseek-ai/DeepSeek-R1
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
```

> ⚠️ **硅基流动注意事项**：国际站（siliconflow.com）和中国站（siliconflow.cn）是两套独立系统，API Key 不通用。`.com` 的 key 只能配 `api.siliconflow.com` 域名。

### 启动后端

```bash
cd server-node
npm install
node index.js        # 或 npm run start（nodemon 热更新）
# 控制台输出：服务运行在： http://localhost:4000
```

---

## 三、前端 travel-h5

### 技术栈

| 依赖 | 用途 |
|---|---|
| `vue` 3.x | 前端框架（Composition API） |
| `vite` | 构建工具 |
| `vue-router` 4.x | SPA 路由 |
| `pinia` | 状态管理（聊天历史） |
| `vant` 4.x | 移动端 UI 组件库 |
| `axios` | HTTP 请求 |
| `marked` | Markdown 解析（AI 聊天消息渲染） |

### Vite 代理配置

```js
server: {
  proxy: {
    "/api": { target: "http://localhost:4000", changeOrigin: true }
  }
}
```

前端请求 `/api/travel/recommend` 自动代理到后端 `http://localhost:4000/api/travel/recommend`，解决跨域。

### 请求工具 `request.js`

| 方法 | 说明 |
|---|---|
| `post(url, data)` | axios POST 普通请求 |
| `get(url, params)` | axios GET 请求 |
| `fetchStream(url, data, onChunk, onComplete, onError)` | **原生 fetch + ReadableStream**，处理 SSE 流式响应 |

`fetchStream` 工作流程：
1. `fetch()` 发起 POST 请求
2. `response.body.getReader()` 获取可读流读取器
3. 循环 `reader.read()` → `TextDecoder` 解码 → 按 `\n` 分行
4. 识别 `data: ` 前缀的行，`JSON.parse` 后根据 `type` 分发到 `onChunk` / `onComplete` / `onError`

### 聊天 UI 关键：ChatBubble.vue

- **用户消息**：`{{ content }}` 纯文本插值（Vue 自动转义，防 XSS）
- **AI 消息**：`v-html="marked.parse(content)"` 渲染 Markdown
- `marked` 配置 `breaks: true`（单个换行符也变成 `<br>`）、`gfm: true`（GitHub Flavored Markdown）
- 内置完整 Markdown 样式覆盖：标题、列表、代码块、表格、引用块、链接等

### 启动前端

```bash
cd travel-h5
npm install
npm run dev          # http://localhost:5173
npm run build        # 生产构建到 dist/
```

---

## 四、完整调用链路

### 旅行规划（非流式）

```
用户在 Home.vue 输入 城市+天数+预算
        │
        ▼
axios.post('/travel/recommend', {city, days, budget})
        │
        ▼
POST http://localhost:4000/api/travel/recommend
        │
        ▼
travelServiceLLM.recommend(city, days, budget)
  ├── RECOMMEND_PROMPT(city, days, budget) 生成 Prompt
  ├── openai.chat.completions.create() → 硅基流动 API
  └── safeParseJson() 容错解析 JSON
        │
        ▼
res.json(result) → 前端 Detail.vue 渲染行程
```

### AI 聊天（流式 SSE）

```
用户在 Chat.vue 输入消息
        │
        ▼
fetchStream('/travel/chat', {message}, onChunk, onComplete, onError)
        │
        ▼
POST http://localhost:4000/api/travel/chat
        │
        ▼
travelServiceLLM.chat(message, callback)
  ├── openai.chat.completions.create({stream: true})
  ├── for await chunk → delta.content
  └── callback(delta) 推增量
        │
        ▼
streamHandler.send({type:"chunk", content: delta})
  → res.write(`data: {...}\n\n`)
        │
        ▼
fetchStream ReadableStream 逐块解析 SSE
        │
        ▼
onChunk(delta) → Chat.vue 更新消息 → ChatBubble.vue Markdown 实时渲染
```

---

## 五、踩过的坑 & 解决方案

| 问题 | 根因 | 解决方案 |
|---|---|---|
| JSON 解析失败（尾逗号） | Postman 请求体 `"budget": 1000,` 带尾逗号 | `express.json()` 标准解析即可，前端注意格式 |
| LangChain ChatOpenAI 超时 | LangChain 顶层字段名是 `baseUrl`（小写 u），不是 `baseURL` | 直接用原生 `openai` npm 包，省掉 wrapper |
| 硅基流动 key 401 | 国际站 `.com` 和中国站 `.cn` 两套独立数据库 | `.env` 里 BASE_URL 必须和 key 所在控制台域名一致 |
| 前端 eventStream 无信息 | 后端 SSE 消息缺 `data:` 前缀，浏览器无法解析 | `streamHandler.js` 补上 `res.write(\`data: ${...}\n\n\`)` |
| 前端收到重复内容 | 回调每次传完整累积串而非增量 delta | `streamCallback(delta)` 只传本次新增 |
| Prompt 参数签名错误 | chat 方法复用 `RECOMMEND_PROMPT(city)` 但只传了一个字符串 | chat 方法用独立 system prompt |
| AI 消息不换行 | HTML 折叠 `\n` 为空格 | AI 消息用 Markdown 渲染，用户消息用 `white-space: pre-wrap` |

---

## 六、快速启动全流程

```bash
# 1. 启动后端
cd server-node && npm install && node index.js
# → http://localhost:4000

# 2. 启动前端（新开终端）
cd travel-h5 && npm install && npm run dev
# → http://localhost:5173

# 3. 浏览器打开 http://localhost:5173
#    首页 → 输入深圳+2天+1000元 → 生成规划
#    聊天页 → 与 AI 对话（流式 Markdown 输出）
```
