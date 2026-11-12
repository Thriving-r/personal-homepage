# 数字分身代理 · 部署说明

目标：让 DeepSeek 的 API Key 只存在 Supabase 服务端，前端页面和访客都拿不到。

代理地址固定为：

```
https://taqpbdsevtrznhkgyunl.supabase.co/functions/v1/persona-chat
```

---

## 方式一：网页控制台（不用装命令行，推荐）

1. 打开 [Supabase Dashboard](https://supabase.com/dashboard/project/taqpbdsevtrznhkgyunl)
2. 左侧 **Edge Functions** → **Create a new function**
3. 函数名填 `persona-chat`，创建
4. 把 `supabase/functions/persona-chat/index.ts` 的全部内容粘贴进在线编辑器，**Deploy**
5. 进入 **Edge Functions → Secrets**（或 Project Settings → Edge Functions → Secrets），新增：
   - Name：`DEEPSEEK_API_KEY`
   - Value：你的 `sk-...`
6. 回到函数设置，确认 **Enforce JWT verification** 是关闭状态
   （本仓库的 `config.toml` 已写 `verify_jwt = false`，网页部署以界面开关为准）
7. 回到 `index.html`，把 `AI.proxyUrl` 填成上面的代理地址

## 方式二：命令行

```bash
cd outputs/personal-homepage
npm i -g supabase
supabase login
supabase link --project-ref taqpbdsevtrznhkgyunl

# Key 存到服务端，不会进代码
supabase secrets set DEEPSEEK_API_KEY=sk-你的key

# 部署（--no-verify-jwt 对应 config.toml 里的 verify_jwt = false）
supabase functions deploy persona-chat --no-verify-jwt
```

---

## 验证是否部署成功

```bash
# 必须带 Origin：函数只认主页域名和 localhost，裸 curl 会被 403 挡掉
curl -i -X POST \
  "https://taqpbdsevtrznhkgyunl.supabase.co/functions/v1/persona-chat" \
  -H "Content-Type: application/json" \
  -H "Origin: https://thriving-r.github.io" \
  -d '{"messages":[{"role":"user","content":"你是谁？"}]}'
```

期望返回 `200`，并且是一串 `data: {...}` 的流式内容。
如果返回 `{"error":"server not configured"}`，说明 Secret 没配上；
返回 `401`，说明 JWT 校验没关；
返回 `403 {"error":"origin not allowed"}`，是来源白名单在起作用（去掉 `-H "Origin: ..."` 也会得到这个）；
返回 `429 {"error":"rate limited"}`，说明撞上了限流（见下）。

## 已经内置的安全措施

| 措施 | 位置 | 说明 |
|---|---|---|
| 来源白名单 | `ALLOWED_ORIGINS` + `DEV_ORIGIN_RE` | 只放行 `https://thriving-r.github.io` 和 localhost / 127.0.0.1 任意端口；空 Origin、`null`、站外域名一律 403 |
| 按 IP 限流 | `RL_MAX_PER_WINDOW` / `RL_MAX_PER_DAY` | 默认 **8 次/分钟、150 次/天**，超了返回 429 + `Retry-After` |
| 载荷上限 | `MAX_MESSAGES` / `MAX_TOTAL_CHARS` | 32 条消息、2 万字，超了 400 / 413 |
| 固定参数 | `MODEL` / `MAX_TOKENS` / `temperature` | 访客改不了模型和长度 |

⚠️ 限流是**单实例内存窗口**，Edge Function 可能同时起多个 isolate，所以它是「降速」不是「硬上限」。
⚠️ CORS 白名单也**不是鉴权**：`Origin` 头可以伪造。两道都只是提高成本，真正的止损还是下面那条。

## 上线后建议

- 在 DeepSeek 控制台给 Key 设一个 10–20 元的用量上限，即使被刷也有止损（**唯一硬性兜底，务必设置**）
- 不要把 `sk-` 开头的 Key 写进 `index.html`，也不要提交到 git
- 换域名或加自定义域名后，记得把新来源加进 `ALLOWED_ORIGINS`
- 本地用 `file://` 双击打开时，浏览器发的 Origin 是 `null`，会被 403 挡掉 → 分身退回本地规则引擎。
  要测真实模型请用 `python3 -m http.server 8777` 起本地服务
