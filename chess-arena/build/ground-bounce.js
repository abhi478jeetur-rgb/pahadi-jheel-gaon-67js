/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { a as e, n as t, r as n } from "./environment-H0LjiCAj.js";
import { r } from "./closed-room-CB0A9B5C.js";
import { o as i } from "./probe-trace-ALKeQrQp.js";
// src/ground-bounce.js
var a = .9, o = .25, s = .001, c = .5, l = 2.2, u = /* @__PURE__ */ new Set([
	"liquid",
	"foam",
	"unlit",
	"fire",
	"smoke",
	"floor"
]);
function d(e) {
	let t = [
		Infinity,
		Infinity,
		Infinity
	], n = [
		-Infinity,
		-Infinity,
		-Infinity
	];
	for (let r of e) for (let e = 0; e < 3; e++) t[e] = Math.min(t[e], r.minimum[e]), n[e] = Math.max(n[e], r.maximum[e]);
	return {
		minimum: t,
		maximum: n
	};
}
var f = /* @__PURE__ */ new WeakMap();
function p(e) {
	let t = e.image;
	if (!t?.data || !(t.width > 0) || t.data.length < t.width * t.height * 4) return null;
	if (!f.has(t)) {
		let n = e.colorSpace === "linear" ? 1 : l, r = [
			0,
			0,
			0
		], i = t.width * t.height;
		for (let e = 0; e < i; e++) for (let i = 0; i < 3; i++) r[i] += (t.data[e * 4 + i] / 255) ** n;
		f.set(t, r.map((e) => e / i));
	}
	return f.get(t);
}
function m(e) {
	if (e.graph || ["blend", "add"].includes(e.alphaMode) || e.transmission > 0 || u.has(e.tag) || !Array.isArray(e.color) || (e.metallic ?? 0) > c) return null;
	let t = e.map ? p(e.map) : [
		1,
		1,
		1
	];
	return t ? e.color.slice(0, 3).map((n, r) => n * t[r] * (1 - (e.metallic ?? 0))) : null;
}
function h(e) {
	if (e.length < 2) return null;
	let t = e.map((e) => i(e)), n = d(t), r = n.maximum[0] - n.minimum[0], c = n.maximum[2] - n.minimum[2];
	for (let [i, l] of t.entries()) {
		let t = l.maximum[0] - l.minimum[0], u = l.maximum[2] - l.minimum[2], d = l.maximum[1] - l.minimum[1], f = t >= a * r && u >= a * c, p = d <= o * Math.max(t, u), h = l.minimum[1] <= n.minimum[1] + s;
		if (f && p && h) {
			let t = m(e[i].material);
			return t ? { albedo: t } : null;
		}
	}
	return null;
}
function g(r, { albedo: i, keyColor: a = [
	0,
	0,
	0
], lightDirection: o = [
	0,
	1,
	0
] }) {
	let { width: s, height: c, channels: l, data: u, intensity: d } = r, f = Math.hypot(...o), p = Math.max(o[1] / f, 0), m = e(t(r), [
		0,
		1,
		0
	]), h = i.map((e, t) => e * ((d > 0 ? a[t] * p / (Math.PI * d) : 0) + m[t])), g = new Float32Array(u);
	for (let e = Math.ceil(c / 2); e < c; e++) for (let t = 0; t < s; t++) {
		let n = (e * s + t) * l;
		for (let e = 0; e < 3; e++) g[n + e] = h[e];
	}
	return Object.freeze({
		...r,
		irradianceSource: n({
			...r,
			data: g
		})
	});
}
var _ = /* @__PURE__ */ new WeakMap();
function v(e) {
	return e.some((e) => e.material?.lightMap || e.material?.irradianceGrid);
}
function y(e) {
	let t = r(e, new Map(e.map((e) => [e.name, e.matrix])));
	return t !== null && t >= .9;
}
var b = /* @__PURE__ */ new WeakMap();
function x(e, t) {
	let n = JSON.stringify([e.length, t]), r = b.get(e);
	if (r?.key === n) return r.ground;
	let i = v(e) ? null : h(e) ?? (t && { albedo: t }), a = i && !y(e) ? i : null;
	return b.set(e, {
		key: n,
		ground: a
	}), a;
}
var S = .5, C = .95, w = 4 * Math.PI, T = .8, E = .001;
function D(e, t, n, r) {
	for (let i = 0; i < 3; i++) r[i] = e[i] * t[n * 3] + e[4 + i] * t[n * 3 + 1] + e[8 + i] * t[n * 3 + 2] + e[12 + i];
	return r;
}
function O(e, t) {
	let { positions: n, indices: r } = e.geometry, i = [
		0,
		0,
		0
	], a = [
		0,
		0,
		0
	], o = [
		0,
		0,
		0
	], s = 0;
	for (let c = 0; c < r.length; c += 3) {
		D(e.matrix, n, r[c], i), D(e.matrix, n, r[c + 1], a), D(e.matrix, n, r[c + 2], o);
		let l = (a[1] - i[1]) * (o[2] - i[2]) - (a[2] - i[2]) * (o[1] - i[1]), u = (a[2] - i[2]) * (o[0] - i[0]) - (a[0] - i[0]) * (o[2] - i[2]), d = (a[0] - i[0]) * (o[1] - i[1]) - (a[1] - i[1]) * (o[0] - i[0]);
		l * (t[0] - i[0]) + u * (t[1] - i[1]) + d * (t[2] - i[2]) > 0 && (s += .5 * Math.hypot(l, u, d));
	}
	return s;
}
function k(e) {
	return m(e) || ((e.metallic ?? 0) > c ? [
		0,
		0,
		0
	] : [
		S,
		S,
		S
	]);
}
function A(e) {
	if (e.length === 0 || v(e) || !y(e)) return null;
	let { minimum: t, maximum: n } = d(e.map((e) => i(e))), r = t.map((e, t) => (e + n[t]) / 2), a = 0, o = [
		0,
		0,
		0
	];
	for (let t of e) {
		if (["blend", "add"].includes(t.material?.alphaMode)) continue;
		let e = O(t, r), n = k(t.material ?? {});
		a += e;
		for (let t = 0; t < 3; t++) o[t] += e * n[t];
	}
	return a > 0 ? {
		minimum: t,
		maximum: n,
		area: a,
		albedo: o.map((e) => e / a)
	} : null;
}
function j(e, { minimum: t, maximum: n }) {
	return e.every((e, r) => e >= t[r] && e <= n[r]);
}
function M(e, t) {
	let n = [
		0,
		0,
		0
	], r = (e, r) => {
		if (!j(e.position, t)) return;
		let i = e.color ?? [
			1,
			1,
			1
		];
		for (let t = 0; t < 3; t++) n[t] += i[t] * (e.intensity ?? 1) * r;
	};
	for (let t of e.pointLights ?? []) r(t, w);
	for (let t of e.spotLights ?? []) r(t, 2 * Math.PI * (1 - Math.cos(t.angle ?? Math.PI / 4)));
	for (let t of e.areaLights ?? []) r(t, Math.PI);
	return n;
}
function N(e, t) {
	return M(t, e).map((t, n) => {
		let r = Math.min(e.albedo[n], C);
		return t / Math.PI * T * r / (e.area * (1 - r));
	});
}
function P(e) {
	let t = e.keyColor;
	return !t || (e.keyIntensity ?? 1) * (t[0] + t[1] + t[2]) > E;
}
var F = /* @__PURE__ */ new WeakMap();
function I(e) {
	let t = F.get(e);
	if (t?.length === e.length) return t.room;
	let n = A(e);
	return F.set(e, {
		length: e.length,
		room: n
	}), n;
}
var L = null;
function R(e) {
	L?.length !== e.length && (L = new Float32Array(e.length)), L.set(e);
	for (let e = 0; e < 3; e++) L[e] += this.bounce[e] / Math.max(this.intensity, 1e-6);
	return L;
}
function z(e, t) {
	return {
		...e,
		bounce: t,
		irradianceWithBounce: R
	};
}
function B(e, t) {
	if (t.roomBounce === !1 || P(t)) return t;
	let n = I(e);
	if (!n) return t;
	let r = N(n, t);
	return r.some((e) => e > 0) ? {
		...t,
		map: z(t.map, r)
	} : t;
}
function V(e) {
	return [
		e.pointLights,
		e.spotLights,
		e.areaLights
	].some((e) => e?.length > 0);
}
var H = .4, U = .2, W = /* @__PURE__ */ new WeakMap();
function G(e) {
	let t = W.get(e);
	if (t?.length === e.length) return t.openAir;
	let n = !v(e) && !y(e);
	return W.set(e, {
		length: e.length,
		openAir: n
	}), n;
}
function K(e, t, n) {
	if (t.outdoorFill === !1 || !t.keyColor || !P(t) || !G(e)) return null;
	let { lightDirection: r } = t, i = Math.hypot(...r), a = Math.max(r[1] / i, 0), o = Math.hypot(r[0], r[2]) / i, s = Math.max(o - a, 0) ** 2;
	return s === 0 ? null : (n?.albedo ?? [
		0,
		0,
		0
	]).map((e) => Math.max(e, U)).map((e, n) => H * e * t.keyColor[n] * (t.keyIntensity ?? 1) * s / Math.PI);
}
function q(e, t, { automaticAlbedo: n = null } = {}) {
	if (!t.map) return t;
	if (V(t)) return B(e, t);
	if (t.groundBounce === !1) return t;
	let r = x(e, n), i = K(e, t, r);
	if (!r) return i ? {
		...t,
		map: z(t.map, i)
	} : t;
	let { lightDirection: a } = t, o = t.keyColor.map((e) => e * (t.keyIntensity ?? 1)), s = JSON.stringify([
		r.albedo,
		o,
		a,
		i
	]), c = _.get(t.map) ?? /* @__PURE__ */ new Map();
	if (_.set(t.map, c), !c.has(s)) {
		let e = g(t.map, {
			albedo: r.albedo,
			keyColor: o,
			lightDirection: a
		});
		c.set(s, i ? z(e, i) : e);
	}
	return {
		...t,
		map: c.get(s)
	};
}
export { h as findGroundSurface, A as findRoomSurface, q as groundBounceEnvironment, k as partDiffuseAlbedo, N as roomBounceRadiance, g as withGroundBounce };
