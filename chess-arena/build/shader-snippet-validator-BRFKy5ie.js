/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
// src/shader-snippet-validator.js
var e = Object.freeze({
	maxBytes: 4096,
	maxPasses: 4,
	maxUniforms: 16,
	maxLoopIterations: 64,
	maxLoopWork: 4096
}), t = /^[a-z][A-Za-z0-9]{0,31}$/, n = Object.freeze([
	"float",
	"vec2",
	"vec3",
	"vec4",
	"int"
]), r = Object.freeze({
	vec2: 2,
	vec3: 3,
	vec4: 4
}), i = "u67_", a = "gl_FragCoord", o = new Set("attribute const uniform varying break continue do for while if else in out inout float int void bool\n  true false discard return mat2 mat3 mat4 vec2 vec3 vec4 ivec2 ivec3 ivec4 uvec2 uvec3 uvec4 bvec2 bvec3 bvec4 struct precision highp\n  mediump lowp layout centroid flat smooth patch sample buffer shared coherent volatile restrict readonly writeonly resource common\n  partition active asm class union enum typedef template this packed goto inline noinline public static extern external interface\n  long short double half fixed unsigned superp input output filter namespace using sizeof cast switch case default uint\n  sampler2D sampler3D samplerCube".split(/\s+/)), s = class extends Error {
	constructor(e, t, n, r) {
		let i = r ? ` line ${r.line}, column ${r.column}` : "";
		super(`${e}${i}: ${t} Fix: ${n}`), this.name = "ShaderSnippetError", this.line = r?.line ?? null, this.column = r?.column ?? null, this.hint = n;
	}
};
function c(e, t, n) {
	if (!e || typeof e != "object" || Array.isArray(e)) throw TypeError(`${n} must be an object.`);
	for (let r of Object.keys(e)) if (!t.includes(r)) throw TypeError(`Unknown ${n} field: ${r}. Allowed fields: ${t.join(", ")}.`);
}
function l(e, t) {
	let n = 1, r = 0;
	for (let i = 0; i < t; i++) e[i] === "\n" && (n++, r = i + 1);
	return {
		line: n,
		column: t - r + 1
	};
}
function u(e, t) {
	let n = "", r = 0;
	for (; r < e.length;) {
		let i = e.slice(r, r + 2);
		if (i === "//") for (; r < e.length && e[r] !== "\n";) n += " ", r++;
		else if (i === "/*") {
			let i = e.indexOf("*/", r + 2);
			if (i === -1) throw new s(t, "This block comment never closes.", "Close it with */ or use // comments.", l(e, r));
			for (; r < i + 2; r++) n += e[r] === "\n" ? "\n" : " ";
		} else n += e[r], r++;
	}
	return n;
}
function d(e, t) {
	for (let n = 0; n < e.length; n++) {
		let r = e.charCodeAt(n), i = r >= 32 && r <= 126;
		if (e[n] === "\\") throw new s(t, "A backslash is not allowed.", "Remove it; a line continuation can hide code from the checks.", l(e, n));
		if (!i && r !== 10 && r !== 13 && r !== 9) throw new s(t, `Character code ${r} is not allowed.`, "Use plain ASCII text and newlines only.", l(e, n));
	}
}
var f = /[A-Za-z_][A-Za-z0-9_]*|\d[\w.]*|\.\d[\w.]*|\+\+|--|<<=|>>=|<=|>=|==|!=|&&|\|\||\^\^|<<|>>|[-+*/%&|^]=|\S/g;
function p(e) {
	return [...e.matchAll(f)].map((e) => ({
		text: e[0],
		index: e.index
	}));
}
var m = (e) => e !== void 0 && /^[A-Za-z_]/.test(e.text);
function h(t, n, r) {
	for (let o of t) {
		if (!m(o)) continue;
		let t = l(n, o.index), c = o.text;
		if (c === "while" || c === "do") throw new s(r, `"${c}" loops are not allowed.`, `Use a for loop with integer literal bounds of at most ${e.maxLoopIterations}, for example for (int i = 0; i < 8; i++) { ... }.`, t);
		if ([
			"uniform",
			"layout",
			"attribute",
			"varying",
			"buffer",
			"shared"
		].includes(c)) throw new s(r, `"${c}" declarations are not allowed in a snippet.`, "Declare values in the uniforms object of the pass; the engine writes their declarations. Use the provided inputs for the rest.", t);
		if (c.startsWith("gl_") && c !== a) throw new s(r, `"${c}" is not allowed; only ${a} may start with gl_.`, `Take the pixel position from ${a} or the uv argument.`, t);
		if (c.startsWith("u67_")) throw new s(r, `"${c}" starts with ${i}, which the engine keeps for its own names.`, `Rename it without the ${i} prefix.`, t);
	}
}
function g(e, t, n, r) {
	let i = 0;
	for (let a = t; a < e.length; a++) if (e[a].text === n && i++, e[a].text === r && --i === 0) return a;
	return -1;
}
var _ = /^(0|[1-9]\d*)$/, v = `Write the header as for (int i = 0; i < 8; i++) with integer literals, at most ${e.maxLoopIterations} iterations.`;
function y(t, n, r, i) {
	let a = l(r, t[n].index), o = (e, a = n) => {
		throw new s(i, e, v, l(r, t[Math.min(a, t.length - 1)].index));
	}, c = t.slice(n).map((e) => e.text);
	c[1] === "(" && c[2] === "int" && m(t[n + 3]) && c[4] === "=" || o("This for loop must declare one counter: int NAME = literal.");
	let u = c[3];
	_.test(c[5] ?? "") && c[6] === ";" || o("The counter must start at an integer literal.", n + 5), c[7] === u && [
		"<",
		"<=",
		">",
		">=",
		"!="
	].includes(c[8]) && _.test(c[9] ?? "") && c[10] === ";" || o("The loop test must compare the counter with an integer literal.", n + 7);
	let d, f;
	c[11] === u && (c[12] === "++" || c[12] === "--") && c[13] === ")" ? (d = c[12] === "++" ? 1 : -1, f = 13) : (c[11] === "++" || c[11] === "--") && c[12] === u && c[13] === ")" ? (d = c[11] === "++" ? 1 : -1, f = 13) : c[11] === u && (c[12] === "+=" || c[12] === "-=") && _.test(c[13] ?? "") && c[14] === ")" ? (d = Number(c[13]) * (c[12] === "+=" ? 1 : -1), f = 14) : o("The loop step must be i++, ++i, i--, --i, i += N or i -= N.", n + 11), c[f + 1] !== "{" && o("The loop body must be inside { }.", n + f + 1);
	let p = Number(c[5]), h = Number(c[9]), y = {
		"<": (e, t) => e < t,
		"<=": (e, t) => e <= t,
		">": (e, t) => e > t,
		">=": (e, t) => e >= t,
		"!=": (e, t) => e !== t
	}[c[8]], b = 0;
	for (; y(p, h) && b <= e.maxLoopIterations;) p += d, b++;
	if (b > e.maxLoopIterations) throw new s(i, `This for loop runs more than ${e.maxLoopIterations} iterations.`, `Lower the bound or raise the step so the loop runs at most ${e.maxLoopIterations} times.`, a);
	let x = n + f + 1, S = g(t, x, "{", "}");
	return S === -1 && o("The loop body never closes.", x), {
		variable: u,
		iterations: b,
		bodyStart: x,
		bodyEnd: S
	};
}
var b = /* @__PURE__ */ new Set([
	"=",
	"+=",
	"-=",
	"*=",
	"/=",
	"%=",
	"++",
	"--",
	"<<=",
	">>=",
	"&=",
	"|=",
	"^="
]);
function x(e, t, n, r) {
	for (let i = t.bodyStart + 1; i < t.bodyEnd; i++) if (e[i].text === t.variable && (b.has(e[i + 1]?.text) || ["++", "--"].includes(e[i - 1]?.text))) throw new s(r, `The loop counter "${t.variable}" is changed inside its loop body.`, "Leave the counter alone in the body; copy it to another variable if you need to change it.", l(n, e[i].index));
}
function S(e) {
	let t = /* @__PURE__ */ new Map(), n = 0;
	for (let r = 0; r < e.length; r++) {
		if (e[r].text === "{") {
			if (n === 0 && e[r - 1]?.text === ")") {
				let n = r - 1, i = 0;
				for (; n >= 0 && (e[n].text === ")" && i++, e[n].text !== "(" || --i !== 0); n--);
				let a = g(e, r, "{", "}");
				n > 0 && a !== -1 && m(e[n - 1]) && t.set(e[n - 1].text, {
					start: r,
					end: a
				});
			}
			n++;
		}
		e[r].text === "}" && n--;
	}
	return t;
}
function C(e, t, n, r, i, a, o) {
	let s = 0;
	for (let c = t; c < n; c++) {
		let t = r.get(c);
		t ? (s += t.iterations * C(e, t.bodyStart + 1, t.bodyEnd, r, i, a, o), c = t.bodyEnd) : i.has(e[c].text) && e[c + 1]?.text === "(" && !a.has(e[c].text) && (s += o(e[c].text));
	}
	return Math.max(1, s);
}
function w(t, n, r, i) {
	let a = new Map(n.map((e) => [e.forIndex, e])), o = S(t), c = /* @__PURE__ */ new Map(), u = /* @__PURE__ */ new Set();
	function d(e) {
		if (!c.has(e)) {
			u.add(e);
			let { start: n, end: r } = o.get(e);
			c.set(e, C(t, n + 1, r, a, o, u, d)), u.delete(e);
		}
		return c.get(e);
	}
	let f = 1, p = null;
	for (let e of o.keys()) {
		let t = d(e);
		t > f && (f = t, p = e);
	}
	if (f > e.maxLoopWork) {
		let n = o.get(p).start;
		throw new s(i, `Function ${p} can run ${f} loop iterations per pixel, over the limit of ${e.maxLoopWork}.`, "Shorten the loops or the nesting; nested loops multiply and every call to a helper counts its loops again.", l(r, t[n].index));
	}
	return f;
}
function T(t, n = {}) {
	let r = n.label ?? "Shader snippet", i = Math.min(n.maxBytes ?? e.maxBytes, e.maxBytes);
	if (typeof t != "string" || t.trim() === "") throw new s(r, "The fragment is empty or not a string.", "Send the GLSL text as a string.");
	if (t.length > i) throw new s(r, `The fragment is ${t.length} bytes; the limit is ${i}.`, "Shorten the snippet or move constants into uniforms.");
	d(t, r);
	let a = u(t, r), o = a.indexOf("#");
	if (o !== -1) throw new s(r, "Preprocessor lines (#) are not allowed.", "Remove the # line; write constants as const float name = value; and use plain code instead of #define.", l(a, o));
	let c = p(a);
	h(c, a, r);
	let f = [];
	c.forEach((e, t) => {
		if (e.text !== "for") return;
		let n = {
			...y(c, t, a, r),
			forIndex: t
		};
		x(c, n, a, r), f.push(n);
	});
	let m = w(c, f, a, r);
	if (n.requiredFunction && !n.requiredFunction.pattern.test(a)) throw new s(r, "The entry function is missing.", `Define ${n.requiredFunction.example}.`);
	return {
		source: a,
		loopWork: m
	};
}
function E(e, t) {
	if (typeof e != "number" || !Number.isFinite(Math.fround(e))) throw RangeError(`${t} must be a finite number. Fix: send plain JSON numbers, not strings, NaN or Infinity.`);
	return e;
}
function D(e) {
	return typeof e == "number" ? "float" : Array.isArray(e) ? `vec${e.length}` : null;
}
function O(i, { label: a = "Shader snippet", reservedNames: s = [] } = {}) {
	if (i === void 0) return {};
	if (!i || typeof i != "object" || Array.isArray(i)) throw TypeError(`${a} uniforms must be an object of name: value. Fix: for example { "levels": 4 }.`);
	let l = Object.keys(i);
	if (l.length > e.maxUniforms) throw RangeError(`${a} has ${l.length} uniforms; the limit is ${e.maxUniforms}. Fix: pack values into vec4 uniforms.`);
	let u = {};
	for (let e of l) {
		let l = `${a} uniform "${e}"`;
		if (!t.test(e)) throw RangeError(`${l}: the name must match ${t}. Fix: start with a lowercase letter, then letters and digits, 32 characters at most.`);
		if (o.has(e) || s.includes(e)) throw RangeError(`${l}: the name is a GLSL keyword or an input the engine provides. Fix: pick another name.`);
		let d = i[e], f = d && typeof d == "object" && !Array.isArray(d), p = f ? d.type : D(d), m = f ? d.value : d;
		if (f && c(d, ["type", "value"], l), !n.includes(p)) throw TypeError(`${l}: type must be one of ${n.join(", ")}. Fix: send a number, an array of 2 to 4 numbers, or { "type": "int", "value": 4 }.`);
		if (p === "float") E(m, l);
		else if (p === "int") {
			if (!Number.isInteger(m) || Math.abs(m) > 2 ** 31 - 1) throw RangeError(`${l}: an int value must be a whole number within 32 bits.`);
		} else if (!Array.isArray(m) || m.length !== r[p]) throw RangeError(`${l}: a ${p} value is an array of ${r[p]} numbers.`);
		else m.forEach((e, t) => E(e, `${l}[${t}]`));
		u[e] = {
			type: p,
			value: Array.isArray(m) ? [...m] : m
		};
	}
	return u;
}
function k(e) {
	return Object.keys(e).sort().map((t) => `uniform ${e[t].type} ${t};`).join("\n");
}
function A(e, { headerLines: t, snippet: n }) {
	let r = n.split("\n");
	return String(e).replace(/\0/g, "").trim().split("\n").map((e) => {
		let n = /^(ERROR|WARNING):\s*\d+:(\d+):\s*(.*)$/.exec(e.trim());
		if (!n) return e;
		let i = Number(n[2]), a = i - t;
		return a < 1 || a > r.length ? `${n[1]}: engine wrapper line ${i}: ${n[3]}` : `${n[1]}: snippet line ${a}: ${n[3]}\n    | ${r[a - 1].trim()}`;
	}).join("\n");
}
export { T as a, k as i, A as n, O as o, c as r, e as t };
