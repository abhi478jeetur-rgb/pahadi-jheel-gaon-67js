/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { t as e } from "./subsurface-limits-DJNpVtVf.js";
// src/path-tracer-shading.js
var t = 2 * Math.PI, n = .001, r = .002, i = .04;
function a(e, t, n) {
	return .2126 * e + .7152 * t + .0722 * n;
}
function o(e, n, r, i, a) {
	let { width: o, height: s, channels: c, data: l, intensity: u, cosine: d, sine: f } = e, p = d * n - f * i, m = f * n + d * i, h = (Math.atan2(p, -m) / t + .5) * o - .5, g = Math.acos(Math.max(-1, Math.min(1, r))) / Math.PI * s - .5, _ = Math.floor(h), v = Math.floor(g), y = h - _, b = g - v;
	a[0] = 0, a[1] = 0, a[2] = 0;
	for (let e = 0; e < 4; e++) {
		let t = ((_ + (e & 1)) % o + o) % o, n = Math.max(0, Math.min(s - 1, v + (e >> 1))), r = (e & 1 ? y : 1 - y) * (e >> 1 ? b : 1 - b), i = (n * o + t) * c;
		a[0] += r * l[i] * u, a[1] += r * l[i + 1] * u, a[2] += r * l[i + 2] * u;
	}
}
function s(e, t, n, r) {
	let i = t, a = n - 1;
	for (; i < a;) {
		let t = i + a >> 1;
		e[t] < r ? i = t + 1 : a = t;
	}
	return i;
}
function c(e, n, r, i) {
	let { width: o, height: s, channels: c, data: l, cosine: u, sine: d, total: f } = e, p = u * n - d * i, m = d * n + u * i, h = Math.min(o - 1, Math.floor((Math.atan2(p, -m) / t + .5) * o)), g = Math.acos(Math.max(-1, Math.min(1, r))), _ = Math.min(s - 1, Math.floor(g / Math.PI * s)), v = Math.max(Math.sin(g), 1e-6), y = Math.sin(Math.PI * (_ + .5) / s), b = (_ * o + h) * c;
	return (a(l[b], l[b + 1], l[b + 2]) + 1e-6) * y / f * o * s / (t * Math.PI * v);
}
function l(e, n, r, i, a, o) {
	let { width: l, height: u, cosine: d, sine: f, rowCumulative: p, pixelCumulative: m, total: h } = e, g = s(p, 0, u, n * h), _ = g * l, v = m[_ + l - 1], y = s(m, _, _ + l, r * v) - _, b = Math.PI * (g + a) / u, x = ((y + i) / l - .5) * t, S = Math.sin(b), C = S * Math.sin(x), w = -S * Math.cos(x);
	return o[0] = d * C + f * w, o[1] = Math.cos(b), o[2] = -f * C + d * w, c(e, o[0], o[1], o[2]);
}
function u(e, t) {
	let n = e * e, r = t * t * (n - 1) + 1;
	return n / (Math.PI * r * r);
}
function d(e, t) {
	let n = e * e, r = t * t;
	return 2 * t / (t + Math.sqrt(n + (1 - n) * r));
}
function f(e, t) {
	let n = (1 - Math.min(Math.max(t, 0), 1)) ** 5;
	return e + (1 - e) * n;
}
function p(e, n, r, i, a, o, s) {
	let c = i * e, l = i * n, u = r, d = Math.hypot(c, l, u);
	c /= d, l /= d;
	let f = u / d, p = Math.hypot(c, l), m = p > 0 ? -l / p : 1, h = p > 0 ? c / p : 0, g = -f * (p > 0 ? c / p : 0), _ = -f * (p > 0 ? l / p : 0), v = p, y = Math.sqrt(a), b = t * o, x = y * Math.cos(b), S = y * Math.sin(b), C = .5 * (1 + f);
	S = (1 - C) * Math.sqrt(1 - x * x) + C * S;
	let w = Math.sqrt(Math.max(0, 1 - x * x - S * S)), T = x * m + S * g + w * c, E = x * h + S * _ + w * l, D = S * v + w * f, O = i * T, k = i * E, A = Math.max(0, D), j = Math.hypot(O, k, A);
	s[0] = O / j, s[1] = k / j, s[2] = A / j;
}
function m(e) {
	return Math.max(e * e, n);
}
function h(e, t) {
	let n = Math.abs(e[0]) < .9, r = +!!n, i = +!n, a = e[1] * 0 - e[2] * i, o = e[2] * r - e[0] * 0, s = e[0] * i - e[1] * r, c = Math.hypot(a, o, s);
	a /= c, o /= c, s /= c, t[0] = a, t[1] = o, t[2] = s, t[3] = e[1] * s - e[2] * o, t[4] = e[2] * a - e[0] * s, t[5] = e[0] * o - e[1] * a, t[6] = e[0], t[7] = e[1], t[8] = e[2];
}
function g(e, t, n, r, i) {
	i[0] = e[0] * t + e[3] * n + e[6] * r, i[1] = e[1] * t + e[4] * n + e[7] * r, i[2] = e[2] * t + e[5] * n + e[8] * r;
}
function _(e, t, n, r, i) {
	i[0] = e[0] * t + e[1] * n + e[2] * r, i[1] = e[3] * t + e[4] * n + e[5] * r, i[2] = e[6] * t + e[7] * n + e[8] * r;
}
var v = /* @__PURE__ */ new Float64Array(3), y = /* @__PURE__ */ new Float64Array(3), b = /* @__PURE__ */ new Float64Array(3);
function x() {
	return {
		frame: /* @__PURE__ */ new Float64Array(9),
		view: /* @__PURE__ */ new Float64Array(3),
		viewCosine: 0,
		diffuseColor: /* @__PURE__ */ new Float64Array(3),
		specularNormalReflectance: /* @__PURE__ */ new Float64Array(3),
		specularWeight: 1,
		specularAlpha: n,
		coatWeight: 0,
		coatChance: 0,
		sampledCoat: !1,
		coatAlpha: n,
		diffuseChance: 1,
		subsurfaceChance: 0,
		diffuseShare: 1,
		specularChance: 0,
		value: /* @__PURE__ */ new Float64Array(3),
		pdf: 0
	};
}
function S(e, t, n) {
	let r = 1 - t, i = Math.min(r * r, 2 ** (-9.28 * n)) * r + (.0425 - .0275 * t), a = 1.04 - .572 * t - 1.04 * i, o = 1.04 * i + .022 * t - .04;
	return Math.min(1, Math.max(0, e * a + o));
}
function C(e, t, n, r, o, s, c, l, u, d = t.clearcoat) {
	h(s, e.frame), e.view[0] = c, e.view[1] = l, e.view[2] = u;
	let p = Math.max(s[0] * c + s[1] * l + s[2] * u, 1e-4);
	e.viewCosine = p;
	let g = (t.ior - 1) / (t.ior + 1), _ = g * g, v = S(_, r, p);
	e.coatWeight = d > 0 ? d * f(i, p) : 0;
	let y = 1 - e.coatWeight, b = (1 - n) * (1 - v) * y;
	for (let t = 0; t < 3; t++) {
		e.diffuseColor[t] = o[t] * b;
		let r = _ * (1 - n) + o[t] * n;
		e.specularNormalReflectance[t] = r;
	}
	let x = a(e.specularNormalReflectance[0], e.specularNormalReflectance[1], e.specularNormalReflectance[2]);
	e.specularWeight = y, e.specularAlpha = m(r), e.coatAlpha = m(t.clearcoatRoughness);
	let C = a(e.diffuseColor[0], e.diffuseColor[1], e.diffuseColor[2]), w = f(x, p) * y, T = e.coatWeight, E = C + w + T;
	e.diffuseChance = E > 0 ? C / E : 1, e.subsurfaceChance = 0, e.diffuseShare = b, e.specularChance = E > 0 ? w / E : 0, e.coatChance = E > 0 ? T / E : 0;
}
function w(e, t) {
	e.subsurfaceChance = e.diffuseChance * t, e.diffuseChance -= e.subsurfaceChance;
	for (let n = 0; n < 3; n++) e.diffuseColor[n] *= 1 - t;
}
function T(e, t) {
	h(t, e.frame), e.diffuseColor.fill(1), e.diffuseChance = 1, e.subsurfaceChance = 0, e.specularChance = 0, e.coatChance = 0, e.coatWeight = 0;
}
function E(e, t, n, r) {
	return u(e, r) * d(e, t) * d(e, n) / (4 * t * n);
}
function D(e, t, n, a) {
	e.value[0] = 0, e.value[1] = 0, e.value[2] = 0, e.pdf = 0;
	let { frame: o, view: s, viewCosine: c } = e, l = o[6] * t + o[7] * n + o[8] * a;
	if (l <= 0) return;
	let p = s[0] + t, m = s[1] + n, h = s[2] + a, g = Math.hypot(p, m, h) || 1;
	p /= g, m /= g, h /= g;
	let _ = o[6] * p + o[7] * m + o[8] * h, v = Math.max(s[0] * p + s[1] * m + s[2] * h, 0);
	e.pdf += e.diffuseChance * l / Math.PI;
	for (let t = 0; t < 3; t++) e.value[t] += e.diffuseColor[t] / Math.PI;
	if (e.specularChance > 0 && e.specularAlpha > r) {
		let t = e.specularAlpha, n = E(t, c, l, _) * e.specularWeight;
		for (let t = 0; t < 3; t++) e.value[t] += f(e.specularNormalReflectance[t], v) * n;
		e.pdf += e.specularChance * d(t, c) * u(t, _) / (4 * c);
	}
	if (e.coatChance > 0 && e.coatAlpha > r) {
		let t = e.coatAlpha, n = f(i, v) * E(t, c, l, _) * (e.coatWeight / Math.max(f(i, c), 1e-6));
		for (let t = 0; t < 3; t++) e.value[t] += n;
		e.pdf += e.coatChance * d(t, c) * u(t, _) / (4 * c);
	}
}
function O(e, t, n, r, i, a, o) {
	let s = 2 * (r * e + i * t + a * n);
	o[0] = s * e - r, o[1] = s * t - i, o[2] = s * n - a;
}
function k(e, n, i, a, o) {
	let { frame: s, view: c } = e;
	if (n < e.diffuseChance) {
		let e = Math.sqrt(i), n = t * a;
		return g(s, e * Math.cos(n), e * Math.sin(n), Math.sqrt(Math.max(0, 1 - i)), o), !1;
	}
	let l = n >= e.diffuseChance + e.specularChance;
	e.sampledCoat = l;
	let u = l ? e.coatAlpha : e.specularAlpha;
	return _(s, c[0], c[1], c[2], v), u <= r ? (o[0] = 2 * e.viewCosine * s[6] - c[0], o[1] = 2 * e.viewCosine * s[7] - c[1], o[2] = 2 * e.viewCosine * s[8] - c[2], !0) : (p(v[0], v[1], v[2], u, i, a, y), O(y[0], y[1], y[2], v[0], v[1], v[2], b), g(s, b[0], b[1], b[2], o), !1);
}
function A(e, t) {
	if (e.sampledCoat) t[0] = t[1] = t[2] = e.coatWeight / e.coatChance;
	else for (let n = 0; n < 3; n++) t[n] = f(e.specularNormalReflectance[n], e.viewCosine) * e.specularWeight / e.specularChance;
}
function j(e, t) {
	let n = t * t * (1 - e * e);
	if (n >= 1) return 1;
	let r = Math.sqrt(1 - n), i = (t * e - r) / (t * e + r), a = (e - t * r) / (e + t * r);
	return .5 * (i * i + a * a);
}
function M(e, t, n, i, a, o, s, c, l, u, d) {
	let f = N;
	h(e, f);
	let m = e[0], b = e[1], x = e[2];
	s > r && (_(f, t, n, i, v), p(v[0], v[1], v[2], s, l, u, y), g(f, y[0], y[1], y[2], P), m = P[0], b = P[1], x = P[2]);
	let S = a ? 1 / o : o, C = Math.max(t * m + n * b + i * x, 1e-6);
	if (c < j(C, S)) return O(m, b, x, t, n, i, d), d[0] * e[0] + d[1] * e[1] + d[2] * e[2] > 0;
	let w = Math.sqrt(Math.max(0, 1 - S * S * (1 - C * C))), T = S * C - w;
	return d[0] = T * m - S * t, d[1] = T * b - S * n, d[2] = T * x - S * i, d[0] * e[0] + d[1] * e[1] + d[2] * e[2] < 0;
}
var N = /* @__PURE__ */ new Float64Array(9), P = /* @__PURE__ */ new Float64Array(3), F = 1e-6, I = 3, L = Object.freeze({
	exit: 0,
	thin: 1,
	lost: 2
});
function R(t) {
	if (!t || !(t.weight > 0)) return null;
	let [n, ...r] = e(t);
	return {
		weight: n,
		meanFreePath: r.slice(0, I).map((e) => Math.max(e, F)),
		color: r[I] < 0 ? null : r.slice(I, 6)
	};
}
function z(e) {
	let t = Math.min(1, Math.max(0, e)), n = Math.sqrt(9.59217 + 41.6808 * t + 17.7126 * t * t), r = 4.09712 + 4.20863 * t - n;
	return Math.min(1, Math.max(0, 1 - r * r));
}
function B(e, t, n) {
	let r = /* @__PURE__ */ new Float64Array(9), i = /* @__PURE__ */ new Float64Array(3), a = /* @__PURE__ */ new Float64Array(3), o = new Float64Array(I), s = new Float64Array(I);
	function c(e) {
		let n = Math.sqrt(t.next()), i = 2 * Math.PI * t.next(), o = Math.sqrt(Math.max(0, 1 - n * n));
		h(e, r);
		let s = n * Math.cos(i), c = n * Math.sin(i);
		for (let t = 0; t < 3; t++) a[t] = r[t] * s + r[3 + t] * c - e[t] * o;
	}
	function l() {
		let e = 2 * t.next() - 1, n = 2 * Math.PI * t.next(), r = Math.sqrt(Math.max(0, 1 - e * e));
		a[0] = r * Math.cos(n), a[1] = e, a[2] = r * Math.sin(n);
	}
	function u(r, u, d, f, p, m, h, g, _) {
		for (let e = 0; e < I; e++) o[e] = 1 / r.meanFreePath[e], s[e] = z(u[e]);
		i[0] = d - m[0] * e.surfaceOffset, i[1] = f - m[1] * e.surfaceOffset, i[2] = p - m[2] * e.surfaceOffset, c(m);
		for (let r = 0;; r++) {
			if (!(n(e, i[0], i[1], i[2], a[0], a[1], a[2], g) && g.material === h)) return r === 0 ? L.thin : L.lost;
			let c = Math.min(2, Math.floor(t.next() * I)), u = -Math.log(1 - t.next()) / o[c];
			if (u >= g.distance) {
				let e = 0;
				for (let t = 0; t < I; t++) e += Math.exp(-o[t] * g.distance) / I;
				if (!(e > 0)) return L.lost;
				for (let t = 0; t < I; t++) _[t] *= Math.exp(-o[t] * g.distance) / e;
				return L.exit;
			}
			if (r === 32) return L.lost;
			let d = 0;
			for (let e = 0; e < I; e++) d += o[e] * Math.exp(-o[e] * u) / I;
			if (!(d > 0)) return L.lost;
			for (let e = 0; e < I; e++) _[e] *= s[e] * o[e] * Math.exp(-o[e] * u) / d;
			i[0] += a[0] * u, i[1] += a[1] * u, i[2] += a[2] * u, l();
		}
	}
	return u.direction = a, u;
}
export { w as _, x as a, D as c, C as d, m as f, T as g, k as h, h as i, a as l, M as m, B as n, c as o, l as p, R as r, o as s, L as t, A as u };
