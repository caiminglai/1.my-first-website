/**
 * AI 问答核心模块
 * 支持多 LLM 提供商：OpenAI / Anthropic / 阿里云通义千问 / 智谱 AI / 其他兼容 OpenAI 协议的服务
 *
 * 使用方式：
 * 1. 在页面上选择提供商并填入 API Key（保存在浏览器 localStorage）
 * 2. 或在后端 .env 中配置 AI_PROVIDER / AI_API_KEY / AI_BASE_URL / AI_MODEL
 *
 * 前端配置优先于 .env 配置
 */

const AI_SERVICES = {
  openai: {
    name: "OpenAI",
    defaultModel: "gpt-4o-mini",
    buildUrl: (baseUrl) =>
      (baseUrl || "https://api.openai.com") + "/v1/chat/completions",
  },
  anthropic: {
    name: "Anthropic",
    defaultModel: "claude-3-haiku-20240307",
    buildUrl: (baseUrl) =>
      (baseUrl || "https://api.anthropic.com") + "/v1/messages",
  },
  alibaba: {
    name: "阿里云通义千问",
    defaultModel: "qwen-turbo",
    buildUrl: (baseUrl) =>
      (baseUrl || "https://dashscope.aliyuncs.com") +
      "/api/v1/services/aigc/text-generation/generation",
  },
  zhipu: {
    name: "智谱 AI",
    defaultModel: "glm-flash",
    buildUrl: (baseUrl) =>
      (baseUrl || "https://open.bigmodel.cn") + "/api/paas/v4/chat/completions",
  },
  custom: {
    name: "自定义（兼容 OpenAI 协议）",
    defaultModel: "gpt-4o-mini",
    buildUrl: (baseUrl) =>
      baseUrl || "https://api.openai.com/v1/chat/completions",
  },
};

// SSRF 防护：已知 LLM 服务商域名白名单
const ALLOWED_LLM_HOSTS = new Set([
  "api.openai.com",
  "api.anthropic.com",
  "dashscope.aliyuncs.com",
  "open.bigmodel.cn",
]);

// 私有/内网 IP 段（阻止 SSRF 打内网）
const PRIVATE_IP_PATTERNS = [
  /^127\./, /^10\./, /^172\.(1[6-9]|2\d|3[01])\./, /^192\.168\./,
  /^169\.254\./, /^0\./, /^::1$/, /^fe80:/, /^fc00:/, /^fd00:/,
];

function validateLLMUrl(urlString) {
  let parsed;
  try {
    parsed = new URL(urlString);
  } catch {
    throw new Error("无效的URL格式");
  }
  // 只允许 https（开发环境允许 http localhost）
  if (parsed.protocol !== "https:" && !(parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1")) {
    throw new Error("仅允许HTTPS协议");
  }
  // 阻止内网 IP
  for (const pattern of PRIVATE_IP_PATTERNS) {
    if (pattern.test(parsed.hostname)) {
      throw new Error("不允许访问内网地址");
    }
  }
  // 白名单域名检查（custom 提供商也需要在白名单内或由管理员配置）
  if (!ALLOWED_LLM_HOSTS.has(parsed.hostname)) {
    // 允许通过环境变量 AI_ALLOWED_HOSTS 扩展白名单
    const extraHosts = (process.env.AI_ALLOWED_HOSTS || "").split(",").map(h => h.trim()).filter(Boolean);
    if (!extraHosts.includes(parsed.hostname)) {
      throw new Error(`不允许访问此域名: ${parsed.hostname}，如需使用请设置 AI_ALLOWED_HOSTS 环境变量`);
    }
  }
  return urlString;
}

function getProviderInfo(provider) {
  return AI_SERVICES[provider] || AI_SERVICES.openai;
}

function getSupportedProviders() {
  return Object.keys(AI_SERVICES).map((k) => ({
    provider: k,
    name: AI_SERVICES[k].name,
    defaultModel: AI_SERVICES[k].defaultModel,
  }));
}

function buildSystemPrompt() {
  return `你是"同物异名"知识系统的智能助手。用户可能问关于术语、概念、学科知识的问题。

你的核心任务：
1. 用通俗易懂的语言解释复杂概念
2. 如果用户问的是两个概念的区别，请用对比方式说明
3. 识别被学术包装/商业包装的概念，揭示其本质
4. 如果不知道答案，请坦诚告诉用户，不要编造

输出要求：
- 直接回答问题，不需要开场白
- 回答简洁，控制在 300 字以内
- 可以适当引用系统中的术语名称
- 重点放在"本质是什么"和"和谁有关系"`.trim();
}

async function callLLM({ provider, apiKey, baseUrl, model, question }) {
  const info = getProviderInfo(provider);
  const finalModel = model || info.defaultModel;
  const url = validateLLMUrl(info.buildUrl(baseUrl));
  const systemPrompt = buildSystemPrompt();

  if (provider === "anthropic") {
    return await callAnthropic(url, apiKey, finalModel, systemPrompt, question);
  } else if (provider === "alibaba") {
    return await callAlibaba(url, apiKey, finalModel, systemPrompt, question);
  } else {
    // openai / zhipu / custom 都使用 OpenAI 协议
    return await callOpenAIProtocol(
      url,
      apiKey,
      finalModel,
      systemPrompt,
      question,
    );
  }
}

async function* callLLMStream({ provider, apiKey, baseUrl, model, question }) {
  const info = getProviderInfo(provider);
  const finalModel = model || info.defaultModel;
  const url = validateLLMUrl(info.buildUrl(baseUrl));
  const systemPrompt = buildSystemPrompt();

  if (provider === "anthropic") {
    return yield* callAnthropicStream(
      url,
      apiKey,
      finalModel,
      systemPrompt,
      question,
    );
  } else if (provider === "alibaba") {
    return yield* callAlibabaStream(
      url,
      apiKey,
      finalModel,
      systemPrompt,
      question,
    );
  } else {
    return yield* callOpenAIProtocolStream(
      url,
      apiKey,
      finalModel,
      systemPrompt,
      question,
    );
  }
}

async function callOpenAIProtocol(url, apiKey, model, systemPrompt, question) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question },
      ],
      temperature: 0.7,
    }),
  });

  const data = await res.json();
  if (!res.ok)
    throw new Error(
      data.error?.message ||
        data.message ||
        "API 调用失败 (HTTP " + res.status + ")",
    );

  return {
    content: data.choices?.[0]?.message?.content || "",
    model: data.model || model,
    tokens: {
      prompt: data.usage?.prompt_tokens || 0,
      completion: data.usage?.completion_tokens || 0,
    },
  };
}

async function* callOpenAIProtocolStream(
  url,
  apiKey,
  model,
  systemPrompt,
  question,
) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question },
      ],
      temperature: 0.7,
      stream: true,
    }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(
      data.error?.message ||
        data.message ||
        "API 调用失败 (HTTP " + res.status + ")",
    );
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const jsonStr = line.slice(6);
        if (jsonStr === "[DONE]") continue;
        try {
          const data = JSON.parse(jsonStr);
          const content = data.choices?.[0]?.delta?.content;
          if (content) yield { content, done: false };
        } catch (_e) {
          // ignore parse errors
        }
      }
    }
  }
  yield { content: "", done: true };
}

async function callAnthropic(url, apiKey, model, systemPrompt, question) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      system: systemPrompt,
      messages: [{ role: "user", content: question }],
      max_tokens: 1024,
      temperature: 0.7,
    }),
  });

  const data = await res.json();
  if (!res.ok)
    throw new Error(
      data.error?.message || "Anthropic API 调用失败 (HTTP " + res.status + ")",
    );

  return {
    content: data.content?.[0]?.text || "",
    model: data.model || model,
    tokens: {
      prompt: data.usage?.input_tokens || 0,
      completion: data.usage?.output_tokens || 0,
    },
  };
}

async function* callAnthropicStream(
  url,
  apiKey,
  model,
  systemPrompt,
  question,
) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      system: systemPrompt,
      messages: [{ role: "user", content: question }],
      max_tokens: 1024,
      temperature: 0.7,
      stream: true,
    }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(
      data.error?.message || "Anthropic API 调用失败 (HTTP " + res.status + ")",
    );
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const jsonStr = line.slice(6);
        try {
          const data = JSON.parse(jsonStr);
          if (data.type === "content_block_delta") {
            yield { content: data.delta?.text || "", done: false };
          } else if (data.type === "message_stop") {
            yield { content: "", done: true };
          }
        } catch (_e) {
          // ignore parse errors
        }
      }
    }
  }
  yield { content: "", done: true };
}

async function callAlibaba(url, apiKey, model, systemPrompt, question) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input: {
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question },
        ],
      },
      parameters: { temperature: 0.7, max_tokens: 1024 },
    }),
  });

  const data = await res.json();
  if (!res.ok)
    throw new Error(
      data.message || "阿里云 API 调用失败 (HTTP " + res.status + ")",
    );

  return {
    content:
      data.output?.choices?.[0]?.message?.content || data.output?.text || "",
    model: data.model || model,
    tokens: { prompt: 0, completion: 0 },
  };
}

async function* callAlibabaStream(url, apiKey, model, systemPrompt, question) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "X-DashScope-SSE": "enable",
    },
    body: JSON.stringify({
      model,
      input: {
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question },
        ],
      },
      parameters: { temperature: 0.7, max_tokens: 1024 },
    }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(
      data.message || "阿里云 API 调用失败 (HTTP " + res.status + ")",
    );
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const jsonStr = line.slice(6);
        try {
          const data = JSON.parse(jsonStr);
          if (data.output?.choices?.[0]?.message?.content) {
            yield {
              content: data.output.choices[0].message.content,
              done: false,
            };
          }
          if (data.output?.finish_reason === "stop") {
            yield { content: "", done: true };
          }
        } catch (_e) {
          // ignore parse errors
        }
      }
    }
  }
  yield { content: "", done: true };
}

module.exports = {
  callLLM,
  callLLMStream,
  getProviderInfo,
  getSupportedProviders,
};
