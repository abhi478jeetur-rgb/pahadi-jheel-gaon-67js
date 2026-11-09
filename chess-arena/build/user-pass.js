/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { r as e, t } from "./gl-program-KwXE3oHO.js";
import { a as n, i as r, n as i, o as a, r as o, t as s } from "./shader-snippet-validator-BRFKy5ie.js";
// src/user-pass.js
var c = Object.freeze([
	"sceneColor",
	"sceneDepth",
	"resolution",
	"time",
	"depthAt",
	"worldPointAt",
	"worldNormalAt",
	"userPass"
]), l = Object.freeze({
	min: .05,
	max: 1
}), u = /^[a-z][A-Za-z0-9-]{0,31}$/, d = [
	"name",
	"fragment",
	"uniforms",
	"scale"
], f = Object.freeze({
	pattern: /\bvec4\s+userPass\s*\(\s*vec2\s+[A-Za-z_]\w*\s*\)\s*\{/,
	example: "vec4 userPass(vec2 uv) { return texture(sceneColor, uv); }"
});
function p(e) {
	if (!Array.isArray(e)) throw TypeError("postPasses must be an array of { name, fragment, uniforms, scale }. Fix: send [] to clear it.");
	if (e.length > s.maxPasses) throw RangeError(`postPasses holds ${e.length} passes; the limit is ${s.maxPasses}. Fix: merge passes, or draw several effects in one fragment.`);
	let t = /* @__PURE__ */ new Set();
	return e.map((e, r) => {
		if (o(e, d, `postPasses[${r}]`), typeof e.name != "string" || !u.test(e.name)) throw RangeError(`postPasses[${r}].name must match ${u}. Fix: a lowercase letter, then letters, digits or hyphens, 32 characters at most.`);
		if (t.has(e.name)) throw RangeError(`Pass name "${e.name}" is used twice. Fix: give each pass its own name.`);
		t.add(e.name);
		let i = e.scale ?? 1;
		if (typeof i != "number" || !(i >= l.min && i <= l.max)) throw RangeError(`Post pass "${e.name}" scale must be between ${l.min} and ${l.max}. Fix: 0.25 renders at a quarter of the width and height.`);
		n(e.fragment, {
			label: `Post pass "${e.name}" fragment`,
			requiredFunction: f
		});
		let s = a(e.uniforms, {
			label: `Post pass "${e.name}"`,
			reservedNames: c
		});
		return {
			name: e.name,
			fragment: e.fragment,
			uniforms: s,
			scale: i
		};
	});
}
var m = Object.freeze({
	fields: "name, fragment (defines vec4 userPass(vec2 uv)), uniforms, scale 0.05-1 (1)",
	inputs: "sceneColor, sceneDepth (sampler2D), resolution (vec2, this pass), time (s), depthAt(uv), worldPointAt(uv), worldNormalAt(uv, from depth); gl_FragCoord",
	uniforms: "a number is float, [x,y(,z(,w))] is vec2-4, {type:\"int\",value} is int; name ^[a-z][A-Za-z0-9]{0,31}$",
	rules: "no # lines, while, do, uniform/layout declarations, gl_ names but gl_FragCoord, or u67_ names; for loops only as for (int i = 0; i < N; i++) { } with literal bounds, 64 iterations at most, loop work under 4096",
	limits: Object.freeze({
		maxPasses: s.maxPasses,
		maxBytes: s.maxBytes,
		maxUniforms: s.maxUniforms,
		maxLoopIterations: s.maxLoopIterations,
		maxLoopWork: s.maxLoopWork
	}),
	notes: "Passes run in order on the finished frame; scale under 1 renders smaller and enlarges with nearest filtering. A compile error returns the log with snippet line numbers (renderError); the scene stays. Stills and render jobs apply them; the path tracer does not. docs/user-passes.md"
});
function h(e) {
	return e.map((e) => ({
		name: e.name,
		scale: e.scale,
		uniforms: Object.entries(e.uniforms).map(([e, { type: t }]) => `${e}:${t}`),
		fragmentBytes: e.fragment.length
	}));
}
var g = "#version 300 es\nprecision highp float;\nprecision highp int;\nin vec2 textureCoordinate;\nuniform sampler2D sceneColor;\nuniform sampler2D sceneDepth;\nuniform mat4 u67_inverseViewProjection;\nuniform vec2 resolution;\nuniform float time;\nout vec4 u67_output;\nfloat depthAt(vec2 uv) { return texture(sceneDepth, uv).r; }\nvec3 worldPointAt(vec2 uv) {\n  vec4 point = u67_inverseViewProjection * vec4(uv * 2.0 - 1.0, depthAt(uv) * 2.0 - 1.0, 1.0);\n  return point.xyz / point.w;\n}\nvec3 worldNormalAt(vec2 uv) {\n  vec2 texel = 1.0 / vec2(textureSize(sceneDepth, 0));\n  vec3 center = worldPointAt(uv);\n  vec3 right = worldPointAt(uv + vec2(texel.x, 0.0)) - center;\n  vec3 left = center - worldPointAt(uv - vec2(texel.x, 0.0));\n  vec3 up = worldPointAt(uv + vec2(0.0, texel.y)) - center;\n  vec3 down = center - worldPointAt(uv - vec2(0.0, texel.y));\n  vec3 normal = cross(dot(right, right) < dot(left, left) ? right : left, dot(up, up) < dot(down, down) ? up : down);\n  float size = length(normal);\n  return size > 1e-12 ? normal / size : vec3(0.0, 1.0, 0.0);\n}\n", _ = "\nvoid main() { u67_output = userPass(textureCoordinate); }\n";
function v(e) {
	let { source: t } = n(e.fragment, {
		label: `Post pass "${e.name}" fragment`,
		requiredFunction: f
	}), i = `${g}${r(e.uniforms)}\n`;
	return {
		source: `${i}${t}${_}`,
		headerLines: i.split("\n").length - 1,
		snippet: t
	};
}
var y = "#version 300 es\nprecision highp float;\nin vec2 textureCoordinate;\nuniform sampler2D sourceTexture;\nout vec4 outputColor;\nvoid main() { outputColor = texture(sourceTexture, textureCoordinate); }";
function b(e, t, n, r, i = !0) {
	let a = e.createTexture();
	e.bindTexture(e.TEXTURE_2D, a), e.texImage2D(e.TEXTURE_2D, 0, i ? e.RGBA8 : e.RGB8, t, n, 0, i ? e.RGBA : e.RGB, e.UNSIGNED_BYTE, null);
	for (let t of [e.TEXTURE_MIN_FILTER, e.TEXTURE_MAG_FILTER]) e.texParameteri(e.TEXTURE_2D, t, r);
	return e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_S, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_T, e.CLAMP_TO_EDGE), a;
}
function x(e, t, n) {
	let r = b(e, t, n, e.NEAREST), i = e.createFramebuffer();
	if (e.bindFramebuffer(e.FRAMEBUFFER, i), e.framebufferTexture2D(e.FRAMEBUFFER, e.COLOR_ATTACHMENT0, e.TEXTURE_2D, r, 0), e.checkFramebufferStatus(e.FRAMEBUFFER) !== e.FRAMEBUFFER_COMPLETE) throw Error("Post pass framebuffer allocation failed. Fix: lower the pass scale or the render size.");
	return {
		texture: r,
		framebuffer: i,
		width: t,
		height: n
	};
}
function S(e, t, { type: n, value: r }) {
	n === "float" ? e.uniform1f(t, r) : n === "int" ? e.uniform1i(t, r) : n === "vec2" ? e.uniform2fv(t, r) : n === "vec3" ? e.uniform3fv(t, r) : e.uniform4fv(t, r);
}
function C(e, t, n) {
	let r = t.message.replace(/^Shader (compilation|linking) failed: /, ""), a = i(r, {
		headerLines: n.headerLines,
		snippet: n.snippet
	});
	return /* @__PURE__ */ Error(`Post pass "${e.name}" failed to compile as GLSL ES 3.00. Line numbers refer to your fragment snippet.\n${a}`);
}
function w(n) {
	if (n.userPasses) return n;
	let r = {
		passes: [],
		key: "[]",
		entries: [],
		capture: null,
		copy: null
	}, i = /* @__PURE__ */ new WeakMap();
	function a(e, t) {
		t.target &&= (e.deleteTexture(t.target.texture), e.deleteFramebuffer(t.target.framebuffer), null);
	}
	function o(e, t) {
		a(e, t), e.deleteProgram(t.program);
	}
	function s(e) {
		r.capture && e.deleteTexture(r.capture.texture), r.capture = null, r.entries.forEach((t) => a(e, t));
	}
	function c(e) {
		s(e), r.entries.forEach((t) => e.deleteProgram(t.program)), r.entries = [], r.copy && e.deleteProgram(r.copy.program), r.copy = null;
	}
	function l() {
		let a = n.context;
		return r.entries.slice(r.passes.length).forEach((e) => o(a, e)), r.entries.length = Math.min(r.entries.length, r.passes.length), r.passes.forEach((n, s) => {
			i.has(n) || i.set(n, v(n));
			let c = i.get(n), l = r.entries[s];
			if (l?.source === c.source) {
				l.pass = n;
				return;
			}
			let u;
			try {
				u = t(a, e, c.source);
			} catch (e) {
				throw C(n, e, c);
			}
			l && o(a, l);
			let d = [
				"sceneColor",
				"sceneDepth",
				"u67_inverseViewProjection",
				"resolution",
				"time",
				...Object.keys(n.uniforms)
			];
			r.entries[s] = {
				pass: n,
				source: c.source,
				program: u,
				target: null,
				locations: Object.fromEntries(d.map((e) => [e, a.getUniformLocation(u, e)]))
			};
		}), r.entries;
	}
	function u(e, t) {
		let i = n.context;
		r.capture && (r.capture.width !== e || r.capture.height !== t) && (i.deleteTexture(r.capture.texture), r.capture = null);
		let a = !!i.getContextAttributes()?.alpha;
		return r.capture ??= {
			texture: b(i, e, t, i.LINEAR, a),
			width: e,
			height: t
		}, i.bindFramebuffer(i.FRAMEBUFFER, null), i.bindTexture(i.TEXTURE_2D, r.capture.texture), i.copyTexSubImage2D(i.TEXTURE_2D, 0, 0, 0, 0, 0, e, t), r.capture.texture;
	}
	function d(e, t, r) {
		return e.target && (e.target.width !== t || e.target.height !== r) && a(n.context, e), e.target ??= x(n.context, t, r), e.target;
	}
	function f(e, t, r, i, a) {
		let o = n.context, { locations: s, pass: c } = e;
		o.viewport(0, 0, r, i), o.useProgram(e.program), o.activeTexture(o.TEXTURE0), o.bindTexture(o.TEXTURE_2D, t), o.uniform1i(s.sceneColor, 0), o.activeTexture(o.TEXTURE1), o.bindTexture(o.TEXTURE_2D, n.depthTexture ?? n.whiteTexture), o.uniform1i(s.sceneDepth, 1), o.uniformMatrix4fv(s.u67_inverseViewProjection, !1, n.inverseViewProjection), o.uniform2f(s.resolution, r, i), o.uniform1f(s.time, a.time ?? 0);
		for (let [e, t] of Object.entries(c.uniforms)) S(o, s[e], t);
		o.drawArrays(o.TRIANGLES, 0, 3);
	}
	function m(i, a, o) {
		let s = n.context;
		if (!r.copy) {
			let n = t(s, e, y);
			r.copy = {
				program: n,
				texture: s.getUniformLocation(n, "sourceTexture")
			};
		}
		s.bindFramebuffer(s.FRAMEBUFFER, null), s.viewport(0, 0, a, o), s.useProgram(r.copy.program), s.activeTexture(s.TEXTURE0), s.bindTexture(s.TEXTURE_2D, i), s.uniform1i(r.copy.texture, 0), s.drawArrays(s.TRIANGLES, 0, 3);
	}
	function h(e) {
		let t = n.context, { width: r, height: i } = n.canvas, a = l();
		t.disable(t.DEPTH_TEST), t.disable(t.CULL_FACE), t.disable(t.BLEND), t.bindVertexArray(null);
		let o = u(r, i), s = !1;
		a.forEach((n, c) => {
			let l = c === a.length - 1 && n.pass.scale === 1, u = l ? r : Math.max(1, Math.round(r * n.pass.scale)), p = l ? i : Math.max(1, Math.round(i * n.pass.scale)), m = l ? null : d(n, u, p);
			t.bindFramebuffer(t.FRAMEBUFFER, m?.framebuffer ?? null), f(n, o, u, p, e), o = m?.texture, s = l;
		}), s || m(o, r, i);
	}
	let g = n.resolveFrame;
	return n.resolveFrame = function(e, ...t) {
		g.call(this, e, ...t), r.passes.length > 0 && !this.benchmark && h(e);
	}, n.postStages.push({
		name: "User passes",
		apply: () => null,
		releaseTargets: s,
		dispose: c
	}), n.userPasses = {
		set(e) {
			let t = JSON.stringify(e);
			t !== r.key && (r.passes = p(e), r.key = t);
		},
		get passes() {
			return structuredClone(r.passes);
		}
	}, n;
}
export { m as USER_PASS_CAPABILITIES, c as USER_PASS_INPUTS, l as USER_PASS_SCALE, v as buildPassFragment, h as describeUserPasses, w as installUserPasses, p as normalizeUserPasses };
