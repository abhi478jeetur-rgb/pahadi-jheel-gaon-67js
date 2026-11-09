/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { C as e } from "./mat4-BCZClxna.js";
// node_modules/gl-matrix/esm/vec3.js
function t() {
	var t = new e(3);
	return e != Float32Array && (t[0] = 0, t[1] = 0, t[2] = 0), t;
}
function n(t) {
	var n = new e(3);
	return n[0] = t[0], n[1] = t[1], n[2] = t[2], n;
}
function r(e) {
	var t = e[0], n = e[1], r = e[2];
	return Math.sqrt(t * t + n * n + r * r);
}
function i(t, n, r) {
	var i = new e(3);
	return i[0] = t, i[1] = n, i[2] = r, i;
}
function a(e, t) {
	return e[0] = t[0], e[1] = t[1], e[2] = t[2], e;
}
function o(e, t, n, r) {
	return e[0] = t, e[1] = n, e[2] = r, e;
}
function s(e, t, n) {
	return e[0] = t[0] + n[0], e[1] = t[1] + n[1], e[2] = t[2] + n[2], e;
}
function c(e, t, n) {
	return e[0] = t[0] - n[0], e[1] = t[1] - n[1], e[2] = t[2] - n[2], e;
}
function l(e, t, n) {
	return e[0] = t[0] * n, e[1] = t[1] * n, e[2] = t[2] * n, e;
}
function u(e, t, n, r) {
	return e[0] = t[0] + n[0] * r, e[1] = t[1] + n[1] * r, e[2] = t[2] + n[2] * r, e;
}
function d(e, t) {
	var n = t[0] - e[0], r = t[1] - e[1], i = t[2] - e[2];
	return Math.sqrt(n * n + r * r + i * i);
}
function f(e, t) {
	var n = t[0] - e[0], r = t[1] - e[1], i = t[2] - e[2];
	return n * n + r * r + i * i;
}
function p(e) {
	var t = e[0], n = e[1], r = e[2];
	return t * t + n * n + r * r;
}
function m(e, t) {
	var n = t[0], r = t[1], i = t[2], a = n * n + r * r + i * i;
	return a > 0 && (a = 1 / Math.sqrt(a)), e[0] = t[0] * a, e[1] = t[1] * a, e[2] = t[2] * a, e;
}
function h(e, t) {
	return e[0] * t[0] + e[1] * t[1] + e[2] * t[2];
}
function g(e, t, n) {
	var r = t[0], i = t[1], a = t[2], o = n[0], s = n[1], c = n[2];
	return e[0] = i * c - a * s, e[1] = a * o - r * c, e[2] = r * s - i * o, e;
}
function _(e, t, n, r) {
	var i = t[0], a = t[1], o = t[2];
	return e[0] = i + r * (n[0] - i), e[1] = a + r * (n[1] - a), e[2] = o + r * (n[2] - o), e;
}
function v(e, t, n) {
	var r = t[0], i = t[1], a = t[2], o = n[3] * r + n[7] * i + n[11] * a + n[15];
	return o ||= 1, e[0] = (n[0] * r + n[4] * i + n[8] * a + n[12]) / o, e[1] = (n[1] * r + n[5] * i + n[9] * a + n[13]) / o, e[2] = (n[2] * r + n[6] * i + n[10] * a + n[14]) / o, e;
}
function y(e, t, n) {
	var r = t[0], i = t[1], a = t[2];
	return e[0] = r * n[0] + i * n[3] + a * n[6], e[1] = r * n[1] + i * n[4] + a * n[7], e[2] = r * n[2] + i * n[5] + a * n[8], e;
}
function b(e, t, n) {
	var r = n[0], i = n[1], a = n[2], o = n[3], s = t[0], c = t[1], l = t[2], u = i * l - a * c, d = a * s - r * l, f = r * c - i * s;
	return u += u, d += d, f += f, e[0] = s + o * u + i * f - a * d, e[1] = c + o * d + a * u - r * f, e[2] = l + o * f + r * d - i * u, e;
}
function x(e, t) {
	var n = e[0], r = e[1], i = e[2], a = t[0], o = t[1], s = t[2], c = Math.sqrt((n * n + r * r + i * i) * (a * a + o * o + s * s)), l = c && h(e, t) / c;
	return Math.acos(Math.min(Math.max(l, -1), 1));
}
var S = r;
(function() {
	var e = t();
	return function(t, n, r, i, a, o) {
		var s, c;
		for (n ||= 3, r ||= 0, c = i ? Math.min(i * n + r, t.length) : t.length, s = r; s < c; s += n) e[0] = t[s], e[1] = t[s + 1], e[2] = t[s + 2], a(e, e, o), t[s] = e[0], t[s + 1] = e[1], t[s + 2] = e[2];
		return t;
	};
})();
export { b as S, f as _, t as a, y as b, h as c, r as d, _ as f, o as g, u as h, a as i, i as l, l as m, x as n, g as o, m as p, n as r, d as s, s as t, S as u, p as v, v as x, c as y };
