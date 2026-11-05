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
curl -i -X POST \
  "https://taqpbdsevtrznhkgyunl.supabase.co/functions/v1/persona-chat" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"你是谁？"}]}'
```

期望返回 `200`，并且是一串 `data: {...}` 的流式内容。
如果返回 `{"error":"server not configured"}`，说明 Secret 没配上；
返回 `401`，说明 JWT 校验没关。

## 上线后建议

- 把 `index.ts` 里的 `ALLOWED_ORIGINS` 从 `["*"]` 改成你的主页域名，例如
  `["https://你的用户名.github.io", "http://localhost:8899"]`
- 在 DeepSeek 控制台给 Key 设一个 10–20 元的用量上限，即使被刷也有止损
- 不要把 `sk-` 开头的 Key 写进 `index.html`，也不要提交到 git
