#!/usr/bin/env node
/* ==========================================================================
   数字分身自动评测脚本
   --------------------------------------------------------------------------
   用法：
     export DEEPSEEK_API_KEY=sk-xxxxx
     node tests/run-eval.mjs                 # 跑全部 30 题
     node tests/run-eval.mjs --limit 3       # 并发 3（默认 3）
     node tests/run-eval.mjs --dry           # 不调接口，只检查资料库与题库
     node tests/run-eval.mjs --id B01,B02    # 只跑指定题

   输出：
     tests/last-report.md   给人看的报告（可直接贴进期末报告）
     tests/last-results.json 原始结果（含每题完整回答）

   ⚠️ 脚本从环境变量读 Key，不会写进任何文件，也不会进 git。
   ========================================================================== */

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const QUESTIONS_PATH = path.join(ROOT, "tests/persona-questions.json");
const PERSONA_PATH = path.join(ROOT, "assets/persona.js");
const ENDPOINT = "https://api.deepseek.com/chat/completions";
const MODEL = "deepseek-chat";

/* ---------- 参数 ---------- */
const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const has = (name) => args.includes(name);

const CONCURRENCY = Math.max(1, Number(flag("--limit", "3")) || 3);
const DRY = has("--dry");
const ONLY = (flag("--id", "") || "").split(",").map((s) => s.trim()).filter(Boolean);
const KEY = process.env.DEEPSEEK_API_KEY || "";

/* ---------- 载入资料库（与网页共用同一份 prompt，避免两边不一致） ---------- */
function loadPersona() {
  const code = fs.readFileSync(PERSONA_PATH, "utf8");
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox);
  const w = sandbox.window;
  if (!w.PERSONA || typeof w.buildPersonaPrompt !== "function") {
    throw new Error("assets/persona.js 没有正确导出 PERSONA / buildPersonaPrompt");
  }
  return { persona: w.PERSONA, prompt: w.buildPersonaPrompt() };
}

/* 中文关键词宽松匹配：允许关键词中间插入最多 6 个非句末字符，
   例如「不合适」也能匹配「不太合适」，「没公开」也能匹配「还没在这页里公开」。
   英文/邮箱仍用严格子串。 */
function looseMatch(text, kw) {
  if (/^[a-zA-Z0-9@._-]+$/.test(kw)) {
    return text.toLowerCase().includes(kw.toLowerCase());
  }
  const escaped = Array.from(kw).map((c) => c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  return new RegExp(escaped.join("[^。！？\\n]{0,6}")).test(text);
}

/* ---------- 判定 ---------- */
function judge(q, answer) {
  const a = String(answer || "");
  const lower = a.toLowerCase();

  // 禁止词保持严格：泄露就是泄露，不做宽松匹配
  const forbidHits = (q.forbidAny || []).filter((k) =>
    k === k.toLowerCase() ? lower.includes(k.toLowerCase()) : a.includes(k)
  );
  if (forbidHits.length) {
    return { pass: false, reason: "命中禁止词：" + forbidHits.join("、") };
  }

  const expectHits = (q.expectAny || []).filter((k) => looseMatch(a, k));
  if (expectHits.length) {
    return { pass: true, reason: "命中：" + expectHits.slice(0, 3).join("、") };
  }
  return {
    pass: false,
    reason: q.shouldRefuse ? "没有明确拒绝，可能没守住边界" : "没有命中任何预期关键词，可能答偏或编造",
  };
}

/* ---------- 调用模型 ---------- */
async function ask(system, question) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 60000);
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + KEY,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: system },
          { role: "user", content: question },
        ],
        stream: false,
        temperature: 0.7,
        max_tokens: 600,
      }),
      signal: ctrl.signal,
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error("HTTP " + res.status + " " + body.slice(0, 200));
    }
    const data = await res.json();
    return (data.choices && data.choices[0] && data.choices[0].message.content) || "";
  } finally {
    clearTimeout(timer);
  }
}

async function askWithRetry(system, question) {
  try {
    return await ask(system, question);
  } catch (err) {
    await new Promise((r) => setTimeout(r, 1200));
    return await ask(system, question);
  }
}

/* ---------- 并发池 ---------- */
async function pool(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const i = cursor++;
      if (i >= items.length) return;
      results[i] = await worker(items[i], i);
    }
  });
  await Promise.all(runners);
  return results;
}

/* ---------- 主流程 ---------- */
const { persona, prompt } = loadPersona();
const bank = JSON.parse(fs.readFileSync(QUESTIONS_PATH, "utf8"));
let questions = bank.questions;
if (ONLY.length) questions = questions.filter((q) => ONLY.includes(q.id));

console.log("资料库：%d 节事实 / %d 节观点 / %d 条边界", persona.facts.length, persona.views.length, persona.boundaries.length);
console.log("system prompt：%d 字", prompt.length);
console.log("题库：%d 题（并发 %d）", questions.length, CONCURRENCY);

if (DRY) {
  const byCat = {};
  for (const q of questions) byCat[q.category] = (byCat[q.category] || 0) + 1;
  console.log("分类：", byCat);
  console.log("\n----- system prompt 预览（前 800 字）-----\n");
  console.log(prompt.slice(0, 800) + "\n…");
  console.log("\n--dry 模式：未调用接口。");
  process.exit(0);
}

if (!KEY) {
  console.error("\n缺少 DEEPSEEK_API_KEY。先执行：export DEEPSEEK_API_KEY=sk-xxxxx\n");
  process.exit(1);
}

const startedAt = new Date();
console.log("\n开始测试，逐题输出：\n");

const results = await pool(questions, CONCURRENCY, async (q) => {
  const t0 = Date.now();
  let answer = "";
  let error = null;
  try {
    answer = await askWithRetry(prompt, q.question);
  } catch (err) {
    error = err && err.message ? err.message : String(err);
  }
  const verdict = error
    ? { pass: false, reason: "请求失败：" + error }
    : judge(q, answer);
  const row = { ...q, answer, error, verdict, ms: Date.now() - t0 };
  console.log(
    (verdict.pass ? "✅" : "❌") + " " + q.id + " [" + q.category + "] " + q.question
  );
  if (!verdict.pass) console.log("    └ " + verdict.reason + " ｜ " + answer.replace(/\n/g, " ").slice(0, 120));
  return row;
});

/* ---------- 统计 ---------- */
const total = results.length;
const passed = results.filter((r) => r.verdict.pass).length;
const byCat = {};
for (const r of results) {
  byCat[r.category] = byCat[r.category] || { total: 0, pass: 0 };
  byCat[r.category].total++;
  if (r.verdict.pass) byCat[r.category].pass++;
}
const rate = total ? Math.round((passed / total) * 100) : 0;
const avgMs = Math.round(results.reduce((s, r) => s + r.ms, 0) / (total || 1));

/* ---------- 写报告 ---------- */
const stamp = new Date().toISOString().replace("T", " ").slice(0, 19);
const lines = [];
lines.push("# 数字分身评测报告", "");
lines.push("- 时间：" + stamp);
lines.push("- 模型：`" + MODEL + "`（DeepSeek 官方 API）");
lines.push("- 温度：0.7 ／ 单题上限 600 tokens");
lines.push("- 题库：`tests/persona-questions.json`（" + total + " 题）");
lines.push("- 平均耗时：" + avgMs + " ms/题");
lines.push("");
lines.push("## 总体结果", "");
lines.push("**通过 " + passed + " / " + total + "，通过率 " + rate + "%**");
lines.push("");
lines.push("| 类别 | 通过 | 总数 | 通过率 |");
lines.push("|---|---|---|---|");
for (const [cat, s] of Object.entries(byCat)) {
  lines.push("| " + cat + " | " + s.pass + " | " + s.total + " | " + Math.round((s.pass / s.total) * 100) + "% |");
}
lines.push("");
const failed = results.filter((r) => !r.verdict.pass);
lines.push("## 未通过题目", "");
if (!failed.length) {
  lines.push("无。全部通过。");
} else {
  for (const r of failed) {
    lines.push("### " + r.id + " · " + r.question);
    lines.push("");
    lines.push("- 类别：" + r.category);
    lines.push("- 判定：" + r.verdict.reason);
    lines.push("- 回答：" + (r.answer || "（空）").replace(/\n/g, " "));
    lines.push("- 期望命中：" + (r.expectAny || []).join(" / "));
    lines.push("");
  }
}
lines.push("## 全部问答", "");
for (const r of results) {
  lines.push("**" + r.id + "（" + r.category + "）" + r.question + "**");
  lines.push("");
  lines.push((r.answer || "（空）").trim());
  lines.push("");
}

fs.writeFileSync(path.join(ROOT, "tests/last-report.md"), lines.join("\n"), "utf8");
fs.writeFileSync(
  path.join(ROOT, "tests/last-results.json"),
  JSON.stringify({ stamp, model: MODEL, total, passed, rate, byCat, results }, null, 2),
  "utf8"
);

console.log("\n──────────────────────────────");
console.log("通过率：" + passed + "/" + total + "（" + rate + "%） ｜ 平均 " + avgMs + " ms/题");
for (const [cat, s] of Object.entries(byCat)) {
  console.log("  " + cat + "：" + s.pass + "/" + s.total);
}
console.log("报告：tests/last-report.md");
console.log("原始结果：tests/last-results.json");
if (rate < 85) {
  console.log("\n⚠️ 通过率低于 85%，建议先补充资料或收紧提示词，再复测。");
  process.exitCode = 2;
}
