# AGENTS.md · 个人主页项目

> 本文件供 AI 助手自动读取。**每次修改代码后，助手必须在本文件「变更记录」一节追加一条记录。**

## 项目概述

刘孟涵（Menghan Liu）的个人主页，单文件静态网页。

- 技术栈：原生 HTML + 内联 CSS + 内联 `<script>`，无构建工具、无框架
- 主页面 `index.html` 无外部依赖；`travel.html` 例外，使用本地 three.js（`assets/lib/`）
- ⚠️ `travel.html` 依赖 **普通脚本**（非 ES Module）与 **内联 data URI 贴图**，目的是让 `file://` 双击也能正常渲染，详见「交互与组件约定 · 旅行页」
- 页面结构：`index.html` 三个面板（Tab 切换）—— `About Me` / `Home` / `Virtual Space`；`travel.html` 为独立 3D 地球旅行页
- 用途：个人展示（非商业）

## 目录结构

项目根目录：

```
/Users/liumenghan/Documents/个人主页/outputs/personal-homepage
```

| 路径 | 说明 |
|---|---|
| `index.html` | 主文件，HTML / CSS / JS 全部内联其中 |
| `travel.html` | 旅行页：three.js 3D 地球 + 城市标记 + 照片展示（独立页面） |
| `assets/avatar.png` | 头像 |
| `assets/bg.jpg` | 水彩天空背景图 |
| `assets/tour-1.jpg` | 旅行照片 1（夏 · 海边栈道） |
| `assets/tour-2.jpg` | 旅行照片 2（地中海小镇） |
| `assets/tour-3.jpg` | 旅行照片 3（书法 · 墨） |
| `assets/earth-texture.jpg` | 地球贴图（NASA Blue Marble 卫星影像，4096×2048，2:1 等距圆柱投影） |
| `assets/earth-texture.js` | 地球贴图 data URI（2048×1024，609KB）。旅游页实际加载的贴图源，**必须保留** |
| `assets/lib/three.global.js` | three.js r160（由 ESM 版转成的普通脚本，页面实际引用） |
| `assets/lib/OrbitControls.global.js` | 轨道控制器（同上，普通脚本） |
| `assets/lib/three.module.js` | three.js r160 原始 ESM 版，**当前未被引用**（保留作回退参考） |
| `assets/lib/OrbitControls.js` | OrbitControls 原始 ESM 版，**当前未被引用** |
| `assets/*.png` | 对应的高清源图，页面未引用 |

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
  - 标记：数据在 `TRAVELS` 数组（`{ city, en, lat, lng, photo, note }`），每帧把经纬度投影到屏幕坐标；点击标记在下方卡片显示照片
  - 新增城市只需往 `TRAVELS` 加一条；照片建议放到 `assets/travel/`
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
- **「关于我」文案（温暖文艺方向）**：`tagline` 由 `Welcome to my channel!` 改为「把日子过成自己喜欢的样子」；`hero-note` 改为「大一在读 · 在深圳慢慢长大 · 记录生活的人」；「最近在做」改为「打磨这个小主页 · 认真上大一必修课 · 用脚步认识深圳」
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
