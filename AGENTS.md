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
| `calligraphy.html` | 书法页：可拖拽的书法作品卡片（独立页面，原生 pointer 事件；Aceternity 式**错落叠放 + 悬停倾斜 + 甩出惯性**）；**已填入 6 张真实作品照片**（`WORKS` 的 `img`），照片下方**不显示文字** |
| `assets/calligraphy/` | 书法作品照片，6 张（`praise-yangcheng-2023` / `china-dream` / `hui-yangcheng-2022` / `zhong-nanshan-2020` / `mao-zedong-poems` / `20th-congress-2022`）。全部 `sips -Z 1600 -s formatOptions 72` 压缩，共约 2.4MB |
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
  - **鼠标在页面内移动时球整页跟随**（用户原话「泡泡在整个页面动，不止右侧」）：指针活跃时停靠点临时变成指针位置，球缓动追过去；`pointerleave` / 触摸设备 / `prefers-reduced-motion` 下回到停靠点。位移由渲染循环缓动后写成 `transform: translate3d()`；跟随缓动 `k = min(4.5 + 差距*0.5, 38)`、回归固定 `k = 3.6`（`1-exp(-k*dt)`，`dt` 上限 0.05s）
  - ⚠️ **跟随三原则（十五 定稿；改这三处 = 重犯「跟丢」）**：①**滚动量直通**——球是贴在**视口**里跟指针的，`follow.on` 时每帧先 `pos.y += ΔscrollY`，缓动只吃「球↔指针」的差距（否则滚动量被缓动吃掉，快速滚动直接落后几百像素）；②**滞后有硬上限** `maxLag = max(orbSize*0.45, 60)`（约半个球身），超出部分截掉（超高速甩动也不拉开距离）；③**循环生死不能只看球在不在视口内**——球的布局盒钉在文档原点、位置靠 `transform` 摆，被甩出视口时 `IntersectionObserver` 报不相交 → `stop()`，**而位置又只有这个循环会更新 → 球永久冻住、再也回不来**（「跟丢」主因）。现在跟随时绝不因不可见而停、`pointermove` 里 `if (!running) start()` 兜底，省电停循环只在「停靠完成 + 不在视口 + 未跟随」三条件齐备时发生
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
