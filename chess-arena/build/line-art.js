/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { l as e } from "./shader-registry-DHYkwAg5.js";
import "./shaders-BfxaqrIb.js";
// src/toon-shader.js
e("toon", Object.freeze({
	declarations: "uniform float materialToon;\nuniform float toonDefault;\nfloat toonLight(float light) {\n  float bands = materialToon > 0.0 ? materialToon : toonDefault;\n  if (bands <= 0.0) return light;\n  float scaled = clamp(light, 0.0, 1.0) * bands;\n  float band = floor(scaled);\n  return (band + smoothstep(0.0, 0.02 * bands, scaled - band)) / bands;\n}\n",
	illuminateReflectance: "  normalLight = toonLight(normalLight);\n"
}));
// src/line-art.js
var t = "#version 300 es\nprecision highp float;\nout vec2 textureCoordinate;\nvoid main() {\n  vec2 position = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));\n  textureCoordinate = position;\n  gl_Position = vec4(position * 2.0 - 1.0, 0.0, 1.0);\n}";
function n(e, t, n) {
	let r = e.createShader(t);
	if (e.shaderSource(r, n), e.compileShader(r), !e.getShaderParameter(r, e.COMPILE_STATUS)) throw Error(`Line art shader compilation failed: ${e.getShaderInfoLog(r)}`);
	return r;
}
function r(e, t, r) {
	let i = e.createProgram();
	if (e.attachShader(i, n(e, e.VERTEX_SHADER, t)), e.attachShader(i, n(e, e.FRAGMENT_SHADER, r)), e.linkProgram(i), !e.getProgramParameter(i, e.LINK_STATUS)) throw Error(`Line art shader linking failed: ${e.getProgramInfoLog(i)}`);
	return i;
}
var i = Object.freeze({
	width: 1.5,
	color: Object.freeze([
		.02,
		.02,
		.02
	]),
	boundaries: !0,
	creaseAngle: 35,
	depthJump: .08,
	toon: 0
}), a = Object.freeze({
	width: Object.freeze([.25, 16]),
	color: Object.freeze([0, 4]),
	creaseAngle: Object.freeze([0, 180]),
	depthJump: Object.freeze([0, 10]),
	toon: Object.freeze([0, 8]),
	maxPolylines: 64,
	minPolylinePoints: 2,
	maxPolylinePoints: 256,
	maxPolylineSegments: 4096,
	coordinate: 1e6
}), o = [...Object.keys(i), "polylines"], s = [
	"points",
	"color",
	"width",
	"depthTest",
	"closed"
], c = Math.ceil(a.width[1] / 2);
function l(e, t) {
	if (!e || typeof e != "object" || Array.isArray(e)) throw TypeError(`${t} must be a JSON object.`);
}
function u(e, t, n) {
	let r = Object.keys(e).filter((e) => !t.includes(e));
	if (r.length > 0) throw RangeError(`${n} has unknown ${r.length === 1 ? "field" : "fields"}: ${r.join(", ")}. Allowed: ${t.join(", ")}.`);
}
function d(e, [t, n], r) {
	if (typeof e != "number" || !Number.isFinite(e) || e < t || e > n) throw RangeError(`${r} must be a number between ${t} and ${n}.`);
	return e;
}
function f(e, t) {
	if (typeof e != "boolean") throw TypeError(`${t} must be true or false.`);
	return e;
}
function p(e, t) {
	if (!Array.isArray(e) || e.length !== 3) throw TypeError(`${t} must be three linear RGB numbers [red, green, blue].`);
	return e.map((e, n) => d(e, a.color, `${t}[${n}]`));
}
function m(e, t) {
	if (!Array.isArray(e) || e.length !== 3) throw TypeError(`${t} must be a point [x, y, z].`);
	let n = a.coordinate;
	return e.map((e, r) => d(e, [-n, n], `${t}[${r}]`));
}
function h(e, t, n) {
	let r = `lines.polylines[${t}]`;
	l(e, r), u(e, s, r);
	let i = Array.isArray(e.points) ? e.points.length : 0;
	if (i < a.minPolylinePoints || i > a.maxPolylinePoints) throw RangeError(`${r}.points needs ${a.minPolylinePoints} to ${a.maxPolylinePoints} points.`);
	return {
		points: e.points.map((e, t) => m(e, `${r}.points[${t}]`)),
		color: p(e.color ?? n.color, `${r}.color`),
		width: d(e.width ?? n.width, a.width, `${r}.width`),
		depthTest: f(e.depthTest ?? !0, `${r}.depthTest`),
		closed: f(e.closed ?? !1, `${r}.closed`)
	};
}
function g(e) {
	return e.points.length - 1 + +!!e.closed;
}
function _(e = {}) {
	l(e, "lines"), u(e, o, "lines");
	let t = {
		width: d(e.width ?? i.width, a.width, "lines.width"),
		color: p(e.color ?? i.color, "lines.color"),
		boundaries: f(e.boundaries ?? i.boundaries, "lines.boundaries"),
		creaseAngle: d(e.creaseAngle ?? i.creaseAngle, a.creaseAngle, "lines.creaseAngle"),
		depthJump: d(e.depthJump ?? i.depthJump, a.depthJump, "lines.depthJump"),
		toon: d(e.toon ?? i.toon, a.toon, "lines.toon")
	};
	if (e.polylines !== void 0) {
		if (!Array.isArray(e.polylines) || e.polylines.length > a.maxPolylines) throw RangeError(`lines.polylines must be a list of at most ${a.maxPolylines} polylines.`);
		t.polylines = e.polylines.map((e, n) => h(e, n, t));
		let n = t.polylines.reduce((e, t) => e + g(t), 0);
		if (n > a.maxPolylineSegments) throw RangeError(`lines.polylines hold ${n} segments; the limit is ${a.maxPolylineSegments}.`);
	}
	return t;
}
function v(e) {
	return e.boundaries || e.creaseAngle > 0 || e.depthJump > 0;
}
var y = `#version 300 es
precision highp float;
uniform sampler2D sourceTexture;
uniform sampler2D sceneDepth;
uniform sampler2D partTexture;
uniform sampler2D normalTexture;
uniform vec3 projectionDepth;
uniform float halfWidth;
uniform vec3 lineColor;
uniform float useBoundaries;
uniform float creaseCosine;
uniform float depthJump;
out vec4 outputColor;
ivec2 lastPixel;
vec3 partAt(ivec2 pixel) { return texelFetch(partTexture, clamp(pixel, ivec2(0), lastPixel), 0).rgb; }
vec3 normalAt(ivec2 pixel) { return normalize(texelFetch(normalTexture, clamp(pixel, ivec2(0), lastPixel), 0).rgb * 2.0 - 1.0); }
float depthAt(ivec2 pixel) {
  float ndc = texelFetch(sceneDepth, clamp(pixel, ivec2(0), lastPixel), 0).r * 2.0 - 1.0;
  return projectionDepth.z > 0.5 ? -(ndc - projectionDepth.y) / projectionDepth.x : (ndc + projectionDepth.x) / projectionDepth.y;
}
bool hasPart(vec3 part) { return dot(part, vec3(1.0)) > 0.0; }
bool differs(ivec2 center, ivec2 other, vec3 centerPart, vec3 centerNormal) {
  vec3 otherPart = partAt(other);
  if (useBoundaries > 0.5 && dot(abs(otherPart - centerPart), vec3(1.0)) > 0.001) return true;
  if (creaseCosine > -1.5 && hasPart(centerPart) && hasPart(otherPart) && dot(centerNormal, normalAt(other)) < creaseCosine) return true;
  return false;
}
bool depthEdge(ivec2 center, ivec2 offset, float centerDepth) {
  float jump = abs(depthAt(center + offset) + depthAt(center - offset) - 2.0 * centerDepth);
  return jump > depthJump * abs(centerDepth);
}
bool ringHasEdge(ivec2 center, int ring, vec3 centerPart, vec3 centerNormal, float centerDepth) {
  int diagonal = max(1, int(round(float(ring) * 0.70710678)));
  ivec2 offsets[4] = ivec2[4](ivec2(ring, 0), ivec2(0, ring), ivec2(diagonal, diagonal), ivec2(diagonal, -diagonal));
  for (int index = 0; index < 4; index++) {
    ivec2 offset = offsets[index];
    if (differs(center, center + offset, centerPart, centerNormal) || differs(center, center - offset, centerPart, centerNormal)) return true;
    if (depthJump > 0.0 && depthEdge(center, offset, centerDepth)) return true;
  }
  return false;
}
void main() {
  ivec2 pixel = ivec2(gl_FragCoord.xy);
  lastPixel = textureSize(sourceTexture, 0) - 1;
  vec4 source = texelFetch(sourceTexture, pixel, 0);
  vec3 centerPart = partAt(pixel);
  vec3 centerNormal = normalAt(pixel);
  float centerDepth = depthAt(pixel);
  float fullRings = floor(halfWidth);
  float partial = halfWidth - fullRings;
  float coverage = 0.0;
  for (int ring = 1; ring <= ${c}; ring++) {
    if (float(ring) > ceil(halfWidth)) break;
    if (ringHasEdge(pixel, ring, centerPart, centerNormal, centerDepth)) {
      coverage = float(ring) <= fullRings ? 1.0 : partial;
      break;
    }
  }
  outputColor = vec4(source.rgb * (1.0 - coverage) + lineColor * coverage, source.a * (1.0 - coverage) + coverage);
}`, b = "#version 300 es\nprecision highp float;\nuniform mat4 viewProjection;\nuniform vec2 resolution;\nuniform float lineWidth;\nin vec3 startPoint;\nin vec3 endPoint;\nout vec2 localPixel;\nflat out float segmentLength;\nconst float NEAR_W = 0.001;\nvoid main() {\n  vec4 startClip = viewProjection * vec4(startPoint, 1.0);\n  vec4 endClip = viewProjection * vec4(endPoint, 1.0);\n  if (startClip.w < NEAR_W && endClip.w < NEAR_W) {\n    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);\n    localPixel = vec2(0.0);\n    segmentLength = 0.0;\n    return;\n  }\n  if (startClip.w < NEAR_W) startClip = mix(startClip, endClip, (NEAR_W - startClip.w) / (endClip.w - startClip.w));\n  if (endClip.w < NEAR_W) endClip = mix(endClip, startClip, (NEAR_W - endClip.w) / (startClip.w - endClip.w));\n  vec2 startPixel = startClip.xy / startClip.w * resolution * 0.5;\n  vec2 endPixel = endClip.xy / endClip.w * resolution * 0.5;\n  float segmentPixels = distance(startPixel, endPixel);\n  vec2 along = segmentPixels > 0.0001 ? (endPixel - startPixel) / segmentPixels : vec2(1.0, 0.0);\n  vec2 across = vec2(-along.y, along.x);\n  float margin = lineWidth * 0.5 + 1.0;\n  bool atEnd = gl_VertexID == 1 || gl_VertexID == 4 || gl_VertexID == 5;\n  bool upper = gl_VertexID == 2 || gl_VertexID == 3 || gl_VertexID == 5;\n  float lengthwise = atEnd ? segmentPixels + margin : -margin;\n  float sideways = upper ? margin : -margin;\n  vec4 anchor = atEnd ? endClip : startClip;\n  vec2 pixel = (atEnd ? endPixel : startPixel) + along * (atEnd ? margin : -margin) + across * sideways;\n  gl_Position = vec4(pixel / (resolution * 0.5) * anchor.w, anchor.z, anchor.w);\n  localPixel = vec2(lengthwise, sideways);\n  segmentLength = segmentPixels;\n}", x = "#version 300 es\nprecision highp float;\nuniform sampler2D sceneDepth;\nuniform vec3 projectionDepth;\nuniform float lineWidth;\nuniform vec3 lineColor;\nuniform float depthTest;\nin vec2 localPixel;\nflat in float segmentLength;\nout vec4 outputColor;\nfloat eyeDepth(float depth) {\n  float ndc = depth * 2.0 - 1.0;\n  return projectionDepth.z > 0.5 ? -(ndc - projectionDepth.y) / projectionDepth.x : projectionDepth.y / (ndc + projectionDepth.x);\n}\nvoid main() {\n  float distanceToSegment = length(vec2(localPixel.x - clamp(localPixel.x, 0.0, segmentLength), localPixel.y));\n  float alpha = clamp(lineWidth * 0.5 - distanceToSegment + 0.5, 0.0, 1.0);\n  if (alpha <= 0.0) discard;\n  if (depthTest > 0.5) {\n    float sceneDistance = eyeDepth(texelFetch(sceneDepth, ivec2(gl_FragCoord.xy), 0).r);\n    if (eyeDepth(gl_FragCoord.z) > sceneDistance * 1.005 + 0.002) discard;\n  }\n  outputColor = vec4(lineColor * alpha, alpha);\n}";
function S(e, t, n) {
	return Object.fromEntries(n.map((n) => [n, e.getUniformLocation(t, n)]));
}
function C(e, t, n, r, i) {
	let a = e.createTexture();
	e.bindTexture(e.TEXTURE_2D, a), e.texImage2D(e.TEXTURE_2D, 0, r ? e.RGBA16F : e.RGBA8, t, n, 0, e.RGBA, r ? e.HALF_FLOAT : e.UNSIGNED_BYTE, null), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, i), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MAG_FILTER, i), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_S, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_T, e.CLAMP_TO_EDGE);
	let o = e.createFramebuffer();
	if (e.bindFramebuffer(e.FRAMEBUFFER, o), e.framebufferTexture2D(e.FRAMEBUFFER, e.COLOR_ATTACHMENT0, e.TEXTURE_2D, a, 0), e.checkFramebufferStatus(e.FRAMEBUFFER) !== e.FRAMEBUFFER_COMPLETE) throw Error("Line art framebuffer allocation failed. Choose a lower quality preset.");
	return {
		texture: a,
		framebuffer: o
	};
}
function w(e) {
	let t = e.points, n = new Float32Array(g(e) * 6);
	for (let r = 0; r < g(e); r++) n.set(t[r], r * 6), n.set(t[(r + 1) % t.length], r * 6 + 3);
	return n;
}
function T(e) {
	let n = null, i = null, a = null, o = null, s = null, c = null, l = /* @__PURE__ */ new Map(), u = /* @__PURE__ */ new Map();
	function d(e, t) {
		let { context: n } = e;
		return l.has(t) || l.set(t, C(n, e.canvas.width, e.canvas.height, !1, n.NEAREST)), l.get(t);
	}
	function f(e, t) {
		let { context: n, canvas: r } = e, i = d(e, t);
		n.bindFramebuffer(n.READ_FRAMEBUFFER, e.passSupport.framebuffer), n.bindFramebuffer(n.DRAW_FRAMEBUFFER, i.framebuffer), n.blitFramebuffer(0, 0, r.width, r.height, 0, 0, r.width, r.height, n.COLOR_BUFFER_BIT, n.NEAREST);
	}
	function p(e) {
		c &&= (e.deleteTexture(c.texture), e.deleteFramebuffer(c.framebuffer), null);
		for (let t of l.values()) e.deleteTexture(t.texture), e.deleteFramebuffer(t.framebuffer);
		l.clear();
	}
	function m(e, t = /* @__PURE__ */ new Set()) {
		for (let [n, r] of u) t.has(n) || (e.deleteBuffer(r.buffer), u.delete(n));
	}
	function h(e) {
		p(e), m(e), n && e.deleteProgram(n), a && e.deleteProgram(a), s && e.deleteVertexArray(s), n = null, a = null, s = null;
	}
	function g(e) {
		let t = e.projection, n = t[15] === 1;
		return [
			t[10],
			t[14],
			+!!n
		];
	}
	function _(e, a, o) {
		let { context: s } = e;
		n || (n = r(s, t, y), i = S(s, n, [
			"sourceTexture",
			"sceneDepth",
			"partTexture",
			"normalTexture",
			"projectionDepth",
			"halfWidth",
			"lineColor",
			"useBoundaries",
			"creaseCosine",
			"depthJump"
		])), s.useProgram(n), [
			[o, "sourceTexture"],
			[e.depthTexture, "sceneDepth"],
			[d(e, "part").texture, "partTexture"],
			[d(e, "normal").texture, "normalTexture"]
		].forEach(([e, t], n) => {
			s.activeTexture(s.TEXTURE0 + n), s.bindTexture(s.TEXTURE_2D, e), s.uniform1i(i[t], n);
		}), s.uniform3fv(i.projectionDepth, g(e)), s.uniform1f(i.halfWidth, a.width / 2), s.uniform3fv(i.lineColor, a.color), s.uniform1f(i.useBoundaries, +!!a.boundaries), s.uniform1f(i.creaseCosine, a.creaseAngle > 0 ? Math.cos(a.creaseAngle * Math.PI / 180) : -2), s.uniform1f(i.depthJump, a.depthJump), s.drawArrays(s.TRIANGLES, 0, 3);
	}
	function T(e, t) {
		let n = JSON.stringify([t.points, t.closed]), r = u.get(n);
		if (!r) {
			let i = w(t), a = e.createBuffer();
			e.bindBuffer(e.ARRAY_BUFFER, a), e.bufferData(e.ARRAY_BUFFER, i, e.STATIC_DRAW), r = {
				buffer: a,
				count: i.length / 6
			}, u.set(n, r);
		}
		return {
			key: n,
			...r
		};
	}
	function E(e, t) {
		let { context: n, canvas: i } = e;
		a || (a = r(n, b, x), o = S(n, a, [
			"viewProjection",
			"resolution",
			"lineWidth",
			"sceneDepth",
			"projectionDepth",
			"lineColor",
			"depthTest"
		]), s = n.createVertexArray()), n.useProgram(a), n.bindVertexArray(s), n.enable(n.BLEND), n.blendFuncSeparate(n.ONE, n.ONE_MINUS_SRC_ALPHA, n.ONE, n.ONE_MINUS_SRC_ALPHA), n.activeTexture(n.TEXTURE0), n.bindTexture(n.TEXTURE_2D, e.depthTexture), n.uniform1i(o.sceneDepth, 0), n.uniformMatrix4fv(o.viewProjection, !1, e.viewProjection), n.uniform2f(o.resolution, i.width, i.height), n.uniform3fv(o.projectionDepth, g(e));
		let c = n.getAttribLocation(a, "startPoint"), l = n.getAttribLocation(a, "endPoint"), u = /* @__PURE__ */ new Set();
		for (let e of t) {
			let { key: t, buffer: r, count: i } = T(n, e);
			u.add(t), n.bindBuffer(n.ARRAY_BUFFER, r);
			for (let [e, t] of [[c, 0], [l, 12]]) n.enableVertexAttribArray(e), n.vertexAttribPointer(e, 3, n.FLOAT, !1, 24, t), n.vertexAttribDivisor(e, 1);
			n.uniform1f(o.lineWidth, e.width), n.uniform3fv(o.lineColor, e.color), n.uniform1f(o.depthTest, +!!e.depthTest), n.drawArraysInstanced(n.TRIANGLES, 0, 6, i);
		}
		m(n, u), n.disable(n.BLEND), n.bindVertexArray(null);
	}
	function D(t, n, r, i) {
		let a = e.lines;
		if (!a) return null;
		let o = v(a), s = a.polylines?.length > 0;
		if (!o && !s) return null;
		if (!t.depthTexture) throw Error("Line art requires depth:true on the renderer.");
		let { context: l, canvas: u } = t;
		return c ??= C(l, u.width, u.height, t.hdr, l.LINEAR), l.bindFramebuffer(l.FRAMEBUFFER, c.framebuffer), l.viewport(0, 0, u.width, u.height), l.disable(l.DEPTH_TEST), l.disable(l.CULL_FACE), l.bindVertexArray(null), o ? _(t, a, i) : A(t, i), s && E(t, a.polylines), c.texture;
	}
	let O = null, k = null;
	function A(e, n) {
		let { context: i } = e;
		O || (O = r(i, t, "#version 300 es\nprecision highp float;\nuniform sampler2D sourceTexture;\nout vec4 outputColor;\nvoid main() { outputColor = texelFetch(sourceTexture, ivec2(gl_FragCoord.xy), 0); }"), k = i.getUniformLocation(O, "sourceTexture")), i.useProgram(O), i.activeTexture(i.TEXTURE0), i.bindTexture(i.TEXTURE_2D, n), i.uniform1i(k, 0), i.drawArrays(i.TRIANGLES, 0, 3);
	}
	return {
		name: "Line art",
		apply: D,
		captureGuide: f,
		releaseTargets: p,
		dispose(e) {
			h(e), O && e.deleteProgram(O), O = null;
		}
	};
}
function E(e) {
	if (e.lineArt) return e;
	if (!e.passSupport) throw Error("Line art needs installRenderPasses(renderer) from 67js/addons/render-passes first.");
	let t = { lines: null }, n = T(t);
	e.postStages.push(n);
	let r = e.render.bind(e), i = 0;
	function a() {
		for (let t of ["materialToon", "toonDefault"]) e.uniforms[t] = e.context.getUniformLocation(e.program, t);
	}
	function o() {
		e.shaderFeatures?.has("toon") && (e.context.useProgram(e.program), e.context.uniform1f(e.uniforms.toonDefault, i));
	}
	let s = e.rebuildMainProgram.bind(e);
	e.rebuildMainProgram = () => {
		s(), a(), o();
	};
	function c(t) {
		i = t, t > 0 && e.requireFeatureNames(["toon"]), o();
	}
	function l(t) {
		for (let [i, a] of [["objectId", "part"], ["normal", "normal"]]) r({
			...t,
			pass: i
		}), n.captureGuide(e, a);
	}
	return e.render = (n) => {
		let i = n.lines && n.pass === void 0 && !n.reflectionTarget && !e.benchmark ? n.lines : null;
		c(i?.toon ?? 0), t.lines = i, i && v(i) && l(n);
		try {
			r(n);
		} finally {
			t.lines = null;
		}
	}, e.program && a(), e.lineArt = { resolve: _ }, e;
}
export { i as LINE_ART_DEFAULTS, a as LINE_ART_LIMITS, E as installLineArt, _ as resolveLineArt };
