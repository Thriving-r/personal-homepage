/*!
 * 云背景层 · Cloud Background Layer
 * ---------------------------------------------------------------------------
 * · 效果来源：Aceternity UI《Cloud Shader》
 *     https://ui.aceternity.com/components/cloud-shader
 *     组件源码：https://ui.aceternity.com/registry/cloud-shader.json
 *     作者 Manu Arora · 该组件以 "Aceternity License" 发布，允许用于个人 / 客户的
 *     终端产品并允许修改，仅禁止把组件源文件当模板或素材转售；本项目属个人展示，
 *     在允许范围内（与 citywalk.html 的 Typewriter、calligraphy.html 的
 *     Draggable Card 同一处理口径）。
 *
 * · ⚠️ 本项目硬约束是「零依赖 + file:// 双击可用」（见 AGENTS.md），所以这里
 *     **没有引入 React / motion**，而是把官方那份 WebGL 着色器原样移植成
 *     原生 JS：顶点/片元着色器、billow 噪声、域扭曲、云的自阴影（向上再采样
 *     一次密度）与大气透视参数全部保留。
 *
 * · 与官方唯一的功能性差异（本项目定制）：官方把「天空」也画进 canvas
 *   （u_skyTop/u_skyBottom 由深蓝渐变到浅蓝，gl_FragColor.a = 1.0，整块不透明）。
 *   本页面的底图是既有的水彩天空（assets/bg.jpg + 径向渐变），所以这里
 *   **只画云、天空留透明**：着色器改为按 premultiplied alpha 累积云的覆盖度，
 *   天空区域 alpha = 0，让页面自己的水彩背景透出来。
 *   于是云的「暗部 / 大气透视」用 --sky-200 一档的 u_haze 代替原来的 sky，
 *   整体保持浅蓝水彩调，不引入新色系。
 *
 * · 层级：canvas 走 .cloud-bg 样式（position:fixed + z-index:-1 +
 *   pointer-events:none），永远在页面内容之下，不会遮挡也不拦截任何文字/按钮。
 *
 * · 降级：WebGL 不可用 → canvas 直接隐藏（页面背景照旧）；prefers-reduced-motion
 *   → 只渲染静止的一帧；标签页切到后台 → 暂停渲染循环，省电。
 * ---------------------------------------------------------------------------
 */
(function () {
  "use strict";

  var canvas = document.querySelector("canvas.cloud-bg");
  if (!canvas) return;

  /* ============ 可调参数（水彩浅蓝版） ============ */
  var CFG = {
    speed: 1,            // 漂移速度倍率，1 = 官方默认
    count: 6,            // 云的数量 1~6（越多层次越丰富）
    cloudColor: "#ffffff", // 云的亮部颜色
    haze: "#cfe4f5",     // 远处云融入的「天空色」（= --sky-200），决定云的暗部与大气透视
    maxPixels: 2600000   // 渲染分辨率上限：云本身很柔，降采样看不出来，用来省电
  };

  var gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: false,
    premultipliedAlpha: true,
    depth: false,
    stencil: false
  }) || canvas.getContext("experimental-webgl", {
    alpha: true,
    antialias: false,
    premultipliedAlpha: true
  });

  // WebGL 不可用（老浏览器 / 被禁用）→ 隐藏本层，页面背景照旧
  if (!gl) {
    canvas.style.display = "none";
    return;
  }

  var VERT = [
    "attribute vec2 a_pos;",
    "varying vec2 v_uv;",
    "void main() {",
    "  v_uv = a_pos * 0.5 + 0.5;",
    "  gl_Position = vec4(a_pos, 0.0, 1.0);",
    "}"
  ].join("\n");

  // 片的着色器：官方 Cloud Shader 的移植版（天空透明、按 premultiplied alpha 累积云）
  var FRAG = [
    "#ifdef GL_FRAGMENT_PRECISION_HIGH",
    "precision highp float;",
    "#else",
    "precision mediump float;",
    "#endif",
    "",
    "varying vec2 v_uv;",
    "",
    "uniform vec2 u_res;",
    "uniform float u_time;",
    "uniform float u_count;",
    "uniform vec3 u_cloud;",
    "uniform vec3 u_haze;",
    "",
    "const mat2 R = mat2(0.80, 0.60, -0.60, 0.80);",
    "",
    "float hash(vec2 p) {",
    "  return fract(sin(dot(p, vec2(41.31, 289.17))) * 26737.367);",
    "}",
    "",
    "float vnoise(vec2 p) {",
    "  vec2 i = floor(p);",
    "  vec2 f = fract(p);",
    "  f = f * f * (3.0 - 2.0 * f);",
    "  float a = hash(i);",
    "  float b = hash(i + vec2(1.0, 0.0));",
    "  float c = hash(i + vec2(0.0, 1.0));",
    "  float d = hash(i + vec2(1.0, 1.0));",
    "  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);",
    "}",
    "",
    "float fbm(vec2 p) {",
    "  float sum = 0.0;",
    "  float amp = 0.5;",
    "  for (int i = 0; i < 4; i++) {",
    "    sum += amp * vnoise(p);",
    "    p = R * p * 2.03 + 19.19;",
    "    amp *= 0.5;",
    "  }",
    "  return sum;",
    "}",
    "",
    "// billow noise: sharp puffy ridges, like cauliflower cloud tops",
    "float billow(vec2 p) {",
    "  float sum = 0.0;",
    "  float amp = 0.5;",
    "  for (int i = 0; i < 5; i++) {",
    "    sum += amp * (1.0 - abs(2.0 * vnoise(p) - 1.0));",
    "    p = R * p * 2.11 + 13.37;",
    "    amp *= 0.5;",
    "  }",
    "  return sum;",
    "}",
    "",
    "// raw density for one cloud at point p",
    "float cloudDensity(vec2 p, vec2 c, vec2 r, float seed, float t) {",
    "  vec2 q = p - c;",
    "",
    "  // envelope: dome above the center, flat base below",
    "  float ry = q.y > 0.0 ? r.y : r.y * 0.42;",
    "  float env = 1.0 - length(vec2(q.x / r.x, q.y / ry));",
    "  if (env < -0.35) return 0.0;",
    "",
    "  // domain-warped billow detail, moves with the cloud, evolves slowly",
    "  vec2 dp = q * (2.4 / r.x) + seed;",
    "  dp += 0.6 * vec2(",
    "    fbm(dp * 1.4 + t * 0.04),",
    "    fbm(dp * 1.4 + 7.7 - t * 0.03)",
    "  );",
    "  float detail = billow(dp * 1.6);",
    "",
    "  return env + (detail - 0.62) * 0.62;",
    "}",
    "",
    "// 单朵云 → straight-alpha 的 (rgb, a)。暗部用 u_haze 代替官方画进背景的 sky。",
    "vec4 cloudLayer(vec2 p, vec2 c, vec2 r, float seed, float t, float dist) {",
    "  float d = cloudDensity(p, c, r, seed, t);",
    "  if (d < 0.02) return vec4(0.0);",
    "",
    "  // sample density toward the sun (straight up) for self-shadowing",
    "  float dUp = cloudDensity(p + vec2(0.0, r.y * 0.55), c, r, seed, t);",
    "  float occl = clamp((dUp - d) * 1.1 + d * 0.55, 0.0, 1.0);",
    "",
    "  vec3 lit = u_cloud * 1.04;",
    "  vec3 shadow = mix(u_cloud * 0.68, u_haze, 0.42);",
    "  vec3 cloudCol = mix(lit, shadow, occl * 0.80);",
    "",
    "  float alpha = smoothstep(0.02, 0.38, d);",
    "",
    "  // silver lining on thin edges",
    "  float rim = smoothstep(0.02, 0.14, d) * (1.0 - smoothstep(0.14, 0.40, d));",
    "  cloudCol += rim * 0.10;",
    "",
    "  // atmospheric perspective: far clouds fade into the sky",
    "  cloudCol = mix(cloudCol, u_haze, dist * 0.35);",
    "  alpha *= mix(1.0, 0.8, dist);",
    "",
    "  return vec4(cloudCol, alpha);",
    "}",
    "",
    "// one drifting cloud: horizontal wrap + gentle vertical bob",
    "// 按 premultiplied alpha 叠加到累积结果上（c.rgb * c.a）",
    "vec4 cloudPass(vec4 acc, vec2 p, float aspect, float t,",
    "               float spd, float phase, float y, vec2 r, float seed, float dist) {",
    "  float cx = mix(-r.x - 0.25, aspect + r.x + 0.25, fract(t * spd + phase));",
    "  float cy = y + sin(t * 0.05 + phase * 6.2831) * 0.012;",
    "  vec4 c = cloudLayer(p, vec2(cx, cy), r, seed, t, dist);",
    "  if (c.a <= 0.0) return acc;",
    "  return vec4(c.rgb * c.a + acc.rgb * (1.0 - c.a), c.a + acc.a * (1.0 - c.a));",
    "}",
    "",
    "void main() {",
    "  float aspect = u_res.x / u_res.y;",
    "  vec2 p = vec2(v_uv.x * aspect, v_uv.y);",
    "  float t = u_time;",
    "",
    "  // 天空不绘制：acc 从全透明开始，只有云会累积颜色与 alpha",
    "  vec4 acc = vec4(0.0);",
    "",
    "  // thin cirrus streaks, stretched horizontally, high in the sky",
    "  float cirrusBand = smoothstep(0.55, 0.8, v_uv.y) * (1.0 - smoothstep(0.9, 1.0, v_uv.y));",
    "  if (cirrusBand > 0.01) {",
    "    float streak = fbm(vec2(p.x * 1.6 - t * 0.006, p.y * 12.0));",
    "    float wisp = smoothstep(0.52, 0.78, streak) * cirrusBand * 0.30;",
    "    acc = vec4(u_cloud * wisp, wisp);",
    "  }",
    "",
    "  // far layer: small, high, slow",
    "  if (u_count > 5.5) {",
    "    acc = cloudPass(acc, p, aspect, t, 0.006, 0.10, 0.84, vec2(0.20, 0.10), 43.7, 1.0);",
    "  }",
    "  if (u_count > 4.5) {",
    "    acc = cloudPass(acc, p, aspect, t, 0.008, 0.62, 0.73, vec2(0.24, 0.12), 71.3, 0.85);",
    "  }",
    "",
    "  // middle layer",
    "  if (u_count > 3.5) {",
    "    acc = cloudPass(acc, p, aspect, t, 0.011, 0.33, 0.60, vec2(0.34, 0.16), 17.3, 0.55);",
    "  }",
    "  if (u_count > 2.5) {",
    "    acc = cloudPass(acc, p, aspect, t, 0.013, 0.80, 0.47, vec2(0.30, 0.15), 29.9, 0.45);",
    "  }",
    "",
    "  // near layer: big, low, fast",
    "  if (u_count > 1.5) {",
    "    acc = cloudPass(acc, p, aspect, t, 0.016, 0.05, 0.35, vec2(0.46, 0.20), 91.1, 0.15);",
    "  }",
    "  acc = cloudPass(acc, p, aspect, t, 0.020, 0.48, 0.20, vec2(0.56, 0.24), 57.2, 0.0);",
    "",
    "  // premultiplied（canvas 默认 premultipliedAlpha: true，正好对上）",
    "  gl_FragColor = acc;",
    "}"
  ].join("\n");

  function compile(type, source) {
    var shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  var vert = compile(gl.VERTEX_SHADER, VERT);
  var frag = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vert || !frag) {
    canvas.style.display = "none";
    return;
  }

  var program = gl.createProgram();
  if (!program) {
    canvas.style.display = "none";
    return;
  }
  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  gl.bindAttribLocation(program, 0, "a_pos");
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    canvas.style.display = "none";
    return;
  }
  gl.useProgram(program);

  var buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  var loc = {
    res: gl.getUniformLocation(program, "u_res"),
    time: gl.getUniformLocation(program, "u_time"),
    count: gl.getUniformLocation(program, "u_count"),
    cloud: gl.getUniformLocation(program, "u_cloud"),
    haze: gl.getUniformLocation(program, "u_haze")
  };

  function parseHex(color) {
    var value = String(color).trim();
    if (value.charAt(0) === "#") {
      var hex = value.slice(1);
      if (hex.length === 3) {
        hex = hex.charAt(0) + hex.charAt(0) + hex.charAt(1) + hex.charAt(1) + hex.charAt(2) + hex.charAt(2);
      }
      return [
        parseInt(hex.slice(0, 2), 16) / 255,
        parseInt(hex.slice(2, 4), 16) / 255,
        parseInt(hex.slice(4, 6), 16) / 255
      ];
    }
    var rgb = value.match(/[\d.]+/g);
    if (rgb && rgb.length >= 3) {
      return [Number(rgb[0]) / 255, Number(rgb[1]) / 255, Number(rgb[2]) / 255];
    }
    return [1, 1, 1];
  }

  var cloudRGB = parseHex(CFG.cloudColor);
  var hazeRGB = parseHex(CFG.haze);
  var cloudCount = Math.min(6, Math.max(1, CFG.count));

  var reduceMotion = false;
  try {
    reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch (e) { /* 老浏览器忽略 */ }

  function resize() {
    // ⚠️ 必须用 window.innerWidth/innerHeight，不要拿 canvas.clientWidth 当主来源：
    // 本层是 position:fixed; inset 0 的全屏层，尺寸恒等于视口。
    // 而 defer 脚本可能在「CSS 还没应用」时就跑到这里，此时 canvas 的默认固有尺寸
    // 是 300×150 —— 它是**真值**，所以 `clientWidth || window.innerWidth` 这种写法
    // 不会兜底，会算出 300×150 并把缓冲区永久钉在默认尺寸上（实测 file:// 下
    // index.html / travel.html 中招，云层完全不可见）。
    var vw = window.innerWidth || canvas.clientWidth;
    var vh = window.innerHeight || canvas.clientHeight;

    // 分辨率：DPR 上限 2，再兜一层总像素上限（云很柔，降采样看不出差别）
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var budget = Math.sqrt(CFG.maxPixels / Math.max(1, vw * vh));
    if (dpr > budget) dpr = budget;
    if (dpr < 0.5) dpr = 0.5;

    var w = Math.max(1, Math.floor(vw * dpr));
    var h = Math.max(1, Math.floor(vh * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    gl.viewport(0, 0, w, h);
    gl.uniform2f(loc.res, w, h);
  }

  var frame = 0;
  var running = false;
  var startTime = 0;

  function draw(now) {
    if (!running) return;
    var elapsed = reduceMotion ? 0 : ((now - startTime) / 1000) * CFG.speed;
    gl.uniform1f(loc.time, elapsed);
    gl.uniform1f(loc.count, cloudCount);
    gl.uniform3f(loc.cloud, cloudRGB[0], cloudRGB[1], cloudRGB[2]);
    gl.uniform3f(loc.haze, hazeRGB[0], hazeRGB[1], hazeRGB[2]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    frame = window.requestAnimationFrame(draw);
  }

  function start() {
    if (running) return;
    running = true;
    startTime = performance.now();
    if (reduceMotion) {
      // 静止的一帧：只确认一次画面，不进入循环
      gl.uniform1f(loc.time, 0);
      gl.uniform1f(loc.count, cloudCount);
      gl.uniform3f(loc.cloud, cloudRGB[0], cloudRGB[1], cloudRGB[2]);
      gl.uniform3f(loc.haze, hazeRGB[0], hazeRGB[1], hazeRGB[2]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      running = false;
      return;
    }
    frame = window.requestAnimationFrame(draw);
  }

  function stop() {
    running = false;
    if (frame) window.cancelAnimationFrame(frame);
    frame = 0;
  }

  resize();
  if (window.ResizeObserver) {
    new ResizeObserver(function () { resize(); }).observe(canvas);
  } else {
    window.addEventListener("resize", resize);
  }
  // 移动端横竖屏切换 / 缩放
  window.addEventListener("orientationchange", function () {
    window.setTimeout(resize, 120);
  });
  // 兜底：脚本可能在样式表生效前就跑到这里（见 resize() 的注释），
  // load 之后再对齐一次，保证首屏尺寸一定正确。
  if (document.readyState !== "complete") {
    window.addEventListener("load", resize);
  }

  // 切到后台就停，省电
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stop();
    else start();
  });

  start();
})();
