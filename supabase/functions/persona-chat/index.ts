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
      5. 来源白名单：只认主页域名与 localhost，空 Origin / "null" 一律拒绝
      6. 按 IP 的服务端限流（分钟窗口 + 每日上限），压住脚本刷额度
      ⚠️ 第 5 条只是「挡住别的网页在浏览器里调用」，CORS 不是鉴权 ——
         Origin 头谁都能伪造。真正的钱袋子兜底是第 6 条 + DeepSeek 控制台
         的用量上限（建议 10~20 元），两者都要设。
   ========================================================================== */

const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";
const MODEL = "deepseek-chat";
const MAX_TOKENS = 600;
const MAX_MESSAGES = 32;      // 32 条：system + 最多 4 组 few-shot(8 条) + 8 轮历史(16 条) + 当前问题
const MAX_TOTAL_CHARS = 20000;  // system prompt 约 3300 字 + few-shot 约 1600 字 + 最近对话

/* 只允许主页本身和本地预览调用。
   本地预览任意端口都放行（python3 -m http.server 8777 就行），方便调试；
   线上只认 GitHub Pages 这一个来源。
   ⚠️ 不要为了「方便 curl 测试」把 "" / "null" 加回来：那正是脚本刷额度的入口。 */
const ALLOWED_ORIGINS: string[] = [
  "https://thriving-r.github.io",
];
const DEV_ORIGIN_RE = /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d{1,5})?$/;

function isOriginAllowed(origin: string): boolean {
  /* 必须带 Origin 且命中白名单；空串、"null"（file:// / 沙箱 iframe）一律不放行 */
  if (!origin) return false;
  return ALLOWED_ORIGINS.includes(origin) || DEV_ORIGIN_RE.test(origin);
}

/* ---------------------------------------------------------------------------
   按 IP 限流：单实例内存滑窗，尽力而为。
   Edge Function 会起多个 isolate，所以这是「降速」不是「硬上限」；
   但配上每请求 600 tokens 的固定上限，刷一晚上也就几块钱，足够兜住作业场景。
   --------------------------------------------------------------------------- */
const RL_WINDOW_MS = 60_000;     // 1 分钟窗口
const RL_MAX_PER_WINDOW = 8;     // 单 IP 每分钟最多 8 次
const RL_DAY_MS = 86_400_000;    // 24 小时窗口
const RL_MAX_PER_DAY = 150;      // 单 IP 每天最多 150 次
const RL_MAX_KEYS = 5000;        // 防止 Map 无限增长

type Bucket = { winAt: number; winCount: number; dayAt: number; dayCount: number };
const buckets = new Map<string, Bucket>();

function clientIp(req: Request): string {
  const xff = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim();
  return (
    xff ||
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-real-ip") ||
    "__shared__"
  );
}

function takeToken(ip: string): { ok: true } | { ok: false; retryAfter: number } {
  const now = Date.now();
  let b = buckets.get(ip);
  if (!b) {
    if (buckets.size >= RL_MAX_KEYS) buckets.clear();
    b = { winAt: now, winCount: 0, dayAt: now, dayCount: 0 };
    buckets.set(ip, b);
  }
  if (now - b.winAt >= RL_WINDOW_MS) { b.winAt = now; b.winCount = 0; }
  if (now - b.dayAt >= RL_DAY_MS) { b.dayAt = now; b.dayCount = 0; }

  if (b.winCount >= RL_MAX_PER_WINDOW) {
    return { ok: false, retryAfter: Math.ceil((b.winAt + RL_WINDOW_MS - now) / 1000) };
  }
  if (b.dayCount >= RL_MAX_PER_DAY) {
    return { ok: false, retryAfter: Math.ceil((b.dayAt + RL_DAY_MS - now) / 1000) };
  }
  b.winCount += 1;
  b.dayCount += 1;
  return { ok: true };
}

function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") || "";
  const headers: Record<string, string> = {
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
  /* 只有白名单来源才回 ACAO；不回时浏览器会直接拦掉响应 */
  if (origin && isOriginAllowed(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
}

function json(req: Request, obj: unknown, status = 200): Response {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...corsHeaders(req), "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin") || "";
  /* 统一拒绝「没带 Origin」和「不在白名单」的请求。
     注意这挡不住伪造 Origin 的 curl —— 它挡的是别的网页在浏览器里偷调；
     成本兜底靠下面的限流 + DeepSeek 控制台用量上限。 */
  if (!isOriginAllowed(origin)) {
    console.warn("拒绝来源", origin || "(empty)", "ip:", clientIp(req));
    return new Response(JSON.stringify({ error: "origin not allowed" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders(req) });
  }
  if (req.method !== "POST") {
    return json(req, { error: "method not allowed" }, 405);
  }

  /* 只有真正要花钱的 POST 才计数 */
  const gate = takeToken(clientIp(req));
  if (!gate.ok) {
    return new Response(JSON.stringify({ error: "rate limited" }), {
      status: 429,
      headers: {
        ...corsHeaders(req),
        "Content-Type": "application/json",
        "Retry-After": String(gate.retryAfter),
      },
    });
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
