/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { n as e, r as t } from "./animation-IxY9GETP.js";
// src/camera-path.js
function n(e, t, n) {
	return n && typeof n == "object" && !Array.isArray(n) && !ArrayBuffer.isView(n) ? {
		...n,
		target: e,
		property: t
	} : {
		target: e,
		property: t,
		keyframes: [{
			time: 0,
			value: n
		}]
	};
}
function r(e, t) {
	if (!Array.isArray(e) && !ArrayBuffer.isView(e) || e.length !== 3) throw TypeError(`${t} must contain three finite components.`);
	for (let n of e) if (!Number.isFinite(n)) throw RangeError(`${t} must contain three finite components.`);
}
function i(e, t, n) {
	r(e, "Camera eye"), r(t, "Camera target"), r(n, "Camera up");
	let i = t[0] - e[0], a = t[1] - e[1], o = t[2] - e[2], s = Math.hypot(i, a, o), c = Math.hypot(...n);
	if (!Number.isFinite(s) || s <= 1e-8 || !Number.isFinite(c) || c <= 1e-8) throw RangeError("Camera eye and target must be distinct, with a nonzero up vector.");
	let l = Math.abs(i / s * (n[0] / c) + a / s * (n[1] / c) + o / s * (n[2] / c));
	if (!Number.isFinite(l) || l >= 1 - 1e-10) throw RangeError("Camera up must not be parallel to the viewing direction.");
}
function a(e, t, n) {
	if (!Number.isFinite(e) || e <= 0 || e >= 180) throw RangeError("Camera field of view must be between 0 and 180 degrees.");
	if (!Number.isFinite(t) || !Number.isFinite(n) || t <= 0 || n <= t) throw RangeError("Camera clipping planes must satisfy 0 < near < far.");
}
function o(e, t) {
	let n = Object.getOwnPropertyDescriptor(e, t), r = n, i = Object.getPrototypeOf(e);
	for (; !r && i !== null;) r = Object.getOwnPropertyDescriptor(i, t), i = Object.getPrototypeOf(i);
	if (r && (!("value" in r) || !r.writable) || !n && !Object.isExtensible(e)) throw TypeError("Camera output fields must be writable data properties.");
}
function s(e, t) {
	if (!Array.isArray(t) && !ArrayBuffer.isView(t) || t.length !== 16 || !Array.from(t).every(Number.isFinite)) throw TypeError("Tracking requires a finite affine target matrix.");
	if (t[3] !== 0 || t[7] !== 0 || t[11] !== 0 || t[15] !== 1) throw RangeError("Tracking requires an affine target matrix.");
	let n = e[0], r = e[1], i = e[2];
	for (let a = 0; a < 3; a++) e[a] = t[a] * n + t[a + 4] * r + t[a + 8] * i + t[a + 12];
}
function c(e, { sensorHeight: t = 24 } = {}) {
	if (!Number.isFinite(e) || e <= 0 || !Number.isFinite(t) || t <= 0) throw RangeError("Focal length and sensor height must be positive and finite.");
	let n = 2 * Math.atan(t / e / 2) * 180 / Math.PI;
	return a(n, .1, 100), n;
}
function l({ duration: c, loop: l = !1, eye: u, target: d = [
	0,
	0,
	0
], fov: f = 45, roll: p = 0, up: m = [
	0,
	1,
	0
], near: h = .1, far: g = 100 } = {}) {
	if (r(m, "Camera up"), a(45, h, g), Math.hypot(...m) <= 1e-8) throw RangeError("Camera up must be nonzero.");
	let _ = Object.freeze(Array.from(m)), v = Math.hypot(..._), y = _.map((e) => e / v), b = t({
		duration: c,
		loop: l,
		tracks: [
			n("eye", "translation", u),
			n("target", "translation", d),
			n("fov", "value", f),
			n("roll", "value", p)
		]
	});
	for (let e of b.tracks[2].keyframes) a(e.value, h, g);
	let x = e(b), S = /* @__PURE__ */ new Float64Array(3), C = /* @__PURE__ */ new Float64Array(3), w = /* @__PURE__ */ new Float64Array(3), T = /* @__PURE__ */ new Float64Array(3);
	function E(e, t = {
		eye: [
			0,
			0,
			0
		],
		target: [
			0,
			0,
			0
		],
		up: [
			0,
			0,
			0
		]
	}, { targetMatrix: n } = {}) {
		let r = [
			t.eye,
			t.target,
			t.up
		];
		for (let e of r) {
			if (!(Array.isArray(e) || e instanceof Float32Array || e instanceof Float64Array) || e.length !== 3) throw TypeError("Camera output needs writable three-component eye, target and up arrays.");
			if (Object.isFrozen(e)) throw TypeError("Camera output arrays must be writable.");
			if (Array.isArray(e)) for (let t = 0; t < 3; t++) o(e, t);
		}
		if (new Set(r).size !== 3 || Object.isFrozen(t)) throw TypeError("Camera output must be writable and its vectors must be distinct.");
		for (let e = 0; e < r.length; e++) for (let t = e + 1; t < r.length; t++) {
			let n = r[e], i = r[t];
			if (ArrayBuffer.isView(n) && ArrayBuffer.isView(i) && n.buffer === i.buffer && n.byteOffset < i.byteOffset + i.byteLength && i.byteOffset < n.byteOffset + n.byteLength) throw TypeError("Camera output vectors must not overlap in memory.");
		}
		for (let e of [
			"fov",
			"near",
			"far",
			"projection"
		]) o(t, e);
		let c = x.sample(e);
		S.set(c[0].output), C.set(c[1].output), n !== void 0 && s(C, n), i(S, C, _);
		let l = c[2].output[0];
		a(l, h, g);
		let u = c[3].output[0], d = Math.hypot(C[0] - S[0], C[1] - S[1], C[2] - S[2]);
		for (let e = 0; e < 3; e++) T[e] = (C[e] - S[e]) / d;
		let f = Math.cos(u), p = Math.sin(u), m = T[0] * y[0] + T[1] * y[1] + T[2] * y[2];
		for (let e = 0; e < 3; e++) {
			let t = (e + 1) % 3, n = (e + 2) % 3, r = T[t] * y[n] - T[n] * y[t];
			w[e] = y[e] * f + r * p + T[e] * m * (1 - f);
		}
		let v = [
			S,
			C,
			w
		];
		for (let e = 0; e < r.length; e++) if (r[e] instanceof Float32Array) for (let t = 0; t < 3; t++) v[e][t] = Math.fround(v[e][t]);
		i(S, C, w);
		for (let e = 0; e < r.length; e++) for (let t = 0; t < 3; t++) r[e][t] = v[e][t];
		return t.fov = l, t.near = h, t.far = g, t.projection = "perspective", t;
	}
	return E(0), Object.freeze({
		duration: b.duration,
		loop: b.loop,
		clip: b,
		sample: E
	});
}
export { c as n, l as t };
