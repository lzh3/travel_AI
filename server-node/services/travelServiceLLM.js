import OpenAI from "openai";
import dotenv from "dotenv";
import { RECOMMEND_PROMPT } from "./LLMPromptConstStr.js";

dotenv.config();

class TravelService {
  constructor() {
    this.client = null;
    this.model = "";
    this.baseURL = "";
    this.initClient();
  }

  initClient() {
    if (this.client) return this.client;

    const provider = process.env.MODEL_PROVIDER;
    let apiKey;
    if (provider === "siliconflow") {
      apiKey = process.env.SILICONFLOW_API_KEY;
      this.model = process.env.SILICONFLOW_MODEL;
      this.baseURL = process.env.SILICONFLOW_BASE_URL;
    } else if (provider === "deepseek") {
      apiKey = process.env.DEEPSEEK_API_KEY;
      this.model = process.env.DEEPSEEK_MODEL;
      this.baseURL = process.env.DEEPSEEK_BASE_URL;
    } else {
      throw new Error("MODEL_PROVIDER 未配置（需为 siliconflow 或 deepseek）");
    }

    if (!apiKey || apiKey.length < 10) {
      throw new Error(`${provider} API Key 未配置或长度异常，请检查 .env`);
    }

    this.client = new OpenAI({
      apiKey,
      baseURL: this.baseURL,
      timeout: 120000,
      maxRetries: 0,
    });

    return this.client;
  }

  async recommend(city, days, budget) {
    const prompt = RECOMMEND_PROMPT(city, days, budget);

    try {
      const resp = await this.client.chat.completions.create({
        model: this.model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 2048,
      });
      const content = resp.choices?.[0]?.message?.content || "";

      console.log("AI 返回的规划:", content);

      return this.safeParseJson(content);
    } catch (error) {
      if (error?.status === 401 || error?.status === 403) {
        throw new Error("API Key 已失效，请在 .env 中重新配置");
      }
      if (error?.name === "TimeoutError" || error?.code === "ECONNABORTED") {
        throw new Error("AI 服务响应超时，请检查网络或模型可用性");
      }
      throw error;
    }
  }

  async chat(message, streamCallback) {
    const messages = [
      {
        role: "system",
        content: "你是一个礼貌的、经验丰富旅行规划师，请贴心地解答用户的问题。",
      },
      { role: "user", content: message },
    ];

    let fullStr = "";

    try {
      const stream = await this.client.chat.completions.create({
        model: this.model,
        messages,
        temperature: 0.7,
        max_tokens: 2048,
        stream: true,
      });
      for await (const chunk of stream) {
        const delta = chunk.choices[0].delta.content || "";
        if (!delta) continue;
        fullStr += delta;

        if (streamCallback) {
          streamCallback(delta);
        }
      }
      return { success: true, content: fullStr };
    } catch (error) {
      console.error("AI 服务响应错误:", error);
      throw error;
    }
  }

  // 处理 AI 返回的 JSON 字符串，移除可能的代码块或额外的空格
  sanitizeJson(raw) {
    let text = raw.trim();

    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (codeBlockMatch) {
      text = codeBlockMatch[1].trim();
    } else {
      const braceStart = text.indexOf("{");
      const braceEnd = text.lastIndexOf("}");
      if (braceStart !== -1 && braceEnd !== -1 && braceEnd > braceStart) {
        text = text.substring(braceStart, braceEnd + 1);
      }
    }

    text = text.replace(/^[^{[]+/, "").replace(/[^}\]]+$/, "");
    text = text.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)(\s*:)/g, '$1"$2"$3');
    text = text.replace(/:\s*'([^']*?)'/g, ': "$1"');

    return text;
  }

  safeParseJson(raw) {
    try {
      return JSON.parse(raw);
    } catch {
      try {
        const sanitized = this.sanitizeJson(raw);
        return JSON.parse(sanitized);
      } catch (e) {
        console.error("JSON 解析失败, 原始内容:", raw);
        throw new Error("AI 返回的规划格式无法解析为 JSON");
      }
    }
  }
}

const singleton = new TravelService();
export default singleton;
