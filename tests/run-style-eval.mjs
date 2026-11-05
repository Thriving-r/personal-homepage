#!/usr/bin/env node
/* ==========================================================================
   数字分身 · 风格评测（LLM 评委）
   --------------------------------------------------------------------------
   为什么需要这份脚本：
     run-eval.mjs 判的是「有没有说到关键词、有没有越界」，它证明分身不出错，
     但证明不了分身「像刘孟涵」。一个满口「综上所述」的客服机器人也能 30/30。
     这份脚本换成另一个模型当评委，只评语感，不评事实。

   用法：
     export DEEPSEEK_API_KEY=sk-xxxxx
     node tests/run-style-eval.mjs              # 当前配置跑一遍，5 维打分
     node tests/run-style-eval.mjs --ab         # 有 few-shot vs 无 few-shot，盲评谁更像
     node tests/run-style-eval.mjs --temp 0.9   # 指定生成温度（默认 0.7）
     node tests/run-style-eval.mjs --id S01,S02 # 只跑指定题
     node tests/run-style-eval.mjs --limit 4    # 并发（默认 3）
     node tests/run-style-eval.mjs --dry        # 不调接口，只体检资料库与题库

   输出：
     tests/style-report.md   给人看的报告
     tests/style-results.json 原始结果

   ⚠️ Key 只从环境变量读，不写进任何文件。
   ⚠️ reference 为空时评委没有风格金标准，只能按维度猜，分数仅供参考。
   ========================================================================== */

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const QUESTIONS_PATH = path.join(ROOT, "tests/style-questions.json");
const PERSONA_PATH = path.join(ROOT, "assets/persona.js");
const REPORT_PATH = path.join(ROOT, "tests/style-report.md");
const RESULTS_PATH = path.join(ROOT, "tests/style-results.json");

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
const TEMP = Math.min(1.5, Math.max(0, Number(flag("--temp", "0.7")) || 0.7));
const DRY = has("--dry");
const AB = has("--ab");
const ONLY = (flag("--id", "") || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const KEY = process.env.DEEPSEEK_API_KEY || "";

const DIMENSIONS = ["口吻", "句长节奏", "用词自然度", "收尾习惯", "真人感"];

/* 客观信号：AI 味套话。不参与打分，只做交叉验证 —— 评委可能会偏心，
   但这些词出现就是出现了，数得出来。 */
const AI_SMELL = [
  "值得一提的是",
  "综上所述",
  "总的来说",
  "总而言之",
  "此外",
  "总之",
  "希望对你有帮助",
  "作为一名",
  "需要注意的是",
  "换句话说",
  "在当今",
  "随着",
  "赋能",
  "打造",
];

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
  return {
    persona: w.PERSONA,
    prompt: w.buildPersonaPrompt(),
    stats: typeof w.personaStats === "function" ? w.personaStats() : null,
    buildMessages:
      typeof w.buildPersonaMessages === "function"
        ? w.buildPersonaMessages
        : (question, history) =>
            [{ role: "system", content: w.buildPersonaPrompt() }].concat(
              history || [],
              [{ role: "user", content: question }]
            ),
  };
}

function loadQuestions() {
  const raw = JSON.parse(fs.readFileSync(QUESTIONS_PATH, "utf8"));
  let list = Array.isArray(raw.questions) ? raw.questions : [];
  if (ONLY.length) list = list.filter((q) => ONLY.includes(q.id));
  return list;
}

/* ---------- 调用模型 ---------- */
async function chat(messages, { temperature = TEMP, maxTokens = 600 } = {}) {
  let lastErr;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${KEY}`,
        },
        body: JSON.stringify({
          model: MODEL,
          messages,
          stream: false,
          temperature,
          max_tokens: maxTokens,
        }),
      });
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error("HTTP " + res.status + " " + body.slice(0, 200));
      }
      const data = await res.json();
      const txt = data?.choices?.[0]?.message?.content;
      return String(txt || "").trim();
    } catch (e) {
      lastErr = e;
      if (attempt < 2) await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
    }
  }
  throw lastErr;
}

/* ---------- 评委提示词 ---------- */
const JUDGE_RULES = [
  "你是一位严格的中文语感评审。你只评「说话风格」，不评事实对错，也不给修改建议。",
  "",
  "【场景】这是一个大学生的个人主页数字分身。访客在对话框提问，它用第一人称回答。",
  "【目标】像一个 19 岁大一男生在微信里随手回消息——不是客服话术，也不是公众号小作文。",
  "",
  "【评分维度】每项 1-5 的整数分",
  "1. 口吻：5=真人聊天，3=有点端着，1=标准客服腔",
  "2. 句长节奏：5=长短句交错、有停顿感，1=一律工整的长句",
  "3. 用词自然度：5=口语词用得自然，1=满是「值得一提的是」「综上所述」这类书面套话",
  "4. 收尾习惯：5=说完就停、不强行升华，1=每段都要总结拔高一句",
  "5. 真人感：5=允许不完美、有自嘲或迟疑，1=完美得像通稿",
];

function buildJudgeMessages(question, answer, reference) {
  return [
    { role: "system", content: JUDGE_RULES.join("\n") },
    {
      role: "user",
      content: [
        reference
          ? "【本人真实回答（风格金标准，只参考语气和用词，不要抄内容）】\n" + reference
          : "【没有参考样本】只按上述维度判断，不要假设某种具体风格。",
        "",
        "【访客提问】" + question,
        "【分身回答】" + answer,
        "",
        "只输出一行 JSON，不要代码块、不要解释：",
        '{"口吻":4,"句长节奏":3,"用词自然度":4,"收尾习惯":3,"真人感":3,"一句评":"不超过25字"}',
      ].join("\n"),
    },
  ];
}

function buildPairwiseMessages(question, a, b, reference) {
  return [
    {
      role: "system",
      content: [
        JUDGE_RULES.join("\n"),
        "",
        "现在给你同一个问题的两段回答，甲和乙。判断哪一段更像真人在聊天。",
        "只比风格，不比内容完整度。",
      ].join("\n"),
    },
    {
      role: "user",
      content: [
        reference
          ? "【本人真实回答（风格金标准）】\n" + reference
          : "【没有参考样本】只按上述维度判断。",
        "",
        "【访客提问】" + question,
        "【甲】" + a,
        "【乙】" + b,
        "",
        '只输出一行 JSON，不要代码块：{"更像":"甲","理由":"不超过20字"}',
      ].join("\n"),
    },
  ];
}

/* ---------- 解析 ---------- */
function parseJSON(text) {
  const s = String(text || "").replace(/```json/gi, "").replace(/```/g, "");
  const a = s.indexOf("{");
  const b = s.lastIndexOf("}");
  if (a < 0 || b <= a) return null;
  try {
    return JSON.parse(s.slice(a, b + 1));
  } catch {
    return null;
  }
}

function clampScore(n) {
  const v = Math.round(Number(n));
  return Number.isFinite(v) ? Math.min(5, Math.max(1, v)) : null;
}

function normalizeScores(obj) {
  if (!obj) return null;
  const out = {};
  for (const d of DIMENSIONS) {
    const v = clampScore(obj[d]);
    if (v === null) return null;
    out[d] = v;
  }
  out.一句评 = String(obj.一句评 || "").slice(0, 60);
  out.总分 = Object.values(out)
    .filter((v) => typeof v === "number")
    .reduce((a, b) => a + b, 0);
  return out;
}

function smellHits(text) {
  const t = String(text || "");
  return AI_SMELL.filter((w) => t.includes(w));
}

/* ---------- 并发池 ---------- */
async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let idx = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (idx < items.length) {
      const i = idx++;
      out[i] = await fn(items[i], i);
    }
  });
  await Promise.all(workers);
  return out;
}

/* ---------- 主流程 ---------- */
async function main() {
  const persona = loadPersona();
  const questions = loadQuestions();

  if (!questions.length) throw new Error("题库为空，或 --id 没匹配到任何题");

  console.log(`模型 ${MODEL} · 温度 ${TEMP} · 题库 ${questions.length} 题 · 模式 ${AB ? "A/B 盲评" : "单版评分"}`);
  if (persona.stats) {
    console.log(
      `资料库：prompt ${persona.stats.promptChars} 字 · 事实 ${persona.stats.facts} 条 · 观点 ${persona.stats.views} 条 · ` +
        `边界 ${persona.stats.boundaries} 条 · few-shot ${persona.stats.examples} 组（${persona.stats.exampleChars} 字）`
    );
    if (!persona.stats.examples && !AB) {
      console.log("⚠️  examples 还是空的 —— 现在测的是「纯形容词驱动」的基线，填了样本再跑一次才能看出提升。");
    }
  }

  const withRef = questions.filter((q) => String(q.reference || "").trim()).length;
  if (!DRY && withRef < questions.length) {
    console.log(`⚠️  ${questions.length - withRef}/${questions.length} 题没有 reference，评委缺少风格金标准，分数可信度下降。`);
  }

  if (DRY) {
    const ids = questions.map((q) => q.id);
    const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
    if (dup.length) throw new Error("题库 id 重复：" + [...new Set(dup)].join("、"));
    const noQ = questions.filter((q) => !String(q.question || "").trim());
    if (noQ.length) throw new Error("有题目缺 question 字段：" + noQ.map((q) => q.id).join("、"));

    const demoQ = questions[0].question;
    const msgs = persona.buildMessages(demoQ, [], { maxExamples: 4 });
    console.log("\nDRY 体检通过：");
    console.log(`  · messages 条数（含 few-shot）：${msgs.length}`);
    console.log(`  · 角色序列：${msgs.map((m) => m.role[0]).join("")}`);
    console.log(`  · 无样本时条数：${persona.buildMessages(demoQ, [], { maxExamples: 0 }).length}`);
    return;
  }

  if (!KEY) throw new Error("没有 DEEPSEEK_API_KEY。先 export DEEPSEEK_API_KEY=sk-xxx 再跑。");

  const started = Date.now();
  const results = [];

  await mapLimit(questions, CONCURRENCY, async (q) => {
    const question = q.question;
    const reference = String(q.reference || "").trim();

    try {
      /* A/B：同一题生成两版，一版带 few-shot，一版不带 */
      const withFew = await chat(
        persona.buildMessages(question, [], { maxExamples: 4 }),
        { temperature: TEMP }
      );

      let record = { id: q.id, category: q.category, question, answer: withFew, reference };

      if (AB) {
        const withoutFew = await chat(
          persona.buildMessages(question, [], { maxExamples: 0 }),
          { temperature: TEMP }
        );
        record.answerWithout = withoutFew;

        /* 随机分配甲乙，抵消位置偏见 */
        const flip = Math.random() < 0.5;
        const A = flip ? withoutFew : withFew;
        const B = flip ? withFew : withoutFew;
        const pick = parseJSON(
          await chat(buildPairwiseMessages(question, A, B, reference), {
            temperature: 0.2,
            maxTokens: 200,
          })
        );

        let winner = "平";
        const s = String(pick?.["更像"] || "");
        if (s.includes("甲") && !s.includes("乙")) winner = flip ? "无样本" : "有样本";
        else if (s.includes("乙") && !s.includes("甲")) winner = flip ? "有样本" : "无样本";

        record.pairwise = { winner, reason: String(pick?.["理由"] || "").slice(0, 40) };
      }

      const judged = parseJSON(
        await chat(buildJudgeMessages(question, withFew, reference), {
          temperature: 0.2,
          maxTokens: 250,
        })
      );
      record.scores = normalizeScores(judged);
      record.smell = smellHits(withFew);
      record.chars = withFew.length;

      results.push(record);
      const tag = record.scores
        ? DIMENSIONS.map((d) => `${d} ${record.scores[d]}`).join(" / ")
        : "评分解析失败";
      console.log(`✓ ${q.id} ${record.scores ? record.scores.总分 + "/25" : "-"}  ${tag}`);
    } catch (e) {
      results.push({ id: q.id, category: q.category, question, error: String(e.message || e) });
      console.log(`✗ ${q.id} 失败：${String(e.message || e).slice(0, 120)}`);
    }
  });

  /* 并发返回顺序不可控，按题库顺序重排，报告才稳定可比 */
  const order = new Map(questions.map((q, i) => [q.id, i]));
  results.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));

  const elapsed = Date.now() - started;
  writeReport({ results, persona, questions, elapsed, withRef });
}

/* ---------- 报告 ---------- */
function writeReport({ results, persona, questions, elapsed, withRef }) {
  const ok = results.filter((r) => r.scores);
  const failed = results.filter((r) => r.error);

  const avg = {};
  for (const d of DIMENSIONS) {
    avg[d] = ok.length
      ? (ok.reduce((n, r) => n + r.scores[d], 0) / ok.length).toFixed(1)
      : "-";
  }
  const avgTotal = ok.length
    ? (ok.reduce((n, r) => n + r.scores.总分, 0) / ok.length).toFixed(1)
    : "-";

  const over120 = ok.filter((r) => r.chars > 120).length;
  const avgChars = ok.length
    ? Math.round(ok.reduce((n, r) => n + r.chars, 0) / ok.length)
    : 0;
  const smellTotal = ok.reduce((n, r) => n + r.smell.length, 0);

  const L = [];
  L.push("# 数字分身风格评测报告");
  L.push("");
  L.push(`- 时间：${new Date().toLocaleString("zh-CN", { hour12: false })}`);
  L.push(`- 模型：\`${MODEL}\` ／ 生成温度 ${TEMP} ／ 并发 ${CONCURRENCY}`);
  L.push(`- 题库：\`tests/style-questions.json\`（${questions.length} 题，${withRef} 题有 reference）`);
  L.push(
    `- few-shot 样本：${persona.stats ? persona.stats.examples : "?"} 组` +
      (persona.stats && persona.stats.examples ? "" : "（⚠️ 空 → 本次是纯形容词基线）")
  );
  L.push(`- 耗时：${(elapsed / 1000).toFixed(1)} s`);
  L.push("");

  L.push("## 总体得分");
  L.push("");
  if (!ok.length) {
    L.push("**没有一条成功拿到评分，先看下面的失败原因。**");
  } else {
    L.push(`**平均 ${avgTotal} / 25**（满分 25，3 分是「及格线」，4 分以上才算真的像）`);
    L.push("");
    L.push("| 维度 | 平均分 |");
    L.push("|---|---|");
    for (const d of DIMENSIONS) L.push(`| ${d} | ${avg[d]} |`);
  }
  L.push("");

  L.push("## 客观信号");
  L.push("");
  L.push(`- 平均回答长度：**${avgChars} 字**（风格规则写的是「默认 120 字以内」）`);
  L.push(`- 超过 120 字的回答：**${over120} / ${ok.length}** 条`);
  L.push(`- AI 套话命中：**${smellTotal}** 次${smellTotal ? "（" + [...new Set(ok.flatMap((r) => r.smell))].join("、") + "）" : ""}`);
  L.push("");

  if (AB) {
    const voted = results.filter((r) => r.pairwise);
    const win = voted.filter((r) => r.pairwise.winner === "有样本").length;
    const lose = voted.filter((r) => r.pairwise.winner === "无样本").length;
    const tie = voted.filter((r) => r.pairwise.winner === "平").length;
    L.push("## 盲评对比：有 few-shot vs 无 few-shot");
    L.push("");
    L.push(`有样本胜 **${win}** ／ 无样本胜 **${lose}** ／ 平 **${tie}**（共 ${voted.length} 题）`);
    const rate = voted.length ? Math.round((win / voted.length) * 100) : 0;
    L.push("");
    L.push(
      rate >= 60
        ? `→ 样本确实有效（胜率 ${rate}%），可以保留这套样本继续补。`
        : rate >= 40
        ? `→ 样本效果不明显（胜率 ${rate}%）。多半是样本太短、太书面，或者话题覆盖不到这些题。`
        : `→ 样本反而更差（胜率 ${rate}%）。检查是不是样本本身写得像作文，模型照着抄了。`
    );
    L.push("");
    L.push("| 题目 | 胜者 | 理由 |");
    L.push("|---|---|---|");
    for (const r of voted) {
      L.push(`| ${r.id} | ${r.pairwise.winner} | ${r.pairwise.reason || "-"} |`);
    }
    L.push("");
  }

  L.push("## 逐题明细");
  L.push("");
  for (const r of results) {
    L.push(`**${r.id}（${r.category}）${r.question}**`);
    L.push("");
    if (r.error) {
      L.push(`> 失败：${r.error}`);
      L.push("");
      continue;
    }
    L.push("> " + r.answer.replace(/\n/g, "\n> "));
    L.push("");
    if (r.scores) {
      L.push(
        `评分：${DIMENSIONS.map((d) => `${d} ${r.scores[d]}`).join(" / ")} · 总分 ${r.scores.总分}/25` +
          ` · ${r.chars} 字` +
          (r.smell.length ? ` · ⚠️ 套话：${r.smell.join("、")}` : "")
      );
      if (r.scores.一句评) {
        L.push("");
        L.push(`评委评语：${r.scores.一句评}`);
      }
    }
    if (r.answerWithout) {
      L.push("");
      L.push(`对照（无样本）：${r.answerWithout.replace(/\n/g, " ")}`);
    }
    L.push("");
  }

  if (failed.length) {
    L.push("## 失败题目");
    L.push("");
    for (const f of failed) L.push(`- ${f.id}：${f.error}`);
    L.push("");
  }

  L.push("---");
  L.push("");
  L.push("**怎么读这份报告**");
  L.push("");
  L.push("- 总分 25 分：15 分以下基本还是客服腔，18 分以上算过得去，21 分以上才开始「像人」。");
  L.push("- 「收尾习惯」低分最常见，表现为每条回答最后都要拔高一句。");
  L.push("- 「句长节奏」低分说明句子长度太均匀，真人说话是长短交错的。");
  L.push("- 客观信号比评委更可靠：长度超标和套话命中是硬指标，评委可能偏心。");
  L.push("- 想验证改动有没有用，就改一处、跑一次、看分数，别一次改五处。");

  fs.writeFileSync(REPORT_PATH, L.join("\n") + "\n");
  fs.writeFileSync(
    RESULTS_PATH,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        model: MODEL,
        temperature: TEMP,
        mode: AB ? "ab" : "single",
        persona: persona.stats,
        results,
      },
      null,
      2
    ) + "\n"
  );

  console.log(`\n报告已写入 ${path.relative(ROOT, REPORT_PATH)}`);
  console.log(`原始结果 ${path.relative(ROOT, RESULTS_PATH)}`);
  if (ok.length) console.log(`平均 ${avgTotal} / 25`);
}

main().catch((e) => {
  console.error("评测失败：" + (e && e.message ? e.message : e));
  process.exit(1);
});
