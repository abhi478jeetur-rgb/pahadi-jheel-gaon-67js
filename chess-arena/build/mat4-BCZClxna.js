/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
// node_modules/gl-matrix/esm/common.js
var e = 1e-6, t = typeof Float32Array < "u" ? Float32Array : Array;
// node_modules/gl-matrix/esm/mat4.js
function n() {
	var e = new t(16);
	return t != Float32Array && (e[1] = 0, e[2] = 0, e[3] = 0, e[4] = 0, e[6] = 0, e[7] = 0, e[8] = 0, e[9] = 0, e[11] = 0, e[12] = 0, e[13] = 0, e[14] = 0), e[0] = 1, e[5] = 1, e[10] = 1, e[15] = 1, e;
}
function r(e) {
	var n = new t(16);
	return n[0] = e[0], n[1] = e[1], n[2] = e[2], n[3] = e[3], n[4] = e[4], n[5] = e[5], n[6] = e[6], n[7] = e[7], n[8] = e[8], n[9] = e[9], n[10] = e[10], n[11] = e[11], n[12] = e[12], n[13] = e[13], n[14] = e[14], n[15] = e[15], n;
}
function i(e) {
	return e[0] = 1, e[1] = 0, e[2] = 0, e[3] = 0, e[4] = 0, e[5] = 1, e[6] = 0, e[7] = 0, e[8] = 0, e[9] = 0, e[10] = 1, e[11] = 0, e[12] = 0, e[13] = 0, e[14] = 0, e[15] = 1, e;
}
function a(e, t) {
	var n = t[0], r = t[1], i = t[2], a = t[3], o = t[4], s = t[5], c = t[6], l = t[7], u = t[8], d = t[9], f = t[10], p = t[11], m = t[12], h = t[13], g = t[14], _ = t[15], v = n * s - r * o, y = n * c - i * o, b = n * l - a * o, x = r * c - i * s, S = r * l - a * s, C = i * l - a * c, w = u * h - d * m, T = u * g - f * m, E = u * _ - p * m, D = d * g - f * h, O = d * _ - p * h, k = f * _ - p * g, A = v * k - y * O + b * D + x * E - S * T + C * w;
	return A ? (A = 1 / A, e[0] = (s * k - c * O + l * D) * A, e[1] = (i * O - r * k - a * D) * A, e[2] = (h * C - g * S + _ * x) * A, e[3] = (f * S - d * C - p * x) * A, e[4] = (c * E - o * k - l * T) * A, e[5] = (n * k - i * E + a * T) * A, e[6] = (g * b - m * C - _ * y) * A, e[7] = (u * C - f * b + p * y) * A, e[8] = (o * O - s * E + l * w) * A, e[9] = (r * E - n * O - a * w) * A, e[10] = (m * S - h * b + _ * v) * A, e[11] = (d * b - u * S - p * v) * A, e[12] = (s * T - o * D - c * w) * A, e[13] = (n * D - r * T + i * w) * A, e[14] = (h * y - m * x - g * v) * A, e[15] = (u * x - d * y + f * v) * A, e) : null;
}
function o(e) {
	var t = e[0], n = e[1], r = e[2], i = e[3], a = e[4], o = e[5], s = e[6], c = e[7], l = e[8], u = e[9], d = e[10], f = e[11], p = e[12], m = e[13], h = e[14], g = e[15], _ = t * o - n * a, v = t * s - r * a, y = n * s - r * o, b = l * m - u * p, x = l * h - d * p, S = u * h - d * m, C = t * S - n * x + r * b, w = a * S - o * x + s * b, T = l * y - u * v + d * _, E = p * y - m * v + h * _;
	return c * C - i * w + g * T - f * E;
}
function s(e, t, n) {
	var r = t[0], i = t[1], a = t[2], o = t[3], s = t[4], c = t[5], l = t[6], u = t[7], d = t[8], f = t[9], p = t[10], m = t[11], h = t[12], g = t[13], _ = t[14], v = t[15], y = n[0], b = n[1], x = n[2], S = n[3];
	return e[0] = y * r + b * s + x * d + S * h, e[1] = y * i + b * c + x * f + S * g, e[2] = y * a + b * l + x * p + S * _, e[3] = y * o + b * u + x * m + S * v, y = n[4], b = n[5], x = n[6], S = n[7], e[4] = y * r + b * s + x * d + S * h, e[5] = y * i + b * c + x * f + S * g, e[6] = y * a + b * l + x * p + S * _, e[7] = y * o + b * u + x * m + S * v, y = n[8], b = n[9], x = n[10], S = n[11], e[8] = y * r + b * s + x * d + S * h, e[9] = y * i + b * c + x * f + S * g, e[10] = y * a + b * l + x * p + S * _, e[11] = y * o + b * u + x * m + S * v, y = n[12], b = n[13], x = n[14], S = n[15], e[12] = y * r + b * s + x * d + S * h, e[13] = y * i + b * c + x * f + S * g, e[14] = y * a + b * l + x * p + S * _, e[15] = y * o + b * u + x * m + S * v, e;
}
function c(e, t, n) {
	var r = n[0], i = n[1], a = n[2], o, s, c, l, u, d, f, p, m, h, g, _;
	return t === e ? (e[12] = t[0] * r + t[4] * i + t[8] * a + t[12], e[13] = t[1] * r + t[5] * i + t[9] * a + t[13], e[14] = t[2] * r + t[6] * i + t[10] * a + t[14], e[15] = t[3] * r + t[7] * i + t[11] * a + t[15]) : (o = t[0], s = t[1], c = t[2], l = t[3], u = t[4], d = t[5], f = t[6], p = t[7], m = t[8], h = t[9], g = t[10], _ = t[11], e[0] = o, e[1] = s, e[2] = c, e[3] = l, e[4] = u, e[5] = d, e[6] = f, e[7] = p, e[8] = m, e[9] = h, e[10] = g, e[11] = _, e[12] = o * r + u * i + m * a + t[12], e[13] = s * r + d * i + h * a + t[13], e[14] = c * r + f * i + g * a + t[14], e[15] = l * r + p * i + _ * a + t[15]), e;
}
function l(e, t, n) {
	var r = n[0], i = n[1], a = n[2];
	return e[0] = t[0] * r, e[1] = t[1] * r, e[2] = t[2] * r, e[3] = t[3] * r, e[4] = t[4] * i, e[5] = t[5] * i, e[6] = t[6] * i, e[7] = t[7] * i, e[8] = t[8] * a, e[9] = t[9] * a, e[10] = t[10] * a, e[11] = t[11] * a, e[12] = t[12], e[13] = t[13], e[14] = t[14], e[15] = t[15], e;
}
function u(e, t, n) {
	var r = Math.sin(n), i = Math.cos(n), a = t[4], o = t[5], s = t[6], c = t[7], l = t[8], u = t[9], d = t[10], f = t[11];
	return t !== e && (e[0] = t[0], e[1] = t[1], e[2] = t[2], e[3] = t[3], e[12] = t[12], e[13] = t[13], e[14] = t[14], e[15] = t[15]), e[4] = a * i + l * r, e[5] = o * i + u * r, e[6] = s * i + d * r, e[7] = c * i + f * r, e[8] = l * i - a * r, e[9] = u * i - o * r, e[10] = d * i - s * r, e[11] = f * i - c * r, e;
}
function d(e, t, n) {
	var r = Math.sin(n), i = Math.cos(n), a = t[0], o = t[1], s = t[2], c = t[3], l = t[8], u = t[9], d = t[10], f = t[11];
	return t !== e && (e[4] = t[4], e[5] = t[5], e[6] = t[6], e[7] = t[7], e[12] = t[12], e[13] = t[13], e[14] = t[14], e[15] = t[15]), e[0] = a * i - l * r, e[1] = o * i - u * r, e[2] = s * i - d * r, e[3] = c * i - f * r, e[8] = a * r + l * i, e[9] = o * r + u * i, e[10] = s * r + d * i, e[11] = c * r + f * i, e;
}
function f(e, t, n) {
	var r = Math.sin(n), i = Math.cos(n), a = t[0], o = t[1], s = t[2], c = t[3], l = t[4], u = t[5], d = t[6], f = t[7];
	return t !== e && (e[8] = t[8], e[9] = t[9], e[10] = t[10], e[11] = t[11], e[12] = t[12], e[13] = t[13], e[14] = t[14], e[15] = t[15]), e[0] = a * i + l * r, e[1] = o * i + u * r, e[2] = s * i + d * r, e[3] = c * i + f * r, e[4] = l * i - a * r, e[5] = u * i - o * r, e[6] = d * i - s * r, e[7] = f * i - c * r, e;
}
function p(e, t) {
	return e[0] = 1, e[1] = 0, e[2] = 0, e[3] = 0, e[4] = 0, e[5] = 1, e[6] = 0, e[7] = 0, e[8] = 0, e[9] = 0, e[10] = 1, e[11] = 0, e[12] = t[0], e[13] = t[1], e[14] = t[2], e[15] = 1, e;
}
function m(e, t) {
	var n = Math.sin(t), r = Math.cos(t);
	return e[0] = r, e[1] = 0, e[2] = -n, e[3] = 0, e[4] = 0, e[5] = 1, e[6] = 0, e[7] = 0, e[8] = n, e[9] = 0, e[10] = r, e[11] = 0, e[12] = 0, e[13] = 0, e[14] = 0, e[15] = 1, e;
}
function h(e, t, n) {
	var r = t[0], i = t[1], a = t[2], o = t[3], s = r + r, c = i + i, l = a + a, u = r * s, d = r * c, f = r * l, p = i * c, m = i * l, h = a * l, g = o * s, _ = o * c, v = o * l;
	return e[0] = 1 - (p + h), e[1] = d + v, e[2] = f - _, e[3] = 0, e[4] = d - v, e[5] = 1 - (u + h), e[6] = m + g, e[7] = 0, e[8] = f + _, e[9] = m - g, e[10] = 1 - (u + p), e[11] = 0, e[12] = n[0], e[13] = n[1], e[14] = n[2], e[15] = 1, e;
}
function g(e, t) {
	return e[0] = t[12], e[1] = t[13], e[2] = t[14], e;
}
function _(e, t) {
	var n = t[0], r = t[1], i = t[2], a = t[4], o = t[5], s = t[6], c = t[8], l = t[9], u = t[10];
	return e[0] = Math.sqrt(n * n + r * r + i * i), e[1] = Math.sqrt(a * a + o * o + s * s), e[2] = Math.sqrt(c * c + l * l + u * u), e;
}
function v(e, n) {
	var r = new t(3);
	_(r, n);
	var i = 1 / r[0], a = 1 / r[1], o = 1 / r[2], s = n[0] * i, c = n[1] * a, l = n[2] * o, u = n[4] * i, d = n[5] * a, f = n[6] * o, p = n[8] * i, m = n[9] * a, h = n[10] * o, g = s + d + h, v = 0;
	return g > 0 ? (v = Math.sqrt(g + 1) * 2, e[3] = .25 * v, e[0] = (f - m) / v, e[1] = (p - l) / v, e[2] = (c - u) / v) : s > d && s > h ? (v = Math.sqrt(1 + s - d - h) * 2, e[3] = (f - m) / v, e[0] = .25 * v, e[1] = (c + u) / v, e[2] = (p + l) / v) : d > h ? (v = Math.sqrt(1 + d - s - h) * 2, e[3] = (p - l) / v, e[0] = (c + u) / v, e[1] = .25 * v, e[2] = (f + m) / v) : (v = Math.sqrt(1 + h - s - d) * 2, e[3] = (c - u) / v, e[0] = (p + l) / v, e[1] = (f + m) / v, e[2] = .25 * v), e;
}
function y(e, t, n, r) {
	var i = t[0], a = t[1], o = t[2], s = t[3], c = i + i, l = a + a, u = o + o, d = i * c, f = i * l, p = i * u, m = a * l, h = a * u, g = o * u, _ = s * c, v = s * l, y = s * u, b = r[0], x = r[1], S = r[2];
	return e[0] = (1 - (m + g)) * b, e[1] = (f + y) * b, e[2] = (p - v) * b, e[3] = 0, e[4] = (f - y) * x, e[5] = (1 - (d + g)) * x, e[6] = (h + _) * x, e[7] = 0, e[8] = (p + v) * S, e[9] = (h - _) * S, e[10] = (1 - (d + m)) * S, e[11] = 0, e[12] = n[0], e[13] = n[1], e[14] = n[2], e[15] = 1, e;
}
function b(e, t) {
	var n = t[0], r = t[1], i = t[2], a = t[3], o = n + n, s = r + r, c = i + i, l = n * o, u = r * o, d = r * s, f = i * o, p = i * s, m = i * c, h = a * o, g = a * s, _ = a * c;
	return e[0] = 1 - d - m, e[1] = u + _, e[2] = f - g, e[3] = 0, e[4] = u - _, e[5] = 1 - l - m, e[6] = p + h, e[7] = 0, e[8] = f + g, e[9] = p - h, e[10] = 1 - l - d, e[11] = 0, e[12] = 0, e[13] = 0, e[14] = 0, e[15] = 1, e;
}
function x(e, t, n, r, i) {
	var a = 1 / Math.tan(t / 2);
	if (e[0] = a / n, e[1] = 0, e[2] = 0, e[3] = 0, e[4] = 0, e[5] = a, e[6] = 0, e[7] = 0, e[8] = 0, e[9] = 0, e[11] = -1, e[12] = 0, e[13] = 0, e[15] = 0, i != null && i !== Infinity) {
		var o = 1 / (r - i);
		e[10] = (i + r) * o, e[14] = 2 * i * r * o;
	} else e[10] = -1, e[14] = -2 * r;
	return e;
}
var S = x;
function C(e, t, n, r, i, a, o) {
	var s = 1 / (t - n), c = 1 / (r - i), l = 1 / (a - o);
	return e[0] = -2 * s, e[1] = 0, e[2] = 0, e[3] = 0, e[4] = 0, e[5] = -2 * c, e[6] = 0, e[7] = 0, e[8] = 0, e[9] = 0, e[10] = 2 * l, e[11] = 0, e[12] = (t + n) * s, e[13] = (i + r) * c, e[14] = (o + a) * l, e[15] = 1, e;
}
var w = C;
function T(e, t, n, r) {
	var a, o, s, c, l, u, d, f, p, m, h = t[0], g = t[1], _ = t[2], v = r[0], y = r[1], b = r[2], x = n[0], S = n[1], C = n[2];
	return Math.abs(h - x) < 1e-6 && Math.abs(g - S) < 1e-6 && Math.abs(_ - C) < 1e-6 ? i(e) : (d = h - x, f = g - S, p = _ - C, m = 1 / Math.sqrt(d * d + f * f + p * p), d *= m, f *= m, p *= m, a = y * p - b * f, o = b * d - v * p, s = v * f - y * d, m = Math.sqrt(a * a + o * o + s * s), m ? (m = 1 / m, a *= m, o *= m, s *= m) : (a = 0, o = 0, s = 0), c = f * s - p * o, l = p * a - d * s, u = d * o - f * a, m = Math.sqrt(c * c + l * l + u * u), m ? (m = 1 / m, c *= m, l *= m, u *= m) : (c = 0, l = 0, u = 0), e[0] = a, e[1] = c, e[2] = d, e[3] = 0, e[4] = o, e[5] = l, e[6] = f, e[7] = 0, e[8] = s, e[9] = u, e[10] = p, e[11] = 0, e[12] = -(a * h + o * g + s * _), e[13] = -(c * h + l * g + u * _), e[14] = -(d * h + f * g + p * _), e[15] = 1, e);
}
export { t as C, c as S, S as _, h as a, f as b, m as c, g as d, i as f, w as g, s as h, b as i, v as l, T as m, n, y as o, a as p, o as r, p as s, r as t, _ as u, u as v, e as w, l as x, d as y };
