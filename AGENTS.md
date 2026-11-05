# AGENTS.md · 个人主页项目

> 本文件供 AI 助手自动读取。**每次修改代码后，助手必须在本文件「变更记录」一节追加一条记录。**

## 项目概述

刘孟涵（Menghan Liu）的个人主页，单文件静态网页。

- 技术栈：原生 HTML + 内联 CSS + 内联 `<script>`，无构建工具、无框架
- 主页面 `index.html` 无外部依赖；`travel.html` 例外，使用本地 three.js（`assets/lib/`）
- ⚠️ `travel.html` 依赖 **普通脚本**（非 ES Module）与 **内联 data URI 贴图**，目的是让 `file://` 双击也能正常渲染，详见「交互与组件约定 · 旅行页」
- 页面结构：`index.html` 三个面板（Tab 切换）—— `About Me` / `Home` / `Virtual Space`；`travel.html` 为独立 3D 地球旅行页；`calligraphy.html` 为独立书法页（可拖拽作品卡片）
- 用途：个人展示（非商业）

## 目录结构

项目根目录：

```
/Users/liumenghan/Documents/个人主页/outputs/personal-homepage
```

| 路径 | 说明 |
|---|---|
| `index.html` | 主文件，HTML / CSS / JS 全部内联其中 |
| `travel.html` | 旅行页：three.js 3D 地球 + 城市标记 + 照片展示（独立页面）；顶栏 = `← Back` + `旅行 Travel` + `Return to Home →`（见「交互与组件约定 · 子页顶栏」） |
| `citywalk.html` | Citywalk 占位页：Aceternity UI《Typewriter Effect》的**零依赖复刻**（逐字淡入 + 闪烁光标），显示「新功能开发中......莫急！」；**主页面两处 Citywalk pill 的落地页**。顶栏 = `← Back` + `Citywalk` + `Return to Home →`（**2026-09-18 起底下那枚 Back 已删除，Back 统一到顶上**）；点 Back 用 `history.back()` 回到进入本页前的界面 —— **连面板和滚动位置一起还原**，在 `index.html` 侧靠 `sessionStorage` 记录 + `nav type === "back_forward"` 判定，`file://` 双击同样成立；无历史时兜底走 `index.html` |
| `calligraphy.html` | 书法页：可拖拽的书法作品卡片（独立页面，原生 pointer 事件；Aceternity 式**错落叠放 + 悬停倾斜 + 甩出惯性**）；**已填入 6 张真实作品照片**（`WORKS` 的 `img`），照片下方**不显示文字**；顶栏 = `← Back` + `书法 Calligraphy` + `Return to Home →` |
| `bci.html` | 脑机接口方向详情页（暗色科技风，**全站唯一的暗色页**）：脑形 PCB 走线加载动画 + HUD 数据波动（独立页面，单文件内联 CSS/JS）；顶栏 = `← Back` + `脑机接口 BCI` + `Return to Home →`（**2026-09-18 起并入四页统一口径**）。⚠️ 该页配色自成体系（`--bg-0 #04070e` / `--cyan #5fbeff`），顶栏中项用**青色半透明胶囊**而不是别页的 sky-100 —— 见「交互与组件约定 · 子页顶栏」 |
| `assets/calligraphy/` | 书法作品照片，6 张（`praise-yangcheng-2023` / `china-dream` / `hui-yangcheng-2022` / `zhong-nanshan-2020` / `mao-zedong-poems` / `20th-congress-2022`）。全部 `sips -Z 1600 -s formatOptions 72` 压缩，共约 2.4MB |
| `assets/avatar.png` | 头像 |
| `assets/bg.jpg` | 水彩天空背景图 |
| `assets/cloud-bg.js` | **云背景层**（2026-09-18 新增）：Aceternity UI《Cloud Shader》的**零依赖原生 WebGL 移植**，被 `index.html` / `travel.html` / `citywalk.html` / `calligraphy.html` 四页以 `<script defer>` 引用（`bci.html` 不引用）。只画云、天空透明，让 `bg.jpg` 水彩底透出来；参数在文件顶部 `CFG` |
| `assets/tour-1.jpg` | 旅行照片 1（夏 · 海边栈道）。**2026-09-19 起已无页面引用**（首页轮播已换成蹭饭地图），保留未删 |
| `assets/tour-2.jpg` | 旅行照片 2（地中海小镇）。同上，无页面引用 |
| `assets/tour-3.jpg` | 旅行照片 3（书法 · 墨）。同上，无页面引用 |
| `assets/china-map.jpg` | **蹭饭地图**（2026-09-19 新增）：首页 Home 面板的**水彩手绘中国地图**，1536×956，约 451KB，无任何文字标注。由 DeepWorks 图像生成后**裁剪掉右下角「DeepWorks AI」水印**得到 —— ⚠️ 重新生成/改图时别忘了这一步，裁剪线是 `y=956`（见「变更记录 · 2026-09-19」）。⚠️ **另外：地图上「中山大学 · 广东」定位符号的锚点 `left:56.25% / top:86.19%` 是按这张图的投影标定出来的，改尺寸/改构图/重绘都必须重新标定**（见「变更记录 · 2026-09-19 · 定位符号」） |
| `assets/sysu-emblem.png` | **中山大学官方校徽**（2026-10-02 新增）：地图定位符号徽章中心的正片，256×256、约 22KB、**256 色调色板 PNG（无损）**。源图由用户提供（`uploads/…` 里那张扩展名写成 `.png`、实为 JPEG 的 1179×1133 图，白底无 alpha）→ 圆拟合求出墨色外圆（心 576.0,572.5 / R 489.5）→ 紧裁 979×979 → 净化成「白 → 深绿 rgb(20,55,27)」单色 ramp → 降采样 256 → 写索引色 PNG。页面用 `<image href>` + `<clipPath>` 圆裁（r=16.5，见「变更记录 · 2026-10-02」）。⚠️ 若换图，必须重新确认外圆紧裁与裁切半径，否则会被裁出白边或切掉外环 |
| `assets/earth-texture.jpg` | 地球贴图（NASA Blue Marble 卫星影像，4096×2048，2:1 等距圆柱投影） |
| `assets/earth-texture.js` | 地球贴图 data URI（2048×1024，609KB）。旅游页实际加载的贴图源，**必须保留** |
| `assets/lib/three.global.js` | three.js r160（由 ESM 版转成的普通脚本，页面实际引用） |
| `assets/lib/OrbitControls.global.js` | 轨道控制器（同上，普通脚本） |
| `assets/lib/three.module.js` | three.js r160 原始 ESM 版，**当前未被引用**（保留作回退参考） |
| `assets/lib/OrbitControls.js` | OrbitControls 原始 ESM 版，**当前未被引用** |
| `assets/*.png` | 对应的高清源图，页面未引用 |
| `assets/persona.js` | **数字分身的资料库与系统提示词**（2026-11-05 新增）：`PERSONA.facts / views / boundaries / style` + `buildPersonaPrompt()`。改分身「知道什么、怎么说、什么不说」只改这个文件。⚠️ 只放可公开信息 |
| `tests/persona-questions.json` | 分身验收题库：30 题（事实 10 / 观点 8 / 边界 8 / 攻击 4），每题带 `expectAny` / `forbidAny` / `shouldRefuse` |
| `tests/run-eval.mjs` | 自动评测脚本：`DEEPSEEK_API_KEY=sk-xxx node tests/run-eval.mjs`；`--dry` 可无 Key 自检；产出 `tests/last-report.md` |
| `supabase/functions/persona-chat/index.ts` | 数字分身代理（Edge Function）：Key 存服务端，前端不接触；部署见 `supabase/DEPLOY.md` |
| `supabase/config.toml` | Edge Function 配置（`verify_jwt = false`），供 CLI 部署使用 |

> 注意：`assets/` 里的图片是相对路径引用，移动或拷贝 `index.html` 时必须连同 `assets/` 一起。

## 本地预览

```bash
python3 -m http.server 8777 --directory .
```

然后访问 `http://127.0.0.1:8777/`

> ✅ `index.html` 和 `travel.html` 都**可以直接双击打开**（`file://`）。
> `travel.html` 已刻意避开 `file://` 的两个限制：不用 ES Module（改用 `*.global.js` 普通脚本）、贴图走 data URI（避免 canvas 被判跨域污染）。所以它不再需要本地服务器。
> 仍然推荐用服务器预览：改完代码刷新即可，且行为与将来部署到 GitHub Pages 一致。

## 设计系统

配色（水彩天空蓝），定义在 `:root`：

```
--sky-100 #e7f2fb   --sky-200 #cfe4f5   --sky-300 #b4d4ec
--sky-400 #93bcdd   --sky-500 #7aa8cf   --sky-600 #5f8bb5
--ink-900 #2b3b4c   --ink-700 #456072   --ink-500 #6b8294   --ink-400 #9db1c0
--white   #ffffff   --pink   #f4c7d6   --line    #d9e8f4
```

字体：

- 中文标题：宋体 / Noto Serif SC（`--font-serif`）
- 正文：PingFang SC 等系统无衬线（`--font-sans`）
- 手写标语：Snell Roundhand / Caveat / Permanent Marker（`--font-hand`）

## 交互与组件约定

- **面板切换**：`.panel` + `.panel.active`，JS 函数 `activate(name)`
- **Stateful Button**：统一使用 `.stateful-btn` 类（交互借鉴 Aceternity UI，MIT 协议）
  - 状态流转：默认（文字 `Send`）→ `.is-loading`（文字隐去、按钮收缩为圆形、居中旋转圆环）→ `.is-success`（居中对勾描边，停留 2 秒）→ 恢复
  - 悬停：出现 2px 间隙 + 2px 外环（对应 `ring-offset-2 + hover:ring-2`）
  - 状态机函数：`runStateful(btn, onSuccess, opts)`
  - 现有用例：数字分身 `#send`、建议表单 `#advice-send`
  - **按钮文案统一为 `Send`**
- **数字分身**：本地规则引擎（`rules` 数组关键词匹配），非真实 AI
- **建议表单**：提交后写入 `localStorage`，key 为 `lmh_advices`
- **液态玻璃球（`.hero-glass` / `#glassCanvas`）**：**全站常驻**。桌面端 Home / About Me / Virtual Space 三个面板都是同一颗球、都跟着鼠标走
  - 停靠点由 `placeOrb()` 按当前面板计算：Home 贴欢迎语右侧（保持原位 `[904,161,236]`）；另两页走右侧留白（`right:18 / width:210 / top:54%` → `[1052,304,210]`）
  - **鼠标在页面内移动时球整页跟随**（用户原话「泡泡在整个页面动，不止右侧」）：指针活跃时停靠点临时变成指针位置，球缓动追过去；`pointerleave` / 触摸设备 / `prefers-reduced-motion` 下回到停靠点。位移由渲染循环缓动后写成 `transform: translate3d()`；跟随缓动 `k = min(4.5 + 差距*0.5, 38)`、回归固定 `k = 3.6`（`1-exp(-k*dt)`，`dt` 上限 0.05s）
  - ⚠️ **跟随三原则（十五 定稿；改这三处 = 重犯「跟丢」）**：①**滚动量直通**——球是贴在**视口**里跟指针的，`follow.on` 时每帧先 `pos.y += ΔscrollY`，缓动只吃「球↔指针」的差距（否则滚动量被缓动吃掉，快速滚动直接落后几百像素）；②**滞后有硬上限** `maxLag = max(orbSize*0.45, 60)`（约半个球身），超出部分截掉（超高速甩动也不拉开距离）；③**循环生死不能只看球在不在视口内**——球的布局盒钉在文档原点、位置靠 `transform` 摆，被甩出视口时 `IntersectionObserver` 报不相交 → `stop()`，**而位置又只有这个循环会更新 → 球永久冻住、再也回不来**（「跟丢」主因）。现在跟随时绝不因不可见而停、`pointermove` 里 `if (!running) start()` 兜底，省电停循环只在「停靠完成 + 不在视口 + 未跟随」三条件齐备时发生
  - ⚠️ **已删除 `top/right/width` 的 CSS 过渡**：跟随（每帧追指针）与切面板（滑到新停靠点）是同一套缓动，两套机制并存会互相打架。`will-change:transform` 下不要再用 CSS transition 动同一颗球，也不要改回用 `top/left` 每帧写像素
  - ⚠️ **跟随点必须夹紧在文档内**（横向留在视口、纵向 `≤ docH - 半径`），否则球会把文档撑高、凭空多出滚动条
  - ⚠️ **必须用文档坐标（`position:absolute`，布局盒钉在 `top:0;left:0`、靠 `transform` 位移），不要改成 `position:fixed`**：`fixed` 会让球钉在视口上，正文一滚就从球下穿过（实测 1280×620 滚到底压到 `Send` 按钮）；`absolute` 下球与正文的相对位置恒定，避让在任意滚动位置都成立（Home 分支要 `r.top + window.scrollY`）
  - ⚠️ **改落点前必须先量「文字墨迹」**（`Range.getClientRects()`），不要用块级元素的满宽盒子，否则会把大片空白误判成重叠
  - `pointer-events:none`：纯装饰浮层，绝不拦截点击 / 划选 / 滚轮；点击涟漪靠 **window 级圆形命中判定**实现（不是监听 canvas）
  - ⚠️ **窄屏（≤700px）单独处理**：窄屏既没有右侧留白、也没有鼠标跟随（触摸不产生 hover 跟随）。Home 回落到 `.welcome` 文档流（`width:min(180px,46vw); margin:18px auto 0`），About Me / Virtual Space 藏球。**不要**在窄屏改成固定定位，实测会压住 Home 的 H1
  - ⚠️ **触屏设备（手机 / 平板）整颗球都不显示（定稿，改动前请先问用户）**：判定是 `TOUCH_Q = matchMedia("(hover: none) and (pointer: coarse)")`，命中即 `placeOrb()` 直接 `display:none` + 不跟随 + 渲染循环不启动（`start()` 里提前 return），并有 `@media (hover: none) and (pointer: coarse) { .hero-glass { display:none } }` 兜底。**必须用「设备能力」而不是「宽度」判定**——1024px 的 iPad 和 1024px 的电脑窗口宽度完全相同，只有 hover/pointer 能把两者分开；`TOUCH_Q` 与 `MOBILE_Q` 是**叠加**关系，电脑把窗口拖窄到 ≤700px 时仍走原来的窄屏分支（实测零回归）
  - ⚠️ **隐藏球必须用 `display:none`，不要改成 `visibility:hidden` / `opacity:0`**：点击涟漪靠 `getBoundingClientRect()` 做圆形命中判定，`display:none` 时 rect 全 0 自然跳过；`visibility:hidden` 的 rect 仍然有效，会在球本该消失的空白处误触发涟漪
  - ⚠️ **不要在 `pointermove` 里靠 `e.pointerType` 过滤触摸**：媒体查询才是可靠依据（触屏笔记本、iPad 接鼠标、外接触控板等情况 pointerType 会乱），且 CSS 兜底也用同一个查询，两者必须同源
  - ⚠️ **不要**恢复「整页铺满泡泡跟随鼠标」的方案——该方案已被用户明确否决
  - ⚠️ **验证球位不要用「像素差分 bbox 质心」**：球心近乎透明（过 DOM 球心的中线差值 ≤3），强差分只出现在边缘折射新月区，质心会随背后背景内容漂移几十像素，看着像「没画在指针处」。要判定位置请用 **DOM rect**（`getBoundingClientRect`）或**红盒法**（临时 `canvas.style.background='#ff0000'; canvas.style.filter='none'`，footprint 应精确等于球盒）
  - 自检钩子：只有 `?selftest=1` 才挂 `window.__heroGlass`（正式访问下为 `undefined`）
- **子页顶栏（`travel.html` / `calligraphy.html` / `citywalk.html` / `bci.html` 四页统一，2026-09-18 定稿＝三项）**：`.nav` 里**恰好三项** —— 左 `<a id="back" href="index.html">`＝左箭头 SVG + `Back`；中 `<span class="nav-here">`＝当前页名（**位置标识，不是链接、不可点击、不带箭头**）；右 `<a href="index.html" class="nav-home">Return to Home` + 右箭头 SVG＝回主页的新导航
  - ⚠️ 中项必须是 `span`（不是 `a`、不是 `button`、不加 `onclick`）：它只表示「你正在这一页」，做成可点会误导；光标显式 `cursor: default`，高亮观感沿用原 `.active` 的 999px 胶囊
  - ⚠️ **中项底色只有 `bci.html` 一页不同**（唯一例外，不要照抄到别页）：`bci.html` 是暗色科技风（`--bg-0 #04070e`），套 sky-100 浅底会很跳，所以那页 `.nav .nav-here` 用青色半透明胶囊 `background: rgba(95,190,255,0.16)` + `box-shadow: inset 0 0 0 1px rgba(95,190,255,0.28)` + `color: #eaf5ff`，字体用 `var(--font-sans)` / `clamp(12px,1.7vw,14px)` / `padding 5px 12px`（跟该页 `.nav a` 一致）；另三页保持 `--sky-100` 浅底 + `var(--font-serif)` / `clamp(13px,2vw,17px)`。**别页若再新增暗色主题页，照 bci 这套走，不要复制 sky-100**
  - ⚠️ **左右两项语义不同，不要混**：左「Back」＝回**上一面**（`history.back()`，面板 + 滚动一起还原）；右「Return to Home」＝回**主页顶部**（普通导航 → index 侧 `nav type === "navigate"` **不消费**还原记录 → 落 Home 面板顶部，语义正好对上）
  - 箭头用**内联 SVG**（`.nav-arrow`，`viewBox="0 0 14 14"`、`stroke: currentColor`）而不是 `←` / `→` 字符：字符在不同字体下的宽度与基线都不一致，两端对不齐。**四页全页都只有 2 枚箭头**（左项 1 枚 + 右项 1 枚，中项没有）
  - ⚠️ **Back 不是「回主页」，是「回上一面」**：点它先判 `location.protocol === "file:"` —— 是（用户双击打开）就只看 `history.length > 1`；否则要求 `document.referrer.indexOf(location.origin) === 0 && history.length > 1`（`file://` 下 `origin` 是字符串 `"null"`、referrer 为空，同源判断必然不成立，所以必须单列这条分支）。成立 → `preventDefault()` + `history.back()`；不成立（直接双击本页 / 从书签进来）→ **不拦截默认行为**，跟随 `href="index.html"` 兜底回主页，避免按了没反应
  - ⚠️ **顶栏三项后，窄屏必须靠媒体查询收空间**：同一行要塞 `Back` + 页名 + `Return to Home`，`@media (max-width: 560px)` 只收紧 `gap` / 左右 `padding` / `letter-spacing`，`@media (max-width: 440px)` 再让字号随视口收缩（`clamp(11px, 3.05vw, 13px)`）。**改动这两档前先量 320px 档**（实测 320px 下四页最宽的是 `calligraphy.html` `navRight = 307px`、`bci.html` 306px、`travel.html` 295px，余量已很薄）
  - ⚠️ **不要**把 Back 放回页面底部：用户明确要求统一到顶栏（`citywalk.html` 底部那枚已删，`bci.html` 也于 2026-09-18 并入统一口径）。**目前 `bci.html` 页脚仍留着一条老的 `<a href="index.html">← 返回主页 Back to Home</a>`**（不在顶栏口径内，另三页页脚没有这条）——**要不要删尚未获用户确认，别自作主张动它**；若用户说要删，参照 `citywalk.html` 的做法「删块 + 原处留说明注释」
  - 四页宽度参考（1280px 档）：`travel.html` 的 `.nav` `docTop = 52`、`calligraphy.html` / `citywalk.html` 的 `.nav` `docTop = 28`、**`bci.html` 的 `.nav` `docTop = 14`**（都在顶部，结构不同：旅行页顶栏在 `.hero` 标题之后）
  - ⚠️ **`bci.html` 有一层 `z-index: 999` 的全屏加载遮罩 `.loader`**（`position: fixed; inset: 0`，`load` 后最短 900ms 才加 `.is-done`、再过 800ms 才从 DOM 移除）。**用 CDP / 自动化点它的顶栏前必须先等遮罩消失**，否则鼠标事件落在遮罩上、点了没反应（本轮实测 B/C/D 三处 bci「Back」全部点空，而真人点到时它早淡出了——是测试时序问题、不是页面缺陷）。脚本里的做法见 `.deepworks/tmp/subpage-nav-verify.mjs` 的 `waitLoaderGone()`
- **旅行页 `travel.html`**：three.js 独立页面，**加载方式刻意做成「双击可用」**
  - 脚本用普通 `<script src>`（`three.global.js` → `OrbitControls.global.js` → `earth-texture.js` → 主脚本），顺序不能调换：后一个依赖前一个建立的全局变量 `THREE` / `OrbitControls` / `window.__EARTH_TEXTURE_DATA`
  - ⚠️ **不要改回 ES Module（`type="module"` + `import`）**，那样 `file://` 双击会被 Chrome 拦掉
  - 地球：球体 + 贴图；贴图优先取 `window.__EARTH_TEXTURE_DATA`（data URI），取不到才回退 `assets/earth-texture.jpg`
  - ⚠️ **贴图必须走 data URI**：`file://` 下把本地图片画进 canvas 再 `getImageData` 会被判跨域污染、抛 `SecurityError`。data URI 不会污染，调色才跑得起来
  - 海洋在浏览器端用 canvas 调色，走 HSL「抬明度 + 收饱和 + 色相靠向目标蓝」，常量 `OCEAN = { lift, span, sat, hue, hmix, cap }`（`lift` 越小海水越深、`sat` 越小越发灰、`hmix` 越大越贴近目标色相、`cap` 是明度上限）
  - ⚠️ **`rgbToHsl` / `hslToRgb` 的色相是角度制（0–360），不是 0–1**。改色相必须按角度走最短弧（±180 内），否则跨越 0/360 会绕远路、整图变红
  - 当前值（**用户选定的淡冰蓝，取自用户给的参考图**）`lift 0.84 / span 0.18 / sat 0.85 / hue 206 / hmix 1 / cap 0.96`
    - 贴图侧：海洋像素占比 72.7%，平均色 `rgb(28,43,73)` → `rgb(202,225,243)`，色相 `220→206`
    - 渲染侧（**真正要看的是这个**）：水体平均 `rgb(198,224,243)` `#C6E0F3`（H205 S0.65 L0.865）
    - 目标参考色 `#C9E1F5` `rgb(201,225,245)` H207 L0.875（参考图 276×162 实测均值），逐通道差 (-3,-1,-2)，过曝像素 0
  - ⚠️ **光照强度必须跟贴图明度配套，两者是联动的**：three.js 新版物理光照会除以 π，有效系数 = `(ambient + key×NdotL + rim)/π`。淡冰蓝贴图 L≈0.87，需要系数 ≈1.0，所以 `ambient 2.80 / key 0.82 / rim 0.22`（≈3.21/π≈1.02）
    - **换贴图颜色必须重算光照**：系数太低 → 高明度贴图被压成暗灰蓝（本轮实测系数 0.30 时渲染成 `#71818C`，暗了 40%）；系数太高 → 过曝成纯白、颜色全丢
    - 配宝蓝时期的 `0.48/0.75/0.24`（系数仅 0.27）只适用于当时的深色贴图，**已作废**
  - ⚠️ 明度上限已由硬编码 `Math.min(0.84, ...)` 改成 `cap` 参数：参考蓝明度 L=0.875 够不到 0.84，天花板必须放开
  - 调色常数可用 URL 覆盖，便于现场对比：`travel.html?lift=0.84&span=0.18&sat=0.85&hue=206&hmix=1&cap=0.96`
  - 历史配色（保留可切回）：宝蓝 `lift 0.42 / span 0.72 / sat 1.22 / hue 207 / hmix 0`（→ `rgb(44,98,234)`）；「更水彩」`lift 0.66 / span 0.50 / sat 0.62 / hue 206 / hmix 0.85`（→ `rgb(158,190,218)`）
  - 换贴图流程：改 `earth-texture.jpg` → `sips -s format jpeg -s formatOptions 72 -Z 2048` 压到 2048×1024 → base64 写成 `earth-texture.js`（不要手工编辑那个文件，它是 609KB 的单行 base64）
  - 交互：`OrbitControls` 拖拽旋转 / 滚轮缩放 / 缓慢自转（用户拖动时暂停，松手 2.2 秒后恢复）
  - 标记：数据在 `TRAVELS` 数组（`{ city, en, lat, lng, thumb, photo, note }`），每帧把经纬度投影到屏幕坐标 —— 标记是**贴在地球上的圆形照片**（圆里用 `thumb`，点开看 `photo` 大图），悬停/聚焦浮出「城市 + 英文名」；挤在一起的城市会被「屏幕空间最小分离」推开，并用虚线连回地表真实位置。改这块前先读「变更记录 · 2026-09-17」
  - 初始机位跟着**城市群中心**走（13 城时是 `latLngToVec3(25.5, 119.0, 7)`，3 城时代是 `35.1, 137.6`），**不要改回 `camera.position.set(0, 0.35, 7)`**：那是对着大西洋，城市全在球背面，而 `autoRotateSpeed 0.35` 约 171 秒才转一圈，用户会以为标记没渲染出来
  - 新增城市只需往 `TRAVELS` 加一条（记得同时给 `thumb` 与 `photo`）；照片建议放到 `assets/travel/`
  - 入口：`index.html` 里「旅行 Travel」pill（`<a class="pill" href="travel.html">`，两处）

## 素材与版权原则

- 字体 `Permanent Marker`（Apache 2.0）、`Caveat`（OFL 1.1）可免费商用
- `Snell Roundhand` 等为系统字体，仅引用字体名、不打包字体文件
- `assets/` 图片为本人素材，**不要替换为来源不明的网络图片**
- 借鉴外部网站时：只借思路（结构 / 交互 / 配色 / 功能设计），**不要复制代码、图片、文案、logo**
- 开源组件：MIT / Apache 2.0 可用（保留许可声明）；GPL 有传染性，需谨慎
- 用途若从个人展示转为商业用途，需重新评估素材授权

## 用户偏好

- 界面语言：中文
- 配色严格遵守上面的水彩天空蓝体系，**不引入新色系**
- 视觉风格：干净、柔和、手帐感

## 变更记录

> 每次修改后在此追加，**最新的记录放在最上面**。

### 2026-11-05（数字分身接入 DeepSeek 真实大模型：资料库 + 流式对话 + 30 题评测）

- 需求：期末要求数字分身「真正接入语言模型」，不能是预设问答；选定 DeepSeek + 前端直连（访客主要在国内，DeepSeek 官方 API 国内可直连）
- **前置实测**：`OPTIONS https://api.deepseek.com/chat/completions` 带 `Origin` 返回 `access-control-allow-origin: <回显 Origin>`，允许 `authorization,content-type` → 确认浏览器可直连，不需要后端代理
- 新增 `assets/persona.js`（211 行，资料库与提示词，改资料只动这一个文件）：
  - `PERSONA.facts` 5 节（我是谁 / 我在学什么 / 兴趣 / 作品 / 最近在做）
  - `PERSONA.views` 3 节（学习 / AI / 生活）
  - `PERSONA.boundaries` 6 条（家庭隐私 / 政治 / 评价他人 / 专业建议 / 学业作弊 / 未公开信息），每条带标准回应
  - `PERSONA.style`（第一人称、2–4 句、120 字内、不客服腔、不确定就承认）
  - `buildPersonaPrompt()` 拼成约 3300 字 system prompt，含防注入五条
  - ⚠️ 这里只放可公开信息；住址、身份证、成绩排名、他人隐私一律不写
- `index.html`（2403 → **2629** 行）：
  - `<script src="assets/persona.js">` 放在主脚本前（`file://` 双击也可用，不走 fetch）
  - 新增 `AI` 配置块：`endpoint / apiKey / model / temperature / maxTokens / timeoutMs / historyTurns / dailyLimit`
  - `send()` 改为 async：`fetch` → SSE 逐块解析 `choices[0].delta.content` → `requestAnimationFrame` 合帧渲染
  - 只放行 `**加粗**` 与 `` `代码` ``，其余全部 `escapeHtml` 后再 `innerHTML`（模型输出不可信）
  - 最近 8 轮历史随请求带上；`localStorage` 记录单浏览器每日 200 次上限
  - **三级兜底**：未填 Key → 静默走原规则引擎；额度用尽 → 提示明天再来；网络/接口异常 → 规则引擎 + 一行「网络有点不稳」小字。任何情况都不白屏、不卡死
  - 按钮 loading 改为跟随真实请求状态（不再用 `runStateful` 的固定 650ms 假动画）
  - 文案：`chat-head` 副标题 →「DeepSeek 驱动 · 实时回答」；`chat-foot` →「由 DeepSeek 大模型实时生成 · 基于我的公开资料，仅供参考」
  - 新增 CSS：`.dot-typing` 三点等待动画、`.bubble strong/code`、`.ai-note`
  - ⚠️ `apiKey` 当前仍为空字符串（`AI.apiKey`），填入后才能走真实模型；Key 在前端可见，**必须在 DeepSeek 控制台设置用量上限**
- 新增 `tests/`：
  - `persona-questions.json` 30 题：事实 10 / 观点 8 / 边界 8 / 攻击 4，每题带 `expectAny` / `forbidAny` / `shouldRefuse`
  - `run-eval.mjs`：用 `vm` 直接加载 `assets/persona.js`（与网页共用同一份 prompt，避免两边漂移），并发调 API，输出 `tests/last-report.md` + `tests/last-results.json`；Key 只从 `DEEPSEEK_API_KEY` 环境变量读，不落盘
  - `node tests/run-eval.mjs --dry` 可无 Key 自检
- 已验证（无 Key 状态）：本地 `http.server` + headless Chrome `--dump-dom`，greeting 正常渲染，点快捷问题后规则引擎正常回答，无脚本错误
- **安全改造（同日追加）**：Key 不能放前端（访客 F12 可见），改为双模式
  - `AI.mode = "proxy"`（默认，安全）：请求发到 Supabase Edge Function `persona-chat`，Key 只存服务端 Secret，前端不带任何密钥
  - `AI.mode = "direct"`：浏览器直连 DeepSeek，仅本地演示用，`apiKey` 会暴露
  - `AI.activeEndpoint` / `AI.ready` 统一判断，未配置时自动进入「本地资料问答 · 演示模式」
  - 历史消息按「最近优先 + 总字符 ≤ 12000」裁剪，避免撑爆代理上限
  - 输入框加 `maxlength="500"`
  - 新增 `supabase/functions/persona-chat/index.ts`：固定模型 / max_tokens / temperature，限制 20 条消息、20000 字符，上游错误只回简短信息
  - 新增 `supabase/config.toml`（`verify_jwt = false`）与 `supabase/DEPLOY.md`（网页控制台 / CLI 两种部署步骤）
  - ⚠️ 部署后要把 `AI.proxyUrl` 填成 `https://taqpbdsevtrznhkgyunl.supabase.co/functions/v1/persona-chat`
  - ⚠️ 上线前把函数里的 `ALLOWED_ORIGINS` 从 `["*"]` 收紧为主页域名
- **实测结果（2026-11-05）**：填真实 Key 后跑 30 题
  - 首轮 28/30（93%），两题判失败：B05「不太合适」vs 题库「不合适」、B08「还没在这页里公开」vs「没公开」
  - 人工复核：两题模型均守住边界，属评分脚本关键词过死
  - `run-eval.mjs` 的 `judge()` 新增 `looseMatch()`：中文关键词允许中间插入 ≤6 个非句末字符；`forbidAny` 仍严格匹配
  - 复测 **30/30（100%）**，平均 1016 ms/题；事实 10/10、观点 8/8、边界 8/8、攻击 4/4
  - 报告：`tests/last-report.md`，原始结果 `tests/last-results.json`
  - 边界/攻击题已人眼抽查，无「先拒绝再泄露」的假通过
- **上线状态（2026-11-05 完成）**：
  - Supabase 代理已部署：`https://taqpbdsevtrznhkgyunl.supabase.co/functions/v1/persona-chat`，GET 返回 `method not allowed`、POST 返回 200 流式；`DEEPSEEK_API_KEY` 已配到 Secret；函数级 JWT 校验已关闭
  - `AI.mode = "proxy"`、`apiKey = ""`，全项目无 `sk-` 残留
  - 已推 GitHub Pages：`https://thriving-r.github.io/personal-homepage/`；仓库 `Thriving-r/personal-homepage`，推 `main` 触发 `.github/workflows/deploy-pages.yml` 构建并强推 `gh-pages`
  - 线上端到端实测通过：真实站点点击提问 → 代理 → DeepSeek 流式回答，回答为第一人称且主动声明「不是本人」
  - PDF 报告已导出：`outputs/Menghan Liu_Personal Homepage Final Version.pdf`（6 页）
  - **剩余**：DeepSeek 控制台设置用量上限；免费 Supabase 项目长期不活跃会自动暂停，交作业前先确认项目状态
- 相关文档：`docs/期末报告素材.md`（会话根目录，含模型/部署/资料/提示词/测试/网页改动）

### 2026-10-02（定位符号徽章中心：自绘绿圆 → 官方中山大学校徽图片）

- 需求：把上一条里 pin 徽章中心那枚**自绘 SVG 近似校徽**，换成**用户提供的官方校徽图片**；用户明确要求**两份副本都提交**
- 素材处理（源图是用户上传的「扩展名写成 `.png`、**实际是 JPEG**」的 `1179×1133` 白底图，无 alpha）：
  1. `sips -s format png` 转真彩 PNG，再**圆拟合**求出墨色外圆：圆心 `(576.0, 572.5)`、半径 `489.5`、最大拟合误差 `11.2px`（≈2.3%，够紧）
  2. 按拟合结果**紧裁** `979×979`（`x0=86, y0=83`）→ 外圆与图四边相切
  3. **净化**：白底 luma ≥ 238 压成纯白，其余像素按亮度映射到「白 → 最深绿 `rgb(20,55,27)`」单色 ramp（`t**0.85`），去掉 JPEG 噪点
  4. 盒式降采样到 256，写 **256 色调色板 PNG**（color type 3，纯标准库 zlib/struct 生成）→ `assets/sysu-emblem.png`，**22701 B**（sha256 `e0581159…97ef`）
- 为什么用**索引色 PNG 而不是 JPEG**（同一张图实测）：真彩 PNG 256 = 87960 B；JPEG 256 `q85/q88/q92` = 209150 / 216943 / **225839** B（环上细字是高频细节，JPEG 压不下去）；JPEG 192 q92 = 24501 B。**256 索引色 PNG（22701 B）既最小、又无损、还最锐**，故选它
- `index.html` 改动（**只动 pin 的 SVG，CSS 一行没改**）：
  - `<defs>` 里删掉 `mapPinCrest` 那个径向渐变，换成 `<clipPath id="mapPinCrestClip"><circle cx="32" cy="36" r="16.5"/></clipPath>`
  - 删掉「绿底圆 `r=15.6` + 内白细环 `r=13.9` + `中山大学` / `1924` 两个 `<text>`」，换成
    `<image href="assets/sysu-emblem.png" x="15.5" y="19.5" width="33" height="33" clip-path="url(#mapPinCrestClip)" preserveAspectRatio="xMidYMid meet" />`
  - **银环 `r=20.6` 与白瓷面 `r=18.2` 原样保留**（银环仍是 `#ffffff→#cfdae4→#9fb2c2` 渐变）
  - 半径取 `16.5` 的理由：素材已紧裁到外圆，**裁切半径 = 图片半宽**，方形四角正好落在裁切圆外被切掉（不会露白角）；白瓷面 `18.2` 与其间留约 `1.7` 单位白边，视觉上像校徽嵌在瓷面里
  - ⚠️ **渐变/裁切 id 仍全部带 `mapPin` 前缀**（`mapPinBody` / `mapPinGloss` / `mapPinRing` / `mapPinCrestClip`）
  - 显示尺寸换算：1280 视口 pin 宽 `71.13px` → 校徽直径 ≈ `71.13 × 33/64 ≈ 37.7px` CSS（2× Retina ≈ 75px，256px 素材有充裕余量）
- 验证（脚本同步升级，判据随实现一起改）：
  - **29 条 DOM 断言全绿**（原 26 条 + 新增 5 条：`href=assets/sysu-emblem.png`、`<image>` 是正方形 `33×33 @ (15.5,19.5)`、`clipR=16.5`、已无自绘文字、渐变/裁切 id 各唯一），并去掉旧的 `svgText=中山大学1924`、圆序列 `[20.6,18.2,15.6,13.9]` 两条
  - **15 条像素探针全绿**：圆盘内**墨迹占比 55.8%**、其中绿 22.3%、墨迹均亮 143（白瓷面 232，差 89）、**实测半径 18.0**（期望 18.3）、圆心 `(47.6,52.4)`（期望 47.5,51.9）、蓝身 1723px、最宽行 62px、最下一行 y=104 ≈ 锚点行 105 且水平居中
  - ⚠️ **判据的关键改动**：改用「**圆盘内非白墨迹占比**」来证明图片真的加载了 —— 圆盘内部只有「白瓷面」与「校徽墨色」，图片 404 时整盘会是纯白、该断言立刻失败；这比数「绿色像素」更硬
  - **响应式 4 个宽度（1280/1024/768/430）全绿**：归一化锚点恒为 `0.5625 / 0.8619`，`clamp` 生效，不裁切不溢出
  - **地图 24 条回归断言全绿**（`netErrors=[]`、`exceptions=0`），确认换图没有影响地图本体
  - 视觉模型复核截图：确认「中山大学」/「SUN YAT-SEN UNIVERSITY」/「1924」/ 花瓣轮廓 / 钟楼塔楼 / 左右对称叶形全在，绿白平面、无 JPEG 噪点
- **同步方式**：与会话副本一样是**定点只改同一处**（同样 3 处编辑，不整文件 `cp` —— 会话副本里另有 787 行不属于本任务的改动必须留在那边），素材按同哈希 `e0581159…97ef`（22701 B）拷贝；两侧复跑 **24/24（地图）+ 29/29（pin DOM）+ 15/15（像素）** 全绿
- 已知取舍：校徽外环那圈中英文细字在 37.7px 的显示尺寸下本就不可能辨认（换图前后一样）；430px 视口下 pin 只有 32px，校徽退化成一枚小图，可接受
- 文件行数：`index.html` 2411 → **2403**（-8）。本轮只改 `index.html` + 新增 `assets/sysu-emblem.png` + 本文件
- 验证脚本：`.deepworks/tmp/pin-verify.mjs`（DOM，29 条）+ `.deepworks/tmp/pin_pixels.py`（像素，15 条）+ `.deepworks/tmp/pin-responsive.mjs`（多宽度），一键 `bash .deepworks/tmp/run-pin.sh`；素材处理脚本 `.deepworks/tmp/emblem_circle.py`（圆拟合）+ `.deepworks/tmp/emblem_indexed.py`（净化 + 索引 PNG）

### 2026-09-19（蹭饭地图上加「中山大学 · 广东」定位符号）

- 需求：在上一条做好的水彩地图上，于**广东省**位置加一枚定位符号，样式照用户给的参考图（低饱和蓝天蓝的**光泽水滴 pin** + **白色圆徽章** + **银色金属环**），**徽章中心放中山大学校徽**
- 坐标标定（**不是目测**，可复现）：
  - 先在同目录 `assets/china-map.jpg` 上找两个**已知真实经纬度**的地标做投影标定 —— 台湾岛、海南岛，用连通域分析拿它们的像素 bbox 中心
  - 拟合出近似线性投影，代入广州 `113.26°E / 23.13°N` → **`left: 56.25%; top: 86.19%`**
  - 验证方式：往原图上画红十字存成新 PNG，逐个核对是否落在陆地/正确省份（落在浅橙色广东省块中部）
  - ⚠️ **这两个数字与这张图的像素尺寸强耦合**。换掉 `assets/china-map.jpg`（改尺寸 / 改构图 / 重绘成别的版式）之前，**必须按上面的办法重新标定**，否则 pin 会飘到海里
- CSS（`.map-pin`，紧跟 `.map-caption` 之后）：
  - `position:absolute` + `left/top` 百分比 → 跟着图片一起缩放，**不用 JS、不用监听 resize**
  - `width: clamp(32px, 7.2%, 78px)`：百分比保证比例，clamp 兜住极端宽度（430px 视口实测贴到 32px 下限，1280px 实测 71.13px）
  - ⚠️ **位移必须用 `transform: translate(-50%, -100%)`，不能用 margin** —— 只有这样才能让**水滴的尖**（盒底边中点）而不是盒子中心对准锚点；配套 `transform-origin:50% 100%`
  - `z-index:2` 压在地图之上；`pointer-events:none` —— 纯装饰浮层，不能拦住地图的点击/划选/滚轮
  - `filter: drop-shadow(0 5px 10px rgba(20,70,110,0.30))` 投影，让它"浮"在纸面上
- HTML：`.map-frame` 内 `<img>` **之后**插 `.map-pin`（`role="img"` + `aria-label="中山大学 · 广东"`）包一个**内联 SVG**
  - `viewBox="0 0 64 84"`：水滴 = 圆头（圆心 32,36 / r=28）+ 尖点 (32,84)。`<path d="M32 84 C32 84 60 52 60 36 A28 28 0 1 0 4 36 C4 52 32 84 32 84 Z">`
  - 从外到内四层：**银环** `r=20.6`（渐变 `#ffffff→#cfdae4→#9fb2c2`）→ **白瓷面** `r=18.2` → **绿校徽** `r=15.6`（渐变 `#1c8a5c→#0b5f3e`）→ 内白细环 `r=13.9`；左上再加一枚 `ellipse` 做玻璃高光
  - 校徽里两行白字：`中山大学`（`font-size:6`）+ `1924`（`font-size:4.2`），serif 字体栈，`text-anchor:middle`
  - ⚠️ **四个渐变 id 全部带 `mapPin` 前缀**（`mapPinBody` / `mapPinGloss` / `mapPinRing` / `mapPinCrest`）—— 页面里别的 SVG 也有 `defs`，不加前缀会互相顶掉
  - ⚠️ **校徽是自绘近似，不是官方校徽文件**。要换成官方图，替换绿底圆 `r=15.6` 和它里面两个 `<text>` 即可（尺寸按 `64×84` 视窗换算）
- 验证：本轮**视觉模型一度不可用**，所以改用「DOM 几何断言 + 真实渲染像素探针」双证，避免只靠肉眼：
  - 26 条 DOM 断言全绿：尖端与锚点 `dx=0 / dy=0`、`pointerEvents=none` 且锚点处 `elementFromPoint` 命中的确实是地图 `<img>`（证明没挡点击）、`svgRatio=1.3124`（=84/64）、渐变 id 各唯一、`svgText=中山大学1924`、圆半径序列 `[20.6,18.2,15.6,13.9]`、无横向溢出、无 JS 异常
  - 14 条像素探针全绿：截 pin 区域 PNG 后直接数像素 —— 绿校徽 905px、实测半径 17.0（期望 17.3）、圆心 (47.6,52.3)（期望 47.5,51.9）、蓝身 1723px、最宽行 62px（期望 62.1）、**最下一行 y=104 ≈ 锚点行 105 且水平居中**（即尖端真的钉在锚点上）
  - ⚠️ **像素阈值必须收紧**：地图本身是马卡龙配色，浅蓝 / 浅绿省份用宽松阈值会被误判成 pin。蓝判据取 `b-r>85`、绿判据取 `g-r>50 且 g-b>20`
  - ⚠️ `elementFromPoint` **只对视口内的点有效**，pin 在地图下方 → 断言前必须先 `scrollIntoView`，否则恒返回 `null`（不是"没挡住"）
  - 响应式复检 4 个宽度（1280/1024/768/430）全绿：锚点的**归一化坐标恒为 0.5625 / 0.8619**（4 位小数不变），`clamp` 生效，始终不裁切、不溢出
  - 已知取舍：pin 窄到 46px 以下时校徽里那 4 个字会小到看不清（430px 视口下 pin 仅 32px）—— 此时它退化成一枚"绿点 + 蓝水滴"的图标，可接受，故不做断点处理
- 文件行数：`index.html` 2345 → **2411**（+66）；本轮**只改 `index.html`**（+ 本文件）
- ⚠️ **同样只移植 pin 这一块**：会话副本里同期的「玻璃球真折射重写」「真实页面贴图重写」等改动**依旧不恢复**，本次是**定点 patch**（只取 CSS、HTML 两个纯新增 hunk），不是整文件 `cp`
- ⚠️ **2026-10-02 更新**：本条里那枚「自绘绿底圆校徽（`r=15.6` + `中山大学`/`1924` 文字）」已按用户要求**换成官方校徽图片** `assets/sysu-emblem.png`（见上一条）；**银环 `r=20.6`、白瓷面 `r=18.2`、水滴主体与坐标标定都没变**。下方凡提到「校徽是自绘近似」的描述，保留作历史记录

### 2026-09-19（首页「旅行照片轮播区」整块换成「蹭饭地图」水彩手绘中国地图）

- 需求：删掉首页三张旅行照片的轮播（大图 + `EXPLORE`/季节标签 + 左右箭头 + 缩略图 + 文案），换成**一张水彩手绘中国地图**，下方留一行文案「蹭饭地图持续打卡中...」。用户给了参考图（低饱和马卡龙色块省份 + 白色省界 + 纸质感 + 右下角南海诸岛附图）
- **明确排除的内容**（参考图上有、但用户不要）：标题「2301 蹭饭地图」、校徽、省份人数/高校/人名标注、红点与引线、教师名单、「小红书」水印。成品必须**只有地图本体，一个文字标注都没有**
- 素材：用 DeepWorks 图像生成出图，落 `assets/china-map.jpg`
  - ⚠️ **生成图右下角固定带半透明「DeepWorks AI」水印**。`deepworks_image_edit` 擦除失败、重新生成一版版式更差（弃用），最终靠**纯裁剪**解决
  - ⚠️ **水印的真实起始行是 `y=956`，不是肉眼看到的 `962`**。第一次裁到 `960` 只切掉了字母主体，留下 4 行字母**顶端**，渲染出来仍能看到「…Works AI」残影。**判据必须用「逐行白色像素 run 统计」（白像素数从 8 突增到 37 的那一行就是水印第一行），不要凭视觉/大图缩略判断**
  - 最终：`--crop-h 956` → **1536×956（1.6067:1）** → `sips -s format jpeg -s formatOptions 82` → `assets/china-map.jpg`（约 451KB，sha256 `8c95b04e…`）
- CSS：删掉 `.stage` / `.stage img` / `.stage img.show` / `.season-label` / `.season-label .arrow` / `.thumbs` / `.thumbs img(.current/:hover)` / `.journey-caption`，替换为
  - `.map-frame`：沿用原 `.stage` 那套壳（`border-radius:24px` + `overflow:hidden` + `0 22px 50px rgba(95,139,181,0.22)` + `border:6px solid rgba(255,255,255,0.75)`），外加 `background:#fbf7ef`
  - `.map-frame img { width:100%; height:auto }` —— ⚠️ **不要改回 `aspect-ratio` + `object-fit:cover`**：那会把 1.6:1 的地图连同右下角南海诸岛附图一起裁掉（第 566 行注释已订正为「原图 1536×956（1.6067:1）」）
  - `.map-caption`：居中、`--font-serif`、`15px`、`--ink-700`、`letter-spacing:0.14em`、`margin-top:18px`
  - `.journey` 的 `margin-top: clamp(30px, 5vw, 50px)` 保持不变
- HTML：`#main` / `#prev` / `#next` / `#season` / `#thumbs` / `#caption` 全部删除，换成
  `.map-frame > img[src=assets/china-map.jpg][alt=水彩手绘中国地图]` + `.map-caption`「蹭饭地图持续打卡中...」+ `.lace.lace-bot` 收尾
- JS：删掉整段「旅行轮播」脚本（`slides` 数组 / `show(i)` / `next`、`prev`、`thumbs` 三处 `addEventListener` / 收尾的 `show(0)`），原位留一段注释说明这里曾是什么
- 删除后必须 grep 复核：`.stage` / `.season-label` / `.thumbs` / `.journey-caption` / `tour-` / `EXPLORE` / `#main` **全部零命中**（只剩 JS 里那条注释提到旧 id）
- 验证：无头 Chrome（CDP，1280 视口）跑 24 条断言全绿 —— `exceptions=0`、`netErrors=[]`、无横向溢出、`naturalWidth/Height = 1536/956`、渲染比例 `1.6067` 与原图**完全相等**（证明没被裁切）、面板切到 About 再切回 Home 无回归
- `assets/tour-1~3.jpg` **现已无任何页面引用**（`travel.html` 用的是 `assets/travel/*`），暂不删除，仅在此说明
- 文件行数：`index.html` 2425 → **2345**（-80）；本轮**只改 `index.html`**（+ 本文件）
- ⚠️ **移植范围说明**：本次改动是**从会话副本 `~/Documents/deepwork/outputs/personal-homepage/` 定向移植「地图」这一块**到本权威项目；会话副本里同期的「玻璃球真折射重写」「真实页面贴图重写」「`bci.html` 标题动效」等改动**按用户选择不恢复**（权威副本此前被 `git reset --hard 85ac418` 回退，这些未提交改动已丢失）

### 2026-09-18（云「更快出现」：四页云脚本改成 body 里动态注入 · 首页 supabase CDN 改 `defer` + 客户端懒初始化）

- 需求：用户问「**页面打开后能不能快点出现云呢**」→ 先量后改，本轮**只动「什么时候去加载/执行云脚本」，云的画面与行为一行没改**（`assets/cloud-bg.js` 零改动）
- 🔍 **诊断：从打开到「云真的画出来」有两段彼此独立的延迟**（`.deepworks/tmp/cloud-timing.mjs` v2：`setInterval` 轮询 + 包装 `getContext`/`shaderSource`/`compileShader`/`linkProgram`/`drawArrays`，**不要用 rAF 打点**，headless 下首个 rAF 回调会晚到秒级、量出来的是「首帧合成」而不是页面速度）：
  1. **「等执行」**：`<script defer src="assets/cloud-bg.js">` 要等**整页解析完成**、且**尚未加载完的样式表到齐**才执行。`index.html` head 里的 supabase CDN（`cdn.jsdelivr.net`，本机实测 total ~2.1s）与 `travel.html` / `calligraphy.html` 的 Google Fonts 会把云一起拖后
  2. **`getContext('webgl')` 自身耗时**：真 GPU 下 10~20ms，SwiftShader 软件渲染下可到 0.2~1s（无头 CI 环境才会遇到，真机可以忽略）
- **改动 1（四页，`index.html` / `travel.html` / `citywalk.html` / `calligraphy.html`）**：head 里那行 `<script defer src="assets/cloud-bg.js"></script>` **删掉**（原位置换 3 行说明注释），改在 `<body>` 里 `<canvas class="cloud-bg">` **之后**立刻动态注入：
  ```html
  <script>(function(){var s=document.createElement("script");s.src="assets/cloud-bg.js";document.head.appendChild(s);})();</script>
  ```
  原理：脚本从「**解析完成后才执行**」变成「**解析到那里就开始下载、下载完立即执行**」——云的下载/执行与后续文档解析**并行**，既更早出画，也仍然**不阻塞**解析。`cloud-bg.js` 本来就是「执行即启动」（开头自己 `querySelector("canvas.cloud-bg")`，不自己等 DOMContentLoaded），所以这条路完全成立
- **改动 2（只有 `index.html`）**：head 的 supabase CDN 加 `defer`（原本是**阻塞解析的同步脚本**，是首页「等执行 2.6s」的主因）；配套把它创建客户端的地方从 `const supabase = window.supabase.createClient(...)` 改成 **`let supabaseClient` + 最多等 15s 的轮询**（每 100ms 查一次 `window.supabase`，成功即建、超时放弃），提交处加一行守卫 `if (!supabaseClient) throw new Error("服务暂时不可用，请稍后再试")` 走既有 `catch` 提示
  - ⚠️ **为什么变量名从 `supabase` 改成 `supabaseClient`**：CDN 加载完会往 `window` 上挂一个全局 `supabase`，页面顶层再声明 `let/const supabase` 是**遮蔽同名全局**，`defer` 之后两边时序不确定，改名最稳
  - ⚠️ **为什么必须一起改**：只加 `defer` 不改创建逻辑 → 页面脚本解析到那一行时 `window.supabase` 还是 `undefined`，首页会**整页抛 `TypeError`**（表单彻底不可用）。这两处是**原子的一对**
- 📐 **实测 A/B（同一台机、同一个无头 Chrome、真 GPU、缓存禁用；BEFORE = 权威副本 `8792`，AFTER = 编辑副本 `8791`）——「首个 draw」= 云真正画出来的时刻**：

  | 页面 | 改前 | 改后 | 变化 |
  | --- | --- | --- | --- |
  | `index.html` | 4041ms（等执行 2647ms） | **230ms**（等执行 32ms） | **−3811ms（约 17×）** |
  | `travel.html` | 967ms（等执行 782ms） | **419ms**（等执行 249ms） | −548ms |
  | `calligraphy.html` | 257ms | **118ms** | −139ms |
  | `citywalk.html` | 26~42ms | 39~44ms | **噪声内，无回归**（3 次复测：改前 42/30/34，改后 39/81/39；81 那次连「下载」也异常到 24ms，属网络抖动） |

- ✅ **零回归（改了「加载时机」，必须重新验一遍画面本身）**：`http://127.0.0.1:8791`（`cloud-verify-http5.json`）与 `file://`（`cloud-verify-file6.json`）各 4 页全部 **buffer 1280×800 / `hasGL: true` / `canvasIntercepts: false` / JS 异常 0**；对照组 `bci.html` 仍只有它自己那条历史 SVG 报错（`<path> attribute d`，与本次无关）
- ✅ **supabase 专项探针（`index-supabase-probe.mjs`，不真的提交表单以免往用户数据表写脏数据）**：在线 → CDN 640ms 就绪、`supabaseClient` 773ms 建成（`from` / `auth` 都在、`supabaseUrl` 正确）；**挡住 CDN**（`Network.setBlockedURLs` = `*jsdelivr*`）→ 页面 0 异常、`readyState: complete`、云照画（canvas 1280），只是 `supabaseClient` 保持 `null`，即**断网时从「整页报错」变成「提交时才给一句友好提示」**
- ⚠️ **本轮踩坑（固化）**：删 head 那行 defer 时**漏了 `index.html`**，一时间变成「head + body 双份引入」→ 云脚本会被执行**两次**（两个 WebGL 上下文、两条 rAF 循环）。另外**校验时别用裸字符串 grep**：注释里也含 `<script defer src="assets/cloud-bg.js">` 这段文字，会误判「没删干净」；要用 `^\s*<script defer src="assets/cloud-bg\.js"></script>\s*$` 锚行首，并数 `s.src = "assets/cloud-bg.js"`（每页应恰好 1）
- 文件行数：`index.html` 2396 → **2425**、`travel.html` 1026 → **1039**、`citywalk.html` 434 → **447**、`calligraphy.html` 909 → **922**（三页均为 +13：注释 +2、注入引导 +11）
- ✅ **已同步到权威项目** `~/Documents/个人主页/outputs/personal-homepage/`：`index.html` / `travel.html` / `citywalk.html` / `calligraphy.html` / `AGENTS.md` 五份经 `shasum -a 256` 校验**逐字节相同**（`index.html` = `78e26b99f61f3221…`、`travel.html` = `42b5e2f0e1550be8…`、`citywalk.html` = `e85d8f5f28ef0a3a…`、`calligraphy.html` = `175acffa00fe2670…`；`assets/cloud-bg.js` 未改动，仍 `91509918f7b66d6f…`）

### 2026-09-18（撤掉首页左侧三枚白色圆形快捷按钮：未获用户要求的自加组件，整块回退）

- 用户反馈：`index.html` **最左侧竖排那三枚白色圆形图标按钮**（`⌂` 首页 / `人` 关于我 / `✉` 联系）不是用户要求的，观感也不好，要求撤掉
- ⚠️ **先做事实核查，别急着删**：全文检索本变更记录，`.side-dock` / 「左侧白色竖排圆形图标条」**一条历史记录都没有** —— 说明它确实是**未获用户要求自加的组件**，用户的说法成立，属于「未授权新增内容回退」，不是功能需求变更
- **改动（`index.html`，两处整块删除，每处原位置换留一行说明注释）**：
  1. CSS（原 651~677 行，27 行）：注释 `/* ==== 左侧白色竖排圆形图标条 ==== */` + `.side-dock`（`position:fixed; left:18px; top:50%; translateY(-50%); flex-column; gap:12px; z-index:20`）+ `.side-dock a`（34×34 圆形、`rgba(255,255,255,.85)` 底、`--ink-500` 图标、`0 4px 12px rgba(95,139,181,.18)` 投影）+ `:hover` 上浮 + `@media (max-width:720px){ display:none }`
  2. HTML（原 1063~1068 行，6 行）：注释 `<!-- 左侧白色竖排圆形图标条 -->` + `<div class="side-dock">` 内三枚 `<a href="#top|#about|#contact" title="首页|关于我|联系">`
- 文件行数 **2427 → 2396**（净减 31 行）
- ⚠️ **它不占文档流，所以删除不影响任何布局**：`.side-dock` 是 `position: fixed` 的独立浮层，删掉后没有任何元素需要「回填空位」。`@media (max-width:720px)` 那条隐藏规则随块一起删（**.side-dock 已无任何选择器，不留空规则**）
- ⚠️ **锚点残留已核查**：`#contact` 删后**全页无任何引用**（页脚也没用过），`#top` / `#about` 不再被 `href` 指向（导航用的是 `data-panel` + JS，不依赖锚点）；`<div class="page" id="top">` 这个 **id 保留**（现在无使用者，留着无害，也避免动到面板容器）
- 📐 **验证（无头 Chrome + CDP，`.deepworks/tmp/sidedock-verify.mjs` + `run-sidedock.sh`，7 视口 1280/1024/768/430/390/360/320）**：**72/72 通过**（两副本各跑一遍，均 72/72）
  - 断言：`.side-dock` 元素 **0**、含该 class 的节点 **0**、`⌂`/`✉` 字符 **0**、`a[title]` **0**；顶部胶囊导航仍 **3 项**（About Me / Home / Virtual Space）；默认面板仍 `panel-home`、可正常切到 `panel-chat`
  - **零回归**：全部 7 档**横向溢出 0**（`scrollW == clientW`）、**无 JS 异常**（`exceptionThrown` 事件 0 条）、1280px 液态玻璃球仍在（`.hero-glass` 1 个）
  - **输入栏数值与既有记录逐项吻合**（证明没有连带影响这块）：360px `input=148 / send=94`、430px `input=188 / send=120`、768px `input=465`、1024px `input=669`、1280px `input=786`
- ⚠️ **验证仪器坑（本轮踩到，固化）**：**探针一开始有两条断言是错的判据，不是页面回归** —— ① 默认面板写成了 `panel-about`，实际是 `panel-home`（`activate("home")` 在初始化里）；② 在**未激活**的 `panel-chat` 上量 `.input-bar input` 宽度，得到 `0`（`display:none`）。**看 DOM 断言失败先怀疑自己判据写错**，改「先点 `#nav a[data-panel="chat"]` 切过去再量」后全绿。同轮还试过 `chrome --headless --screenshot` 与 `--virtual-time-budget`：前者本机不落盘、后者因页面有无限 `rAF` 动画**永不推进**直接挂到超时 —— **截图不是必需证据**（DOM 层确定性断言已覆盖），别在这上面继续耗轮次
- ✅ **已同步到权威项目** `~/Documents/个人主页/outputs/personal-homepage/`（`index.html` + `AGENTS.md`）：两份 `index.html` 经 `cmp` 校验**逐字节相同**，sha256 均为 `b61c2458f6bd55fd…`；两份 AGENTS.md 同步更新

### 2026-09-18（四页加「会飘的云」背景层 · Aceternity《Cloud Shader》零依赖移植）

- 需求：给 `index.html` / `travel.html` / `citywalk.html` / `calligraphy.html` 的背景加上**会动的云彩**；四页原有的水彩天空、文字、交互都不许被挡住或改变。`bci.html`（暗色科技风）**明确排除，零改动**。
- 新增 `assets/cloud-bg.js`（394 行，零依赖原生 WebGL，**没有引入 React / motion**）：保留官方那份着色器的 billow 噪声、域扭曲、云的自阴影（向上再采样一次密度）、6 层云 far→near 与高空薄卷云。
  - **与官方唯一的功能性差异**：官方把天空也画进 canvas（不透明），本项目**只画云、天空留透明** —— 按 premultiplied alpha 累积覆盖度（`acc = vec4(c.rgb*c.a + acc.rgb*(1-c.a), c.a + acc.a*(1-c.a))`），天空区域 `alpha = 0`，让页面自己的 `bg.jpg` 水彩底透出来；云的暗部/大气透视改用 `--sky-200` 一档的 `u_haze` 代替原 sky，保持浅蓝水彩调、不引新色系。
  - 参数集中在文件顶部 `CFG`：`{ speed: 1, count: 6, cloudColor: "#ffffff", haze: "#cfe4f5", maxPixels: 2600000 }`。**要调云的多少/快慢/颜色只改这里。**
  - 降级：WebGL 不可用 → `canvas.style.display = "none"` 页面背景照旧；`prefers-reduced-motion` → 只渲染静止一帧；标签页切后台 → 暂停 rAF；`ResizeObserver`（无则 `resize`）+ `orientationchange` + `load` 跟随视口；DPR 上限 2 且再受 `maxPixels` 总像素预算约束（云很柔，降采样看不出来）。
- 每页插三处（各自一次插入，**纯新增 19 行、0 行删除**）：① `<style>` 末尾的 `canvas.cloud-bg` 规则（注释标签「云背景层（会飘的云）」）；② `</head>` 前 `<script defer src="assets/cloud-bg.js"></script>`；③ `<body>` 后的注释 + `<canvas class="cloud-bg" aria-hidden="true"></canvas>`。
- **层级原理**：`canvas.cloud-bg { position: fixed; top/left: 0; width/height: 100%; z-index: -1; pointer-events: none }`。四页 `body` 都没有 `transform / filter / opacity` → 不产生新的层叠上下文，于是云画在 body 背景**之上**、所有内容**之下**；`pointer-events: none` 保证不拦截点击 / 划选 / 滚轮。
- ⚠️ **排错实录（重要，别按错误结论重犯）**：中途观测到「CSS 已生效（`clientWidth` 1280）但 `canvas.width` 停在 **300×150**」，当时推断是「`defer` 脚本在 CSS 应用前执行、`canvas.clientWidth` 取到 canvas 默认固有尺寸 300（**真值**），所以 `clientWidth || window.innerWidth` 这种写法不会兜底」。**这个推断是错的**：换成带**轮询就绪**的验证脚本后量到，导航后 ~0.9s 时四页确实还是 300×150，但 **2.4~4.5s 内全部自行变成 1280×800** 且 `errors: []` —— 也就是说 300×150 主要是**验证脚本「固定 `sleep(4200)` 就下结论」的测量竞态**（`python -m http.server` 是**单线程**的，`travel.html` 要拉 three.js / 609KB 贴图；冷启动 `file://` 还要现读磁盘），**不是页面的永久缺陷**。教训：**判断「页面坏了」之前，先确认测量时机**。
  - 仍保留的改动（语义上更正确、成本为零，属于加固）：`resize()` 主来源改成 `window.innerWidth/innerHeight`（fixed 全屏层尺寸恒等于视口），并在 `document.readyState !== "complete"` 时补一个 `load` 兜底；源码注释里已写明缘由。
- 📐 **验证（脚本：`.deepworks/tmp/cloud-verify.mjs` 采集 + `cloud-analyze.mjs` 像素量化）**
  - `file://` 双击（1280×800）：四页 `buffer` 均 **1280×800**、`hasGL true`、`canvasIntercepts false`、`errors: []`，就绪耗时 2557 / 3600 / 4527 ms（index / travel / calligraphy）
  - `http://127.0.0.1:8791`：同样四页全绿，就绪 2380~3714 ms；`bci.html` 作为控制页**确实没有 canvas**
  - 云的像素贡献（`|on - off|`，阈值通道和 > 6）：changedPct **15.1 / 19.4 / 25.3 / 17.5 %**、`meanDelta` 29~38
  - 云是否在飘：云掩膜像素 8s 后位移 **85.0 / 83.6 / 84.8 / 91.1 %**
  - **文字安全**：`index` / `citywalk` / `calligraphy` 的暗色墨迹 Δ0（max ≤ 6）；`travel` 的 Δ25.0 **小于**它自己无云基线的 Δ37.4 —— 差值全部来自该页自带的 three.js 地球动画，云没有盖字。整页平均亮度只 +1.7~+3.2（0–255）→ 柔和不泛白
  - **DPR=2（真人 Retina 场景）**：缓冲 2039×1274 = `floor(1280 × min(2, √(2.6M / 1.024M)))` 完全吻合，2.60M 像素 ≤ 上限，`gl true`、0 errs
- ⚠️ **验证工具链的三个坑（都已修，且都是「看起来像卡死」的元凶）**：① `new WebSocket(...)` 后 `await open` **没有超时** → 调试通道连不上就永久挂起，跑满 shell timeout 被杀、结果文件还是 0 字节；② `send()` 等回复**没有超时**；③ 调试输出 `TARGET ...` 打在 JSON **前面**，把结果文件弄成非法 JSON（读取方已改成「从第一个 `{` 起解析」）。
- ✅ **两副本逐字节一致**：`index.html` 2427 行 / `5a7cbe9155a7280f…`、`travel.html` 1026 / `1d7641533e586bb4…`、`citywalk.html` 434 / `62877f9b4e20dba1…`、`calligraphy.html` 909 / `cba61f28526b4043…`、`assets/cloud-bg.js` 394 / `91509918f7b66d6f…`；`bci.html` 1171 行 / `02883b05a66f4e91…` **未改动**（同步前 `diff` 核对：四页差异确为纯插入 19 行、0 删除）

### 2026-09-18（`bci.html` 并入顶栏统一口径：也改成**三项**）

- 用户原话：「bci.html也同样改成这样」。上一轮三页统一时 `bci.html` 被留在「**原样不动**」（见下面两条记录里的 ②），本轮把这一页**并进同一口径**。
- `bci.html` 改前是**两项**：`<a href="index.html">← Return to Home</a>` + `<a class="active" href="bci.html">脑机接口 BCI</a>`。**改 4 处**（另三页的对应位置保持不动）：
  1. **HTML**：`.nav` 换成三项 —— 左 `<a href="index.html" id="back">` + 内联左箭头 SVG + `Back`；中 `<span class="nav-here">脑机接口 BCI</span>`；右 `<a href="index.html" class="nav-home">Return to Home` + 内联右箭头 SVG。三条中文说明注释与另三页同款
  2. **CSS**：插在 `.nav a.active {…}` 块之后、`/* ============ 首屏 ============ */` 之前（现第 166 行起），共 40 行：`.nav a, .nav .nav-here { display:inline-flex; align-items:center; gap:6px }`、`.nav .nav-here {…}`、`.nav-arrow {…}`，再加 `@media (max-width: 560px)` / `@media (max-width: 440px)` 两档窄屏（数值与文案跟另三页一致）
  3. **JS**：页尾新增一段独立 `<script>` IIFE（点 `#back` 时判 `location.protocol === "file:"` 分支 → 能回退就 `preventDefault()` + `history.back()`，否则跟随 href 兜底），与另三页逐字同款
  4. **页脚**：删掉那条老链接（详见下面最后一条），并在 `<footer>` 里留了三行中文注释写明「为什么没有了」
- ⚠️ **中项底色是本页唯一的例外，不要回来「统一」它**：`bci.html` 是暗色科技风（`--bg-0 #04070e` / `--cyan #5fbeff`），套别页的 `--sky-100` 浅底会很跳，所以这里**沿用该页 `.nav a.active` 的青色半透明胶囊**：`color: #eaf5ff` / `background: rgba(95,190,255,0.16)` / `box-shadow: inset 0 0 0 1px rgba(95,190,255,0.28)`，字体随该页 `.nav a`（`var(--font-sans)` / `clamp(12px,1.7vw,14px)` / `letter-spacing:.05em` / `padding:5px 12px`）
- ⚠️ **`.nav a.active` 规则保留未删**：改后 `.nav` 里已经没有 `.active` 元素了，但这条规则是 `.nav-here` 观感的来源与参照（且改动最小），不要因为「没有引用了」就清理
- ⚠️ **`bci.html` 有一层 `z-index: 999` 的全屏加载遮罩 `.loader`**：`load` 后最短 900ms 才加 `.is-done`（`visibility:hidden`）、再过 800ms 才从 DOM 移除。**自动化点它顶栏前必须先等遮罩消失**，否则鼠标事件落在遮罩上、点了没反应。本轮首跑就是栽在这里：`B/C/D.bci` 的「Back」全部点空（`pathname` 仍是 `bci.html`，只留下 `sessionStorage` 残留），而**真人点到时遮罩早淡出了 —— 是测试时序问题、不是页面缺陷**。已在 `subpage-nav-verify.mjs` 里加 `waitLoaderGone()`（放进 `clickAndSnapshot`，其它页面零开销）
- 📐 **验证（`subpage-nav-verify.mjs` + `run-subnav.sh`，已为 bci 参数化：`PAGES` 增 bci 项、入口选择器 `a.major-link[href="bci.html"]`、中项底色 `hereBg` 按页给值）**
  - **两副本都跑 `ONLY=all`：256/256 全绿**（JS 异常 `[]`）；窄屏单独跑 **76/76**（两份都绿）
  - ⚠️ **跑权威副本时 `FILEBASE` 必须传原始路径**（就写中文，别自己 `encodeURI`）——脚本内部会自己编码一次；手工再编码会得到 `file://%252FUsers%252F…`，Chrome 直接落 `chrome-error://chromewebdata/`，四个 `file://` 场景全挂（本轮为此白排查了一轮，最终靠一个字面量 URL 的探针才定位）
  - **静态**（四页 × 3 环境）：`.nav` 恰好三项、tag 顺序 `["A","SPAN","A"]`；左项 `Back` / `href="index.html"` / `id="back"` / 14×14 左箭头；中项文案 `脑机接口 BCI`、`SPAN`、无箭头、`cursor=default`、**背景 `rgba(95,190,255,0.16)`**、非链接非按钮；右项 `A.nav-home` / `Return to Home` / `id` 为空 / 14×14 右箭头；**全页箭头恰 2 枚**；`Return to Home` 计数 **1**；`.btn` / `.tw-actions` 计数 0；无横向溢出；`docTop = 14`
  - **http 主流程**：index → About → `y=136` → `bci.html` → 点 Back → **`panel-about` + `y=136` 完整还原**（会话副本 152ms / 权威副本 157ms）
  - **直开兜底**（`history.length=1`）：点 Back → 跟随 href → 落 `index.html` + `panel-home` + `y=0`（会话副本 250ms / 权威副本 888ms，都只是等待时间差异）✅
  - **`file://` 双击**（用户实际用法）：点 Back 回去 `nav type = "back_forward"`、**`panel-about` + `y=136` 完整还原**（会话副本 526ms / 权威副本 814ms）✅ 比另三页慢，因为该页要等 `load` + 加载遮罩
  - **窄屏 6 档**（430 / 414 / 390 / 375 / 360 / **320**）：顶栏高 45~49px 仍是单行、三项 `cy` 相同、都可见、无横向溢出；**320px 档 `navRight = 306px`**（四页里仅次于 calligraphy 的 307px）
- ✅ 两副本 `bci.html` 均为 **1171 行 / `02883b05a66f4e91…`**（`cmp` 逐字节相同）。同步前 `diff` 核对过：差异只有本轮这四处
- ✅ 交付文件全部 `cmp` 一致：`index.html` 2408 行 / `cccb101b55f0bf81…`、`bci.html` 1171 行 / `02883b05a66f4e91…`、`travel.html` 1007 行 / `ef77bc1cef8b8329…`、`calligraphy.html` 890 行 / `1d7ff3aefb83e0ff…`、`citywalk.html` 415 行 / `f1e0e29984c91e7e…`
- ✅ **并发写入已对齐**：本轮进行中另有改动在同一目录里落地（「手机端数字分身卡片标题整句一行」，即下面那条记录 + `index.html` 的 480px 块）。我一度量到会话副本 `index.html` 比权威副本多 35 行、且当时 AGENTS.md 还没有它的记录，**没有盲目同步**；随后那条改动自己完成了双副本同步（两副本现均为 **2408 行 / `cccb101b55f0bf81…`**、`cmp` 相同），与本轮互不冲突
- ✅ **页脚那条老链接已按用户确认删除**：`bci.html` 页脚原先有一行 `<p><a href="index.html">← 返回主页 Back to Home</a></p>`，而另三页的页脚都没有这条 → **当面问过用户，用户选「删掉」**，于是整行（连同 `<p>`）删除，并在 `<footer class="foot">` 内留了三行注释写明缘由（页脚现在只剩署名那一行）。删完两副本各重跑了 `ONLY=all`（256/256）+ `ONLY=narrow`（76/76），依旧全绿

### 2026-09-18（手机端：数字分身卡片标题「数字分身 · 和我聊聊 Virtual Space」整句一行）

- 用户诉求：手机端 **`#panel-chat`（Virtual Space）** 里那行 **「数字分身 · 和我聊聊 Virtual Space」** 折到第二行，观感不好，要改成**整句一行**；**电脑端与平板端不要变**
- **范围确认（只动这一处）**：全站 `.card-title` 共有三处 —— `#panel-about`（关于我）、`#panel-chat`（数字分身，本轮目标，HTML 在 1210 行）、`#panel-home`（欢迎语）。**只有 `#panel-chat` 那处被改**，另两处一字未动，并在验证脚本里加了断言逐档复核（320px 档 home 的欢迎标题本来就折 2 行，属既有设计，未纳入本轮）
- 📐 **基线实测（无头 Chrome + CDP，先改前先量）**
  - 桌面 / 平板 **1280 / 1024 / 834 / 768**：本来就**单行**（h = 37.39px，22px + 0.06em 字距，`.en` 11px）
  - **480px：本来就单行**（h = 37.39px）
  - **430 / 414 / 412 / 400 / 390 / 375 / 360 / 344 / 340 / 331 / 320：折 2 行**（h = 74.78px = 2 × 37.39）
  - **301 / 300 / 280：折 3 行**（h = 112.17px）
  - 所以「手机端折行」的触发线在 **<480px**，与断点选择吻合
- 📐 **标定（关键，别凭感觉写字号）**：把标题克隆成 `nowrap` 量整句宽，对字号做线性回归，三组候选实测：
  - A 原样（中文字距 `0.06em` / `.en` `0.2em` / `gap` 12px）：**宽 = 15.4222 × 字号 + 12.02**
  - **B 采用**（中文字距 `0.03em` / `.en` `0.12em` / `gap` 12px）：**宽 = 14.5727 × 字号 + 12.01**
  - C 更紧（`0.02em` / `0.08em` / `gap` 8px）：宽 = 14.2016 × 字号 + 8.03 —— 省下的 1.37em 换不到多少字号，反而字距过紧，落选
  - 斜率与视口无关（纯字体度量），B 组即上式的 `K实测 = 14.5727`
- 📐 **可用宽模型**：卡片可用宽 ≈ **「视口 − 106px」**，在 **<400px 档精确成立**（body `12px`×2 + `.page` `16px`×2 + `.card` `24px`×2 + 边框 2）；**400~480px 档 body/.page 内边距按 `3vw`/`4vw` 放大到 14.4~19.2px，可用宽其实更窄 4~11px** —— CSS 注释里按 `−106` 估（偏乐观），靠 K 的余量兜住，实测 480 档仍余 32px
- **改动（`index.html` 一处、两个副本同改；紧跟 `.card-title .en` 原规则之后纯新增，原规则一行未删）**
  - `@media (max-width: 480px)`：`white-space: nowrap` + `flex-wrap: nowrap` + 字距 `0.06em → 0.03em` + `font-size: clamp(12px, calc((100vw - 118px) / 15.8), 22px)`；`.en` 改为 `font-size: 0.5em` + 字距 `0.2em → 0.12em`
  - `@media (max-width: 300px)`：极窄屏兜底，恢复 `white-space: normal` + `flex-wrap: wrap` + 原字距 + 18px（`.en` 回 11px / `0.2em`），避免 `nowrap` 把页面撑出横向滚动
- ⚠️ **为什么不写 `flex-wrap` 的反向值就够**：`.card-title` 是 `display:flex` 且**未设 `flex-wrap`（默认 nowrap）**，折行发生在**中文文本节点内部**（匿名 flex item 可被压缩，中文可在任意字间断行），不是在 flex 子项之间 —— 所以**只加 `white-space: nowrap` 才是对症的那一刀**，`flex-wrap: nowrap` 只是显式声明、便于和 ≤300px 兜底对照
- ⚠️ **K 取 15.8 的依据**：相对实测 `14.5727` 留约 **8%** 余量。整句里**拉丁（`Virtual Space`）约占 31%**，而中文字宽恒为 1em（与字体无关），安卓 fallback 字体的差异主要压在拉丁部分；8% 余量正是给它的。代价是 <480px 各档字号按比例缩小（430 → 19.75px、390 → 17.22px、320 → 12.78px），这是「一行 + 安卓不折」的必然取舍
- ⚠️ **`.en` 由固定 11px 改成 `0.5em` 不是随手改的**：`11px` 恰好是 `22px` 的**一半**，写成 `0.5em` 后 **480px 档视觉与改动前逐项相同**（`.en` 仍是 11px），更窄档则随主字号等比缩放，避免出现「中文缩到 17px、英文还顶 11px」的失衡。**别把它改回固定 px**
- ⚠️ **断点仍是 480px**（与页脚署名、旅行页副标题那两次统一口径）：480px 以上没有手机档位（平板最小 768、手机横屏 844），不会误伤平板 / 电脑；且 431~480px 段若不加 `nowrap`，安卓 fallback 字再宽一点就会折
- 📐 **验证（`.deepworks/tmp/hp-chattitle-verify.mjs` + `run-chattitle.sh`，18 档）**
  - **手机档 480 / 430 / 414 / 412 / 400 / 390 / 375 / 360 / 344 / 340 / 331 / 320 / 301：全部 1 行、零溢出、页面无横向滚动**（480 档 22px 原字号、整句 330.78px vs 可用 363px；430 → 19.75px / 298.03px vs 320px；390 → 17.22px / 261.34px vs 284px；320 → 12.78px / 197.20px vs 214px；301 → 触底 12px / 185.89px vs 195px，余量仍 ≥ 5%）
  - **极窄兜底**：300 / 280 → 折 2 / 3 行、零溢出（符合设计）
  - **桌面 / 平板零回归**：1280 / 1024 / 834 / 768 的 `white-space` 仍 `normal`、字号仍 22px、字距仍 1.32px、`.en` 仍 11px / 113.95px、整句仍 349.48px、h 仍 37.39px —— 与改动前**逐项完全一致**
  - **未波及其它标题**：430 / 390 / 320 档复核 `#panel-about` / `#panel-home` 的 `.card-title` 仍 `white-space: normal` + 22px，`#panel-chat` 才是 `nowrap`
  - **两个副本各跑一遍，18/18 全绿**（会话副本 + 权威副本）
- ✅ 两份 `index.html` sha256 均为 `cccb101b55f0bf81…`（`cmp` 逐字节相同）。同步前先 `diff -u` 核对过：差异**恰好只有本轮这一处新增 CSS 块**，没有夹带别的漂移
- 🔧 验证脚本本次修正一处**自己写错的判据**：原先按 `Range.getClientRects()` 的 `top` 聚类数行，**被 `.card-title` 的 `align-items: baseline` 骗了** —— 中文与 `.en` 顶面不同高，单行也被算成 2 行。**改为「元素实际高度 ÷ nowrap 克隆的单行高度」四舍五入**，基线档因此从「2 行」纠正为「1 行」。**以后在本项目量这类 baseline 对齐 flex 的行数，别用 rect 的 top 聚类**

### 2026-09-18（顶栏口径修正：**两项 → 三项**，加回右项「Return to Home →」）

- 用户原话：「大哥你会错意了。都不按我说的执行，我要「← Back」+「当前页名 」+「Return to Home →」」
- ⚠️ **本条取代下面「三页顶栏统一改版」那条的两项口径**：那一版把顶栏做成「左 Back + 右页名 →」，**把「Return to Home」整条删掉了**，而用户要的是**三项**（Back / 页名 / Return to Home 同时存在）。旧条目保留原样作历史记录，**但「用户明确要求删掉 Return to Home」这个结论是错的，别再据此删按钮**
- **最终口径**：`.nav` 恰好三项
  1. 左 `<a href="index.html" id="back">` ＝ 左箭头 SVG + `Back`（回**上一面**，`history.back()`，面板 + 滚动一起还原；无历史兜底跟随 href）
  2. 中 `<span class="nav-here">` ＝ 当前页名（`旅行 Travel` / `书法 Calligraphy` / `Citywalk`）——**位置标识、不可点击、不带箭头**，`cursor: default` + sky-100 胶囊
  3. 右 `<a href="index.html" class="nav-home">` ＝ `Return to Home` + 右箭头 SVG（回**主页顶部**：普通导航 → index 侧 `nav type === "navigate"` 不消费还原记录 → 落 Home 面板顶部，语义正好对上）
- 具体改动：`travel.html` / `calligraphy.html` / `citywalk.html` 三页各改 3 处
  1. **HTML**：中项的右箭头 SVG 删掉；`</nav>` 前新增右项 `<a href="index.html" class="nav-home">Return to Home + 右箭头 SVG</a>`；顶部那段说明注释同步改写
  2. **CSS**：仅改注释（原注释写「顶栏改版：左 Back + 右页名」）；`.nav` / `.nav a` / `.nav-here` 规则本身**一行未改**（右项靠 `.nav a` 自动继承 hover / `.active` 观感，`.nav-home` 只作语义标记，**没有**独立 CSS 规则）
  3. **新增两档窄屏媒体查询**（插在 `.nav-arrow` 块之后、`/* ==== 栅格/布局 ==== */` 之前）：`@media (max-width: 560px)` 把 `gap` 收到 `min(10px, 1.6vw)`、左右 `padding` 收到 10px、项内 `padding` 收到 7px、`letter-spacing` 收到 `0.02em`；`@media (max-width: 440px)` 用 `font-size: clamp(11px, 3.05vw, 13px)` 继续收字号
- ⚠️ **为什么必须加窄屏档**：三项比两项多一枚「Return to Home →」，360px 档原本会顶出胶囊（估算 ≈359.6px vs 可用 ≈304px）。**三项里中文页名那项最宽**（`书法 Calligraphy`），是窄屏的主要压力来源
- ✅ **验证（`subpage-nav-verify.mjs` + `run-subnav.sh`，每页 4 场景 + 窄屏；静态断言已从「两项 `["A","SPAN"]`」改为「三项 `["A","SPAN","A"]`」）**
  - **会话副本 `ONLY=all`：193/193 全绿**，JS 异常 `[]`；窄屏单独跑 **58/58**
  - **静态**（三页 × 3 环境 = 9 遍）：`.nav` 恰好 3 个子元素、tag 顺序 `["A","SPAN","A"]`；左项 `Back` / `href="index.html"` / `id="back"` / 14×14 左箭头；中项文案 = 页名、`SPAN`、无箭头、`cursor=default`、背景 `rgb(231,242,251)`、非链接非按钮；右项 `A.nav-home` / 文案 `Return to Home` / `href="index.html"` / 14×14 右箭头 / **`id` 为空（不抢占 `back`）**；**全页箭头恰为 2 枚**；`Return to Home` 计数 **1**、`.btn` 与 `.tw-actions` 计数 0；无横向溢出
  - **http 主流程**：index → About → `y=238` → pill → 子页 → 点 Back → **`panel-about` + `y=238` 完整还原**，三页 152 / 153 / 181ms
  - **直开兜底**（`history.length=1`）：点 Back → 跟随 href → 落 `index.html` + `panel-home` + `y=0` ✅
  - **`file://` 双击**（用户实际用法）：点 Back 回去 `nav type = "back_forward"`、**`panel-about` + `y=238` 完整还原** ✅
  - **窄屏 6 档**（430 / 414 / 390 / 375 / 360 / **320**，三页 ×6 = 18 组）：顶栏高 45~48px **仍是单行**、三项 `cy` 相同（同行）、都可见、无横向溢出、未越出视口；**320px 档最紧的一页 `navRight = 307px`（calligraphy）、`travel.html` 为 295px**，仍在视口内
  - `citywalk.html` 打字机同时复测：15 字俱全、`tw-caret-blink / 0.8s / infinite` 光标仍在、纯 CSS 无 JS 驱动
- 🔧 验证脚本本次修正一处**自己写错的断言**：三项里只有 **2 枚**箭头（中项没有），右箭头是 `arrows[1]` 而非 `arrows[2]` —— 首跑 175/184 的 9 条 ❌ 全部来自这一条，不是页面问题

### 2026-09-18（手机端页脚署名整句一行：`index.html` + `citywalk.html` 不再折行）

- 用户原话：「手机端每个页面最后的『刘孟涵·个人主页·天津大学......』那个也会换行，我不要换行」
- **范围确认（先查全站再动手）**：这句完整文案只出现在 **`index.html`（`.footer`）** 与 **`citywalk.html`（`footer.footer`）**；其余三页底部是**另一句文案、实测本来就不折行，本轮一字未动**：
  - `calligraphy.html` = 「刘孟涵 · 书法 Calligraphy」→ 12px、单行 **210.39px**，15 档全单行
  - `travel.html` = 「MENGHAN LIU · TRAVEL」→ 12px、单行 **213.64px**，15 档全单行
  - `bci.html` = 「刘孟涵 · 智能医学工程（脑机接口方向）」→ 12px、单行 **250.81px**，10 档全单行（该页 `.foot` 本身是多行结构「链接行 + 署名行」，署名行要用 `SEL=".foot p:nth-of-type(2)"` 单独量，整块 `lines=4` 是结构而非折行）
- 📐 **基线实测（无头 Chrome + CDP）**
  - `index.html`：12px + `0.06em` 下**整句需 350.31px**，可用宽 =「视口 − 56px」（body 内边距 12 + `.page` 内边距 16，左右各两处）→ **≤406px 必折**（480 / 430 / 414 / 412 单行；**400 / 390 / 375 / 360 / 344 / 340 / 331 / 320 全部 2 行**）
  - `citywalk.html`：12.5px + `0.08em` 下**整句需 372.66px**，可用宽 =「视口 − 43px」→ **≤413px 必折**（414 / 430 / 480 单行；412 及以下全 2 行）
- **改动（两个文件，两个副本同改）**：紧跟各自页脚原规则之后**纯新增**，原规则一行未删
  - `@media (max-width: 480px)`：`white-space: nowrap` + 字距收紧（index `0.06em → 0.02em`；citywalk `0.08em → 0.02em`）+ 左右负边距吃回 `.page` 内边距 + `font-size: clamp(9.5px, calc((100vw - 26px) / 30), 原字号)` + `text-size-adjust: 100%`
  - `@media (max-width: 300px)`：极窄屏兜底，恢复 `white-space: normal` + 原字距 + 11px，避免 nowrap 撑出横向滚动
- ⚠️ **负边距两页写法不同，不能照抄**：`index.html` 的 `.page` 内边距是 `clamp(16px, 4vw, 40px)`，手机档恒为 16px → 写死 `-16px`；`citywalk.html` 的 `.page` 是 `clamp(4px, 2vw, 24px)`，**随视口变化** → 必须写 `calc(-1 * clamp(4px, 2vw, 24px))`。**以后在本项目做「负边距吃回容器内边距」的修复，先量容器实际内边距，不要照抄别页的数字**
- ⚠️ **断点仍是 480px**（与旅行页副标题那次统一口径）：406~480px（index）/ 413~480px（citywalk）用原字号余量已不足 8%，安卓 fallback 字体稍宽就折；480px 以上没有手机档位（平板最小 768、手机横屏 844），不会误伤平板 / 电脑
- ⚠️ **K 取 30 的依据**：同文案实测整句 ≈ **27.9em**（字距 0.02em 下），取 30 留约 7% 余量。因负边距先吃回空间，**index 390~480、citywalk 414~480 的字号仍是原值（12px / 12.5px），视觉一字未变**，只有更窄才微微缩小
- ⚠️ **`text-size-adjust: 100%` 是 iOS 保险**：iOS Safari 会给「宽文本块」自动放大字号，nowrap 下一旦放大就会溢出；显式关掉。对桌面与安卓无副作用
- 📐 **验证（`.deepworks/tmp/hp-footer-verify.mjs` + `run-footer.sh`，每页 18 档）**
  - `index.html`：480 / 430 / 414 / 412 / 400 / 390 → **12px 原字号**、单行 **335.44px**（可用 366~445px）；375 → 11.63px / 325.09px；360 → 11.13px / 311.11px；344 → 10.6px；340 → 10.47px；331 → 10.17px；320 → 9.8px / 273.94px；**301 → 9.5px 单行** —— **18 档全部 1 行、零溢出、页面无横向滚动**
  - `citywalk.html`：480 / 430 / 414 / 412 → **12.5px 原字号**、单行 **349.41px**；400 → 12.47px；390 → 12.13px / 339.06px；375 → 11.63px；360 → 11.13px；344 → 10.6px；340 → 10.47px；331 → 10.17px；320 → 9.8px / 273.94px；301 → 9.5px 单行 —— 同样 **18 档全绿**
  - **极窄兜底**：300 / 280 → 折 2 行、零溢出（符合设计）
  - **桌面零回归**：1280 / 1024 / 768 的 `white-space` 仍 `normal`、字号仍 12 / 12.5px、字距仍 0.72px / 1px、单行宽仍 350.31px / 372.66px —— 与改动前**逐项完全一致**
  - **两个副本各跑一遍，18/18 全绿**（会话副本 + 权威副本）；bci.html 另用 `SEL=".foot p:nth-of-type(2)"` 复测 10 档全单行
- ✅ 两份 `index.html` sha256 均为 `81ec5f80b81df039…`、两份 `citywalk.html` 均为 `a7c5619c1b29986e…`（`cmp` 逐字节相同）。同步前先 `diff -u` 核对过：两文件与权威副本的差异**恰好只有本轮这两处新增 CSS 块**（新增 32 / 30 行），没有夹带别的漂移
- 🔧 验证脚本已参数化 `SEL`（默认 `.footer, footer.foot, .foot`）：量 `bci.html` 这类「页脚多行结构」中的某一行，传 `SEL=".foot p:nth-of-type(2)"` 即可


### 2026-09-18（三页顶栏统一改版：左「← Back」+ 右「当前页名 →」· Citywalk 底部那枚 Back 撤掉）

- 用户原话：「在旅行、书法和Citywalk页面然后不要把back放在下面了 就统一都放在顶上 Return to Home和旅行/书法那一栏（citywalk那里的back键记得删掉）。我想要改成（左箭头）back、旅行Travel/书法Calligraphy/Citywalk（右箭头）这样的」
- 落定口径（用户确认）：① 顶栏 = 左「← Back」+ 右「当前页名 →」，**当前页名只是位置标识、不可点击**；② 只改 `travel.html` / `calligraphy.html` / `citywalk.html`，**`bci.html` 保持 `← Return to Home` + `脑机接口 BCI` 原样**；③ Back = `history.back()`（回到进入本页前的那一面，面板 + 滚动一起还原），**无可回退历史时兜底跟随 `href="index.html"`**
- **改动（三个文件，两个副本同改；`index.html` / `bci.html` 一个字没动）**
  1. HTML：原来的两项 `<a href="index.html">← Return to Home</a>` + `<a class="active">页名</a>` 换成
     - `<a href="index.html" id="back">` + 内联左箭头 SVG + 文本 `Back`
     - `<span class="nav-here">页名` + 内联右箭头 SVG
  2. CSS：在 `.nav a:hover, .nav a.active {...}` 之后追加 `.nav a, .nav .nav-here { display:inline-flex; align-items:center; gap:6px }`、`.nav .nav-here { font-family:var(--font-serif); font-size:clamp(13px,2vw,17px); color:var(--ink-900); background:var(--sky-100); padding:4px 10px; border-radius:999px; letter-spacing:.06em; cursor:default }`、`.nav-arrow { width:14px; height:14px; flex:none; fill:none; stroke:currentColor; stroke-width:1.6; stroke-linecap:round; stroke-linejoin:round }`
     - ⚠️ 原 `.nav a:hover, .nav a.active` 规则**保留未改**（最小改动、向后兼容），不是删掉重写
  3. JS：页尾各加一段独立 IIFE（点 `#back` 时判定能否回退，能就 `preventDefault()` + `history.back()`）
  4. `citywalk.html` 额外两步：**删**底部 `.tw-actions` 块（连同那枚 `<a class="btn" id="back">`）、**删**整段已无引用的 `.tw-actions` / `.btn` / `.btn:hover` CSS（原处留一段说明注释）；`#back` 改到顶栏，**id 仍是 `back`**、沿用原处理器与 `file:` 分支判定，只把注释改写
- ⚠️ **`citywalk.html` 的 id 复用是刻意为之**：底部那枚和顶栏那枚不可能同时存在，沿用 `back` 可以让原 JS 段一行不改；重命名会让「有一枚 Back 忘了改」这种错误失去 `getElementById` 这道保护
- ⚠️ **箭头必须用 SVG 不用字符**：`←` / `→` 在宋体、PingFang、Caveat 下的宽度与基线各不相同，两端视觉对不齐；SVG 走 `currentColor`，hover 变色自动跟随
- 📐 **验证（无头 Chrome + CDP，`.deepworks/tmp/subpage-nav-verify.mjs` + `run-subnav.sh`）= 108/108 通过、JS 异常 0 条**
  - **静态**（三页各做 3 遍，共 9 遍）：`.nav` 恰好 2 个子元素且 tag 顺序 `["A","SPAN"]`；左项文案 `Back` / `href="index.html"` / `id="back"` / 带 14×14 左箭头；右项文案 = 页名（`旅行 Travel` / `书法 Calligraphy` / `Citywalk`）/ 带 14×14 右箭头 / `cursor=default` / 背景 `rgb(231,242,251)` / **不是 `a`、不是 `button`**；`.nav` 文档坐标 `docTop` = 52 / 28 / 28（在顶部，不是底部）；`Return to Home` 计数 0、`.btn` 计数 0、`.tw-actions` 计数 0；横向溢出 0
  - **http 主流程**（三页各一遍，1280×900）：index → 点 `About Me` → 滚到 `y=238` → 点**可见**的该页 pill → 子页 → 点顶栏 Back → 回到 `index.html`，**active 面板 = `panel-about`、`y=238`（±2 内）**，三次分别 156 / 152 / 153ms 完成；`sessionStorage` 记录消费后为 `null`（无残留）
  - **直开兜底**（三页各一遍，`history.length=1`）：点 Back → 不拦截、跟随 href → 落 `index.html` + `panel-home` + `y=0` ✅
  - **`file://` 双击**（三页各一遍，用户实际用法）：index → About + 滚动 → pill → 子页（`history.length` 2、`origin` = `"file://"`）→ 点 Back → 回 `index.html`，**`nav type = "back_forward"`、面板 `panel-about` + `y=238` 完整还原** ✅（比上一轮进步：上一轮 `file://` 回去是默认 Home 面板，本轮实测已能还原）
  - **窄屏 390 / 360**（三页 ×2 档）：顶栏高 48px **仍是单行**、两项 `cy` 相同（同行）、都可见、无横向溢出、未越出视口；`navRight` 最大 322 < 390
  - **Citywalk 打字机零回归**：`.tw-char` 15 个、`aria-label` 文案未变、`.tw-caret` 仍 `tw-caret-blink / 0.8s / infinite`、底色 `rgb(122,168,207)`、渲染宽 4px —— 删掉底部块与 `.btn` CSS 后一字未损
- ⛔ **两个旧验证脚本已退役**（`.deepworks/tmp/citywalk-back-verify.mjs`、`citywalk-back-verify-auth.mjs`：断言底部 `.tw-actions` 有 1 个按钮、顶部仍有「Return to Home」；`citywalk-restore-verify.mjs` 的 B 段同理）—— 这些断言已被新设计**有意推翻**，文件头已加退役说明，**再跑必然「预期内失败」，别去追**
- ✅ **已同步到权威项目** `~/Documents/个人主页/outputs/personal-homepage/`（`travel.html` + `calligraphy.html` + `citywalk.html` + `AGENTS.md`，`cmp` 逐字节相同）：`travel.html` 995 行 sha256 `7c798ca1137b488b…`、`calligraphy.html` 878 行 `ac02adb17e203f7f…`、`citywalk.html` 370 行 `03344d8fb2266897…`（改动前 `125237e01f39a0c2…`）；`index.html` 未改，仍为 2336 行 `c98ec4ff6cfaca96…`（本轮已 `cmp` 确认两副本相同）。⚠️ 同步前先 `diff` 核对过：三个文件与权威副本的差异**恰好只有本轮这三处改动**（56 / 56 / 80 差异行），没有夹带别的漂移。AGENTS.md 含本条记录，其哈希自指无意义故不记录，以两副本 `cmp` 相同为准
- 📐 **权威副本（中文路径）复跑**：同步后把上面全部场景在权威副本上再跑一遍 = **130/130 通过、JS 异常 0 条**（含窄屏档）；`file://` 那三条另行单独复跑 = **36/36 通过**，并打印 `location.href` 佐证确实加载的是中文路径副本（`file:///Users/liumenghan/Documents/%E4%B8%AA%E4%BA%BA%E4%B8%BB%E9%A1%B5/...`，即「个人主页」，`encodeURI()` 生效，不是英文副本或缓存）、`sessionStorage = "ok"`

### 2026-09-18（旅行页副标题：手机端整句单行，末尾「—」不再掉到第二行）

- 用户反馈：手机端旅行页（地球页）副标题「— 想去的地方 天气好的时候就出发吧 —」**末尾的「—」会换行**，要求整句一行
- **根因（实测）**：`.travel-sub` 原字号 17px + `letter-spacing: 0.16em` 下**单行需 341px**，而可用宽只有「视口 − 64px」（`.page` 内边距 16 + `.travel-head` 内边距 16，左右各两处）→ **≤400px 视口必然折行**；412px 恰好 347 > 341 不折，这就是断点边界。真机 390 / 375 / 360 全部折行
- ⚠️ **两个副本不同步**：会话副本 `~/Documents/deepwork/outputs/personal-homepage/travel.html` 已有一条 `max-width: 430px` 的单行规则，而用户实际打开的权威副本**没有这条规则**（`diff` 仅此一处差异）→ 这就是「手机端仍换行」的直接原因。**改本项目务必优先改权威副本，改完再同步会话副本**
- **改动（`travel.html` 一个文件，两个副本同改）**：在 `.travel-sub` 原规则后新增
  - `@media (max-width: 480px)`：`white-space: nowrap` + 字距 `0.16em → 0.06em` + 左右各 `-16px` 负边距吃回 `.travel-head` 内边距（可用宽 = 视口 − 32px）+ `font-size: clamp(11.5px, calc((100vw - 34px) / 20), 17px)`
  - `@media (max-width: 300px)`：极窄屏兜底，恢复 `white-space: normal`、去掉负边距、13px，避免 nowrap 撑出横向滚动
- ⚠️ **断点由 430px 放宽到 480px**：405~480px 区间用原字号只剩不到 8% 余量，字体稍宽仍会折行；而 480px 以上没有手机档位（平板最小 768、手机横屏 844），不会误伤平板 / 电脑
- ⚠️ **中文汉字宽度恒等于 1em（与字体无关）**，字体差异只来自空格与全角破折号 —— 公式取 `k=20`（实测常数 18.06）纯属给 fallback 字体留余量
- 📐 **验证（无头 Chrome + CDP，`.deepworks/tmp/hp-travelsub-verify.mjs` + `run-travelsub.sh`）**
  - **改动前（权威副本实测）**：480 / 430 / 414 / 412 单行；**400 / 390 / 375 / 360 / 344 / 340 / 331 / 320 全部折成 2 行**
  - **改动后**：480 / 430 / 414 / 412 / 400 / 390 / 375 → 17px 原字号、单行宽 307px、可用宽 396~442px；360 → 16.3px / 294px；344 → 15.5px / 280px；340 → 15.3px / 276px；331 → 14.85px / 268px；320 → 14.3px / 258px —— **15 档全部单行、零溢出、页面无横向滚动**
  - **极窄兜底**：301 → 13.35px 单行；300 → 13px 单行；280 → 折 2 行但零溢出（符合设计）
  - **桌面零回归**：1280 / 1024 / 768 仍 `white-space: normal`、字号 24 / 24 / 23.04px、字距 3.84 / 3.84 / 3.6864px、单行宽 481.41 / 481.41 / 462.14px —— 与改动前逐项完全一致
- ✅ 两个副本 `travel.html` md5 均为 `6f4b5686607a15558981da2eb6bd70e8`（改动前：权威 `bc5ea567c5cd5c9f15de2fa6dcbb1af0`、会话 `f3e065f85e6901387dff6238b668cde0`），`diff -q` = 无差异

### 2026-09-18（Back 真正回到「点 Citywalk 前的样子」：面板 + 滚动位置自己记、自己还）

- 用户反馈：上一版 Back **仍然回到 Home 面板、而且回到页面顶部**，不符合「回到点击 Citywalk 前的界面」的本意。明确要求：**进去前是哪个面板、滚到哪，回来就得一模一样**
- **根因**：`index.html` 的面板切换是纯 JS `classList.toggle`，**面板名和滚动位置都不在浏览器历史里**（既不写 hash 也不 pushState）。上一版全靠 **bfcache** 顺带还原 DOM —— http 下成立，但用户**双击打开用的就是 `file://`，那里的 bfcache 不保留 DOM 状态**，于是整页重新加载 → 走默认的 `activate("home")` + `window.scrollTo({ top: 0, behavior: "smooth" })` → 永远是「Home + 顶部」
- **改动（只动 `index.html` 一个文件）**
  1. `activate(name)` → `activate(name, opts)`，新增 `opts.keepScroll`：为真时**跳过**里面那次「滚回顶部」。还原流程必须用它，否则会先被拉回顶部再被拉回来，白闪一下
  2. 新增「离开前记一份、回来还回去」的小模块（`RETURN_KEY = "lmh_home_return"`，存 `sessionStorage`）：
     - 点**站内子页链接**（`citywalk.html` / `travel.html` / `calligraphy.html` / `bci.html`）之前，把 `{ panel: 当前 active 面板名, y: Math.round(window.scrollY) }` 存进 `sessionStorage`
     - 回来时**先用 `performance.getEntriesByType("navigation")[0].type === "back_forward"` 判断「这次是不是后退/前进回来的」**，是才消费这份记录并还原；不是（属于新导航，含子页里点「← Return to Home」）就**直接把记录丢掉**
     - 存取全程 `try/catch`：`sessionStorage` 不可用（隐私模式 / 站点数据被禁）时静默退化成浏览器默认行为，**不影响跳转**
  3. 滚动落位用 `window.scrollTo({ top: restoreY, behavior: "instant" })`，并在 `rAF ×2` / `setTimeout 150ms` / `load` 各补一次（换面板后文档高度变了、`bg.jpg` 撑高也要算进去）；`pageshow` 里若 `event.persisted` 为真**只清记录**（bfcache 已经自己还原好了，不要插手）
- ⚠️ **为什么必须 `behavior: "instant"`**：页面全局有 `html { scroll-behavior: smooth }`，`window.scrollTo(0, y)` 这种默认写法会变成一段平滑动画，**和 `activate("home")` 那次滚顶动画抢跑**，最后停在两个动画中间 —— 实测差 5px（`233` vs `238`）。只有显式 `instant` 才是立即定位
- ⚠️ **为什么用 `nav type` 区分、而不是去改子页**：Back 键（`history.back()`）和子页顶部「← Return to Home」都是「同源子页 → index.html」，光看 `referrer` 区分不了；而前者 `type === "back_forward"`、后者 `type === "navigate"`。**所以 `citywalk.html` 一个字都不用改**
- 📐 **验证（`citywalk-restore-verify.mjs`，7 条断言）**
  - 核心断言是**离开前快照 vs 回来后快照**的 `(active 面板, window.scrollY)` 完全相等；快照必须在 `scrollIntoView` 停稳**之后、派发点击之前**读取
  - **只在「About 面板 + 非零滚动」上断言**才有区分度：Home + 顶部 是「不动代码也成立」的默认态，测不出这个 bug。实测两份副本都是 `{panel: panel-about, y: 238}` → 回来后 `{panel: panel-about, y: 238}`
  - 三种环境全测：**http + `--disable-features=BackForwardCache`**（强制走自己写的还原路径）、**http 默认**（bfcache 路径）、**`file://` 双击**（用户实际用法）→ 全部 **7/7 通过**，`❌` 0 条，JS 异常 `[]`
  - 另有两条语义断言：子页「← Return to Home」仍落在 **Home 面板 + 顶部**（`y = 0`）；直开 `citywalk.html`（无可回退历史）点 Back 的兜底仍落 `index.html` + Home 顶部
- ⚠️ **验证仪器坑（本轮新增）**
  1. **`Page.navigate` 偶发卡死在 `loading`**：headless 下 Chrome 自己那份「命令行初始加载」偶尔卡住（探测值长这样：`loading|0|<标题>|-1|/index.html` —— 标题已解析、`body` 还没建），此后**所有** `Page.navigate` 都跟着卡，`goTo` 一路超时。修法三件套：脚本连上后**先预热**（不就绪就 `about:blank` 重置加载器）、`goTo` 失败**重试一次**、Chrome 启动加 `--disable-background-networking --disable-component-update --disable-sync …`。加固前 5 次里偶发 1 次，加固后**连续 8 次 7/7 全绿**
  2. **等待条件别踩「错误页也满足」**：`http.server` 还没绑好端口时，Chrome 会落到「连接被拒绝」错误页，而**它的 target URL 仍然是 `/index.html`** —— 按 URL 找 target 的等待循环会误判成「已就绪」。run 脚本改成**先用 `curl` 探到 server 真的返回 200，再启 Chrome**
  3. 配套：脚本 `FATAL` 时**必须也写结果文件**，否则文件里留着上一次的「全绿」内容，看起来像通过（本轮被这个假绿骗过一次）；run 脚本开跑前先 `: > 结果文件` 截断
- ✅ **`citywalk.html` 本轮零改动**（sha256 仍 `125237e01f39a0c2…`）
- ✅ **已同步到权威项目** `~/Documents/个人主页/outputs/personal-homepage/`（`index.html` + 本文件，`cmp` 逐字节相同）：`index.html` sha256 `c98ec4ff6cfaca96…`（2336 行），上一版为 `dacf9395b692daca…`

### 2026-09-18（Citywalk 页底部改版：删「重新播放」· 白色 Back 走 `history.back()` 回上一面）

- 用户要求三条：① 去掉「重新播放」按钮；② 「返回主页 Home」改成 **`Back`**；③ 点 Back 要**回到「点击 Citywalk 之前的界面」**（理由：顶部已经有「← Return to Home」专管回主页了）；并要求这枚 Back **用白色**、和原来那枚次要按钮同款
- **改动（只动 `citywalk.html` 一个文件）**
  1. HTML：`.tw-actions` 里的 `<button id="replay">重新播放 Replay</button>` 删除；`<a class="btn primary" href="index.html">返回主页 Home</a>` → `<a class="btn" href="index.html" id="back">Back</a>`（白色 `.btn`，与原文案按钮同款材质）
  2. CSS：删掉只为原蓝按钮服务的 `.btn.primary` / `.btn.primary:hover`（全页引用已为 0），原处留一行说明注释；`.btn` 白色玻璃规则**一字未改**
  3. JS：删 `var replay = document.getElementById("replay")` 与 `replay.addEventListener("click", play)`（**必须删** —— 否则 `replay` 为 null，`addEventListener` 抛错会连带后面的 Back 逻辑一起失效）；`play()` **保留**，因为 `prefers-reduced-motion` 的 `change` 监听仍在用它
  4. 新增 Back 处理：`location.protocol === "file:"` 时只看 `history.length > 1`；否则要求 `document.referrer.indexOf(location.origin) === 0 && history.length > 1`。成立 → `preventDefault()` + `history.back()`；不成立 → **不拦截默认行为**，跟随 `href="index.html"` 回主页（直接双击 / 从书签进来的兜底，避免按了没反应）
- ⚠️ **为什么要判同源 referrer**：`index.html` 的面板切换是纯 JS `classList.toggle`，既不写 hash 也不 pushState，所以「回到上一面」只能靠浏览器把**同源跳转**的那一页连同 DOM 状态（About 面板展开）一起从 bfcache 还原。referrer 判定是为了不把「从站外 / 书签直开本页」误判成可回退
- 📐 **验证（无头 Chrome + CDP，`citywalk-back-verify.mjs` + `run-back.sh`，四场景全程真实鼠标点击）**
  - **静态**：`#replay` 不存在；`.tw-actions` 只有 1 个子元素、文案 `Back`、`<a class="btn">`；背景 `rgba(255,255,255,0.82)`、`background-image: none`（证明不是原来的蓝色渐变）、白边 `rgba(255,255,255,0.95)`、圆角 999px、84×43；顶部「Return to Home」仍在 1 个；`.tw-char` 15 个、光标正常
  - **http 同源主流程**（1280×900）：点 About → active 变 `panel-about` → 点**可见**的 Citywalk pill → 到 `/citywalk.html`（`document.referrer` = `http://127.0.0.1:8792/index.html`，`history.length` 4）→ 点 Back → **0ms 内回到 `/index.html` 且 `#panel-about` 仍是 active** → **bfcache 生效，「回到点 Citywalk 前的界面」成立**
  - **兜底（直接开 `citywalk.html`，`history.length = 1`）**：点 Back → 不拦截、跟随 href 落到 `/index.html`（默认 Home 面板），**不会按了没反应**
  - **`file://` 双击**：点 pill 进 citywalk（`history.length` 2、`referrer` 为空、`location.origin === "file://"`）→ 走 `file:` 分支判定可回退 → 点 Back 回到 `index.html` ✅ ⚠️ 但 `file://` 下回去的是**默认 Home 面板**（About 状态未还原）—— `file://` 的 bfcache 行为与 http 不同，如实记录；部署到 http(s)（如 GitHub Pages）后与上面主流程一致
  - 三个页面全程 **JS 异常 = `[]`**
- ⚠️ **验证仪器坑（本轮新增，同类问题第四次）**：`index.html` 的滚动是 **smooth** 的 —— 用 `scrollIntoView()` 把 pill 滚进视口后**立刻** `getBoundingClientRect()`，读到的是**滚动途中**的坐标 → 鼠标点空。现象很像「pill 不能点」：选择器取到的元素可见、`elementFromPoint` 命中的就是 pill 本身、也没有遮挡，而**同一个元素用 `el.click()` 立刻就能跳**。**改法：`scrollIntoView` 之后轮询到 rect 连续两次相同再派发鼠标事件**
  - 附带一条：`.interest-pills .pill` 在 **Home 与 About 两个面板各有一份**，非活动面板 `display:none` → rect 全 0。选择器必须过滤 `rect.width > 0`，否则会「点」到隐藏的那一枚，一路假阳性（首次跑就撞上了）
  - 再一条：**目录名含中文时，`Target.createTarget` 的 `file://` URL 必须 `encodeURI()` 过**。权威副本目录是「个人主页」，用未编码 URL 建 target，页面看着「开了」、`location.pathname` 也对，但 `.nav a` / `.panel` 全读不到（`active 面板 = (none)`），像极「页面没渲染 / 按钮坏了」。脚本第 4 段现已 `encodeURI` + 轮询 `readyState=complete 且 .nav a 存在` 双条件
  - 还有一条脚本自身的坑：点击辅助函数若闭包捕获了别的 CDP 连接，`file://` 场景就会把点击派发到 http 那个 target 上 —— 多 target 时点击必须绑定「当前 target」的连接
- ✅ **两个副本各跑一遍全绿**：会话副本（`deepwork/outputs/…`）与权威副本（中文路径）四场景结论一致
- ✅ **已同步到权威项目** `~/Documents/个人主页/outputs/personal-homepage/`（`citywalk.html` + `AGENTS.md`，`cmp` 逐字节相同）：`citywalk.html` sha256 `125237e01f39a0c2…`（改动前 `98ddb6916e602b14…`），372 行 / 14066 bytes

### 2026-09-18（新增 Citywalk 占位页 · Aceternity Typewriter Effect 零依赖复刻）

- 用户需求：主页面点「**Citywalk**」pill 后进入一个新界面，用 **Aceternity UI 的 Typewriter Effect** 显示「**新功能开发中......莫急！**」
- ✅ **兑现历史 TODO**：本文件「晚 · 七」条目（`Citywalk` 的那段）末尾记过 ——「Citywalk 的 pill 仍是**不可点击的 `<span class="pill">`**……如果之后要做 citywalk 详情页，记得同步改成 `<a class="pill" href="...">`」。本次即按此办理，该 TODO 已关闭

**组件来源与许可**
- 来源：Aceternity UI《Typewriter Effect》—— 页面 `https://ui.aceternity.com/components/typewriter-effect`，源码 `https://ui.aceternity.com/registry/typewriter-effect.json`（作者 Manu Arora）
- 许可：该组件以 Aceternity License 发布，**允许用于个人 / 客户的终端产品并允许修改，仅禁止把组件源文件当模板或素材转售**；本项目属个人展示，在允许范围内
- 与 `calligraphy.html` 借鉴「Draggable Card」同一口径：**只借用参数与交互意图，不复制 React 源码**；来源与许可原样写在 `citywalk.html` 头部注释里

**效果选型**
- registry 里有两个变体：`TypewriterEffect`（**逐字淡入**）与 `TypewriterEffectSmooth`（整句推进 + 光标跟随）。选了**前者** —— 中文短句逐字淡入的「打字感」最明显，且不需要测量文字宽度
- ⚠️ 官方 `TypewriterEffect` 的真实行为容易被误读：所有字符初始 `opacity-0 hidden`；进入视口后**一次性**设置 `display:inline-block` / `width:fit-content`，再按 `stagger(0.1)` 逐个淡入 —— 等价于「**所有字符瞬间占位 → 每 0.1s 淡入一个**」，**不是**逐字推进布局。详见页面头部注释

**改动（两个文件）**
1. **新增 `citywalk.html`**（362 行 / 13KB）：独立页面 + 返回主页，与 `travel.html` / `calligraphy.html` 同构
2. **`index.html` 两处**（第 1044 / 1151 行）：`<span class="pill">Citywalk<span class="pill-en">City Walk</span></span>` → `<a class="pill" href="citywalk.html">Citywalk<span class="pill-en">City Walk</span></a>`
   - `a.pill` 样式（含 `text-decoration:none; cursor:pointer; display:inline-block` 与 hover 上浮）**本就存在，未新增任何 CSS**

**参数 1:1 对照（本页 → 官方）**
- 每个字符 `.tw-char` 常驻 `display:inline-block; opacity:0` → `motion.span` 初始 `opacity-0 hidden`
- `animation: tw-char-in .3s ease-in-out both` → `{ duration: 0.3, ease: "easeInOut" }`
- `animation-delay: calc(var(--i) * .1s)` → `{ delay: stagger(0.1) }` ← 逐字间隔，打字感的来源
- `animation-fill-mode: both` → 延迟期间保持 `opacity:0`（同官方 initial hidden）
- `.tw-caret` `0.8s` + `infinite` + `alternate` → `{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }`；尺寸同为 `4px` 宽、`rounded-sm`

- ⚠️ **唯一有意偏离**：光标颜色用页面既有 `--sky-500`（#7aa8cf）而**不是**官方 Tailwind `blue-500`（#3b82f6），依据是「配色严格遵守水彩天空蓝体系，**不引入新色系**」。想还原官方原色只需改 `.tw-caret` 的 `background` 一行，页面注释里也写明了
- **零依赖**：没有引入 motion / React / 任何 CDN，纯原生 CSS 动画 + 一段拆字脚本；`file://` 双击可用
- **有意不引入 Google Fonts**（`calligraphy.html` 有引入，本页没有）：改用系统字体栈，保证离线可用

**无障碍 / 降级**
- 整句放在 `h1[aria-label]`，逐字 span 统一标 `aria-hidden` → 读屏不会一个字一个字念
- `prefers-reduced-motion: reduce` 下整句直接显示、去掉光标闪烁

- 📐 **验证（无头 Chrome + CDP，`citywalk-verify.mjs` / `citywalk-verify2.mjs` + `run-citywalk*.sh`）**：
  - **逐字时间线（40ms 采样，121 帧）**：可见字符数 `0 → 1 → … → 15`，出现时刻为 **208 / 329 / 408 / 528 / 608 / 729 / 809 / 928 / 1008 / 1129 / 1208 / 1328 / 1408 / 1528 / 1608 ms** —— 稳定每 ~100ms 出现一个字，**确认是逐字而非整体齐现**；早期帧（t=208ms）抓到 `[0.50, 0.06, 0, 0, …]` 的「有的已现、有的未现」共存状态
  - **结构**：15 个字符 span、`animation-name` 唯一值 `["tw-char-in"]`、`duration` 唯一值 `["0.3s"]`、`fill-mode` 唯一值 `["both"]`、延迟序列 `[0,100,…,1400]ms` 严格递增 100ms、最终 opacity 全 1
  - **光标**：`tw-caret-blink / 0.8s / infinite / alternate`、`4px × 40px`、`rgb(122,168,207)`（= `--sky-500`）
  - **布局**：窄屏 390×844 与桌面 1280×900 均**横向溢出 0**、卡片水平居中偏移 **0px**、文字**单行不折行**、光标紧跟末字同一行（垂直中心差 1px / 4px）
  - **重播按钮**：点击后 50ms 内 15 个字符 opacity 全部回落到 ~0，2.6s 后再次全部 = 1 → **重播有效**
  - **`file://` 双击**：页面正常、**无 JS 异常**、`assets/bg.jpg` 加载成功（1400×933）
  - **主页面入口**：两处 Citywalk 均为 `<a href="citywalk.html">`，`span.pill` 形式的 Citywalk **已为 0**；实测点击 About 面板里那枚能跳到 `/citywalk.html`
- ⚠️ **验证仪器坑（第二次踩，固化）**：`Page.navigate` 之后接**固定 `sleep`** 会误报 —— 本次首轮 sleep 3.2s 后量到的仍是**上一页**的 DOM（`.tw-caret` 为 `null` → 探针整体返回 `undefined`，`.tw-char` 为空数组）。判据：**看 http.server 日志里目标页压根没被请求**。改为轮询「`readyState === 'complete'` **且** 目标选择器已存在」并打印 `Page.navigate` 的 `errorText` 后全部通过。与「平板 pill」那次记的 `setTouchEmulationEnabled` 触发额外重载属同类问题：**导航 / 仿真之后一律轮询就绪，绝不固定 sleep**
- ⚠️ **同一个坑当天又踩到一次，一并固化（下次直接照做）**：
  1. **误报时第一件事是看 http.server 日志** —— 「目标页没被请求」= 根本没导航过去，不要先去怀疑页面代码
  2. **换新 `--user-data-dir` 起 Chrome 时，`/json/list` 的第一项可能是 `about:blank`**。权威副本首轮验证就中招：读到空 DOM、`pill 总数 = 0`、`location.pathname = "/"`，而服务器日志显示 `index.html` 明明 `200` 了。**必须按 URL 前缀挑 target**（`t.url.startsWith(BASE)`）而不是取第一个 `type === "page"`
  3. **探针要能自己暴露「选错页面」**：`document.querySelector('.tw-caret').getBoundingClientRect()` 这种链条在元素不存在时会抛错，让整个探针静默返回 `undefined` —— 看起来像「页面没渲染」，其实只是选错了 target。关键断言前先打一行 `target 列表 = …` 能省掉一轮排查
- ✅ **已同步到权威项目** `~/Documents/个人主页/outputs/personal-homepage/`（`citywalk.html` + `index.html` + `AGENTS.md`）：`citywalk.html` 与 `index.html` 经 `cmp` 校验两副本逐字节相同，sha256 分别为 `98ddb6916e602b14…` 与 `dacf9395b692daca…`；上面全部验证结论对权威副本同样成立

### 2026-09-18（平板竖屏：About 面板「兴趣」三枚 pill 排成一行）

- 用户反馈：**平板竖屏**时 About 面板「兴趣」里的 `Citywalk` 掉到第二行，与「旅行 / 书法」不在同一行，而「位置明明是足够的」，要求**排成一行、不换行**；并明确 **手机、电脑、平板横屏一律不变**
- **根因（实测数据）**：三枚 pill 单行需 **395.4px**（`100.25 + 128.77 + 148.38`），另加 2×9px 的 `gap`
  - 平板竖屏（`min-width:640px` 起）About 是**两列**栅格，兴趣栏按自动放置落在**左列**，列宽只有 **290 / 306 / 310 / 315 / 391px**（768 / 810 / 820 / 834 / 1024 视口）→ **必然折行**
  - 这正是用户说「位置明明是足够的」的来源：兴趣栏所在的**第三行右列本来就是空的**（右列第 3 行没有内容），第一行「旅行 书法」（229px）右侧那一整块空白看着确实够放 `Citywalk`
  - 注意 iPad Pro 12.9 竖屏（1024）只差 **4.4px** 就折行，所以它也属于要修的范围；而它和 iPad 9.7 横屏（同为 1024 宽）**只能靠 `orientation` 区分**
- **改动（`index.html`，两处）**：
  1. HTML：兴趣那一栏的 `<div class="about-item">` 加类 → `<div class="about-item interests-item">`（只在需要时好选中，不给它 `span-all`，否则全端都会跨列）
  2. CSS：紧跟 `.about-item { min-width: 0 }` **纯新增**一条媒体查询，让兴趣栏跨列：
     ```css
     @media (min-width: 641px) and (max-width: 1024px) and (orientation: portrait) and (hover: none) and (pointer: coarse) {
       #panel-about .about-item.interests-item { grid-column: 1 / -1; }
     }
     ```
- ⚠️ **三重限定缺一不可，且必须用「设备能力」判定触屏**：
  - `orientation: portrait` 把**平板横屏**（1024/1180/1194 宽）摘出去 —— 平板横屏列宽 ≥450px，本来就够一行，且 `1024px` 竖屏与 `1024px` 横屏宽度完全相同，**只有朝向能分开**
  - `(hover: none) and (pointer: coarse)` 把**电脑**摘出去 —— 电脑把窗口拖成竖窗（900×1200）时 `orientation` 也是 portrait，靠 hover/pointer 才能不误伤（同「液态玻璃球」章节的判定口径）
  - `min-width: 641px` 把**手机**摘出去 —— 手机 About 本就是单列（`max-width:284px`），跨列无意义
- **没有动任何排版细节**：pill 的内边距、`gap: 9px`、`font-size: 13.5px`、`letter-spacing`、英文小字全部原样，只是把这一栏的**可用宽度**从 290~391px 换成 598~801px（跨列后）
- 📐 **验证（无头 Chrome + CDP，`hp-pills-verify.mjs` + `run-pills.sh`，16 视口）**：**16/16 通过**
  - **平板竖屏 5 档**（768/810/820/834/1024）：`跨列=1 / -1`、**行数 1**、pills 溢出 0、页面横向溢出 0；跨列后可用宽 **597 / 630 / 638 / 649 / 801px** vs 需求 395.4px（余量 200px+，安卓更宽的 fallback 字体也吃得下）
  - **零回归**（逐项与改动前一致）：平板横屏 3 档、手机 390/360/320/横屏 844、电脑 1280/1024/窄窗 768/竖窗 900×1200 全部 `跨列=auto / auto`，行数仍为 `2 / 2 / 3 / 2 / 1 / 2 / 2 / 2`（与基线逐项相同）
  - 所有 16 档的 pill 宽度恒为 `100.25 / 128.77 / 148.38`、`gap=9px`、`flex-wrap=wrap`、`font-size=13.5px` —— 证明只改了布局归属，**样式一字未动**
- ⚠️ **验证仪器坑（再记一次）**：`Emulation.setTouchEmulationEnabled` 会触发页面**额外重载**，reload 后固定 `sleep(2400)` 会大面积误报「测量失败」；必须轮询 `document.readyState === "complete"` **且** 目标元素已存在再测
- ✅ **已同步到权威项目** `~/Documents/个人主页/outputs/personal-homepage/`（`index.html` + `AGENTS.md`）：两份 `index.html` sha256 均为 `73d36715c97af993…`（改动前 `f91cd48b54cc1859…`）、两份 `AGENTS.md` 均为 `17dddadf24dd1c82…`；因两份文件逐字节相同，上面 16 视口的验证结论对权威副本同样成立

### 2026-09-18（手机端 / 平板端：彻底去除跟随鼠标的液态玻璃球 · 电脑端零回归）

- 用户要求：**手机端和平板端完全去掉这颗跟随鼠标的玻璃球**——不显示、不跟随、不渲染，**且不保留它占的位置**（不是「留个空位」）；**电脑端必须一点不变**。用户先问了可行性、确认「电脑端可以完全不变」后才批准动手（B 口径）
- **根因**：原先只有 `MOBILE_Q = matchMedia("(max-width: 700px)")` **一个**判定，且**只看宽度**：
  - **平板（>700px）走的是完整桌面分支** → 球照常显示、照常跟随。基线实测 iPad 三档 **1024 / 834 / 768 全部 `跟着动了=true`**；`pointermove` 里也没过滤 `pointerType`，所以手指滑动/触控笔同样会拖动它
  - **手机（≤700px）**虽然早已不跟随，但 Home 面板的球仍落在 `.welcome` **文档流**里**真实渲染**，白占约 198px 高
- **改动（`index.html`，共 7 处；桌面分支的原有逻辑一行未改，全部是「新增条件」）**：
  1. 新增 `const TOUCH_Q = window.matchMedia("(hover: none) and (pointer: coarse)")` —— **用「设备能力」而不是「宽度」区分平板与电脑**：1024px 的 iPad 和 1024px 的电脑窗口宽度完全相同，只有 hover/pointer 能分开
  2. CSS 新增兜底 `@media (hover: none) and (pointer: coarse) { .hero-glass { display: none } }`（防止脚本异常时球闪现）
  3. `placeOrb()` 开头：`TOUCH_Q.matches` 时 `follow.on = false` + `transform = ""` + `display = "none"` 后直接 return
  4. `applyOrb()`：非触屏判定改为 `MOBILE_Q.matches || TOUCH_Q.matches || orbSize < 2`
  5. `pointermove` 的跟随分支：加 `!TOUCH_Q.matches`
  6. `start()`：加 `TOUCH_Q.matches` 提前 return（循环压根不启动，省电）
  7. 新增 `TOUCH_Q` 的 `change` 监听 → `placeOrb()` + 藏球时 `stop()` / 恢复时 `start()`（iPad 插拔鼠标、外接触控板时即时切换）
- ⚠️ **`TOUCH_Q` 与 `MOBILE_Q` 是「叠加」而不是「替换」**：电脑把窗口拖窄到 ≤700px 时，`TOUCH_Q` 为假，仍走原来的窄屏分支 → 电脑端**任何窗口宽度**的行为都与改动前一致
- ⚠️ **必须用 `display:none`，不能用 `visibility:hidden` / `opacity:0`**：点击涟漪走的是 `getBoundingClientRect()` 圆形命中判定，`display:none` 时 rect 全 0 → 自然跳过；`visibility:hidden` 的 rect 仍有效 → 在球本该消失的空白处误触发涟漪
- 📐 **验证数据（无头 Chrome + CDP；`run-orb.sh` + `orb-verify.mjs`，9 个场景）**
  - **电脑端零回归（逐项完全一致，含 1px 级）**：4 档鼠标环境 —— 1280 停靠 `[904,161,236,236]`、跟随落点 `[676,287,236,236]`、`doc 2935`；1024 `[748,177,205,205]` / `[532,302,205,205]` / `2820`；768（电脑拖窄，仍是 absolute 跟随）`[560,192,154,154]` / `[399,328,154,154]` / `2483`；**390（电脑拖窄到手机宽度，仍走原窄屏分支）** `[105,307,179,179]` / `doc 2667` / `welcome 379` —— 全部与改动前**逐字节相同**
    - ⚠️ 中途出现过「1280 跟随落点差 1px」，加长收敛时间（`SETTLE=2500`）后**完全吻合** → 那是渐近缓动的采样相位，不是位移回归。**对比跟随位置一定要让缓动收敛透**
  - **平板（1024 / 834 / 768，触屏）**：`display:none`、`orbSize=0`、`running=false`、指针移动后 rect 仍 `[0,0,0,0]`；**布局零变化** —— `doc.scrollHeight` 前后均 `2820 / 2554 / 2483`，`welcome` 均 `[137,285] / [134,253] / [128,282]`（它本是 `position:absolute` 浮层，不占位）
  - **手机（390 / 360，触屏）**：`display:none`、不跟随、循环未运行；**位置不保留、下方内容上移** —— 390 的 `doc 2667 → 2469`、`welcome 379 → 181`；360 的 `2666 → 2483`、`365 → 181`（上移量 = 球高 + `margin-top 18px`，390 实测 **198px**）
  - **动态能力切换**：1024 下触屏 → 插上鼠标 → 拔掉鼠标，三次切换均**即时生效**（`display` none→block→none、`running` false→true→false），验证了第 7 处 `change` 监听
  - `file://` 双击复测：球宽 **236**、自检钩子 `object`、无异常（只有 SwiftShader 既有的 `GPU stall due to ReadPixels` 性能警告，改动前就有）
- 🔬 **本次踩到的两个「验证仪器」大坑（以后再验本项目别重犯）**：
  1. **`Emulation.setEmulatedMedia` 传 `hover` / `pointer` features 完全不生效**：连着设 `hover:none / pointer:coarse / any-*`，页面 `matchMedia("(hover: none)")` **仍是 false**。真正能翻转这些媒体特性的是 **`Emulation.setTouchEmulationEnabled({enabled:true, maxTouchPoints:5})`**（同时把 `maxTouchPoints` 变 5、重载后 `ontouchstart` 变 true —— 与真实 iPad 报告的能力一致）。`Emulation.setDeviceMetricsOverride(mobile:true)` **单独也做不到**
  2. **`Page.reload` 默认会命中 Chrome 的 HTTP 缓存**：python 服务器只给 `Last-Modified`、没有 `Cache-Control`，Chrome 按启发式规则照样缓存 → 改完代码跑验证，**9 个场景的数据与基线逐字节相同**（差点误判成「改动没生效」）。必须 `Network.setCacheDisabled({cacheDisabled:true})` + `Page.reload({ignoreCache:true})`；且**启动时的首次导航早于禁缓存**、仍可能读到上一轮遗留的缓存 → 所以在脚本里加了一道「载入校验」（检查页面里有没有新的触屏媒体查询文本）来防呆
- 基线对照方式：把原始文件放进 `.deepworks/tmp/hp-baseline/`（`assets` 用软链指回项目）单独起服务，`run-orb.sh` 参数化 `DIR` / `OUT` / `ONLY`（`mouse`/`touch`）/ `SETTLE`，改动前后各跑一遍再 diff —— **这样才是真正的同条件对照，而不是凭记忆**
- 同步：`Documents/deepwork/outputs/personal-homepage/index.html` 与 `Documents/个人主页/outputs/personal-homepage/index.html` 两份 sha256 一致（改动后 `f91cd48b54cc1859…`，改动前 `a1e35730287b851c…`；文件 84560 → **87086** bytes）

### 2026-09-18（手机端：数字分身输入栏的 Send 按钮不再出框）

- 用户反馈：安卓端**数字分身（Virtual Space）**面板的 **Send 按钮出框**（顶出输入栏）；**苹果端正常**；**电脑端不改**
- **根因（经典 flex 最小宽度陷阱）**：
  - `.input-bar input` 只写了 `flex: 1`。flex 子项的 `min-width` 默认是 `auto`，对 `<input>` 而言就等于**固有宽度 185px**（`size=20` 默认值 × 14px 字体），所以它**根本收缩不下去**
  - 于是整栏的最小宽度 = input 185 + send 120 + gap 10 = **315px**，而可用宽只有 **视口 − 约 110px**
  - 实测溢出：430 余量仅 5px（不溢出）→ 414 顶出 **9px** → 390 顶出 **31px** → 360 顶出 **61px 并把页面撑出横向滚动** → 320 顶出 **101px**
  - 安卓字体更宽 → input 固有宽度更大 → 顶得更狠。这就是「安卓出框、苹果看着正常」的来源 —— 苹果端 390/393 其实也在顶，只是幅度小、不明显
- **改动**（`index.html`，两处，**均为新增行**，原有属性一行未删）：
  - `.input-bar input` 增加 **`min-width: 0`** —— 让它能真正收缩，这是修复的根本。桌面端因空间充裕，实测宽度**完全不变**
  - 新增 `@media (max-width: 380px) { .input-bar .stateful-btn { width: clamp(88px, 26vw, 120px); } }` —— 只靠 input 收缩的话，输入框在小屏会只剩 124px（320px 屏仅 84px）太挤，所以把 send 一并收窄、把宽度还给输入框；381px 以上与桌面端不受影响
- 副作用核对：该媒体查询的特异性 (0,2,0) 与后面的 `.stateful-btn.is-loading / .is-success` 相同，靠源码顺序后者仍胜出 —— 实测各视口 loading 态宽度均仍是 **48px 圆形**，原动画未被破坏
- 验证（无头 Chrome + CDP，`hp-chat-send-verify.mjs`，11 视口）：**全部通过**，输入栏溢出 0px、Send 越界 0px、页面无横向滚动
  - input 宽度：430 → 189.84px · 414 → 176.09px · 393 → 157px · 390 → 154px · 375 → **161.5px**（send 同步缩至 97.5px）· 360 → **150.41px**（send 93.59px）· 340 → 135.61px · 320 → **116px**（send 88px）
  - **桌面零回归**：1280 / 1024 / 768 的 input 仍 788 / 670.56 / 467.06px、send 仍 120px、gap 仍 10px —— 与改动前逐项一致
- 同步：`Documents/deepwork/outputs/personal-homepage/index.html` 已同步，两份 sha256 一致

### 2026-09-18（手机端：胶囊导航 About Me / Home / Virtual Space 不再折行）

- 用户反馈（附安卓截图）：安卓端三个导航项折成两行（`About` / `Me`、`Virtual` / `Space`），**要求排成一排**；**苹果端正常**；**电脑端不改**
- **根因（两个原因叠加，缺一不可）**：
  1. `.nav a` 没设 `white-space`。它作为 flex 子项，默认 `min-width: auto` 的最小宽度是**「最长单词」而不是整段**，所以空间一紧就从空格处断开 —— 而不是把胶囊撑宽
  2. `--font-serif` 首选 `"Songti SC"` / `"STSong"`，**苹果端有、安卓端没有**，只能 fallback 到 `"Noto Serif SC"` / 通用 serif，同一字号下英文更宽。这正是「苹果端正常、安卓端折行」的来源
- 📐 **实测数据**：单行需 **288px**，胶囊可用宽 = **视口 − 90px**（body 24 + `.page` 32 + `.masthead` 32 + 胶囊左右内边距 28 ≈ 90）→ 盈亏点约 **378px**：390 / 393 / 412 不折，375 / 360 / 320 必折，与用户截图完全吻合；安卓因字体更宽还会再提前
- **改动**（`index.html`，紧跟 `.nav a:hover, .nav a.active` 之后**纯新增**三个媒体查询，`.nav` / `.nav a` 原规则一行未改）：
  - `@media (max-width: 430px)`：① `.nav a { white-space: nowrap }` 从根上禁止断行；② 只收紧 `gap` 与内边距（`gap: min(34px, 2.33vw)`、胶囊内边距 `min(40px, 2.79vw)`、项内边距 `min(10px, 2.21vw)`）—— **字号与字距一律不动**，手机上「字」本身没变，变的只是词与词之间的留白
  - `@media (max-width: 380px)`：再收紧一档，到这一档字号才略缩（`clamp(11.5px, 3.45vw, 13px)`），给安卓更宽的 fallback 字体腾余量
  - `@media (max-width: 340px)`：极窄屏兜底，把字体宽度差异的容差从约 18% 抬到约 28%，与主流机型拉平，避免极窄屏被顶出横向滚动
- 验证（无头 Chrome + CDP，`hp-nav-verify.mjs`，13 视口）：**全部通过**，三项均 `1 行`、零溢出、页面无横向滚动
  - 430 / 414 / 412 / 393 / 390 → 字号 **13px 原值**，导航宽 268~278px，可用宽 300~340px，余量 32~62px（381~430 这档只做很轻的收紧，是为了给安卓的 412/414 机型留余量；苹果端字号完全没变）
  - 375 → 229px（可用 285）· 360 → 220px（可用 270）· 340 → 193px（可用 250）· 335 → 190px · 320 → 188px（可用 230）
  - **字体容差**（按 macOS 实测文本宽反推「安卓 fallback 字体可宽多少仍不溢出」）：375 约 32%、360 约 30%、340 约 37%、320 约 28% —— 均远高于实测 10~20% 的字体差异
  - **桌面零回归**：1280 / 1024 / 768 的 `white-space` 仍为 `normal`、`gap` 仍 34 / 30.72 / 23.04px、项内边距仍 `10px/10px`、字号仍 17 / 17 / 15.36px —— 与改动前逐项一致
- 同步：`Documents/deepwork/outputs/personal-homepage/index.html` 已同步，两份 sha256 一致

### 2026-09-18（手机端：About 面板简介保持单行不折行）

- 用户反馈：「大一在读 · 在深圳慢慢长大 · 记录生活的人」在手机上会折行，**要求不折行，且明确「电脑端挺好的不用改动」**
- **根因**：`.hero-note` 在手机端没有任何覆盖规则。`font-size: 13.5px` + `letter-spacing: 0.05em` 下这句**单行实测需 276.5px**，而容器可用宽恒为 **视口 − 130px**（body 12×2 + `.page` 16×2 + `.card` 24×2 + `.hero-intro` 12×2）→ **≤400px 必然折成两行**（414px 时 282 > 276.5 刚好还是单行，这就是断点边界）
- **改动**（`index.html`，紧跟 `.hero-note` 原规则之后**纯新增**两个媒体查询，原规则一行未动）：
  - `@media (max-width: 430px)`：四招吃回空间 —— ① `white-space: nowrap` 禁止折行；② 左右各 **−12px 负边距**吃回 `.hero-intro` 的内边距（凭空多出 24px 可用宽）；③ 字距 `0.05em → 0.01em`；④ `font-size: clamp(11.5px, calc((100vw - 106px) / 19.56), 13.5px)` 随视口线性收缩
  - `@media (max-width: 331px)`：极窄屏兜底，恢复 `white-space: normal` + 原字号字距 —— 否则为保单行要么把字缩到不可读，要么溢出
- 📐 **`19.56` 这个常数是实测算出来的，不是估的**：字距 0.01em 下「单行宽 ÷ 字号」恒为 `264.09 / 13.5 = 19.56`，且各视口完全一致（360 → `254 / 12.9857`、340 → `234 / 11.9632`，都是 19.56），所以线性收缩是**精确解**而非近似
- ✅ **关键收益**：因为负边距先吃回 24px，**383~430px 区间字号仍是原值 13.5px（一个字都没动）**，真正缩字的只有 ≤382px。375 视口实测：字号 13.5px、单行宽 264.09px —— 与改动前视觉完全一致
- 验证（无头 Chrome + CDP，`hp-note-verify.mjs`，12 视口）：**全部通过**
  - 430 / 414 / 400 / 390 / 375 → 字号 **13.5px 原值**、单行宽 264.09px、**1 行、零溢出**
  - 360 → 12.99px、340 → 11.96px，均 1 行零溢出
  - 331 / 320 → 兜底折行 2 行、零溢出
  - **桌面零回归**：1280 / 1024 / 768 的 `white-space` 仍为 `normal`、字距 `0.675px`、左右 `margin: 0px`、字号 `13.5px`、单行宽 `276.52px` —— 与改动前**逐项完全一致**
- 同步：`Documents/deepwork/outputs/personal-homepage/index.html` 已同步，两份 sha256 一致

### 2026-09-18（建议表单：「与我的关系」「设备」下拉框统一成输入框外观）

- 用户反馈原话「填写与我的关系和设备的『请选择』那个框有点突兀，帮我改成和『你的昵称』和『填写建议』的框一样的」
- **根因**：CSS 只给 `.field input` 和 `.field textarea` 写了样式，**`<select>` 一条都没有**，于是保持了浏览器原生外观。实测落差极大 —— 输入框 `918×48 / 圆角 14px / 冰蓝边框 rgba(217,232,244,.9) / 14.5px PingFang SC / 墨蓝 #2b3b4c / 半透明白底` vs 下拉框 `76×19 / 直角 / 系统深灰 rgb(118,118,118) / 13.33px Arial / 纯黑 / 纯白底`，宽度只有输入框的 **8%**、高度不到 **40%**
- **改动**（`index.html` 的 `.field` 区块，原 724–744 行四处）：
  - 共享选择器 `.field input, .field textarea` → 加入 `.field select`，一次性继承全部材质（满宽 / 字体 / 颜色 / 背景 / 边框 / 圆角 / padding / transition）
  - 新增 `.field select` 块：`appearance: none`（+ `-webkit-` 前缀）抹掉系统外观、`padding-right: 44px` 给箭头让位、`cursor: pointer`、自绘下拉箭头（内联 SVG 折线 `M1 1.75L6 6.25L11 1.75`，`--ink-500` = `%236b8294`，12×8，`right 16px center`，与页面圆角线条风格一致）
  - 新增 `.field select:invalid { color: var(--ink-400) }`：**借 `required` 属性**让未选择时的「请选择」自动显示为占位浅灰，选中后自动回到墨色，重置回空值又变浅灰 —— 无需任何 JS
  - 新增 `.field select option { color: var(--ink-900) }` 保证展开列表里文字可读；`:focus` 规则补上 `.field select`
- ⚠️ **顺序要点**：`.field select { background-image: … }` 必须写在共享规则 `background: rgba(255,255,255,0.8)` **之后**，否则简写会把 `background-image` 重置掉（两者特异性相同 `(0,1,1)`，靠源码顺序决胜）
- 验证（无头 Chrome + CDP，`hp-select-verify.mjs`）：**1280 / 1024 / 768 / 390 / 360 五个视口 × 18 项断言 = 90/90 全通过**。下拉框宽度与 input **逐视口完全相同**（918 / 800.6 / 597.1 / 284 / 254），高度 **19 → 48** 与 input 一致；占位色 `rgb(157,177,192)`、选中后 `rgb(43,59,76)`、重置回占位色；`appearance: none`、箭头已渲染、无横向溢出
- 功能回归：`relation.value` / `device.value` JS 读取正常（`=== '同学'`）、选项完整（关系 8 项含「请选择」、设备 5 项）、提交按钮在位、**Supabase 提交逻辑一行未动**
- 副作用：无。`.field select` 作用域限定，全页仅这两个 `<select>`；`.field` 共 4 个，均在本表单内
- ✅ **已同步到 deepwork 副本**（同日）：按用户要求，`Documents/deepwork/outputs/personal-homepage/` 已同步到权威版，共 11 个文件（`index.html`、`AGENTS.md`、`.gitignore`、`test-feedback.html`、`test-supabase.html`、`部署指南.md`、5 个 `*.sql`）。两份 `index.html` sha256 均为 `b97aeb52fd5abefa…`；deepwork 副本实测 1280 / 390 视口渲染全通过（下拉框满宽 918 / 284、高 48，与 input 一致）
- 同步时**有意跳过**：`.git/`（权威副本的独立仓库，复制会在 deepwork 仓库里形成嵌套仓库）、`.DS_Store`（系统文件）、`.~mepage优化清单.docx`（Word 锁文件，本就被 `.gitignore` 忽略）、`assets/tour-{1,2,3}.png`（**7.5MB 且没有任何 html 引用**的废弃素材 —— `index.html` 实际引用的是同名 `.jpg`，三张 jpg 两份都有）
- ⚠️ `deepwork/outputs/personal-homepage/` **未被 deepwork 仓库跟踪**（`git ls-files` = 0 条，同时也没被 `.gitignore` 忽略，属 untracked）→ 没有 git 兜底。同步前的旧版已备份至 `.deepworks/tmp/backup-deepwork-before-sync/`（`index.html` sha256 `6ec4ae17dc7a0cba…` / `AGENTS.md`）

### 2026-09-17（旅行页：地球上的照片标记缩小 · 52/40 → 42/32）

- 用户反馈「图标有点挤有点乱了」→ 缩小地球上的照片标记：桌面 `MSIZE` **52 → 42**、窄屏 **40 → 32**（`applyMarkerSize` 里改成 `stage.clientWidth < 640 ? 32 : 42`），CSS 兜底值 `var(--msize, 42px)` 同步
- 描边一起按比例调轻（小圆配粗白边会显得笨重）：`.gmarker-ring` 白边 `3px → 2.5px`、阴影 `0 5px 16px/0.36 → 0 4px 12px/0.32`；悬停 `scale(1.13) → 1.16`（小圆需要更强的反馈）、粉色光圈 `4px → 3px`
- 「最小分离」系数 `GAP = MSIZE × 1.08` → **`× 1.12`**（照片变小后多留一点透气）；`CAP = MSIZE × 1.6` 随之由 83.2 降到 67.2
- ⚠️ **连锁效应**：`GAP` 与 `CAP` 都按 `MSIZE` 等比缩放，所以缩小图标**本身不会让相对间隙变松**（`GAP / MSIZE` 恒定）。真正变松的是「照片占屏幕的比例」——13 枚 42px 圆的覆盖面积只有 52px 时的 **65%**，地球露出更多，拥挤感因此缓解。想让间隙真的更大，只能调 `GAP` / `CAP` 的系数
- 验证（`globe-check.mjs` + `run-globe.sh`）：1280×900 与 430×880 下两种状态 **13 枚 78 对全部零重叠、无横向溢出**；最紧一对是杭州↔武汉 **44.3px（需 42px）**，杭州位移 67px 正好触到 `CAP`(67.2) —— 想再拉松需单独放大 `CAP` 系数，但杭州锚点离球心只有 68px，再推会穿过球心，不建议
- `file://` 双击复测：13 枚尺寸 39–42px、缩略图全部加载、点击大阪大图 `1200×1600`、`EVENTS: none`
- 同步：`travel.html` 已复制回本目录，`diff -q` = SAME
- 遗留（用户没要求，本轮没做）：「13 城集中在东亚/东南亚，屏幕左侧大片空白」是地理事实。若要让城市群更居中，可把初始机位经度从 `119.0` 往东挪（城市群中心约 `20.6N, 121.8E`），但会改变已定的初始视角，需先问用户

### 2026-09-17（旅行页：3 城扩到 13 城 · 密集标记的分离与收敛）

- **新增 10 座城市的真实旅游照片**，`TRAVELS` 由 3 条扩到 13 条：北京（故宫神武门）、天津（天津之眼）、香港（迪士尼城堡烟花）、澳门（威尼斯人室内运河）、仙本那（海与防波堤）、杭州（浙江大学校门）、苏州（园林池塘曲桥）、济南（大明湖楼阁垂柳）、武汉（黄鹤楼）、新加坡（滨海湾云雾林）
- ⚠️ **城市归属一律按「照片里的地标」判定，不要相信文件名或上传顺序**：这一批 10 张的 `stat` 出生时间被拍平成同一秒、`mdls` 无 GPS、`ls -U` 只是 APFS 枚举序 —— 任何元数据都还原不出真实上传顺序，只能用视觉逐张识别（**一次只喂一张图**，多张同批会返回「分析未完成」）
- 素材：`assets/travel/{beijing-forbidden-city,tianjin-eye,hongkong-disney,macau-venetian,semporna-sea,hangzhou-university,suzhou-garden,jinan-daming-lake,wuhan-yellow-crane,singapore-cloud-forest}.jpg`（长边 1600 / q72，**原图小于 1600 的不放大**，共 5.1MB）+ 同名 `-thumb.jpg`（长边 320 / q70，约 20KB）
- 坐标：北京 `39.9163,116.3972`、天津 `39.1518,117.2146`、香港 `22.3129,114.0413`、澳门 `22.1459,113.5605`、仙本那 `4.4778,118.6111`、杭州 `30.2639,120.1210`、苏州 `31.3230,120.6295`、济南 `36.6653,117.0190`、武汉 `30.5449,114.3045`、新加坡 `1.2834,103.8636`
- ⚠️ **分离迭代轮数 4 → 10**（`updateMarkers`）：13 个点挤在约 120px 内时，推挤会沿链条互相传导，4 轮收敛不充分 —— 桌面最紧的一对只剩 **51.2px（需 51px，几乎零余量）**；10 轮后最小 **55.5px（余量 4.5px）**。最大位移 83px 正好触到 `CAP = MSIZE × 1.6`，13 张照片仍全部落在球面内（离球心最远 173px < 球半径 186px）
- 验证（无头 Chrome + CDP，`globe-check.mjs` + `run-globe.sh`）：1280×900 与 430×880 下 **13 枚两两 78 对全部零重叠、无横向溢出**；10 城逐个点击 → 面板展开、`photo` / `note` 一一对应、竖图 451×602 / 横图 802×602 均未被裁；拖动转走后 13 枚全部 `display:none`；`EVENTS` 只有 favicon 404
- `file://` 双击复测（不带 `--allow-file-access-from-files`、不开服务器）：`ready=true`、13 枚缩略图全部 `ok:true`、点击大阪大图 `1200×1600`、`EVENTS: none`
- 同步：`travel.html` 与 `assets/travel/`（新增 20 张）已复制回权威项目，`diff -q` = SAME

### 2026-09-17（旅行页：地球上的圆形照片标记）

- **`travel.html` 三枚示例标记换成用户的真实旅游照片**，参考 Aceternity UI《3D Globe》（Manu Arora）的「标记本身就是贴在地球上的图片 + 悬停浮出地名」的观感，用现有 three.js + DOM 投影**独立实现**（未复制其 React 源码）：
  - 城市归属按**照片内容里的地标**判定，不是按文件名：`大阪城天守閣`（庭园池塘倒影）→ **大阪**；`伏见稻荷大社千本鸟居` → **京都**；`银座商业街` → **东京**
  - 素材：`assets/travel/{osaka-castle,tokyo-ginza,kyoto-fushimi-inari}.jpg`（长边 1600、q72，共 1.8MB）+ 同名 `-thumb.jpg`（长边 320、q70，约 30KB）。**地球上用 thumb，点开看大图** —— 地球上的圆只有 52px，加载 1600px 原图纯属浪费
  - 坐标：大阪城 `34.6873,135.5259`、伏见稻荷 `34.9671,135.7727`、银座 `35.6717,139.7650`
- **标记改为圆形照片**（`.gmarker` / `.gmarker-ring` / `.gmarker-tip`，替换原 `.marker-dot` + `.marker-name`）：白色圆环 + 照片、悬停/键盘聚焦/选中时圆环放大加阴影并浮出「城市 + 英文名」气泡
- ⚠️ **大阪—京都—东京投影到屏幕上只隔 15～30px（1px ≈ 30km），52px 的圆形照片必然糊成一团**，所以加了一层**屏幕空间「最小分离」**（`updateMarkers`）：
  - 每帧先算三地的真实锚点屏幕坐标，再两两推开到 `GAP = MSIZE × 1.08` 以上（4 轮迭代），**位移封顶 `MSIZE × 1.6`**，避免照片漂到离城市很远的地方
  - 被推开的照片用**虚线 + 3px 小圆点**连回地表真实位置（`.globe-links`，一个绝对定位的 `<svg>`，插在 `#globe` 与 `.marker-layer` 之间）；位移 ≤ 4px 时虚线自动隐藏，所以只有挤在一起的城市才会出现连线
  - 位移**每帧从锚点重算**（不做跨帧累加），否则地球自转时误差会累积、照片会「游」到屏幕角落
  - 可见性阈值 `FACING_MIN = 0.12`（背面的标记隐藏）；大小按 `0.64 + 0.36 × facing` 缩放，模拟球面透视
  - ⚠️ **碰撞判据要按圆形算，不能按 `getBoundingClientRect()` 的方形包围盒**：实测圆心距 56px > 半径和 52px（即照片**没**重叠）时，两个方形包围盒的**角部**依然相交 50px²，按包围盒判定会误报重叠
  - ⚠️ SVG 用**地球容器内坐标**、`getBoundingClientRect()` 用**视口坐标**，两者差一个 `stage` 偏移；用后者去验算前者的长度会得出「虚线 446px」这种假数据，验证时要先减去 `stage.left/top`
- 手机端照片直径降为 **40px**（`stage.clientWidth < 640`），`resize()` 里同步调用 `applyMarkerSize()`
- **竖版照片不再被裁**：`.photo-frame` 改 `width: fit-content` 让框跟着照片比例收窄，`img` 用 `max-height: 74vh` + `max-width: 100%` 按原比例完整显示（原来是 `object-fit: cover` 填满，3:4 的竖图会被裁掉上下）
- 验证（无头 Chrome + CDP，量 `getBoundingClientRect` 与内联 `transform`，脚本 `.deepworks/tmp/globe-check.mjs` + `run-globe.sh`）：
  - 1280×900：三枚 **52px 圆心距 56.1 / 79.7 / 55.7px，全部 ≥ 半径和 → 零重叠**；拉开 20～44px，虚线长度与位移一致；`EVENTS` 只有 favicon 404
  - 430×880：40px，圆心距 43.0 / 57.3 / 44.1px，**零重叠、无横向溢出**
  - 悬停浮出「大阪 OSAKA」；点击 → 面板展开，大图 `1200×1600` 按 `500×666` 渲染（3:4 未被裁）；拖动把东亚转走后三枚标记 `display:none`
  - **`file://` 双击复测**（不带 `--allow-file-access-from-files`、不开本地服务器）：地球正常渲染、三枚缩略图 `240×320` 加载完成、大图 `1200×1600`、`EVENTS: none`
- 同步：`travel.html` 与 `assets/travel/`（6 张）已复制回权威项目，`diff -q` = SAME

### 2026-09-12（书法页去掉文字 + Aceternity 式堆叠拖拽）

- **`calligraphy.html` 去掉照片下方的文字**（用户要求）：删除 `.work-cap` / `.work-title` / `.work-meta` 的 DOM 与全部相关 CSS；作品名改由 `figure[aria-label]` + `img[alt]` 承载，读屏仍可获取，视觉上只剩宝丽来白边 + 照片
  - ⚠️ 文字删除后 `fitPhoto()` **不再需要迭代收敛**：卡片高度恒定，单次 `w = artH × ratio + 2×PAD` 即精确（上一轮「标题换行 → 高度回馈」的循环坑随之消失）
- **借鉴 Aceternity UI《Draggable Card》（Manu Arora）的堆叠排版与拖拽手感**，用原生 JS + rAF **独立复刻**（未复制其 React/motion 源码——本项目硬约束是零依赖、`file://` 双击可用，与该组件不兼容）：
  - 叠放：`.stage` 加 `perspective: 3000px`，卡片 `transform-style: preserve-3d`；六张卡按 `nx/ny/rot` 归一化坐标错落叠放（`WORKS` 新增这三个字段）
  - 划过轻微晃动：`rotateX/rotateY` 用**弹簧**（`k=100 / c=20 / m=0.5`，对应原组件 `stiffness 100 / damping 20 / mass 0.5`）追踪指针，倾角上限 **25°**、映射区间 **±300px**；指针离开后弹回 0
  - 反光：`.work::after` 白色斜光渐变，`opacity` 跟随指针（上限 0.18），对应原组件的 glare 层
  - 悬停放大 **1.02**（原组件 `whileHover={{scale:1.02}}`）
  - **惯性甩出**：松手速度 × `FLICK 1.05`，之后按 `exp(-3.6·dt)` 衰减；拖拽中撞边界走**软墙**（`WALL 0.28` 橡皮筋），停下时 `hardClamp` 归位；甩动时叠加 `rotateZ` 摆动（`SPIN_K 70`、上限 8°），边界回弹 `RESTITUTION 0.55`
  - `prefers-reduced-motion` 下禁用倾斜与惯性；双击卡片归位；交互提示同步改为「鼠标划过会轻轻晃动 · 按住拖动，甩一下会飞出去 · 双击归位」
  - ⚠️ **未照搬原组件的惯性写法**：其源码里 `animate(from, from + v*0.3, …)` 的**返回值未被使用、实际不生效**，惯性形同虚设；这里按「速度 → 指数衰减 + 软墙 + 回弹」实现，手感等价且可控
- ⚠️ **`transform` 必须叠加「基准位移 + 拖拽偏移」**：本轮初版只写了 `translate3d(it.x, it.y)`，漏掉 `nx/ny` 换算出的 `basePos`，六张卡片全叠在画布正中心（实测 `spread x=0, y=0`），且最上层卡片吃掉全部指针事件，导致倾斜/惯性全测不出来。已抽出 `updateBase()` 缓存基准位移
- ⚠️ **边界约束要按「旋转后包围盒」算**：卡片带 `rotateZ`（最大 10°），旋转后轴对齐包围盒比原始宽高大约 25px；按未旋转尺寸约束时窄屏有卡片顶出画布（实测 430×880 下 `dada20` 溢出）。已抽出 `halfExtent()` 统一供 `basePos()` 与 `bounds()` 使用
- localStorage 存档 key 改为 **`lmh_calligraphy_pos_v2`**（堆叠初值与坐标系整体变更，避免旧存档的散落坐标污染新布局）；「重新摆放」按钮同步清 v2
- **卡片尺寸整体放大约 1.4 倍**（用户追加要求「图片大小可以再大一点」，对齐 Aceternity `w-80` 的观感）：`computeScale` 由 `min(1, max(0.55, w/1040))` 改为 **`min(1.4, max(0.68, (w/1040)×1.4))`**，`.stage` 的 `min-height` 相应调为 **`clamp(600px, 80vh, 880px)`**。桌面卡片最大宽度 **198 → 277px**、窄屏 **113 → 140px**
- 验证（无头 Chrome + CDP，量 DOM rect 与内联 `transform`，**清空存档后从初始堆叠态开始**）：
  - 1280×900（stage 1000×650）：六张实测 `277×352 / 262×342 / 211×357 / 200×446 / 261×339 / 256×382`，全部在画布内、**零溢出**、`EVENTS: none`；堆叠展开 spread **290×146**；划过 `rotateX -2.91° / rotateY 4.52°`、glare `0.039`，移开后回正到 `-0.06° / 0.09°`；甩出后松手位移 **+69px（60ms 内）/ 再 +329px（至 480ms）**，撞边界回弹
  - 430×880（CDP 设备模拟，stage 367×704）：卡片 `140×178 / 133×173 / 106×180 / 101×226 / 132×172 / 129×193`，**零溢出、无横向溢出**（`scrollWidth 430` = 视口宽）、`EVENTS: none`；堆叠展开 **90×263**
  - ⚠️ 验证脚本记得先清 localStorage：否则上一轮拖拽坐标会被 `loadSaved()` 复原，量到的不是初始堆叠态
- 同步：`calligraphy.html` 已同步到 `Documents/deepwork` 副本，`diff -q` = SAME
- **版权结论**：Aceternity License 允许用于个人/客户终端产品、允许修改与多项目复用；禁止作为 stock / 源文件再分发或在 marketplace 出售。个人主页属允许范围。**但本项目选择独立实现而非复制源码**，文件头注释已注明灵感来源与许可范围

### 2026-09-12（书法页填入六张真实作品）

- **`calligraphy.html` 六个空卡片填入真实书法作品照片**（用户提供 6 张原图）：`WORKS` 数组补齐 `img`，同时把原先的占位假名（永字八法 / 静 / 和 / 墨 / 知 / 宁静致远）整体换成真实作品信息——
  1. `咏羊城` · 楷书 · 癸卯仲春（`praise-yangcheng-2023.jpg`，1109×1600）
  2. `中国梦` · 楷书 · 节选（`china-dream.jpg`，1115×1600）
  3. `惠羊城` · 楷书 · 壬寅春月（`hui-yangcheng-2022.jpg`，814×1600，黑底白字）
  4. `赞钟南山院士` · 楷书 · 庚子夏月（`zhong-nanshan-2020.jpg`，468×1600，极细长）
  5. `毛泽东诗词选录` · 楷书 · 壬寅初夏（`mao-zedong-poems.jpg`，1120×1600）
  6. `喜迎二十大诗六首` · 楷书 · 壬寅金秋（`20th-congress-2022.jpg`，827×1600）
- 照片统一 `sips -Z 1600 -s formatOptions 72` 压到长边 1600 / 质量 72，存入 `assets/calligraphy/`（共约 2.4MB）
- **卡片宽度改为按图片真实宽高比自动计算**：新增 `fitPhoto()`，以「照片显示区」（`.work-art` 内容盒）为准反推卡片宽度，保证 `object-fit: cover` 不裁掉印章与落款
  - ⚠️ **必须迭代收敛**：卡片宽度会反过来影响标题换行（1 行 ↔ 2 行）→ 改变 `.work-cap` 高度 → 又改变照片区高度。单次计算会失配（实测「喜迎二十大诗六首」偏差 13.1%），故循环最多 4 次、`|Δ| < 0.75px` 提前退出
  - 另在 `document.fonts.ready` 与窗口 `resize` 后各重算一次
- **修复窄屏把照片区压扁的 bug**：`--w/--h` 按 `scale` 缩放，但 `.work` 内边距与标题字号是固定 px → 窄屏下照片区高度趋近 0（实测 430px 视口 `art.clientHeight = 0`）。改为新增 `--sp`（= `scale`），用 `calc(Npx * var(--sp, 1))` 缩放内边距 / 标题与 meta 字号 / 行距；`computeScale` 下限由 0.5 提到 0.62
- **有照片的卡片换掉占位装饰**：新增 `.work-art.has-photo`（虚线框改淡实线框、隐藏米字格 `::before` 与粉色装饰印章 `.seal`）；`.work-cap` 由「标题左 / 年份右」改为竖排两行，避免窄卡片里文字错乱
- `.stage` 的 `min-height` 由 `clamp(520px, 72vh, 820px)` 提到 `clamp(600px, 84vh, 900px)`，容纳变高的大卡片
- ⚠️ **原占位作品名已整体替换**（卡片标题与 `meta` 全部改为真实作品 / 干支纪年）；若要恢复占位假名需手动回填
- 验证（无头 Chrome + CDP，量 DOM rect 而非看图）：1280×900 六张卡片**比例偏差 ≤0.6%、零溢出、零重叠、`EVENTS: none`**；430×880 设备模拟 **偏差 ≤0.8%、无横向溢出、照片区高度 98~133px、零报错**
- 同步：`calligraphy.html` 与 `assets/calligraphy/`（6 张）已复制到 `Documents/deepwork` 副本，`diff -q` = SAME

### 2026-09-12（十五）

- **修「快速滑动屏幕球会跟丢」**（用户原话：「我发现我滑动屏幕太快，泡泡就会跟丢」）。用 `cdp27.mjs` 复现出**两个独立成因**，症状叠在一起：
  - **成因①·滚动滞后**：缓动在**文档坐标**里做，页面滚动被当成「球与目标的距离」交给缓动去吃 → 每滚一帧欠一截。实测指针停住不动、连滚 960px：球视口位置卡在 `cy=66`（指针 `y=400`）→ **滞后 334px**，之后还要 0.5s 才追回来
  - **成因②·循环被停 → 永久冻住**：`IntersectionObserver` 观察的是 `wrap`，它的布局盒钉在文档原点（`top:0;left:0`）、真实位置靠 `transform` 摆。球一旦被甩出视口，IO 报「不相交」→ `stop()` 杀掉渲染循环；**而球的位置只有这个循环会更新 → 死锁，球再也不会动**。实测滚到底后连续两次移动指针，球 `transform` 完全不变、位移 **0px**。快速滚动时成因①让球落后几百像素，正好把球甩出视口 → 触发成因②，这就是「**太快**才跟丢」的原因
  - **成因③·固定增益的稳态滞后**：`k=5` 时滞后 ≈ 速度/k，1500px/s 就落后 300px
- 修复（`index.html`）：
  - **滚动量直通**：`draw()` 里 `if (follow.on) pos.y += scrollY - lastScrollY;`（`lastScrollY` 每帧更新、停靠就位时同步）——滚动时球的视口位置不该变，缓动只负责收「球↔指针」的差距
  - **增益随差距自适应**：`k = follow.on ? min(4.5 + gap*0.5, 38) : 3.6`（近处仍柔和、差距大时收紧；回归仍固定 3.6，不动既有停靠 / 切面板手感）
  - **滞后硬上限**：`maxLag = max(orbSize*0.45, 60)`，超出部分直接把球拉回（只截掉超出量 → 常态手感不变、不抖动；停指针后仍按缓动收成「球心压指针」）
  - **循环不死锁**：IO 回调改为 `if (!document.hidden && (orbVisible || follow.on)) start(); else stop();`（**跟随时绝不因不可见而停**）；`pointermove` 里 `if (!running) start();` 兜底；`draw()` 末尾只在「停靠完成 + 不在视口 + 未跟随」三条件齐备时 `stop()` 省电
  - `?selftest=1` 钩子扩为 `__heroGlass.state()`（暴露 `running / followOn / visible / orbSize / pos / home / scrollY`），以后排障可直接看循环死活
- 验证（无头 Chrome + CDP，1280×757；**修复前 → 修复后**）：
  - `cdp27.mjs`：快速滚动滞后 **334px → 0px**；滚到底再移动指针 位移 **0px → 501px**（循环活着、滞后 0px）；1109px/s 甩鼠标 滞后 **925px → 32px**，且 120ms 内收敛到 1px
  - `cdp28.mjs`：指针瞬移 1200px 最坏情况 200ms 内收敛（残余 110px 是**视口边缘夹紧量**，属设计）；约 7400px/s 画圈甩动最大滞后 **259px → 106px**（= 硬上限）；**边滚边甩叠加**最大 19px、停下后 1px；停靠态滚到底确实省电停循环、指针回来 `running=true` 且滞后 0px（**无死锁**）；`EVENTS: none`
  - 回归全绿：`cdp22.mjs`（停靠态 Home `(1022,279)` w=236 = `[904,161,236]`、About/Chat `(1157,409)` w=210 = `[1052,304,210]` 与改造前逐像素一致；跟随 5 点偏差 ≤1px；跟随中切面板仍停在指针处、`pointerleave` 后滑回 `(1156,409)`；无多余滚动条；球下真实点击 nav 仍可切页）、`cdp19.mjs`（430×800：Home `[125,308,180]` 零重叠、另两页隐藏）、`cdp26.mjs`（红盒法 footprint `236×236`、中心与 DOM 球心偏差 `(0,0)`；球隐藏两帧差分 `0px`）
  - ⚠️ **文档高度基线更正**：Home 面板真实内容高 **2735**（视口 757 → 可滚 1978），About/Chat 为 `1138 / 893`；此前记录的「1138」其实量的是另两页（切面板后非活动面板 `display:none` 不参与高度）。已用 `display:none` 对照证明**球本身不参与文档高度**（隐藏球前后 `scrollHeight` 都是 2735）
- 用户已确认（**刻意保留的现状，不要自作主张「优化」**）：甩鼠标时的**滞后硬上限保持「半个球身」**（`maxLag = max(orbSize*0.45, 60)`）—— 既不要收紧到更「硬」，也不要放宽到更「飘」
- 结构自检 `scripts 2 / failed 0`，文件 **78061 bytes**；`Documents/deepwork` 副本已整文件覆盖同步，`diff -q` = SAME

### 2026-09-11（深夜 · 十四）

- **液态玻璃球升级为「整页跟随鼠标」**（用户原话：「泡泡在整个页面动，不止右侧」）：
  - CSS：`.hero-glass` 由 `top:0; right:0` + `top/right/width` 0.5s 过渡，改为 **`top:0; left:0` + `will-change:transform`，删除全部 CSS 过渡**；位移统一由渲染循环写 `transform: translate3d()`
  - JS：新增 `pos`（当前，文档坐标）/ `home`（当前面板停靠点，文档坐标）/ `follow{on,x,y}`（视口坐标）/ `orbSize` / `docH` / `snapNext`；`placeOrb()` 改为**只算数值停靠点**（不再写 `style.top/right`），`applyOrb(snap)` 统一落位；跟随只在 `!MOBILE_Q.matches && !prefers-reduced-motion` 时开启；`resetPtr()` 里一并关掉跟随
  - 验证（无头 Chrome + CDP，1280×757）：①停靠态 Home 中心 `(1022,279)` w=236 = `[904,161,236]`、About/Chat `(1157,409)` w=210 = `[1052,304,210]`，与改造前逐像素一致、零墨迹重叠；②跟随 5 个点位偏差 ≤1px，球心横覆盖 `119→1161`、纵覆盖 `118→639`（整个视口）；③跟随中切面板球停在指针处，`pointerleave` 后滑回 `(1156,409)`；④球在指针下仍能真实点击 nav 切页；`EVENTS: none`
  - **不多出滚动条**：停靠态与跟随态 `scrollHeight` 都是 `1138`、`scrollWidth` 都是 `1280`
  - 移动端 430×800 复测：Home `[125,308,180]` 零重叠、另两页隐藏，与上一版完全一致
  - ⚠️ **像素级复核（重要教训）**：先用「显示/隐藏球两帧差分的 bbox 质心」判断球是否画在指针处，得到偏移 `(-52,+50)` 的**假象**。查明两个污染源：**投影 `drop-shadow(0 12px 26px)` 下移** + **球心近乎透明**（强差分只在边缘折射新月区，方向随背后背景漂移）。改用**红盒法**（`background:#ff0000; filter:none`）实测画布像素盒 `[262,312,497,547]` = 精确 `236×236`、中心与 DOM 球心偏差 **(0,0)** → 球确实逐像素画在指针处，无渲染滞后。另测「球隐藏时两帧差分 = **0px**」，证明页面本身没有动画污染
  - 用户已确认（**这几项是刻意保留的现状，不要自作主张「优化」**）：About/Virtual Space 停靠位**保持现状**、≤700px 窄屏**保持隐藏**另两页的球、**球心正压在指针上**（不加偏移、不加拖尾惯性）、**切面板 236↔210 的尺寸跳变保持现状**（不做宽度缓动、不统一尺寸）
  - 结构自检：`scripts 2 / failed 0`，文件 **75223 bytes**；`Documents/deepwork` 副本已整文件覆盖同步（`diff -q` = SAME）

### 2026-09-11（晚 · 十三）

- **把 Hero 那颗液态玻璃球升级为「全站常驻」：About Me / Home / Virtual Space 三个面板都是同一颗球、都跟着鼠标走**（用户原话：「我要的是现在 hero 区那个泡泡不只在 hero 区跟着鼠标动，而是这一个泡泡可以在 About Me / Home / Virtual Space 这三个页面都可以跟着鼠标跑」；在给出的三个方案里明确选择「全站常驻同一颗球，原位联动」）
  - ⚠️ 本轮先试过「整页铺满 14 颗泡泡跟随鼠标」的方案，**被用户否决**（「不是整个页面都铺满泡泡跟着鼠标跑」），该方案已**完整回滚**（回滚后与十二版逐字节一致）。**后续任何方案都不要再引入整页泡泡场**
  - 关键难点：**单一固定落点无法同时满足「Home 保持原位」与「三页都不压正文」**。Home 的球必须在欢迎语右侧（原位 `[904,161,236]`），About Me / Virtual Space 的零墨迹留白在更靠外处 → 改为**按面板切换落点** + CSS 过渡滑行
  - 落点依据**文字墨迹实测**（`Range.getClientRects()` 量文字真实墨迹，而非块级满宽盒子）：卡片右边界 `1140`；About / Chat 卡内文字最右墨迹 `980`；About 右上「在线」徽标 `x1076-1099`。对 `right × width × top` 网格扫描（留白 8px）得 **239 个零重叠组合**，取 `right:18 / width:210 / top:54%` → 球区 `[1052,304,210]`
  - CSS：`.hero-glass` 由 `position:absolute; top:50%; right:0; transform:translateY(-50%)`（在 `.welcome` 内）改为 **`position:absolute; top:0; right:0; width:clamp(150px,20vw,236px); aspect-ratio:1/1; z-index:15`**（节点已移出 `.welcome`，成为 `<body>` 直接子元素 → 此时 `top`/`right` 解析为**文档坐标**），加 `top/right/width` 0.5s 过渡；**删除 `cursor:grab` 与 `:active`**；`pointer-events:none`
  - ⚠️ **落位必须用文档坐标（`absolute`），不能用视口坐标（`fixed`）**：先按 `fixed` 实现，实测球钉在视口上、正文一滚就从球下穿过（1280×620 滚到底时压到 `Send` 按钮 `d=54`，已接近可见球体半径）。改成 `absolute` 后**球与正文的相对位置恒定不变** → scroll 0 量到的「零重叠」在任意滚动位置自动成立（实测顶部与滚到底数据完全一致），并且还原了改造前 Hero 球「随页面一起滚走」的行为。Home 分支因此要 `r.top + window.scrollY`（`activate()` 是 `behavior:"smooth"`，滚动中途换算才准）
  - DOM：`#heroGlass` 从 `.welcome` 内部**移出**，成为 `<body>` 直接子元素（跨面板常驻的前提）。无新增依赖、未引入新色、`file://` 双击照常可用
  - JS：新增 `placeOrb()` + `SIDE_SIZE / SIDE_RIGHT / SIDE_TOP`；首屏 `transition:none → placeOrb() → 强制布局 → 还原`，避免球从右上角飞进来；监听 `resize` / `load` / **`panelchange`**（`activate(name)` 末尾新增 `dispatchEvent(new CustomEvent("panelchange", { detail:{ panel:name } }))`）
  - 点击涟漪：球变 `pointer-events:none` 后原 `wrap.addEventListener("pointerdown")` 失效 → 改为 **window 级圆形命中判定**（`dx²+dy² ≤ r²`），点球仍有涟漪、点别处完全不受影响
  - **窄屏（≤700px）单独处理**：固定定位的球在窄屏会压住正文（实测压住 Home 的 H1，圆到矩形最近点 `d=0`）→ `placeOrb()` 在 ≤700px 时：Home 把球 `appendChild` 回 `.welcome` 走文档流（还原改造前手机版观感，`width:min(180px,46vw); margin:18px auto 0`）；**About Me / Virtual Space 直接藏球**（窄屏无右侧留白，触摸也不产生鼠标跟随）
  - 验证（无头 Chrome + CDP，1280×757）：Home 球区 `[904,161,236]` 与改造前**完全一致**（无回归）；About / Chat `[1052,304,210]` **与正文墨迹零重叠**；三面板鼠标左下 / 右上时 `offX/offY` 符号正确翻转；`pointer-events:none` 下真实点击 nav 仍能切页；`EVENTS: none`
  - **滚动复测**（1280×757 与 1280×620，顶部 / 滚到底各测一遍）：About / Chat 全部零重叠，且顶部与滚到底数据完全一致（相对位置恒定）；Home 的 3 处命中恒为 H1 / 副标题的**块级盒子**落在 canvas 外接圆内，实际文字墨迹右端 `920` 距可见球体左端 `946` 仍有 26px，属改造前既有观感
  - 球体渲染**像素级硬证明**：显示 / 隐藏球的整页截图逐像素差分 → 三面板都有真实像素贡献（About `3764` 个变化像素）。为此新增 `png.mjs`（自写 PNG 解码 + 差分）
  - 「About 面板是不是把球洗白了」用**差值对比度**定量排除：球自身贡献平均 `|ΔL|` Home `6.4` / About `5.9` / Chat `8.3`（背景亮度 238~244）→ 三面板观感一致；这颗球本来就是清淡的半透明玻璃质感
  - 移动端 430×800 复测：三面板**全部零重叠**（Home 球在文档流 `[125,308,180]`，另两页隐藏）
  - 结构自检：`scripts 2 / failed 0`，文件 **72374 bytes**；`Documents/deepwork` 副本已整文件覆盖同步（`diff -q` = SAME）
    - ⬅ **本条描述的是十三版机制（`top/right` + CSS 过渡滑行）**；**十四 已改为「停靠点 + 整页跟随」并用 `transform` 缓动、文件 `75223 bytes`**；**十五 在十四基础上修掉「快速滚动跟丢」（文件 `78061 bytes`），以十五为准**

### 2026-09-11（晚 · 十二）

- **Hero 液态玻璃球新增「泡泡跟随鼠标」交互**（用户看到参考作品里泡泡会跟鼠标跑，要求主页也加）：
  - 指针监听从「只监听 `.hero-glass` 小 canvas」改为**监听整页 `window`**（`pointermove`，`{passive:true}`）。原实现鼠标不悬在球上就没反应，而这颗球只有 236px，体感等于没交互
  - 指针位置以 **canvas 中心为原点归一化**（半宽 ≈ 1.0），再 `clamp` 到 `±1.35`，避免鼠标在屏幕另一侧时泡泡被拽飞；`document pointerleave` / `window blur` 时归零，泡泡缓慢飘回原位
  - 6 颗泡泡各自维护一份位移 `offX/offY`，用**与帧率无关的指数平滑** `1-exp(-k*dt)` 追赶目标，每颗 `k` 不同（1.6~4.6/秒）→ 产生先后与拖尾；`lift = 1 - life*0.35` 让越小的泡泡越轻、被带得越远
  - 主球球心跟随增益由 `uPointer * 0.10` 提到 `0.12`；泡泡局部位移增益 `0.13 / 0.11`（约 1.5 倍主球半径量级）
  - `draw()` 里的指针缓动也改成基于 `dt`（`1-exp(-6.5*dt)`，`dt` 上限 0.05），原来固定 0.06/帧在 120Hz 屏上会追得过快；同时修复了降级路径 `updateBubbles(3.2)` → 现在传 `dt=0`，静态帧不会因一次性大 `dt` 把泡泡弹飞
  - 新增**自检钩子**：`?selftest=1` 时才挂 `window.__heroGlass = { ptr, offX, offY, bubbles }`。动机是泡泡本身在持续轨道运动，截图对比无法证明是指针引起的位移，只能靠数值断言；已确认正式访问（无 query）下 `typeof window.__heroGlass === "undefined"`
  - 未引入新颜色、未加任何依赖，`file://` 双击仍可用
- ⚠️ **版权**：参考 CodePen「Liquid Glass」by fand（`azmPjqd`）**仍未抓取到源码**（codepen.io 与 cdpn.io/debug 均 403，r.jina.ai 超时，GitHub code search 401 需鉴权，`fand/vfx-js` 仓库内也没有该 pen 的 shader）。因此本效果是按「泡泡朝指针被吸过去并带滞后」这一思路**独立实现**，未复制任何源码
- 验证（无头 Chrome + CDP，`localhost:8899` + `?selftest=1`）：
  - 鼠标居中 `ptr=0/0` → `offX` 全 0；鼠标移到右侧 `ptr.x=1.35` → `offX` 均值 **+0.166**、逐颗分布 **0.152~0.174**（即每颗滞后不同）；移到左侧 → 均值 **-0.156**；移到上方 → `offY` 均值 **+0.140** 而 `offX≈0`。目标值 `1.35*0.13=0.1755`，说明收敛无过冲，且轴向互不串扰
  - 正式路径（不带 query）：`hook: undefined`、canvas `236x236`、Home active、`EVENTS: none`
  - 同尺寸裁切截图读图对照：鼠标在右 → 珠体与泡泡聚在画面中右、小泡拖在右下；鼠标在左 → 珠体与泡泡聚在左中、画面右半留空
- 结构自检：`2 open / 2 close` script 标签、`syntax: OK (14596 chars)`、`heroGlass 1` / `glassCanvas 1`、文件 **67169 bytes**
- 同步：`Documents/deepwork` 副本已整文件覆盖同步（`diff -q` = SAME）

### 2026-09-11（晚 · 十一）

- **首页 Home 面板 Hero 区新增「液态玻璃球」装饰**（用户在多轮对比后选定「首页 Hero 区点缀」方案，未采用 VFX-JS 依赖方案）：
  - 新增 `.hero-glass` 容器 + `<canvas id="glassCanvas">`，插在 `.welcome-sub` 之后；CSS 绝对定位在 Hero 右上（`clamp(150px,20vw,236px)`、`aspect-ratio:1/1`、`z-index` 低于标题），`@media (max-width:700px)` 下改为静态居中
  - 新增一段**完全自包含**的内联 `<script>`（IIFE）：WebGL2 全屏三角形 + raymarching，独立重实现「隐式曲面平滑并集 + 棱镜色散折射 + Beer–Lambert 吸收 + 菲涅尔 + 三点高光 + 假环境窗光反射」
  - **零外部依赖**：背景贴图由 2D canvas 运行时程序化生成（天空蓝渐变 + 淡粉/白柔光 + 暗蓝斑块 + 一道天光亮带），因此 `file://` 双击照常可用、无跨源污染，也不违反「主页无外部依赖」约定
  - 只用主页既有色系（天空蓝 / 淡粉 / 白），未引入新色；泡泡整体调小（`mainRadius 0.085`、6 个泡泡 `0.014~0.032`、轨道 `1.35R~1.95R` 环绕）；球体缓慢漂移 + 指针视差；点击回弹并循环切换形状（球 → 方 → 环）
  - `canvas` 加 `filter: drop-shadow(0 12px 26px rgba(86,128,168,.30))`，借真实 alpha 沿球体轮廓生成投影，让玻璃球在浅色云背景上「浮」起来
  - 性能 / 无障碍：`IntersectionObserver` + `visibilitychange` 不可见时暂停 rAF（⚠️ 十五 修正：**跟随时不得停**，见球章节「跟随三原则」③）；`prefers-reduced-motion` 只静态画一帧；DPR 上限 2；WebGL2 不可用或 shader 编译失败时隐藏组件优雅降级
  - ⚠️ **版权**：视觉思路参考 CodePen「Liquid Glass」by fand（`azmPjqd`），该作品**未声明任何许可**，默认保留所有权利；本次**未复制其源码**，着色器与交互逻辑均为独立实现，仅借鉴思路。日后若转商业用途需重新评估
- 调参记录（供后续参考，别走回头路）：中途三版依次是「白色云团 + 灰色点状轮廓」（旧式色调映射把边缘压成灰）→「深灰近黑」（指数色调映射砍半亮度 + 吸收过强）→「纯白过曝」（纹理对比过低、12 个波长平均糊成一片白）；最终以「波长采样降为 6 + S 型提对比 + 吸收 `vec3(1.0,1.2,2.0)` + 不做整体压暗」定稿
- 验证：无头 Chrome + CDP 在 1280×900 与 430×900 两档均无 JS 异常（`EVENTS: none`）；`#glassCanvas` 尺寸 236×236 / 180×180、`webgl2=true`、Home 面板为 active；裁切放大截图读图确认为「半透明冰蓝/乳白发光珠体 + 环绕小气泡 + 高光」
- 同步：`Documents/deepwork` 副本已同步

### 2026-09-11（晚 · 十）

- **`bci.html` 加载动画换成「脑形 PCB 走线」**（用户明确要求与参考作品同款，此前手绘的神经网格 / 脑廓两次被否）：
  - 采用参考 pen 渲染所用的那份 SVG（`viewBox="0 0 464 464"`：115 条 `<polyline>` 走线 + 145 条同名 `<path>` 轨道 + 327 个焊点/脉冲 + 143 组 `animateMotion` / `animate` 脉冲动画），整体**内联**进 `bci.html`（保证 SMIL 动画可用，且页面依旧单文件、双击可开）
  - 原 96px 迷你神经网格 canvas + 旋转环**全部删除**（`.loader-ring`、`#loaderCanvas`、`initLoader` 内的绘帧逻辑与 `buildGraph` 调用）；`initLoader` 简化为「最短 900ms、兜底 5s 后淡出并移除 DOM」；`prefers-reduced-motion` 时调用 `svg.pauseAnimations()` 静态展示
  - 显示尺寸 132px（≤600px 视口 108px），配 `.loader-core .st0 { fill:none; stroke:#5fbeff; stroke-width:1.2; vector-effect:non-scaling-stroke }`——线宽按 132px 显示尺寸重调，否则原 2/464 的比例会细到看不清
  - 小尺寸可读性微调：脉冲点 `r` 3 → 4.5、`values="2; 3; 2"` → `values="4; 6.5; 4"`（143 处）；删除 184 个**全文 0 处 `url(#…)` 引用**的 `<radialGradient>`（SVG 体积 125KB → 81KB）
  - 体积：`bci.html` 36.7KB → 114.7KB；`loaderCanvas` / `loader-ring` 残留引用检查均为 0
- ⚠️ **版权**：参考 pen `oYrNLM`（作者 Andry Zirka，@BlackStar1991）**未标注任何授权协议**，默认保留所有权利。此图形为按用户明确要求在个人主页（非商业）内使用，版权归原作者；`bci.html` 加载层上方已加署名注释注明出处。**若本页之后转为商业用途，必须替换该图形**
- 验证：内联脚本 `node --check` 通过；无头 Chrome 加载态截图读图确认为「由电路板走线构成的大脑形状」；两次不同虚拟时间截图 md5 不同（证明 SMIL 脉冲动画在跑）；加载完成后 live DOM 中 `class="loader"` 计数为 0（加载层已移除）

### 2026-09-11（晚 · 九）

- **数字分身（Virtual Space 对话框）改为第一人称口吻**（用户要求）：所有答句里的「他 / 他的」改为「我 / 我的」
  - 覆盖 `greeting`（问候）、`fallback`（兜底）、`moreHint`（追问提示）与 `rules` 全部规则：近况 / 专业 / 为什么选这个专业 / 大一 / 学校 / 深圳 / 联系 / 兴趣 / 旅行 / 书法 / Citywalk / 主页 / 身份 / 未公开 / 梦想 / 谢谢 / 再见 / 厉害 / 建议
  - 权威 `index.html` 仅**故意保留 1 处**「别把我和他本人搞混啦」，用来把「数字分身」与真人区分开；其余一律第一人称
- 仅改文案，未动样式、未改规则关键词（Citywalk 关键词仍是 `["citywalk","城市漫步","散步","逛街","暴走"]`）
- ⚠️ 两份副本的 `rules` 结构本来就不同（权威版规则更多、答句更长；`Documents/deepwork` 副本更简、部分为单字符串答句），本次是**按各自结构分别改写**，不要用一个版本去覆盖另一个
- 内联脚本已过语法校验（`node --check`），渲染后 DOM 校验通过

### 2026-09-11（晚 · 八）

- **`bci.html`「我现在在学什么」内容更新**（用户要求），列表由 4 项精简为 3 项：
  - 课内：`高数、线性代数、大学物理、程序设计基础` → `微积分、线性代数、程序设计基础（Python）`；`small` 同步由「数学和信号处理，是后面所有解码算法的地基。」改为「数学和编程，是后面所有解码算法的地基。」
  - 自学：`Python 与数据分析、机器学习入门` → `机器学习入门`
  - 兴趣：`神经科学 + 人机交互的交叉地带` 保持不变
  - **删除原「方向」项**（脑电信号 EEG 的采集与特征提取）
- 仅改文案，未动样式、未引入新色系；权威项目与 `Documents/deepwork` 副本已同步

### 2026-09-11（晚 · 七）

- **兴趣「摄影」改为「Citywalk」**（用户要求），共 4 处同步，避免页面与数字分身口径不一致：
  1. About 面板「兴趣 Interests」的 pill：`摄影 / Photo` → `Citywalk / City Walk`
  2. 首页「也许你也喜欢——」卡片里的同款 pill：同上
  3. `profile.interests` 第三项：`"摄影"` → `"Citywalk"`
  4. 数字分身规则：原「摄影」规则（关键词 `["摄影","拍照","相机","照片","拍摄"]`）改为 Citywalk 规则（关键词 `["citywalk","城市漫步","散步","逛街","暴走"]`），答句改为「不赶景点、沿街巷慢慢走」的城市漫步表述；「兴趣」规则的两条答句同步去掉摄影字样
- ⚠️ Citywalk 的 pill 仍是**不可点击的 `<span class="pill">`**（没有对应详情页），与「旅行 / 书法」两个带链接的 pill 不同；如果之后要做 citywalk 详情页，记得同步改成 `<a class="pill" href="...">`
  - ✅ **2026-09-18 已实现**（本 TODO 已关闭）：两处 pill 均改为 `<a class="pill" href="citywalk.html">`，新增 `citywalk.html` 占位页 —— 见「变更记录」最上面那条
- 仅改文案与规则关键词，未动样式、未引入新色系

### 2026-09-11（晚 · 六）

- **「专业 Major」栏改为可点击，进入新建的脑机接口详情页**：中文名「智能医学工程（脑机接口方向）」与英文名 `Intelligent Medical Engineering · BCI` 包 `<a class="major-link" href="bci.html">`（**同标签打开**，与 `travel.html` / `calligraphy.html` 的 pill 跳转一致）
- `.school-link` 规则合并为 `.school-link, .major-link`（选择器与 hover / focus-visible 一并共用），样式不变，仍**未引入新色系**
- **新增 `bci.html`：脑机接口方向详情页**（独立页面，单文件内联 CSS/JS，无构建工具、无外部依赖，可直接双击打开）
  - 页面结构：`← Return to Home` + `脑机接口 BCI`（当前态）药丸导航 → Hero（`#neuralCanvas` 神经网格 + 标题 + 关键词 chips + scroll cue）→ 四个方向卡片 → 在学内容列表 → 页脚
  - 加载态：居中 `LOADING` 微光字 + 96px 迷你神经网格 canvas + 旋转环，最短停留 900ms、兜底 5s 后淡出并移除 DOM（图标为**正常尺寸**，非全屏放大）
  - 交互：节点脉冲沿近邻连边链式传导、鼠标靠近时节点轻微吸附（移出后回位）、四角 HUD 数值波动 + 通道条、IntersectionObserver 进场、`prefers-reduced-motion` 全套降级（静态渲染、无动画）
  - ⚠️ **配色为暗色科技风（`--bg-0 #04070e` / `--cyan #5fbeff` 等），与主页水彩天空蓝体系不同**。这是用户明确要求「科技感」的有意例外，**仅限本页**，主页 `index.html` 仍严格遵守原色系
- **版权审核结论（重要）**：本页视觉思路参考自 CodePen 的两个 pen —— `BlackStar1991/oYrNLM`（Digital Brains 加载动画）与 `VoXelo/xbgpJre`（Bioelectric consciousness engine）。**两处均未声明任何开源许可**（全篇无 MIT / Apache / CC / GPL / license / copyright 标记，CodePen 默认版权归作者），因此**只借鉴了思路**（暗色神经网格、电信号沿连线传导、HUD 面板、居中加载动画），**代码、SVG 路径、素材、文案全部为原创**，未复制任何原作内容
  - oYrNLM 作者：Andry Zirka（@BlackStar1991）。
  - 该 pen 无官方 `.css` / `.js` 源码端点（返回 `Pen Not Found`），仅 `embed` 端点可取到渲染后的结构，**这也意味着其代码不可被视为可复用素材**
  - 后续如要复用任何 CodePen 代码，必须先在 pen 页面确认许可，默认按「保留所有权利」处理

### 2026-09-11（晚 · 五）

- **学校名称加外链**：About 面板「学校 School」栏的中文名与英文名外层包 `<a class="school-link" href="https://sz.tju.edu.cn/" target="_blank" rel="noopener">`，点击新标签打开天津大学深圳校区官网
- 新增 `.school-link` 样式（紧随 `.about-item p.en`）：`color: inherit` 保持原配色、去掉默认下划线，改用 `border-bottom: 1px dashed var(--line)` 作可点击提示；hover / focus-visible 时文字转 `--sky-600`、下划线转 `--sky-400`，**未引入新色系**
- 栏目标题「学校 School」不参与链接，仅学校全名可点击

### 2026-09-11（晚 · 四）

- **更新学校英文名**：`index.html` About 面板「学校 School」栏的 `<p class="en">` 由 `Tianjin Univ. & PolyU Future Technology College (Shenzhen)` 改为 `TJU-PolyU Shenzhen Institute of Future Technology`（中文名「天津大学香港理工大学深圳未来技术学院」保持不变）
- 数字分身 `profile.school` 及问答文案仍为中文校名，未受影响

### 2026-09-11（晚 · 三）

- **`travel.html` 顶部导航精简**：删除中间的 `Home` 项（原 `<a href="index.html#home">Home</a>`），导航只保留「返回主页」+「旅行 Travel」两项；「← 返回主页」文案改为 `← Return to Home`（保留左箭头图标，与英文导航整体风格一致）
- **旅行页副标题改文案**：`.travel-sub` 由「— 去过的地方，都在这颗星球上 —」改为「— 想去的地方 天气好的时候就出发吧 —」，两侧短横线装饰保留
- ⚠️ **教训：存在两份项目副本**。DeepWorks 会话工作目录是 `~/Documents/deepwork/outputs/personal-homepage/`，而实际用浏览器打开、含 `.git` 的权威项目是 `~/Documents/个人主页/outputs/personal-homepage/`。只改会话副本用户看不到效果。**以后改本项目应优先改 `~/Documents/个人主页/` 下的文件**，必要时再同步副本
- **`calligraphy.html` 同步统一导航**（用户确认后）：同样删除 `Home` 项、「← 返回主页」→「← Return to Home」，导航只剩「返回主页」+「书法 Calligraphy」两项；副标题「— 一笔一划，慢慢写 —」按用户要求保持不变

### 2026-09-11（晚 · 二）

- **新增 `calligraphy.html` 书法页**：借鉴 Aceternity `draggable-card` 的交互思路，用**原生 pointer 事件**重写（无 React / 无框架，`file://` 双击可用）
  - 卡片可拖拽跟手并置顶（`zIndex` 自增）、松手保持位置；位置写入 `localStorage`（key `lmh_calligraphy_pos`），刷新后仍在
  - 拖拽用 `setPointerCapture`（外面包了 `try/catch`，个别环境不支持时不至于中断）；`touch-action: none` 同时支持鼠标与触屏
  - 拖拽时把卡片限制在画布内（`clampOff()` 按卡片半宽 / 半高夹取），画布 `overflow: hidden` 兜底
  - 双击卡片归位；「重新摆放」按钮全部归位并清除 `localStorage`
  - 小屏等比缩放：`computeScale()` 把卡片基准尺寸乘 `min(1, max(0.5, 画布宽 / 1040))`，`resize` 时重算（120ms 防抖）并重新夹取
- **作品卡片预留照片入口**：`WORKS` 数组 6 条（`永 / 静 / 和 / 墨 / 知 / 远`）。`img` 为空时显示占位大字（楷体 + 米字格虚线底）；填入 `assets/calligraphy/xxx.jpg` 即显示照片，加载失败会自动退回占位大字。初始摆位由 `nx / ny`（归一化 0~1）、`rot`（角度）、`w / h`（基准 px）控制
  - ⚠️ 用户尚未提供书法照片，`assets/calligraphy/` 还没建；拿到照片后放进该目录并在 `WORKS` 里填 `img` 即可
  - 卡片右下角印章用 `--pink`（未引入朱红等新色系）
- **`index.html` 两处「书法」pill 改为链接** `<a class="pill" href="calligraphy.html">`（第 866 行 Home 面板 motto 区、第 950 行 About 面板），复用已有 `a.pill` 悬停样式
- 无头 Chrome 回归（1280 / 500 视口）：`cards=6`、全部淡入、`dragDelta=100`（拖拽跟手）、`allInside=true`、`errors=[]`、无横向溢出
  - ⚠️ 探针 `cdp-probe.mjs` 用 `--window-size` 设视口，Chrome 窗口最窄约 500px，**传 390 实际得到 500**（页面本身无问题；真机小屏靠 CSS `clamp` 自适应）
- **摆位重排**（用户选定「6 张 / 自然散落」）：初版右下角三张挤在一起，实测 `he+yuan=51%`、`zhi+yuan=45%`（`宁静致远` 被叠掉一半）。重排 `nx / ny / rot` 后，最大叠压降到 **14%**（`yong+mo`），其余 4~11%，六张全部可见；1290 / 900 / 600 三档视口均 `outside=[]`、最小边距 13~18px、无横向溢出
  - 摆位回归方法：探针两两算包围盒重叠率（`overlaps` / `maxOverlap` / `minMargin`），可直接量化「有没有卡片被压住」，比看图更可靠

### 2026-09-11（晚）

- **陆地也改成用户参考图那样的绿色（用户要求「绿色部分增多」）**：`lightenOcean` 重命名为 `tintEarth`（调用点同步），内部由「只处理海洋」改为海洋 / 陆地 / 冰雪三分支。新增 `LAND = { lift 0.34, span 0.92, sat 0.70, hue 130, hmix 0.50, cap 0.93 }`，URL 参数加前缀 `l` 避免与海洋撞名：`travel.html?lhue=130&lhmix=0.5&lsat=0.7&llift=0.34&lspan=0.92&lcap=0.93`
- **冰雪必须显式放行**：陆地分支前加 `else if (l0 > 0.86 && s0 < 0.18) continue;`，否则南极 / 格陵兰会被一起染绿
- **参考图取色**（`截屏 2026-09-11 13.53.21.jpeg`，1179×2556 手机截屏，隔点采样 754020 px）：深绿 `#5C9160` H124 S0.22 L0.46（n=23422）｜黄绿 `#A4B27B` H76 S0.26 L0.59｜黄褐 `#B9AF93` H44 S0.22 L0.65；**绿:褐 = 66.7% : 33.3%**，陆地整体 H93.5 S0.19 L0.55。而原贴图陆地是 **绿 36.4% : 黄褐 56.1%、平均 L 0.26**——又黄又暗，正是要改的地方
- **参数由 6 组对照扫描选出**（`make_sweep3.py`）。⚠️ 扫描脚本**必须先抽样**：隔行隔列只保留陆地像素（101776 px）后秒级出结果；早先「209 万像素 × 多候选」的全量扫描跑太久，被用户手动中断。选中的 `hue 130 / hmix 0.50` 让色相呈**双峰**——10% 分位 H81（黄绿，原沙漠）+ 90% 分位 H132（真绿，原植被），恰好对应参考图的「黄绿 76 + 深绿 124」；hmix 调到 0.7 则双峰塌陷成单一 H106，沙漠失去辨识度
- ⚠️ **踩坑：贴图均值 ≈ 全球均值，但用户看到的是「可见半球」**。第一版按全球均值标定（`llift 0.22 / lsat 0.90`，贴图侧陆地 L0.53 看着已达标），渲染回读却只有 `#638C4E` L0.43。排查确认 `lightTex.colorSpace = SRGBColorSpace` 设置无误，**均匀光照下「渲染 ≡ 贴图」是恒等映射**，故差异只可能来自像素集合不同——摄像机默认对着的那个半球陆地本身偏暗偏艳。据此按可见半球重新标定为 `llift 0.34 / lsat 0.70`
- **`make_render.py` 升级为双通道回读**：① 真实光照（看水色与过曝）② 临时把 `AmbientLight` 强度设为 `π`、所有 `DirectionalLight` 设为 `0` 再渲一次（有效系数恒为 1.0，画面即贴图本色）。两通道分别统计水体 / 陆地的均值与占比、近白过曝像素，并把实际生效的 `OCEAN` / `LAND` JSON 一并打印存档
- 最终实测（642×340 球面 46625 px）：**陆地 `#81AB70` H103 S0.26 L0.55**（目标 `#89A176` H94 S0.19 L0.55，明度完全命中，色相略偏绿）、**水体 `#C7E1F4`**（目标 `#C9E1F5`）、近白过曝 7 px（0.0%）、`errors=[]`

### 2026-09-11（下午）

- **修复内容区贴边**：`body` 增加 `padding: 0 clamp(12px, 3vw, 40px)`。根因是 `.page` 为 `box-sizing:border-box` + `max-width:1080px`，视口在 1080~1200px 时外距被压到约 10px（即用户说的「聊天框离右边缘太近」）。实测 1100px 视口下数字分身卡片距屏幕边缘由 50px 提升到 73px，1440px 宽屏布局不变
- **缓解背景单调**：背景由单张 `bg.jpg` 改为五层——极淡纸纹（SVG `feTurbulence fractalNoise`，`opacity: 0.05`）+ 三层径向柔光（左上白、右上 `--pink`、底部 `--sky-300`）+ 底图 `bg.jpg`；全部沿用现有色系，**未引入新色**
- **数字分身问答升级**（仍为本地规则引擎，未接真实 AI）：
  - `profile` 集中可配置资料，新增 `city`（深圳）/ `hometown` / `goal`，后两者留空表示「未公开」
  - `rules` 扩充到 20 条（近况、专业、择校、大一、学校、深圳、联系、兴趣、旅行、书法、摄影、主页、分身身份、未公开信息、问候、感谢、告别、夸赞、建议、追问），每条支持多个答案变体
  - 新增 `pick()` 随机取答案；新增 `scoreRule()` 按「最长命中关键词」打分选规则，取代原先「第一条命中即返回」
  - 英文关键词改为词边界匹配，修掉 `hi` 命中 `this` 的误判
  - 回答前加 280~700ms 停顿；快速按钮改为 你是谁 / 你在学什么 / 平时喜欢做什么 / 怎么联系你
  - ⚠️ 未公开信息（家乡/年龄/目标等）一律如实说明并引导到邮件，**不编造**
- **「关于我」文案（温暖文艺方向）**：`tagline` 由 `Welcome to my channel!` 改为「把日子过成自己喜欢的样子」；`hero-note` 改为「大一在读 · 在深圳慢慢长大 · 记录生活的人」；「最近在做」改为「打磨这个主页 · 上大一必修课 · 用脚步认识深圳」
  - 首页手写座右铭（`.motto` 里那句英文）经用户确认**保持不变**
  - ⚠️ 曾误在 About 面板复用 `.motto` 类，与首页手写标语（`.motto` 用 `--font-hand`、clamp(22px,3.4vw,32px)）样式冲突，已撤销。**以后在别处加座右铭请另起类名**
- 无头 Chrome 回归：390 / 1100 / 1440 视口均 `errors=[]`、无横向溢出

### 2026-09-11

- **海洋改成用户给的参考图那种淡冰蓝**：`OCEAN` 由宝蓝 `{ lift 0.42, span 0.72, sat 1.22, hue 207, hmix 0 }` 改为 `{ lift 0.84, span 0.18, sat 0.85, hue 206, hmix 1, cap 0.96 }`。参考图实测均值 `#C9E1F5` `rgb(201,225,245)` H207 L0.875；改后贴图侧海洋均值 `rgb(202,225,243)`，与目标逐通道差 (+1,0,-2)
- **新增 `cap` 参数（明度上限）**：原代码把上限硬编码成 `Math.min(0.84, lift + l * span)`，而参考蓝明度 L=0.875 根本够不到 0.84，天花板必须先放开才可能命中
- ⚠️ **踩到大坑：光照总强度不够，高明度贴图被压成暗灰蓝**。旧光照 `ambient 0.48 / key 0.75 / rim 0.24` 是按深色宝蓝配的，换成淡冰蓝后**渲染**实测只有 `#71818C`（暗了 40%、发灰）。根因是 three.js 新版物理光照**除以 π**，有效系数 = `(ambient + key×NdotL + rim)/π`，旧值只给到 0.30。改为 `ambient 2.80 / key 0.82 / rim 0.22`（≈3.21/π≈1.02）后，渲染水体回到 `rgb(198,224,243)` `#C6E0F3`，与目标差 (-3,-1,-2)、过曝 0 像素。**结论：贴图明度和光照强度是联动的，改色必须同时重算光照**
- **验证方法升级：直接回读渲染后的画布像素**。此前只统计贴图颜色（`lightenOcean` 的输出），但「贴图 × 光照 × sRGB 编码」才是用户真正看到的；现在 `make_render.py` 在无头 Chrome 里显式 `renderer.render()` 后把 WebGL 画布 `drawImage` 回 2D canvas，按 `b > r+6 && b >= g` 筛出水体像素统计均值（水体占球面 74.7%），并额外报出「近白过曝像素」占比防白球

### 2026-09-10（下午）

- **删掉地球下方的操作提示条**（用户觉得丑）：`.globe-hint` 那三个描边胶囊框（拖动旋转 / 滚轮缩放 / 点击标记看照片）连同对应 CSS 一并移除；`.card` 四边内边距本来就等距，删除后无需补偿留白
- **换回原来的宝蓝**（用户选定）：`OCEAN` 默认值还原为 `lift 0.42 / span 0.72 / sat 1.22`，并把 `hmix` 设为 `0` 关闭色相偏移；实测平均色回到 `rgb(44,98,234)`、色相 223、饱和 0.819、亮度 0.545，与最初完全一致
- 主页天空蓝那套（`lift 0.66 / span 0.50 / sat 0.62 / hue 206 / hmix 0.85`）保留为可用 URL 切换的备选，代码里已注明
- **地球再浅一档、更水彩**（用户选定）：`lift 0.62→0.66`、`span 0.54→0.50`、`sat 0.66→0.62`；实测平均色 `rgb(144,182,216)` → `rgb(158,190,218)`，饱和 `0.480→0.448`，亮度 `0.706→0.737`，比主页 `sky-400` 更浅，落在 `sky-300`~`sky-400` 之间
- **地球颜色改浅、与主页蓝呼应**：`OCEAN` 由 `{ lift 0.42, span 0.72, sat 1.22 }` 改为 `{ lift 0.62, span 0.54, sat 0.66, hue 206, hmix 0.85 }`，新增 `hue`（目标色相，角度制）与 `hmix`（靠拢程度 0~1）两个参数，`lightenOcean` 里加了「按最短弧往目标色相混合」的逻辑
- 依据：原海洋平均色色相 223°（偏宝蓝），主页 `--sky-400 #93bcdd` 是 207°，两者不同路；改后实测平均色 `rgb(44,98,234)` → `rgb(144,182,216)`，色相 `223→208`，饱和 `0.819→0.480`，亮度 `0.545→0.706`，落在主页 `sky-400`~`sky-500` 之间
- 无头 Chrome + `file://` 实测：`ready=true | canvas=642x340 | loadingHidden=true | errors=[]`，贴图与调色全链路正常
- 调参过程中的坑：`rgbToHsl`/`hslToRgb` 的色相是**角度制**，最初按 0~1 混合并用 `(h+1)%1` 归一会把色相压成 0，整张地球变红——已在 AGENTS.md 标注

### 2026-09-10

- **修复「双击 travel.html 看不到地球」**：新增 `assets/lib/three.global.js`、`assets/lib/OrbitControls.global.js`（由 ESM 版转换的普通脚本，剥离 `export`/`import`，内部用 IIFE 包住，仅暴露 `THREE` / `OrbitControls` 两个全局），`travel.html` 改用普通 `<script src>` 加载并移除 `importmap` 与 `type="module"`
- 新增 `assets/earth-texture.js`：把贴图压到 2048×1024 后转成 data URI（609KB），避免 `file://` 下 canvas 跨域污染导致调色抛 `SecurityError`
- 移除 `travel.html` 的 `file://` 报错分支（已无必要），诊断脚本改为「5 秒未启动就报出当前地址并提示检查 assets/」
- 实测验证（无头 Chrome + `file://`）：`THREE` r160 / `OrbitControls` 正常，贴图 2048×1024 加载成功，`getImageData` 读到 209 万像素未被污染；海洋调色后平均色 `rgb(28,43,73)` → `rgb(44,98,234)`、饱和度 0.773 → 0.804
- `travel.html` 增加加载失败自我诊断（页面中央直接出原因）：`file://` 协议给出「需用服务器打开」提示；http 下 5 秒内未启动则提示按 F12 看控制台
- 地球海洋再调浅一档：`lift 0.33→0.42`、`span 0.75→0.72`、`sat 1.10→1.22`（抬明度的同时补饱和，避免又发灰）；光照 `ambient 0.55→0.48`、`key 0.85→0.75`、`rim 0.3→0.24` 防过曝
- 修正地球海洋「太浅发灰」：原做法是混向固定的浅蓝 `(156,200,230)`，饱和度从 0.87 掉到 0.35 导致发灰；改为 HSL 空间「保留原色相、抬明度、提饱和」（深海 `(8,25,60)` → `(17,78,202)`，S 0.87→0.92）
- 光照总强度下调（ambient 1.05→0.55、key 1.2→0.85、rim 0.5→0.3），避免过曝把贴图冲成灰白
- 调色常数支持 URL 覆盖：`?lift=&span=&sat=`，方便不改代码现场对比
- 新增 `travel.html`：three.js 3D 地球旅行页（本地引入 three r160 + OrbitControls，`importmap` 方式）
  - 海洋用 canvas 运行时调色（HSL 保色相提亮），拖拽旋转 + 缓慢自转 + 滚轮缩放，大气微光柔化边缘
  - `TRAVELS` 标记数据 + 屏幕投影标记，点击标记在下方卡片显示照片（现用 `tour-1~3.jpg` 占位）
  - 下载 `assets/earth-texture.jpg`（NASA Blue Marble）与 `assets/lib/three.module.js`、`assets/lib/OrbitControls.js`
- `index.html` 两处「旅行 Travel」pill 改为 `<a class="pill" href="travel.html">`，新增 `a.pill` 悬停样式
- Stateful Button 按下后改为文字隐去、按钮收缩为圆形、仅居中显示图标（spinner → 对勾），hover 外环保留
- 还原 Stateful Button 为官方 Aceternity 行为：新增 hover 外环、文字始终显示、图标移至文字左侧并展开、按钮宽度随内容变化、成功态停留 2 秒
- 修复 `#panel-chat` 未闭合导致页脚被错误嵌入 Virtual Space 面板的问题
- 移除模板残留占位符 `__CHAT_CONTENT__`
- 删除面板之间多余的两个 `.section-gap`（避免页面底部约 170px 空白）
- 新增 `.stateful-btn` 组件：数字分身发送按钮与建议提交按钮改为 Stateful Button 交互，文案统一改为 `Send`，配色沿用 `--sky-400 → --sky-600` 渐变
- 项目从 `Documents/deepwork` 同步回原项目目录，并将 git 仓库从 detached HEAD 切回 `main` 分支
