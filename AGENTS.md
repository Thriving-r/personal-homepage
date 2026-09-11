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
| `travel.html` | 旅行页：three.js 3D 地球 + 城市标记 + 照片展示（独立页面） |
| `calligraphy.html` | 书法页：可拖拽的书法作品卡片（独立页面，原生 pointer 事件） |
| `assets/calligraphy/` | 书法作品照片（**尚未创建**，拿到照片后放在这里并在 `WORKS` 里填 `img`） |
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
- **液态玻璃球（`.hero-glass` / `#glassCanvas`）**：**全站常驻**。桌面端 Home / About Me / Virtual Space 三个面板都是同一颗球、都跟着鼠标走
  - 停靠点由 `placeOrb()` 按当前面板计算：Home 贴欢迎语右侧（保持原位 `[904,161,236]`）；另两页走右侧留白（`right:18 / width:210 / top:54%` → `[1052,304,210]`）
  - **鼠标在页面内移动时球整页跟随**（用户原话「泡泡在整个页面动，不止右侧」）：指针活跃时停靠点临时变成指针位置，球缓动追过去；`pointerleave` / 触摸设备 / `prefers-reduced-motion` 下回到停靠点。位移由渲染循环缓动后写成 `transform: translate3d()`（`k = 跟随 5.0 / 回归 3.6`，`1-exp(-k*dt)`，`dt` 上限 0.05s）
  - ⚠️ **已删除 `top/right/width` 的 CSS 过渡**：跟随（每帧追指针）与切面板（滑到新停靠点）是同一套缓动，两套机制并存会互相打架。`will-change:transform` 下不要再用 CSS transition 动同一颗球，也不要改回用 `top/left` 每帧写像素
  - ⚠️ **跟随点必须夹紧在文档内**（横向留在视口、纵向 `≤ docH - 半径`），否则球会把文档撑高、凭空多出滚动条
  - ⚠️ **必须用文档坐标（`position:absolute`，布局盒钉在 `top:0;left:0`、靠 `transform` 位移），不要改成 `position:fixed`**：`fixed` 会让球钉在视口上，正文一滚就从球下穿过（实测 1280×620 滚到底压到 `Send` 按钮）；`absolute` 下球与正文的相对位置恒定，避让在任意滚动位置都成立（Home 分支要 `r.top + window.scrollY`）
  - ⚠️ **改落点前必须先量「文字墨迹」**（`Range.getClientRects()`），不要用块级元素的满宽盒子，否则会把大片空白误判成重叠
  - `pointer-events:none`：纯装饰浮层，绝不拦截点击 / 划选 / 滚轮；点击涟漪靠 **window 级圆形命中判定**实现（不是监听 canvas）
  - ⚠️ **窄屏（≤700px）单独处理**：窄屏既没有右侧留白、也没有鼠标跟随（触摸不产生 hover 跟随）。Home 回落到 `.welcome` 文档流（`width:min(180px,46vw); margin:18px auto 0`），About Me / Virtual Space 藏球。**不要**在窄屏改成固定定位，实测会压住 Home 的 H1
  - ⚠️ **不要**恢复「整页铺满泡泡跟随鼠标」的方案——该方案已被用户明确否决
  - ⚠️ **验证球位不要用「像素差分 bbox 质心」**：球心近乎透明（过 DOM 球心的中线差值 ≤3），强差分只出现在边缘折射新月区，质心会随背后背景内容漂移几十像素，看着像「没画在指针处」。要判定位置请用 **DOM rect**（`getBoundingClientRect`）或**红盒法**（临时 `canvas.style.background='#ff0000'; canvas.style.filter='none'`，footprint 应精确等于球盒）
  - 自检钩子：只有 `?selftest=1` 才挂 `window.__heroGlass`（正式访问下为 `undefined`）
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
    - ⬅ **本条描述的是十三版机制（`top/right` + CSS 过渡滑行）**；**十四 已改为「停靠点 + 整页跟随」并用 `transform` 缓动、文件 `75223 bytes`，以十四为准**

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
  - 性能 / 无障碍：`IntersectionObserver` + `visibilitychange` 不可见时暂停 rAF；`prefers-reduced-motion` 只静态画一帧；DPR 上限 2；WebGL2 不可用或 shader 编译失败时隐藏组件优雅降级
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
