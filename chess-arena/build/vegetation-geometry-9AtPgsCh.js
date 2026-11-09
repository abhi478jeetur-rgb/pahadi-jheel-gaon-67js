/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
// src/vegetation-geometry.js
var e = Math.PI * 2, t = [
	0,
	1,
	0
];
function n(e) {
	let t = Math.floor(e) >>> 0;
	return () => {
		t += 1831565813;
		let e = Math.imul(t ^ t >>> 15, t | 1);
		return e ^= e + Math.imul(e ^ e >>> 7, e | 61), ((e ^ e >>> 14) >>> 0) / 4294967296;
	};
}
function r(e, t, n) {
	return e + (t - e) * n;
}
function i(e, t, n) {
	return Math.min(n, Math.max(t, e));
}
function a(e, t) {
	return r(t[0], t[1], e());
}
function o(e, t, n) {
	let r = Math.imul(e, 374761393) ^ Math.imul(t, 668265263) ^ Math.imul(n, 2147483647);
	return r = Math.imul(r ^ r >>> 13, 1274126177), ((r ^ r >>> 16) >>> 0) / 4294967296;
}
function s(e, t, n, i = 0, a = 0) {
	let s = Math.floor(e), c = Math.floor(t), l = e - s, u = t - c, d = l * l * (3 - 2 * l), f = u * u * (3 - 2 * u), p = (e, t) => t > 0 ? (e % t + t) % t : e, m = (e, t) => o(p(s + e, i), p(c + t, a), n);
	return r(r(m(0, 0), m(1, 0), d), r(m(0, 1), m(1, 1), d), f);
}
function c(e, t) {
	return [
		e[0] + t[0],
		e[1] + t[1],
		e[2] + t[2]
	];
}
function l(e, t) {
	return [
		e[0] - t[0],
		e[1] - t[1],
		e[2] - t[2]
	];
}
function u(e, t) {
	return [
		e[0] * t,
		e[1] * t,
		e[2] * t
	];
}
function d(e, t, n) {
	return [
		e[0] + t[0] * n,
		e[1] + t[1] * n,
		e[2] + t[2] * n
	];
}
function f(e, t) {
	return e[0] * t[0] + e[1] * t[1] + e[2] * t[2];
}
function p(e, t) {
	return [
		e[1] * t[2] - e[2] * t[1],
		e[2] * t[0] - e[0] * t[2],
		e[0] * t[1] - e[1] * t[0]
	];
}
function m(e) {
	return Math.hypot(e[0], e[1], e[2]);
}
function h(e) {
	let t = m(e);
	return t < 1e-9 ? [
		0,
		1,
		0
	] : [
		e[0] / t,
		e[1] / t,
		e[2] / t
	];
}
function g(e, t, n) {
	return [
		r(e[0], t[0], n),
		r(e[1], t[1], n),
		r(e[2], t[2], n)
	];
}
function _(e) {
	let n = h(p(e, Math.abs(e[1]) < .9 ? t : [
		1,
		0,
		0
	]));
	return {
		first: n,
		second: p(e, n)
	};
}
function v(e, t) {
	let n = h(d(e.first, t, -f(e.first, t)));
	return {
		first: n,
		second: p(t, n)
	};
}
function y({ withColors: e = !1 } = {}) {
	let t = [], n = [], r = [], i = [], a = [];
	return {
		get vertexCount() {
			return t.length / 3;
		},
		get triangleCount() {
			return a.length / 3;
		},
		addVertex(a, o, s, c, l = [
			1,
			1,
			1
		]) {
			return t.push(a[0], a[1], a[2]), n.push(o[0], o[1], o[2]), r.push(s, c), e && i.push(l[0], l[1], l[2]), t.length / 3 - 1;
		},
		addTriangle(e, t, n) {
			e !== t && t !== n && e !== n && a.push(e, t, n);
		},
		build() {
			let o = {
				positions: new Float32Array(t),
				normals: new Float32Array(n),
				uvs: new Float32Array(r),
				indices: new Uint32Array(a)
			};
			return e && (o.colors = new Float32Array(i)), o;
		}
	};
}
var b = 1.5, x = .25;
function S(e) {
	return e >= b ? Math.round(e) : e;
}
function C(e, t) {
	let n = -e.first[1], r = -e.second[1];
	return Math.hypot(n, r) < x ? t : Math.atan2(r, n);
}
function w(t, n, r, i, a, o = [
	1,
	1,
	1
], { worldScaleUv: s = !1 } = {}) {
	let f = Math.max(1, Math.round(e * r[0] / a)), p = t.vertexCount, g = n.length - 1, y = null, b = 0, x = 0;
	n.forEach((p, w) => {
		let T = h(l(n[Math.min(w + 1, g)], n[Math.max(w - 1, 0)]));
		y = y ? v(y, T) : _(T);
		let E = e * r[w] / a, D = s ? S(E) : f, O = s && E > 1e-6 ? D / E : 1;
		w > 0 && (b += m(l(p, n[w - 1])) / a * O), s && (x = C(y, x));
		for (let n = 0; n <= i; n++) {
			let a = x + n / i * e, s = c(u(y.first, Math.cos(a)), u(y.second, Math.sin(a)));
			t.addVertex(d(p, s, r[w]), s, n / i * D, b, o);
		}
	});
	let w = i + 1;
	for (let e = 0; e < g; e++) for (let n = 0; n < i; n++) {
		let r = p + e * w + n, i = r + w;
		t.addTriangle(r, r + 1, i), t.addTriangle(r + 1, i + 1, i);
	}
}
function T(e, t, n, r, i) {
	return h(c(c(n, u(r, e)), u(i, t)));
}
function E(e, n) {
	let r = p(e, t), i = m(r) < 1e-4 ? _(e).first : h(r), a = c(u(i, Math.cos(n)), u(p(e, i), Math.sin(n)));
	return {
		forward: e,
		right: a,
		normal: p(a, e)
	};
}
function D(e, t) {
	let { origin: n, frame: r, length: i, width: a, rows: o, droop: s = 0, fold: l = 0, canopyNormal: f, canopyBlend: p = .5, colorBase: m, colorTip: _, brightness: v = 1 } = t, y = l > 0 ? [
		-1,
		0,
		1
	] : [-1, 1], b = t.backFaces === !1 ? [1] : [1, -1];
	b.map((t) => o.map(([o, b]) => {
		let x = d(d(n, r.forward, i * o), r.normal, -s * i * o * o), S = a / 2 * b, C = 2 * s * o, w = m ? g(m, _ ?? m, o).map((e) => e * v) : [
			v,
			v,
			v
		], E = (n) => {
			let i = n * l, a = h(c(u(u(T(C, i, r.normal, r.forward, r.right), t), 1 - p), u(f, p))), s = n === 0 ? d(x, r.normal, l * S) : x;
			return e.addVertex(d(s, r.right, n * S), a, (n + 1) / 2, 1 - o, w);
		};
		if (S <= 0) {
			let e = E(0);
			return y.map(() => e);
		}
		return y.map(E);
	})).forEach((t, n) => {
		let r = b[n] > 0;
		for (let n = 0; n < o.length - 1; n++) for (let i = 0; i < y.length - 1; i++) {
			let a = t[n][i], o = t[n][i + 1], s = t[n + 1][i], c = t[n + 1][i + 1];
			r ? (e.addTriangle(a, o, s), e.addTriangle(o, c, s)) : (e.addTriangle(a, s, o), e.addTriangle(o, s, c));
		}
	});
}
export { u as _, w as a, m as b, _ as c, n as d, p as f, a as g, h, d as i, E as l, g as m, t as n, c as o, r as p, D as r, i as s, e as t, y as u, l as v, s as y };
