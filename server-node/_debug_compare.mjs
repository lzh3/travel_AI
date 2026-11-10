import dotenv from "dotenv";
dotenv.config();

const KEY = process.env.SILICONFLOW_API_KEY;
const BASE = process.env.SILICONFLOW_BASE_URL;
const MODEL = process.env.SILICONFLOW_MODEL;

const { ChatOpenAI } = await import("@langchain/openai");

console.log("=== 测试1: 传 baseURL（大写）—— 我之前写的方式 ===");
{
  const llm = new ChatOpenAI({ apiKey: KEY, modelName: MODEL, baseURL: BASE });
  console.log("clientConfig.baseURL =", llm.clientConfig?.baseURL);
  console.log("this.apiKey =", llm.apiKey?.slice(0, 10) + "...");
}

console.log("\n=== 测试2: 传 baseUrl（小写 L）—— LangChain 实际认的拼写 ===");
{
  const llm = new ChatOpenAI({ apiKey: KEY, modelName: MODEL, baseUrl: BASE });
  console.log("clientConfig.baseURL =", llm.clientConfig?.baseURL);
}

console.log("\n=== 测试3: 传 configuration.baseURL ===");
{
  const llm = new ChatOpenAI({
    apiKey: KEY,
    modelName: MODEL,
    configuration: { baseURL: BASE },
  });
  console.log("clientConfig.baseURL =", llm.clientConfig?.baseURL);
}

console.log("\n=== 测试4: 用正确方式(baseUrl)实际调一次 ===");
{
  const llm = new ChatOpenAI({
    apiKey: KEY,
    modelName: MODEL,
    baseUrl: BASE,
    timeout: 30000,
    maxRetries: 0,
  });
  const t = Date.now();
  try {
    const res = await llm.invoke("说OK");
    console.log("耗时:", Date.now() - t, "ms  ✅");
    console.log("reply:", res.content);
  } catch (e) {
    console.log("耗时:", Date.now() - t, "ms  ❌", e.message);
  }
}
