/* ==========================================================================
   Supabase Edge Function · 数字分身代理
   --------------------------------------------------------------------------
   作用：把浏览器的请求转发给 DeepSeek，Key 只存在服务端环境变量里，
        前端代码和访客都拿不到。

   部署后需要配置的环境变量（Supabase Dashboard → Edge Functions → Secrets）：
     DEEPSEEK_API_KEY = sk-xxxxxxxx

   为什么需要它：
     前端直连 DeepSeek 时，Key 必然出现在页面源码里，任何访客都能复制走。
     加这一层代理后，浏览器只知道自己调用了一个自家函数。

   安全措施（按作业规模够用，不算企业级）：
     1. Key 只在服务端，永不下发前端
     2. 强制固定模型和 max_tokens，访客改不了（防止拿你的 Key 跑贵模型）
     3. 限制消息条数与总字数，避免被塞超长上下文烧钱
     4. 上游报错只返回简短信息，不把 DeepSeek 原始响应透给前端
     5. 可选：把 ALLOWED_ORIGINS 收紧成你的主页域名，别的网站就调不动
   ========================================================================== */

const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";
const MODEL = "deepseek-chat";
const MAX_TOKENS = 600;
const MAX_MESSAGES = 20;      // 最多 20 条（约 10 轮）
const MAX_TOTAL_CHARS = 20000;  // system prompt 约 3300 字 + 最近对话

/* 上线后把 "*" 换成你的主页地址，例如：
   const ALLOWED_ORIGINS = ["https://你的用户名.github.io", "http://localhost:8899"]; */
const ALLOWED_ORIGINS: string[] = ["*"];

function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") || "";
  const allowed =
    ALLOWED_ORIGINS.includes("*") || ALLOWED_ORIGINS.includes(origin);
  return {
    "Access-Control-Allow-Origin": allowed
      ? (ALLOWED_ORIGINS.includes("*") ? "*" : origin)
      : "null",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function json(req: Request, obj: unknown, status = 200): Response {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...corsHeaders(req), "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders(req) });
  }
  if (req.method !== "POST") {
    return json(req, { error: "method not allowed" }, 405);
  }

  const apiKey = Deno.env.get("DEEPSEEK_API_KEY");
  if (!apiKey) {
    console.error("DEEPSEEK_API_KEY 未配置");
    return json(req, { error: "server not configured" }, 500);
  }

  let body: { messages?: unknown };
  try {
    body = await req.json();
  } catch {
    return json(req, { error: "invalid json" }, 400);
  }

  const messages = body?.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return json(req, { error: "messages required" }, 400);
  }
  if (messages.length > MAX_MESSAGES) {
    return json(req, { error: "too many messages" }, 400);
  }

  let totalChars = 0;
  for (const m of messages as Array<Record<string, unknown>>) {
    if (
      !m ||
      typeof m.role !== "string" ||
      typeof m.content !== "string" ||
      !["system", "user", "assistant"].includes(m.role)
    ) {
      return json(req, { error: "invalid message" }, 400);
    }
    totalChars += m.content.length;
  }
  if (totalChars > MAX_TOTAL_CHARS) {
    return json(req, { error: "payload too large" }, 413);
  }

  const upstream = await fetch(DEEPSEEK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,              // 固定，访客改不了
      messages,
      stream: true,
      temperature: 0.7,          // 固定，保持人格稳定
      max_tokens: MAX_TOKENS,    // 固定，防止烧额度
    }),
  });

  if (!upstream.ok) {
    const detail = await upstream.text().catch(() => "");
    console.error("DeepSeek 返回错误", upstream.status, detail.slice(0, 300));
    return json(req, { error: "model unavailable" }, 502);
  }

  return new Response(upstream.body, {
    headers: {
      ...corsHeaders(req),
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
});
