/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { t as e } from "./rolldown-runtime-CvuOiBwx.js";
// src/path-tracer-denoise.js
var t = /* @__PURE__ */ e({ denoiseRadiance: () => f }), n = [
	1,
	2,
	4,
	8,
	16
], r = [
	1 / 16,
	1 / 4,
	3 / 8,
	1 / 4,
	1 / 16
], i = 64, a = 3, o = .02;
function s(e, t) {
	return .2126 * e[t * 3] + .7152 * e[t * 3 + 1] + .0722 * e[t * 3 + 2];
}
function c(e, t, n) {
	let r = new Float32Array(e.length);
	for (let i = 0; i < n; i++) for (let n = 0; n < 3; n++) r[i * 3 + n] = e[i * 3 + n] / Math.max(t[i * 3 + n], o);
	return r;
}
function l(e, t, n, r) {
	let i = new Float32Array(n * r);
	for (let n = 0; n < i.length; n++) {
		let r = Math.max(s(t, n), o);
		i[n] = e[n] / (r * r);
	}
	let a = new Float32Array(i.length);
	for (let e = 0; e < r; e++) for (let t = 0; t < n; t++) {
		let o = 0, s = 0;
		for (let a = -1; a <= 1; a++) for (let c = -1; c <= 1; c++) {
			let l = e + a, u = t + c;
			l < 0 || l >= r || u < 0 || u >= n || (o += i[l * n + u], s++);
		}
		a[e * n + t] = o / s;
	}
	return a;
}
function u(e, t, n, r, i) {
	let a = e[r * t + Math.max(i - 1, 0)], o = e[r * t + Math.min(i + 1, t - 1)], s = e[Math.max(r - 1, 0) * t + i], c = e[Math.min(r + 1, n - 1) * t + i];
	return [(o - a) / 2, (c - s) / 2];
}
function d({ width: e, height: t, light: n, variance: o, normal: c, depth: l }, d, f, p) {
	for (let m = 0; m < t; m++) for (let h = 0; h < e; h++) {
		let g = m * e + h, _ = s(n, g), [v, y] = u(l, e, t, m, h), b = a * Math.sqrt(Math.max(o[g], 0)) + 1e-4, x = 0, S = 0, C = 0, w = 0, T = 0, E = 0;
		for (let a = -2; a <= 2; a++) {
			let u = m + a * d;
			if (!(u < 0 || u >= t)) for (let t = -2; t <= 2; t++) {
				let f = h + t * d;
				if (f < 0 || f >= e) continue;
				let p = u * e + f, m = Math.max(0, c[g * 3] * c[p * 3] + c[g * 3 + 1] * c[p * 3 + 1] + c[g * 3 + 2] * c[p * 3 + 2]), D = Math.abs(v * t * d) + Math.abs(y * a * d) + .001 * Math.abs(l[g]) + 1e-5, O = Math.exp(-Math.abs(l[g] - l[p]) / D), k = Math.exp(-Math.abs(_ - s(n, p)) / b), A = r[a + 2] * r[t + 2] * m ** i * O * k;
				x += A, S += A * A, C += A * A * o[p], w += A * n[p * 3], T += A * n[p * 3 + 1], E += A * n[p * 3 + 2];
			}
		}
		f[g * 3] = w / x, f[g * 3 + 1] = T / x, f[g * 3 + 2] = E / x, p[g] = C / (x * x);
	}
}
function f({ width: e, height: t, color: r, albedo: i, normal: a, depth: s, variance: u }) {
	let f = e * t, p = c(r, i, f), m = l(u, i, e, t), h = new Float32Array(p.length), g = new Float32Array(m.length);
	for (let r of n) d({
		width: e,
		height: t,
		light: p,
		variance: m,
		normal: a,
		depth: s
	}, r, h, g), [p, h] = [h, p], [m, g] = [g, m];
	let _ = new Float32Array(r.length);
	for (let e = 0; e < f; e++) for (let t = 0; t < 3; t++) _[e * 3 + t] = p[e * 3 + t] * Math.max(i[e * 3 + t], o);
	return _;
}
export { t as n, f as t };
