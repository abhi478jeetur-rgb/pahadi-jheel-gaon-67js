/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
// src/triangle-math.js
var e = 1e-12;
function t(e, t, n, r) {
	for (let i = 0; i < 3; i++) {
		let a = t[n * 3 + i] * 3;
		r[i * 3] = e[a], r[i * 3 + 1] = e[a + 1], r[i * 3 + 2] = e[a + 2];
	}
}
function n(e, t) {
	let n = e[3] - e[0], r = e[4] - e[1], i = e[5] - e[2], a = e[6] - e[0], o = e[7] - e[1], s = e[8] - e[2];
	t[0] = r * s - i * o, t[1] = i * a - n * s, t[2] = n * o - r * a;
}
function r(e, t) {
	n(e, t);
	let r = Math.hypot(t[0], t[1], t[2]);
	return r === 0 || (t[0] /= r, t[1] /= r, t[2] /= r), t;
}
function i(e, t, n) {
	let [r, i, o, s, c, l, u, d, f] = t, p = s - r, m = c - i, h = l - o, g = u - r, _ = d - i, v = f - o, y = e[0] - r, b = e[1] - i, x = e[2] - o, S = p * y + m * b + h * x, C = g * y + _ * b + v * x;
	if (S <= 0 && C <= 0) return a(n, r, i, o);
	let w = e[0] - s, T = e[1] - c, E = e[2] - l, D = p * w + m * T + h * E, O = g * w + _ * T + v * E;
	if (D >= 0 && O <= D) return a(n, s, c, l);
	let k = S * O - D * C;
	if (k <= 0 && S >= 0 && D <= 0) {
		let e = S / (S - D);
		return a(n, r + p * e, i + m * e, o + h * e);
	}
	let A = e[0] - u, j = e[1] - d, M = e[2] - f, N = p * A + m * j + h * M, P = g * A + _ * j + v * M;
	if (P >= 0 && N <= P) return a(n, u, d, f);
	let F = N * C - S * P;
	if (F <= 0 && C >= 0 && P <= 0) {
		let e = C / (C - P);
		return a(n, r + g * e, i + _ * e, o + v * e);
	}
	let I = D * P - N * O;
	if (I <= 0 && O - D >= 0 && N - P >= 0) {
		let e = (O - D) / (O - D + N - P);
		return a(n, s + (u - s) * e, c + (d - c) * e, l + (f - l) * e);
	}
	let L = 1 / (I + F + k), R = F * L, z = k * L;
	return a(n, r + p * R + g * z, i + m * R + _ * z, o + h * R + v * z);
}
function a(e, t, n, r) {
	return e[0] = t, e[1] = n, e[2] = r, e;
}
function o(e, t, n) {
	let r = n[3] - n[0], i = n[4] - n[1], a = n[5] - n[2], o = n[6] - n[0], s = n[7] - n[1], c = n[8] - n[2], l = t[1] * c - t[2] * s, u = t[2] * o - t[0] * c, d = t[0] * s - t[1] * o, f = r * l + i * u + a * d;
	if (f === 0) return -1;
	let p = e[0] - n[0], m = e[1] - n[1], h = e[2] - n[2], g = (p * l + m * u + h * d) / f;
	if (g < 0 || g > 1) return -1;
	let _ = m * a - h * i, v = h * r - p * a, y = p * i - m * r, b = (t[0] * _ + t[1] * v + t[2] * y) / f;
	if (b < 0 || g + b > 1) return -1;
	let x = (o * _ + s * v + c * y) / f;
	return x >= 0 ? x : -1;
}
function s(e, t, n) {
	let r = t[6] - t[0], i = t[7] - t[1], a = t[8] - t[2], o = t[3] - t[0], s = t[4] - t[1], c = t[5] - t[2], l = e[0] - t[0], u = e[1] - t[1], d = e[2] - t[2], f = r * r + i * i + a * a, p = r * o + i * s + a * c, m = r * l + i * u + a * d, h = o * o + s * s + c * c, g = o * l + s * u + c * d, _ = f * h - p * p;
	if (_ === 0) return null;
	let v = (h * m - p * g) / _, y = (f * g - p * m) / _;
	return n[0] = 1 - v - y, n[1] = y, n[2] = v, n;
}
function c(e, t, n) {
	let r = [
		0,
		0,
		0
	];
	for (let i = 0; i < 3; i++) {
		let a = (e[i * 3] - n[0]) * t[0] + (e[i * 3 + 1] - n[1]) * t[1] + (e[i * 3 + 2] - n[2]) * t[2];
		r[i] = Math.abs(a) <= 1e-12 ? 0 : a;
	}
	return r;
}
function l(e) {
	return e.every((e) => e > 0) || e.every((e) => e < 0);
}
function u(e, t, n) {
	let r = [];
	for (let n = 0; n < 3; n++) {
		t[n] === 0 && r.push(e.slice(n * 3, n * 3 + 3));
		let i = (n + 1) % 3;
		if (t[n] * t[i] < 0) {
			let a = t[n] / (t[n] - t[i]);
			r.push([
				0,
				1,
				2
			].map((t) => e[n * 3 + t] + (e[i * 3 + t] - e[n * 3 + t]) * a));
		}
	}
	return r.sort((e, t) => e[n] - t[n]), {
		low: r[0],
		high: r[r.length - 1]
	};
}
function d(e, t, n) {
	for (let r of [e, t]) for (let i = 0; i < 3; i++) {
		let a = (i + 1) % 3, o = [
			0,
			1,
			2
		].map((e) => r[a * 3 + e] - r[i * 3 + e]);
		if (f(e, t, [
			o[1] * n[2] - o[2] * n[1],
			o[2] * n[0] - o[0] * n[2],
			o[0] * n[1] - o[1] * n[0]
		])) return !1;
	}
	return !0;
}
function f(t, n, r) {
	let i = p(t, r), a = p(n, r);
	return i.high < a.low - e || a.high < i.low - e;
}
function p(e, t) {
	let n = Infinity, r = -Infinity;
	for (let i = 0; i < 3; i++) {
		let a = e[i * 3] * t[0] + e[i * 3 + 1] * t[1] + e[i * 3 + 2] * t[2];
		n = Math.min(n, a), r = Math.max(r, a);
	}
	return {
		low: n,
		high: r
	};
}
function m(t, n, i = null) {
	let a = r(t, [
		0,
		0,
		0
	]), o = r(n, [
		0,
		0,
		0
	]), s = c(t, o, n), f = c(n, a, t);
	if (l(s) || l(f)) return !1;
	if (i && i.fill(0), s.every((e) => e === 0)) return d(t, n, a);
	let p = [
		a[1] * o[2] - a[2] * o[1],
		a[2] * o[0] - a[0] * o[2],
		a[0] * o[1] - a[1] * o[0]
	].map(Math.abs), m = p.indexOf(Math.max(...p)), h = u(t, s, m), g = u(n, f, m), _ = h.low[m] >= g.low[m] ? h.low : g.low, v = h.high[m] <= g.high[m] ? h.high : g.high;
	return _[m] > v[m] + e ? !1 : (i && (i.set(_, 0), i.set(v, 3)), !0);
}
export { r as a, t as i, i as n, m as o, o as r, s as t };
