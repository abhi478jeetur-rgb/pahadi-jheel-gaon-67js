/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { i as e, l as t } from "./shader-registry-DHYkwAg5.js";
import { a as n, i as r, n as i, o as a, r as o, t as s } from "./shader-snippet-validator-BRFKy5ie.js";
// src/material-snippet.js
var c = Object.freeze(["materialHook", "snippetMask"]), l = [
	"fragment",
	"uniforms",
	"mask",
	"feature"
], u = Object.freeze({
	pattern: /\bvoid\s+materialHook\s*\(\s*inout\s+vec3\s+[A-Za-z_]\w*\s*,\s*inout\s+float\s+[A-Za-z_]\w*\s*,\s*vec2\s+[A-Za-z_]\w*\s*,\s*vec3\s+[A-Za-z_]\w*\s*\)\s*\{/,
	example: "void materialHook(inout vec3 color, inout float alpha, vec2 uv, vec3 worldPosition) { }"
}), d = Object.freeze({
	fields: "material.snippet { fragment (defines void materialHook(inout vec3 color, inout float alpha, vec2 uv, vec3 worldPosition)), uniforms, mask: \"map\" }; null clears it",
	inputs: "color (albedo after the map), alpha (map alpha), uv, worldPosition; snippetMask (the material map, with mask \"map\"); discard",
	uniforms: "as postPasses.uniforms",
	rules: "as postPasses.rules",
	limits: Object.freeze({
		maxBytes: s.maxBytes,
		maxUniforms: s.maxUniforms
	}),
	notes: "Runs in the colour, shadow (a discarded fragment casts no shadow; color starts white there) and ID passes. alpha cuts only with alphaMode \"mask\"; discard always. Rasterizer only. A compile error returns renderError with snippet line numbers. docs/user-passes.md"
});
function f(e, { hasMap: t = !1 } = {}) {
	o(e, l, "snippet");
	let r = n(e.fragment, {
		label: "Material snippet fragment",
		requiredFunction: u
	}).source, i = a(e.uniforms, {
		label: "Material snippet",
		reservedNames: c
	});
	if (e.mask !== void 0 && e.mask !== "map") throw RangeError("Material snippet mask must be \"map\". Fix: the mask is the material's own map or pattern; load the image as the material map.");
	if (e.mask !== void 0 && !t) throw RangeError("Material snippet mask needs a map. Fix: give the material a map or a pattern, or remove mask.");
	let s = e.mask === "map";
	if (!s && /(?<![.\w])snippetMask(?!\w)/.test(r)) throw RangeError("Material snippet fragment uses snippetMask without a mask. Fix: add \"mask\": \"map\" to the snippet and give the material a map.");
	let d = Object.freeze({
		feature: p(r, i, s),
		fragment: r,
		uniforms: Object.freeze(i),
		...s ? { mask: "map" } : {}
	});
	return C(d), d;
}
function p(e, t, n) {
	let i = 2166136261;
	for (let a of `${e}\n${r(t)}\n${n}`) i = Math.imul(i ^ a.codePointAt(0), 16777619) >>> 0;
	return `s${i.toString(16).padStart(8, "0")}`;
}
function m(e) {
	let t = [], n = 0;
	for (let r of e) r === "{" ? (n++, t.push("\n")) : r === "}" ? n-- : n === 0 && t.push(r);
	return [...t.join("").replace(/\([^()]*\)/g, " ").replace(/\([^()]*\)/g, " ").matchAll(/(?:^|[;\s])(?:const\s+)?(?:float|int|bool|void|[ibu]?vec[234]|mat[234])(?:\[\d*\])?\s+([A-Za-z_]\w*)(?:\s*\[\d*\])?\s*(?=[=;,]|\s*$|\n)/gm)].map((e) => e[1]);
}
function h(e, t, n) {
	return e.replace(RegExp(`(?<![.\\w])${t}(?!\\w)`, "g"), () => n);
}
function g(e) {
	let t = `u67_${e.feature}_`, n = e.fragment, i = /* @__PURE__ */ new Set([...m(n), ...Object.keys(e.uniforms)]);
	for (let e of i) n = h(n, e, `${t}${e}`);
	let a = r(Object.fromEntries(Object.entries(e.uniforms).map(([e, n]) => [`${t}${e}`, n])));
	return {
		code: n,
		declarations: a,
		hook: `${t}materialHook`
	};
}
var _ = "void main() {\n  if (alphaMasked < 0.5) return;\n  float alpha = materialOpacity;\n  if (hasBaseMap > 0.5) alpha *= texture(baseMap, textureUV).a;\n", v = "// u67 material hook code\n", y = "  // u67 material hook calls\n", b = `void main() {
  vec3 hookColor = vec3(1.0);
  float hookAlpha = hasBaseMap > 0.5 ? texture(baseMap, textureUV).a : 1.0;
${y}  if (alphaMasked < 0.5) return;
  float alpha = materialOpacity * hookAlpha;
`;
function x(e, t, n) {
	return e.replace(t, () => t + n);
}
function S(e) {
	return e.includes("snippetWorld") ? e : e.replace("out vec2 textureUV;", () => "out vec2 textureUV;\nout vec3 snippetWorld;").replace("textureUV = uv;", () => "textureUV = uv;\n  snippetWorld = world.xyz;");
}
function C(e) {
	let { code: n, declarations: r, hook: i } = g(e), a = `u67_${e.feature}`, o = h(`uniform float ${a};\n${r}\n${n}\n`, "snippetMask", "baseMap"), s = `if (${a} > 0.5) ${i}(hookColor, hookAlpha, textureUV, snippetWorld);\n`;
	t(e.feature, Object.freeze({
		libraries: o,
		surfaceHook: `  if (${a} > 0.5) ${i}(color, textureAlpha, textureUV, worldPosition);\n`,
		depth: (e) => {
			if (e.includes("lightProjection * world")) return S(e);
			let t = e;
			return t.includes(y) || (t = t.replace("in vec2 textureUV;", () => "in vec2 textureUV;\nin vec3 snippetWorld;").replace(_, () => `${v}${b}`)), x(x(t, v, o), y, `  ${s}`);
		}
	})), w.set(e.feature, {
		flag: a,
		snippet: e
	});
}
var w = /* @__PURE__ */ new Map();
function T(e, t, { type: n, value: r }) {
	t !== null && (n === "float" ? e.uniform1f(t, r) : n === "int" ? e.uniform1i(t, r) : n === "vec2" ? e.uniform2fv(t, r) : n === "vec3" ? e.uniform3fv(t, r) : e.uniform4fv(t, r));
}
function E(e, t, n, r) {
	let i = e.context, a = r.parts[0].material.snippet?.feature;
	for (let r of e.shaderFeatures) {
		let e = w.get(r);
		if (!e) continue;
		let o = (e) => (n[e] ??= i.getUniformLocation(t, e), n[e]);
		if (i.uniform1f(o(e.flag), +(r === a)), r === a) for (let [t, n] of Object.entries(e.snippet.uniforms)) T(i, o(`u67_${r}_${t}`), n);
	}
}
var D = e.bind;
e.bind = (e, t, n, r) => {
	D?.(e, t, n, r), E(e, e.program, e.uniforms, r);
}, e.bindDepth = (e, t) => {
	e.depthSnippetUniforms ??= {}, E(e, e.depthProgram, e.depthSnippetUniforms, t), t.parts[0].material.snippet?.mask && (e.context.activeTexture(e.context.TEXTURE0 + 1), e.context.bindTexture(e.context.TEXTURE_2D, t.textures[0]));
};
var O = "#version 300 es\nprecision highp float;\nprecision highp int;\nuniform sampler2D snippetMask;\nout vec4 u67_output;\n", k = "\nvoid main() { vec3 color = vec3(0.5); float alpha = 1.0; materialHook(color, alpha, vec2(0.5), vec3(0.0)); u67_output = vec4(color, alpha); }\n";
function A() {
	return (typeof OffscreenCanvas == "function" ? new OffscreenCanvas(1, 1) : document.createElement("canvas")).getContext("webgl2");
}
function j(e, t = A) {
	let n = /* @__PURE__ */ new Map();
	for (let t of e) {
		let { snippet: e } = t.material;
		e && !n.has(e.feature) && n.set(e.feature, {
			snippet: e,
			parts: []
		}), e && n.get(e.feature).parts.push(t.name);
	}
	if (n.size === 0) return;
	let a = t();
	if (a) try {
		for (let { snippet: e, parts: t } of n.values()) {
			let n = `${O}${r(e.uniforms)}\n`, o = a.createShader(a.FRAGMENT_SHADER);
			a.shaderSource(o, `${n}${e.fragment}${k}`), a.compileShader(o);
			let s = a.getShaderParameter(o, a.COMPILE_STATUS), c = s ? "" : a.getShaderInfoLog(o);
			if (a.deleteShader(o), !s) {
				let r = i(c, {
					headerLines: n.split("\n").length - 1,
					snippet: e.fragment
				}), a = t.slice(0, 3).join(", ");
				throw Error(`Material snippet (used by ${a}${t.length > 3 ? ", ..." : ""}) failed to compile as GLSL ES 3.00. Line numbers refer to your fragment snippet.\n${r}`);
			}
		}
	} finally {
		a.getExtension("WEBGL_lose_context")?.loseContext();
	}
}
export { d as MATERIAL_SNIPPET_CAPABILITIES, c as MATERIAL_SNIPPET_INPUTS, f as normalizeMaterialSnippet, j as probeMaterialSnippets };
