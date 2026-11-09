/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { _ as e, g as t, m as n, n as r } from "./mat4-BCZClxna.js";
import { a as i, c as a, h as o, o as s, p as c, x as l, y as u } from "./vec3-BRYC6f_g.js";
// src/camera.js
var d = Object.freeze([
	"projection",
	"orthoScale",
	"focalLength",
	"sensorWidth",
	"shift",
	"fStop"
]);
function f(e) {
	if (!Array.isArray(e) || e.length !== 2 || !e.every((e) => Number.isFinite(e) && Math.abs(e) <= 1)) throw RangeError("Camera shift must be [x, y], each between -1 and 1 as a fraction of the frame.");
}
function p(n, r, i, { world: a = !1 } = {}) {
	if (!Number.isFinite(i) || i <= 0) throw RangeError("Camera aspect must be positive and finite");
	let o = r.projection !== void 0 || r.fov !== void 0 || r.focalLength !== void 0, s = r.near !== void 0 || r.far !== void 0;
	if (!o && !s) return n;
	let c = r.near ?? .1, l = r.far ?? (a ? 600 : 100);
	if (!Number.isFinite(c) || !Number.isFinite(l) || c <= 0 || l <= c) throw RangeError("Camera clipping planes must satisfy 0 < near < far");
	if (!o) {
		let t = 2 * Math.atan(1 / n[5]), r = n[8];
		return e(n, t, i, c, l), n[8] = r, n;
	}
	if (r.shift !== void 0 && f(r.shift), r.projection === "orthographic") {
		let e = r.orthographicHeight ?? r.orthoScale ?? 4;
		if (!Number.isFinite(e) || e <= 0) throw RangeError("Orthographic height must be positive and finite");
		let a = e / 2;
		return t(n, -a * i, a * i, -a, a, c, l), r.shift && (n[12] -= 2 * r.shift[0], n[13] -= 2 * r.shift[1]), n;
	}
	if (r.projection && r.projection !== "perspective") throw RangeError(`Unsupported camera projection: ${r.projection}`);
	return e(n, m(r, i) * Math.PI / 180, i, c, l), r.shift && (n[8] += 2 * r.shift[0], n[9] += 2 * r.shift[1]), n;
}
function m(e, t) {
	if (e.focalLength !== void 0) {
		let { focalLength: n, sensorWidth: r = 36 } = e;
		if (!Number.isFinite(n) || n <= 0 || !Number.isFinite(r) || r <= 0) throw RangeError("Focal length and sensor width must be positive and finite");
		return 2 * Math.atan(r / t / n / 2) * 180 / Math.PI;
	}
	let n = e.fov ?? 45;
	if (!Number.isFinite(n) || n <= 0 || n >= 180) throw RangeError("Camera field of view must be between 0 and 180 degrees");
	return n;
}
var h = {
	front: [
		0,
		0,
		1
	],
	right: [
		1,
		0,
		0
	],
	top: [
		0,
		1,
		0
	],
	perspective: [
		.58,
		.34,
		.74
	]
};
function g(e = "front", { target: t = [
	0,
	1.5,
	0
], height: n = 3.8, distance: r = 8 } = {}) {
	let a = h[e];
	if (!a) throw RangeError(`Unsupported camera view: ${e}`);
	if (!Number.isFinite(n) || n <= 0) throw RangeError("Orthographic height must be positive and finite");
	if (t.length !== 3 || !t.every(Number.isFinite) || !Number.isFinite(r) || r <= 0) throw RangeError("Camera target and positive distance must be finite");
	let s = c(i(), a);
	return {
		eye: Array.from(o(i(), t, s, r)),
		target: [...t],
		up: e === "top" ? [
			0,
			0,
			-1
		] : [
			0,
			1,
			0
		],
		projection: e === "perspective" ? "perspective" : "orthographic",
		orthographicHeight: n,
		fov: 45
	};
}
function _(e, t, a, o = 1.15) {
	if (!Number.isFinite(a) || a <= 0 || !Number.isFinite(o) || o < 1) throw RangeError("Fit aspect must be positive and padding at least one");
	if (e.minimum.length !== 3 || e.maximum.length !== 3 || !e.minimum.every(Number.isFinite) || !e.maximum.every((t, n) => Number.isFinite(t) && t >= e.minimum[n])) throw RangeError("Fit bounds must be finite and ordered");
	let s = n(r(), t.eye, t.target, t.up ?? [
		0,
		1,
		0
	]), c = [Infinity, Infinity], u = [-Infinity, -Infinity];
	for (let t = 0; t < 8; t++) {
		let n = [
			0,
			1,
			2
		].map((n) => t & 1 << n ? e.maximum[n] : e.minimum[n]), r = l(i(), n, s);
		for (let e = 0; e < 2; e++) c[e] = Math.min(c[e], r[e]), u[e] = Math.max(u[e], r[e]);
	}
	return Math.max(u[1] - c[1], (u[0] - c[0]) / a) * o;
}
function v(e, t, n, r = 1.15) {
	if (!Number.isFinite(n) || n <= 0 || !Number.isFinite(r) || r < 1) throw RangeError("Fit aspect must be positive and padding at least one");
	let i = (e) => e?.length === 3 && Array.from(e).every((e) => typeof e == "number" && Number.isFinite(e));
	if (!i(e?.minimum) || !i(e?.maximum) || !e.maximum.every((t, n) => t >= e.minimum[n])) throw RangeError("Fit bounds must be finite and ordered");
	let o = t?.up ?? [
		0,
		1,
		0
	];
	if (!i(t?.eye) || !i(t?.target) || !i(o)) throw RangeError("Fit camera vectors must be finite");
	if (t.projection && t.projection !== "perspective") throw RangeError("Perspective fit requires a perspective camera");
	let c = t.fov ?? 45, l = t.near ?? .1, d = t.far ?? 100;
	if (!Number.isFinite(c) || c <= 0 || c >= 180 || !Number.isFinite(l) || !Number.isFinite(d) || l <= 0 || d <= l) throw RangeError("Fit lens must have 0 < fov < 180 and 0 < near < far");
	let f = u([], t.target, t.eye), p = Math.hypot(...f);
	if (!Number.isFinite(p) || p === 0) throw RangeError("Fit eye and target must differ");
	for (let e = 0; e < 3; e++) f[e] /= p;
	let m = Math.hypot(...o);
	if (!Number.isFinite(m) || m === 0) throw RangeError("Fit up must have a finite nonzero length");
	let h = Array.from(o, (e) => e / m), g = s([], f, h), _ = Math.hypot(...g);
	if (!Number.isFinite(_) || _ === 0) throw RangeError("Fit up must not be parallel to the view direction");
	for (let e = 0; e < 3; e++) g[e] /= _;
	let v = s([], g, f), y = Math.tan(c * Math.PI / 360), b = y * n;
	if (!Number.isFinite(b) || b <= 0) throw RangeError("Fit aspect and lens exceed the supported numeric range");
	let x = l, S = -Infinity;
	for (let n = 0; n < 8; n++) {
		let i = [
			0,
			1,
			2
		].map((r) => (n & 1 << r ? e.maximum[r] : e.minimum[r]) - t.target[r]), o = a(i, g), s = a(i, v), c = a(i, f);
		x = Math.max(x, Math.abs(o) * r / b - c, Math.abs(s) * r / y - c, l - c), S = Math.max(S, c);
	}
	if (!Number.isFinite(x) || x <= 0 || x + S > d) throw RangeError("Fit bounds cannot fit within the camera clipping planes");
	let C = t.target.map((e, t) => Math.fround(e - f[t] * x)), w = t.target.map((e) => Math.fround(e));
	if (!C.every(Number.isFinite) || !w.every(Number.isFinite) || C.every((e, t) => e === w[t])) throw RangeError("Fit camera collapses or overflows after Float32 rounding; use coordinates closer to the origin");
	return x;
}
export { _ as a, g as i, p as n, v as o, m as r, f as s, d as t };
