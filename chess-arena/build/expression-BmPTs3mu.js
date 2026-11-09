/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { t as e } from "./field-error-DPtscRqU.js";
// src/motion-validation.js
function t(e, t, n) {
	if (!e || Object.getPrototypeOf(e) !== Object.prototype) throw TypeError(`${n} must be a plain object.`);
	for (let r of Reflect.ownKeys(e)) {
		let i = Object.getOwnPropertyDescriptor(e, r);
		if (typeof r != "string" || !t.includes(r) || !i.enumerable || !Object.hasOwn(i, "value")) throw TypeError(`Unknown or unsupported ${n} field: ${String(r)}. Allowed fields: ${t.join(", ")}.`);
	}
}
function n(t, n) {
	if (!Number.isFinite(t) || !Number.isFinite(Math.fround(t))) throw e(n, t, "a finite number that fits Float32, such as 0.5");
	return t;
}
function r(t, r, i, a) {
	if (n(t, a), t < r || t > i) throw e(a, t, `a number from ${r} to ${i}, such as ${r > 0 ? r : Math.min(i, 1)}`);
	return t;
}
function i(e, t, n) {
	if (!Array.isArray(e) || e.length > t || Object.keys(e).length !== e.length || Reflect.ownKeys(e).length !== e.length + 1 || Object.keys(e).some((e, t) => e !== String(t))) throw TypeError(`${n} must be a bounded dense array.`);
	for (let t = 0; t < e.length; t++) if (!Object.hasOwn(Object.getOwnPropertyDescriptor(e, t), "value")) throw TypeError(`${n} cannot contain accessors.`);
	return e;
}
function a(t, r, a) {
	if (r === 1) return n(t, a);
	if (i(t, r, a), t.length !== r) throw e(a, t, `an array of ${r} numbers, such as [${Array(r).fill(0).join(", ")}]`, TypeError);
	return t.map((e) => n(e, a));
}
// src/expression.js
var o = 1e6, s = Object.freeze({
	x: 0,
	y: 1,
	z: 2
}), c = 24, l = Object.freeze([
	"vec",
	"dot",
	"cross",
	"distance",
	"length",
	"normalize",
	"x",
	"y",
	"z"
]), u = /* @__PURE__ */ new Set([
	...l,
	"attr",
	"noise",
	"random"
]), d = /* @__PURE__ */ new Map([
	[1, "one operand"],
	[2, "two operands"],
	[3, "three operands"]
]), f = (e) => ({
	kind: "scalar",
	evaluate: e
}), p = (e) => f(() => e), m = (e, t, n) => ({
	kind: "vector",
	parts: [
		e,
		t,
		n
	]
});
function h(e) {
	return e.kind === "vector" ? e.parts : [
		e.evaluate,
		e.evaluate,
		e.evaluate
	];
}
function g(e) {
	return typeof e == "number" && Number.isFinite(e) && Math.abs(e) <= 1e6;
}
function _(e) {
	if (!e || typeof e != "object" || Array.isArray(e)) return !1;
	let t = Object.getPrototypeOf(e);
	return t === Object.prototype || t === null;
}
function v(e) {
	let t = e.length > c ? `${e.slice(0, c)}...` : e;
	return JSON.stringify(t);
}
function y(e, t) {
	let [n, r, i] = t;
	return t.length === 1 ? (t) => e(n(t)) : t.length === 2 ? (t) => e(n(t), r(t)) : (t) => e(n(t), r(t), i(t));
}
function b(e, t, n) {
	let r = (e) => {
		if (e.every((e) => e.kind === "scalar")) return f(y(n, e.map((e) => e.evaluate)));
		let t = (t) => y(n, e.map((e) => h(e)[t]));
		return m(t(0), t(1), t(2));
	};
	return {
		min: e,
		max: t,
		build: t <= 3 ? r : (e) => e.slice(1).reduce((e, t) => r([e, t]), e[0])
	};
}
function x(e, t) {
	if (e.kind !== "scalar") throw TypeError(`${t} needs a number, not a vector.`);
	return e.evaluate;
}
function S(e) {
	return {
		min: 2,
		max: 2,
		build: ([t, n]) => {
			let r = x(t, "a comparison"), i = x(n, "a comparison");
			return f((t) => +!!e(r(t), i(t)));
		}
	};
}
function C(e) {
	return {
		min: 2,
		max: 8,
		build: (t) => {
			let n = t.map((e) => x(e, "a logic operator"));
			return f((t) => {
				for (let r of n) {
					let n = r(t) !== 0;
					if (e && !n) return 0;
					if (!e && n) return 1;
				}
				return +!!e;
			});
		}
	};
}
function w() {
	return {
		min: 1,
		max: 1,
		build: ([e]) => {
			let t = x(e, "not");
			return f((e) => +(t(e) === 0));
		}
	};
}
function T() {
	return {
		min: 3,
		max: 3,
		build: ([e, t, n]) => {
			let r = x(e, "if"), [i, a, o] = h(t), [s, c, l] = h(n);
			return t.kind === "scalar" && n.kind === "scalar" ? f((e) => r(e) === 0 ? s(e) : i(e)) : m((e) => r(e) === 0 ? s(e) : i(e), (e) => r(e) === 0 ? c(e) : a(e), (e) => r(e) === 0 ? l(e) : o(e));
		}
	};
}
function E(e) {
	return Number.isFinite(e) ? e : 0;
}
function D(e, t, n) {
	if (e === t) return n < e ? 0 : 1;
	let r = Math.min(1, Math.max(0, (n - e) / (t - e)));
	return r * r * (3 - 2 * r);
}
function O() {
	return /* @__PURE__ */ new Map([
		["add", b(2, 8, (e, t) => e + t)],
		["mul", b(2, 8, (e, t) => e * t)],
		["min", b(2, 8, Math.min)],
		["max", b(2, 8, Math.max)],
		["sub", b(2, 2, (e, t) => e - t)],
		["div", b(2, 2, (e, t) => t === 0 ? 0 : e / t)],
		["mod", b(2, 2, (e, t) => t === 0 ? 0 : e - t * Math.floor(e / t))],
		["pow", b(2, 2, (e, t) => E(e ** +t))],
		["atan2", b(2, 2, Math.atan2)],
		["clamp", b(3, 3, (e, t, n) => Math.min(n, Math.max(t, e)))],
		["mix", b(3, 3, (e, t, n) => e + (t - e) * n)],
		["smoothstep", b(3, 3, D)],
		["neg", b(1, 1, (e) => -e)],
		["abs", b(1, 1, Math.abs)],
		["sqrt", b(1, 1, (e) => e < 0 ? 0 : Math.sqrt(e))],
		["sin", b(1, 1, Math.sin)],
		["cos", b(1, 1, Math.cos)],
		["floor", b(1, 1, Math.floor)],
		["ceil", b(1, 1, Math.ceil)],
		["round", b(1, 1, Math.round)],
		["fract", b(1, 1, (e) => e - Math.floor(e))],
		["sign", b(1, 1, Math.sign)],
		["saturate", b(1, 1, (e) => Math.min(1, Math.max(0, e)))],
		["lt", S((e, t) => e < t)],
		["lte", S((e, t) => e <= t)],
		["gt", S((e, t) => e > t)],
		["gte", S((e, t) => e >= t)],
		["eq", S((e, t) => e === t)],
		["and", C(!0)],
		["or", C(!1)],
		["not", w()],
		["if", T()]
	]);
}
function k({ min: e, max: t }) {
	return e === t ? d.get(e) : `${e} to ${t} operands`;
}
function A(e, t, n, r) {
	let { dialect: a } = n, o = a.operators.get(e);
	if (!o) {
		let t = [...a.operators.keys(), ...a.sourceNames];
		throw a.reject(`unknown operator ${v(e)}. Use one of ${t.join(", ")}.`, n);
	}
	let s = o.max === 1 && !(Array.isArray(t) && t.length === 1) ? [t] : t, c = `${e} takes ${k(o)}.`;
	if (!Array.isArray(s) || (i(s, 8, `${e} operands`), s.length < o.min || s.length > o.max)) throw a.reject(c, n);
	return o.build(s.map((e) => M(e, n, r + 1)));
}
function j(e) {
	return e === "time" || _(e) && Object.hasOwn(e, "node") ? "motion" : Array.isArray(e) || _(e) && (Object.hasOwn(e, "attr") || u.has(Object.keys(e)[0])) ? "field" : null;
}
function M(e, t, n) {
	let { dialect: r } = t;
	if (t.nodeCount += 1, t.nodeCount > r.maxNodes) throw r.reject(`more than ${r.maxNodes} nodes.`, t);
	if (n > r.maxDepth) throw r.reject(`nests deeper than ${r.maxDepth} levels.`, t);
	if (typeof e == "number") {
		if (!g(e)) throw r.reject(`a number must be finite and within ${o}.`, t);
		return p(e);
	}
	if (typeof e == "boolean") return p(+!!e);
	let i = r.compileInput(e, t, n);
	if (i) return i;
	let a = j(e);
	if (a && a !== r.name) throw r.reject(`this is a ${a} input and a ${r.name} expression cannot use it. A ${r.name} expression takes ${r.accepts}.`, t);
	if (!_(e)) throw r.reject(`use ${r.accepts}.`, t);
	let s = Object.keys(e);
	if (s.length !== 1) throw r.reject(`an operator object has exactly one key, such as {"add": [1, 2]}; got ${s.length}.`, t);
	return A(s[0], e[s[0]], t, n);
}
export { a as _, v as a, b as c, f as d, m as f, t as g, n as h, O as i, h as l, i as m, M as n, g as o, r as p, p as r, _ as s, s as t, x as u };
