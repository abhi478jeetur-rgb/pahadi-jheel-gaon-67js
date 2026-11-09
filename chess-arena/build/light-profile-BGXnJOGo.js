/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { a as e } from "./shader-registry-DHYkwAg5.js";
// src/light-profile.js
var t = 16, n = 32, r = {
	"wide-flood": 1.5,
	downlight: 6,
	"narrow-spot": 30
}, i = Object.freeze([...Object.keys(r), "batwing"]);
function a(e, t) {
	let n = t * Math.PI / 180;
	return e === "batwing" ? .35 + .65 * Math.sin(2 * n) ** 2 : Math.cos(n) ** r[e];
}
function o(e) {
	let t = [];
	for (let e = 0; e <= 9; e++) t.push(e * 10);
	return {
		angles: t,
		candela: t.map((t) => a(e, t))
	};
}
function s(e, t = "ies") {
	if (typeof e == "string") {
		if (!i.includes(e)) throw RangeError(`${t} must be one of ${i.join(", ")} or { angles, candela }.`);
		return e;
	}
	if (!e || typeof e != "object" || Array.isArray(e)) throw TypeError(`${t} must be a profile name or { angles, candela }.`);
	let { angles: r, candela: a } = e;
	if (!Array.isArray(r) || !Array.isArray(a) || r.length !== a.length || r.length < 2 || r.length > n) throw RangeError(`${t} angles and candela must be arrays of the same length, from 2 to ${n}.`);
	if (r.forEach((e, n) => {
		if (typeof e != "number" || !Number.isFinite(e) || e < 0 || e > 180 || n > 0 && e <= r[n - 1]) throw RangeError(`${t} angles must be degrees from 0 to 180, strictly rising.`);
	}), a.forEach((e) => {
		if (typeof e != "number" || !Number.isFinite(e) || e < 0 || e > 1e7) throw RangeError(`${t} candela must be numbers from 0 to 10000000.`);
	}), !a.some((e) => e > 0)) throw RangeError(`${t} candela needs a value above zero.`);
	return {
		angles: [...r],
		candela: [...a]
	};
}
function c(e, t) {
	let { angles: n, candela: r } = e;
	if (t <= n[0]) return r[0];
	for (let e = 1; e < n.length; e++) if (t <= n[e]) {
		let i = (t - n[e - 1]) / (n[e] - n[e - 1]);
		return r[e - 1] + (r[e] - r[e - 1]) * i;
	}
	return 0;
}
var l = /* @__PURE__ */ new Map();
function u(e) {
	let t = typeof e == "string" ? e : JSON.stringify(e), n = l.get(t);
	if (n) return n;
	let r = typeof e == "string" ? o(e) : e, i = c(r, 0) > 0 ? c(r, 0) : Math.max(...r.candela), a = /* @__PURE__ */ new Float32Array(16);
	for (let e = 0; e < 16; e++) a[e] = c(r, e / 15 * 90) / i;
	return l.size > 64 && l.clear(), l.set(t, a), a;
}
function d(e, t) {
	if (t <= 0) return 0;
	let n = Math.acos(Math.min(t, 1)) / (Math.PI / 2) * 15, r = Math.floor(n), i = Math.min(r + 1, 15);
	return e[r] + (e[i] - e[r]) * (n - r);
}
e.profile = (e) => Array.from(u(s(e, "ies")));
export { s as a, u as i, t as n, d as r, i as t };
