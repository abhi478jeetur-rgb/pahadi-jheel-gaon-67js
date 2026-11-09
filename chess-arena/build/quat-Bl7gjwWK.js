/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { C as e } from "./mat4-BCZClxna.js";
import { t } from "./mat3-BUCH0Dej.js";
import { a as n, c as r, l as i, o as a, p as o, u as s } from "./vec3-BRYC6f_g.js";
// node_modules/gl-matrix/esm/vec4.js
function c() {
	var t = new e(4);
	return e != Float32Array && (t[0] = 0, t[1] = 0, t[2] = 0, t[3] = 0), t;
}
function l(e, t, n) {
	return e[0] = t[0] * n, e[1] = t[1] * n, e[2] = t[2] * n, e[3] = t[3] * n, e;
}
function u(e, t) {
	var n = t[0], r = t[1], i = t[2], a = t[3], o = n * n + r * r + i * i + a * a;
	return o > 0 && (o = 1 / Math.sqrt(o)), e[0] = n * o, e[1] = r * o, e[2] = i * o, e[3] = a * o, e;
}
function d(e, t) {
	return e[0] * t[0] + e[1] * t[1] + e[2] * t[2] + e[3] * t[3];
}
(function() {
	var e = c();
	return function(t, n, r, i, a, o) {
		var s, c;
		for (n ||= 4, r ||= 0, c = i ? Math.min(i * n + r, t.length) : t.length, s = r; s < c; s += n) e[0] = t[s], e[1] = t[s + 1], e[2] = t[s + 2], e[3] = t[s + 3], a(e, e, o), t[s] = e[0], t[s + 1] = e[1], t[s + 2] = e[2], t[s + 3] = e[3];
		return t;
	};
})();
// node_modules/gl-matrix/esm/quat.js
function f() {
	var t = new e(4);
	return e != Float32Array && (t[0] = 0, t[1] = 0, t[2] = 0), t[3] = 1, t;
}
function p(e, t, n) {
	n *= .5;
	var r = Math.sin(n);
	return e[0] = r * t[0], e[1] = r * t[1], e[2] = r * t[2], e[3] = Math.cos(n), e;
}
function m(e, t, n) {
	var r = t[0], i = t[1], a = t[2], o = t[3], s = n[0], c = n[1], l = n[2], u = n[3];
	return e[0] = r * u + o * s + i * l - a * c, e[1] = i * u + o * c + a * s - r * l, e[2] = a * u + o * l + r * c - i * s, e[3] = o * u - r * s - i * c - a * l, e;
}
function h(e, t, n, r) {
	var i = t[0], a = t[1], o = t[2], s = t[3], c = n[0], l = n[1], u = n[2], d = n[3], f, p = i * c + a * l + o * u + s * d, m, h, g;
	return p < 0 && (p = -p, c = -c, l = -l, u = -u, d = -d), 1 - p > 1e-6 ? (f = Math.acos(p), m = Math.sin(f), h = Math.sin((1 - r) * f) / m, g = Math.sin(r * f) / m) : (h = 1 - r, g = r), e[0] = h * i + g * c, e[1] = h * a + g * l, e[2] = h * o + g * u, e[3] = h * s + g * d, e;
}
function g(e, t) {
	var n = t[0], r = t[1], i = t[2], a = t[3], o = n * n + r * r + i * i + a * a, s = o ? 1 / o : 0;
	return e[0] = -n * s, e[1] = -r * s, e[2] = -i * s, e[3] = a * s, e;
}
function _(e, t) {
	return e[0] = -t[0], e[1] = -t[1], e[2] = -t[2], e[3] = t[3], e;
}
function v(e, t) {
	var n = t[0] + t[4] + t[8], r;
	if (n > 0) r = Math.sqrt(n + 1), e[3] = .5 * r, r = .5 / r, e[0] = (t[5] - t[7]) * r, e[1] = (t[6] - t[2]) * r, e[2] = (t[1] - t[3]) * r;
	else {
		var i = 0;
		t[4] > t[0] && (i = 1), t[8] > t[i * 3 + i] && (i = 2);
		var a = (i + 1) % 3, o = (i + 2) % 3;
		r = Math.sqrt(t[i * 3 + i] - t[a * 3 + a] - t[o * 3 + o] + 1), e[i] = .5 * r, r = .5 / r, e[3] = (t[a * 3 + o] - t[o * 3 + a]) * r, e[a] = (t[a * 3 + i] + t[i * 3 + a]) * r, e[o] = (t[o * 3 + i] + t[i * 3 + o]) * r;
	}
	return e;
}
function y(e, t, n, r) {
	var i = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : "zyx", a = Math.PI / 360;
	t *= a, r *= a, n *= a;
	var o = Math.sin(t), s = Math.cos(t), c = Math.sin(n), l = Math.cos(n), u = Math.sin(r), d = Math.cos(r);
	switch (i) {
		case "xyz":
			e[0] = o * l * d + s * c * u, e[1] = s * c * d - o * l * u, e[2] = s * l * u + o * c * d, e[3] = s * l * d - o * c * u;
			break;
		case "xzy":
			e[0] = o * l * d - s * c * u, e[1] = s * c * d - o * l * u, e[2] = s * l * u + o * c * d, e[3] = s * l * d + o * c * u;
			break;
		case "yxz":
			e[0] = o * l * d + s * c * u, e[1] = s * c * d - o * l * u, e[2] = s * l * u - o * c * d, e[3] = s * l * d + o * c * u;
			break;
		case "yzx":
			e[0] = o * l * d + s * c * u, e[1] = s * c * d + o * l * u, e[2] = s * l * u - o * c * d, e[3] = s * l * d - o * c * u;
			break;
		case "zxy":
			e[0] = o * l * d - s * c * u, e[1] = s * c * d + o * l * u, e[2] = s * l * u + o * c * d, e[3] = s * l * d - o * c * u;
			break;
		case "zyx":
			e[0] = o * l * d - s * c * u, e[1] = s * c * d + o * l * u, e[2] = s * l * u - o * c * d, e[3] = s * l * d + o * c * u;
			break;
		default: throw Error("Unknown angle order " + i);
	}
	return e;
}
var b = l, x = d, S = u, C = function() {
	var e = n(), t = i(1, 0, 0), c = i(0, 1, 0);
	return function(n, i, l) {
		var u = r(i, l);
		return u < -.999999 ? (a(e, t, i), s(e) < 1e-6 && a(e, c, i), o(e, e), p(n, e, Math.PI), n) : u > .999999 ? (n[0] = 0, n[1] = 0, n[2] = 0, n[3] = 1, n) : (a(e, i, l), n[0] = e[0], n[1] = e[1], n[2] = e[2], n[3] = 1 + u, S(n, n));
	};
}();
(function() {
	var e = f(), t = f();
	return function(n, r, i, a, o, s) {
		return h(e, r, o, s), h(t, i, a, s), h(n, e, t, 2 * s * (1 - s)), n;
	};
})(), function() {
	var e = t();
	return function(t, n, r, i) {
		return e[0] = r[0], e[3] = r[1], e[6] = r[2], e[1] = i[0], e[4] = i[1], e[7] = i[2], e[2] = -n[0], e[5] = -n[1], e[8] = -n[2], S(t, v(t, e));
	};
}();
export { v as a, S as c, p as d, h as f, y as i, C as l, f as n, g as o, x as r, m as s, _ as t, b as u };
