/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
// src/material-texture-kit.js
function e(e, t, n) {
	let r = Math.imul(e, 668265261) ^ Math.imul(t, 374761393) ^ Math.imul(n, 2654435761);
	return r = Math.imul(r ^ r >>> 15, 2246822507), r = Math.imul(r ^ r >>> 13, 3266489909), (r ^ r >>> 16) >>> 0;
}
var t = (e, t) => (e % t + t) % t, n = (e) => e * e * e * (e * (e * 6 - 15) + 10), r = (e) => Math.min(1, Math.max(0, e)), i = (e, t, n) => {
	let i = r((n - e) / (t - e));
	return i * i * (3 - 2 * i);
};
function a(t, n, r, i, a) {
	let o = e(t, n, a) / 4294967296 * Math.PI * 2;
	return Math.cos(o) * r + Math.sin(o) * i;
}
function o(e, r, i, o, s = 0) {
	let c = e * i, l = r * o, u = Math.floor(c), d = Math.floor(l), f = c - u, p = l - d, m = t(u, i), h = t(u + 1, i), g = t(d, o), _ = t(d + 1, o), v = n(f), y = n(p), b = a(m, g, f, p, s) * (1 - v) + a(h, g, f - 1, p, s) * v, x = a(m, _, f, p - 1, s) * (1 - v) + a(h, _, f - 1, p - 1, s) * v;
	return (b * (1 - y) + x * y) * 1.5;
}
function s(e, t, n, r, i = 0, a = 5, s = .5) {
	let c = 0, l = 1, u = 0;
	for (let d = 0; d < a; d++) c += o(e, t, n << d, r << d, i + d * 131) * l, u += l, l *= s;
	return c / u;
}
function c(e, t, n, r, i = 0, a = 4) {
	let s = 0, c = 1, l = 0;
	for (let u = 0; u < a; u++) {
		let a = 1 - Math.abs(o(e, t, n << u, r << u, i + u * 211));
		s += a * a * c, l += c, c *= .5;
	}
	return s / l;
}
function l(n, r, i, a = 0) {
	let o = n * i, s = r * i, c = Math.floor(o), l = Math.floor(s), u = Infinity, d = Infinity, f = 0;
	for (let n = -1; n <= 1; n++) for (let r = -1; r <= 1; r++) {
		let p = c + r, m = l + n, h = e(t(p, i), t(m, i), a), g = p + (h & 65535) / 65536, _ = m + (h >>> 16) / 65536, v = Math.hypot(g - o, _ - s);
		v < u ? (d = u, u = v, f = h) : v < d && (d = v);
	}
	return {
		nearest: u,
		second: d,
		cell: f
	};
}
function u(e) {
	let t = e <= .0031308 ? e * 12.92 : 1.055 * e ** (1 / 2.4) - .055;
	return Math.round(r(t) * 255);
}
function d(e, t, n) {
	return typeof ImageData == "function" ? new ImageData(e, t, n) : {
		width: t,
		height: n,
		data: e
	};
}
function f(e, t, n) {
	let r = new Uint8ClampedArray(e * e * 4);
	for (let i = 0; i < e; i++) for (let a = 0; a < e; a++) {
		let o = t(a, i), s = n(a, i), c = Math.hypot(o, s, 1), l = (i * e + a) * 4;
		r[l] = Math.round((-o / c * .5 + .5) * 255), r[l + 1] = Math.round((-s / c * .5 + .5) * 255), r[l + 2] = Math.round((1 / c * .5 + .5) * 255), r[l + 3] = 255;
	}
	return r;
}
function p(e, t, n) {
	let r = n * t / 64, i = (n, r) => e[(r + t) % t * t + (n + t) % t];
	return f(t, (e, t) => (i(e + 1, t) - i(e - 1, t)) * r, (e, t) => (i(e, t + 1) - i(e, t - 1)) * r);
}
function m(e, t, n) {
	let r = .5 / t, i = n * t / 32, a = (n, r, a, o) => {
		let s = (n + .5) / t, c = (r + .5) / t;
		return (e(s + a, c + o) - e(s - a, c - o)) * i;
	};
	return f(t, (e, t) => a(e, t, r, 0), (e, t) => a(e, t, 0, r));
}
export { o as a, m as c, i as d, t as f, s as i, p as l, r as n, e as o, d as r, u as s, l as t, c as u };
