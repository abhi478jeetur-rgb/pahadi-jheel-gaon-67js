/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
// src/modeling-curve.js
var e = 1e-4;
function t(e, t) {
	return [
		e[0] - t[0],
		e[1] - t[1],
		e[2] - t[2]
	];
}
function n(e, t) {
	return [
		e[0] + t[0],
		e[1] + t[1],
		e[2] + t[2]
	];
}
function r(e, t) {
	return [
		e[1] * t[2] - e[2] * t[1],
		e[2] * t[0] - e[0] * t[2],
		e[0] * t[1] - e[1] * t[0]
	];
}
function i(e, t) {
	return e[0] * t[0] + e[1] * t[1] + e[2] * t[2];
}
function a(e) {
	return Math.sqrt(i(e, e));
}
function o(e) {
	let t = 1 / (a(e) || 1);
	return [
		e[0] * t,
		e[1] * t,
		e[2] * t
	];
}
function s(e, t, n) {
	let r = Math.cos(n), i = Math.sin(n), a = 1 - r, [o, s, c] = t, l = a * o, u = a * s;
	return [
		(l * o + r) * e[0] + (l * s - i * c) * e[1] + (l * c + i * s) * e[2],
		(l * s + i * c) * e[0] + (u * s + r) * e[1] + (u * c - i * o) * e[2],
		(l * c - i * s) * e[0] + (u * c + i * o) * e[1] + (a * c * c + r) * e[2]
	];
}
function c(e, n) {
	let r = t(e, n);
	return i(r, r);
}
function l(e, t, n, r, i, a, o) {
	let s = (t - e) / i - (n - e) / (i + a) + (n - t) / a, c = (n - t) / a - (r - t) / (a + o) + (r - n) / o;
	return s *= a, c *= a, [
		t,
		s,
		-3 * t + 3 * n - 2 * s - c,
		2 * t - 2 * n + s + c
	];
}
function u(r, i) {
	let s = r.length, u = (e) => {
		let a = (s - +!i) * e, o = Math.floor(a), u = a - o;
		i ? o += o > 0 ? 0 : (Math.floor(Math.abs(o) / s) + 1) * s : u === 0 && o === s - 1 && (o = s - 2, u = 1);
		let d = i || o > 0 ? r[(o - 1) % s] : n(t(r[0], r[1]), r[0]), f = r[o % s], p = r[(o + 1) % s], m = i || o + 2 < s ? r[(o + 2) % s] : n(t(r[s - 1], r[s - 2]), r[s - 1]), h = c(d, f) ** .25, g = c(f, p) ** .25, _ = c(p, m) ** .25;
		g < 1e-4 && (g = 1), h < 1e-4 && (h = g), _ < 1e-4 && (_ = g);
		let v = u * u, y = v * u;
		return [
			0,
			1,
			2
		].map((e) => {
			let [t, n, r, i] = l(d[e], f[e], p[e], m[e], h, g, _);
			return t + n * u + r * v + i * y;
		});
	}, d = [0], f = u(0), p = 0;
	for (let e = 1; e <= 200; e++) {
		let n = u(e / 200);
		p += a(t(n, f)), d.push(p), f = n;
	}
	let m = (e) => {
		let t = e * d[200], n = 0, r = 200;
		for (; n <= r;) {
			let e = Math.floor(n + (r - n) / 2), i = d[e] - t;
			if (i < 0) n = e + 1;
			else if (i > 0) r = e - 1;
			else {
				r = e;
				break;
			}
		}
		if (d[r] === t) return r / 200;
		let i = d[r + 1] - d[r];
		return (r + (t - d[r]) / i) / 200;
	};
	return {
		pointAtFraction: (e) => u(m(e)),
		tangentAt: (n) => {
			let r = m(n), i = u(Math.max(r - e, 0));
			return o(t(u(Math.min(r + e, 1)), i));
		}
	};
}
function d(e) {
	let t = e.map(Math.abs), n = 0;
	t[1] <= t[n] && (n = 1), t[2] <= t[n] && (n = 2);
	let i = [
		0,
		0,
		0
	];
	return i[n] = 1, r(e, o(r(e, i)));
}
function f(e, t) {
	let n = e.length - 1, c = [d(e[0])];
	for (let t = 1; t <= n; t++) {
		let n = c[t - 1], l = r(e[t - 1], e[t]);
		if (a(l) > 2 ** -52) {
			let r = Math.acos(Math.min(Math.max(i(e[t - 1], e[t]), -1), 1));
			n = s(n, o(l), r);
		}
		c.push(n);
	}
	if (t) {
		let t = Math.acos(Math.min(Math.max(i(c[0], c[n]), -1), 1));
		t /= n, i(e[0], r(c[0], c[n])) > 0 && (t = -t);
		for (let r = 1; r <= n; r++) c[r] = s(c[r], e[r], t * r);
	}
	return c.map((t, n) => ({
		normal: t,
		binormal: r(e[n], t)
	}));
}
function p(e, t, n) {
	let r = u(e, t), i = f(Array.from({ length: n + 1 }, (e, t) => r.tangentAt(t / n)), t);
	return i.map((e, a) => {
		let o = t && a === n ? 0 : a;
		return {
			point: r.pointAtFraction(o / n),
			...i[o]
		};
	});
}
// src/triangulate.js
function m(e, t, n) {
	return (t[0] - e[0]) * (n[1] - e[1]) - (t[1] - e[1]) * (n[0] - e[0]);
}
function h(e) {
	let t = 0;
	for (let n = 0, r = e.length - 1; n < e.length; r = n++) t += e[r][0] * e[n][1] - e[n][0] * e[r][1];
	return t / 2;
}
function g(e, t) {
	return e[0] === t[0] && e[1] === t[1];
}
function _(e, t, n, r) {
	let i = m(e, t, n), a = m(e, t, r), o = m(n, r, e), s = m(n, r, t);
	if (Math.sign(i) * Math.sign(a) < 0 && Math.sign(o) * Math.sign(s) < 0) return !0;
	let c = (e, t, n) => n[0] >= Math.min(e[0], t[0]) && n[0] <= Math.max(e[0], t[0]) && n[1] >= Math.min(e[1], t[1]) && n[1] <= Math.max(e[1], t[1]);
	return i === 0 && c(e, t, n) || a === 0 && c(e, t, r) || o === 0 && c(n, r, e) || s === 0 && c(n, r, t);
}
function v(e, t, n, r) {
	return m(e, t, n) > 0 ? m(t, n, r) > 0 && m(t, r, e) > 0 : !(m(t, e, r) > 0 && m(t, r, n) > 0);
}
function y(e, t, n, r, i, a) {
	for (let o of t) for (let t = 0; t < o.length; t++) {
		let s = o[t], c = o[(t + 1) % o.length];
		if (s !== i && c !== i && s !== a && c !== a && _(e[n], e[r], e[s], e[c])) return !0;
	}
	return !1;
}
function b(e, t, n, r) {
	let i = 0;
	for (let t = 1; t < r.length; t++) e[r[t]][0] > e[r[i]][0] && (i = t);
	let a = r[i], o = r[(i + r.length - 1) % r.length], s = r[(i + 1) % r.length], c = [...new Set(n)].map((t) => ({
		vertex: t,
		distance: Math.hypot(e[t][0] - e[a][0], e[t][1] - e[a][1])
	})).sort((e, t) => e.distance - t.distance);
	for (let { vertex: l } of c) if (v(e[o], e[a], e[s], e[l]) && !y(e, t, a, l, a, l)) for (let t = 0; t < n.length; t++) {
		if (n[t] !== l) continue;
		let o = e[n[(t + n.length - 1) % n.length]], s = e[n[(t + 1) % n.length]];
		if (!v(o, e[l], s, e[a])) continue;
		let c = r.map((e, t) => r[(i + t) % r.length]);
		n.splice(t + 1, 0, ...c, a, l);
		return;
	}
	throw RangeError("Triangulation could not connect a hole to the contour. Adjust the holes.");
}
function x(e, t, n) {
	let r = [t, ...n], i = [...t], a = n.map((e) => e.slice()).sort((t, n) => {
		let r = (t) => Math.max(...t.map((t) => e[t][0]));
		return r(n) - r(t);
	});
	for (let t of a) b(e, r, i, t);
	return i;
}
function S(e, t) {
	let n = t.length, r = Array.from({ length: n }, (e, t) => (t + n - 1) % n), i = Array.from({ length: n }, (e, t) => (t + 1) % n), a = [], o = (n) => e[t[n]], s = (e, t) => [
		r[t],
		t,
		i[t]
	].some((t) => g(o(e), o(t))), c = (e) => {
		let t = o(r[e]), n = o(e), a = o(i[e]);
		for (let c = i[i[e]]; c !== r[e]; c = i[c]) {
			if (s(c, e) || m(o(r[c]), o(c), o(i[c])) > 0) continue;
			let l = o(c);
			if (m(t, n, l) >= 0 && m(n, a, l) >= 0 && m(a, t, l) >= 0) return !0;
		}
		return !1;
	}, l = (e) => (i[r[e]] = i[e], r[i[e]] = r[e], r[e]), u = (e) => a.push([
		t[r[e]],
		t[e],
		t[i[e]]
	]), d = n, f = 0, p = 0;
	for (; d > 3;) {
		let e = m(o(r[f]), o(f), o(i[f])), t = p > d;
		if (e === 0) f = l(f), d--, p = 0;
		else if (e > 0 && (t || !c(f))) u(f), f = l(f), d--, p = 0;
		else if (f = i[f], p++, p > d * 2) throw RangeError("Triangulation failed. The contour or holes may touch or cross.");
	}
	return m(o(r[f]), o(f), o(i[f])) > 0 && u(f), a;
}
function ee(e, t) {
	let n = [...e, ...t.flat()], r = e.map((e, t) => t);
	h(e) < 0 && r.reverse();
	let i = e.length;
	return S(n, x(n, r, t.map((e) => {
		let t = e.map((e, t) => i + t);
		return i += e.length, h(e) > 0 && t.reverse(), t;
	})));
}
// src/modeling-shapes.js
var C = 1e-10;
function w(e, t, n) {
	let r = 1 / (Math.sqrt(e * e + t * t + n * n) || 1);
	return [
		e * r,
		t * r,
		n * r
	];
}
function T(e, t, n, r) {
	let i = [], a = [0, 0];
	for (let t = 0; t < e.length; t++) {
		if (t === e.length - 1) {
			i.push([a[0], a[1]]);
			break;
		}
		let n = [e[t + 1][1] - e[t][1], -(e[t + 1][0] - e[t][0])], r = t === 0 ? n : [n[0] + a[0], n[1] + a[1]], [o, s] = w(r[0], r[1], 0);
		i.push([o, s]), a = n;
	}
	let o = [], s = [], c = [];
	for (let a = 0; a <= t; a++) {
		let l = n + 1 / t * a * r, u = Math.sin(l), d = Math.cos(l);
		for (let n = 0; n < e.length; n++) o.push(e[n][0] * u, e[n][1], e[n][0] * d), c.push(a / t, n / (e.length - 1)), s.push(i[n][0] * u, i[n][1], i[n][0] * d);
	}
	let l = [];
	for (let n = 0; n < t; n++) for (let t = 0; t < e.length - 1; t++) {
		let r = t + n * e.length, i = r + e.length;
		l.push(r, i, r + 1, i + 1, r + 1, i);
	}
	return {
		positions: Float32Array.from(o),
		normals: Float32Array.from(s),
		uvs: Float32Array.from(c),
		indices: Uint32Array.from(l)
	};
}
function E(e, t, n, r, i) {
	let a = p(e, t, r), o = [], s = [], c = [];
	for (let { point: e, normal: t, binormal: r } of a) for (let a = 0; a <= i; a++) {
		let c = a / i * Math.PI * 2, l = Math.sin(c), u = -Math.cos(c), d = w(u * t[0] + l * r[0], u * t[1] + l * r[1], u * t[2] + l * r[2]);
		s.push(...d), o.push(e[0] + n * d[0], e[1] + n * d[1], e[2] + n * d[2]);
	}
	for (let e = 0; e <= r; e++) for (let t = 0; t <= i; t++) c.push(e / r, t / i);
	let l = [];
	for (let e = 1; e <= r; e++) for (let t = 1; t <= i; t++) {
		let n = (i + 1) * (e - 1) + (t - 1), r = (i + 1) * e + (t - 1), a = (i + 1) * e + t, o = (i + 1) * (e - 1) + t;
		l.push(n, r, o, r, a, o);
	}
	return {
		positions: Float32Array.from(o),
		normals: Float32Array.from(s),
		uvs: Float32Array.from(c),
		indices: Uint32Array.from(l)
	};
}
function D(e) {
	let t = e[0];
	for (let n = 1; n <= e.length; n++) {
		let r = n % e.length, i = e[r], a = i[0] - t[0], o = i[1] - t[1], s = Math.max(Math.abs(i[0]), Math.abs(i[1]), Math.abs(t[0]), Math.abs(t[1]));
		a * a + o * o <= C * C * s * s ? (e.splice(r, 1), n--) : t = i;
	}
}
function O(e, t, n) {
	let r = e[0] - t[0], i = e[1] - t[1], a = n[0] - e[0], o = n[1] - e[1], s = r * r + i * i, c = r * o - i * a, l, u, d;
	if (Math.abs(c) > 2 ** -52) {
		let c = Math.sqrt(s), f = Math.sqrt(a * a + o * o), p = t[0] - i / c, m = t[1] + r / c, h = n[0] - o / f, g = n[1] + a / f, _ = ((h - p) * o - (g - m) * a) / (r * o - i * a);
		l = p + r * _ - e[0], u = m + i * _ - e[1];
		let v = l * l + u * u;
		if (v <= 2) return [l, u];
		d = Math.sqrt(v / 2);
	} else {
		let e = !1;
		e = r > 2 ** -52 ? a > 2 ** -52 : r < -(2 ** -52) ? a < -(2 ** -52) : Math.sign(i) === Math.sign(o), e ? (l = -i, u = r, d = Math.sqrt(s)) : (l = r, u = i, d = Math.sqrt(s / 2));
	}
	return [l / d, u / d];
}
function te(e) {
	return e.map((t, n) => O(t, e[(n + e.length - 1) % e.length], e[(n + 1) % e.length]));
}
function ne(e) {
	let t = new Float32Array(e.length);
	for (let n = 0; n < e.length; n += 9) {
		let r = e[n] - e[n + 3], i = e[n + 1] - e[n + 4], a = e[n + 2] - e[n + 5], o = e[n + 6] - e[n + 3], s = e[n + 7] - e[n + 4], c = e[n + 8] - e[n + 5], l = Float32Array.from([
			s * a - c * i,
			c * r - o * a,
			o * i - s * r
		]), u = Float32Array.from(w(l[0], l[1], l[2]));
		for (let e = 0; e < 3; e++) t.set(u, n + e * 3);
	}
	return t;
}
function k(e, t, { depth: n, steps: r, bevel: i, bevelThickness: a, bevelSegments: o }) {
	let s = i > 0 || a > 0, c = s ? a : 0, l = s ? i : 0, u = s ? o : 0, d = e.map((e) => [...e]), f = t.map((e) => e.map((e) => [...e]));
	h(d) < 0 || d.reverse();
	for (let e of f) h(e) < 0 && e.reverse();
	D(d), f.forEach(D);
	let p = [d, ...f], m = p.flat(), g = p.flatMap(te), _ = [], v = (e, t) => _.push(m.map((n, r) => [
		n[0] + g[r][0] * e,
		n[1] + g[r][1] * e,
		t
	])), y = (e) => {
		let t = e / u;
		return {
			height: c * Math.cos(t * Math.PI / 2),
			distance: l * Math.sin(t * Math.PI / 2)
		};
	};
	for (let e = 0; e < u; e++) {
		let { height: t, distance: n } = y(e);
		v(n, -t);
	}
	let b = s ? l : 0;
	v(b, 0);
	for (let e = 1; e <= r; e++) v(b, n / r * e);
	for (let e = u - 1; e >= 0; e--) {
		let { height: t, distance: r } = y(e);
		v(r, n + t);
	}
	let x = ee(d, f), S = s ? r + u * 2 : r, C = [], w = [], T = (e, t) => C.push(..._[e][t]), E = (e) => {
		for (let t = e; t >= 1; t--) {
			let e = C.length - t * 3;
			w.push(C[e], C[e + 1]);
		}
	};
	for (let e of x) T(0, e[2]), T(0, e[1]), T(0, e[0]), E(3);
	for (let e of x) {
		for (let t of e) T(S, t);
		E(3);
	}
	let O = 0;
	for (let e of p) {
		for (let t = e.length - 1; t >= 0; t--) {
			let n = t === 0 ? e.length - 1 : t - 1;
			for (let e = 0; e < r + u * 2; e++) {
				let r = _[e][O + t], i = _[e][O + n], a = _[e + 1][O + n], o = _[e + 1][O + t];
				C.push(...r, ...i, ...o, ...i, ...a, ...o);
				let s = Math.abs(r[1] - i[1]) < Math.abs(r[0] - i[0]) ? 0 : 1, c = (e) => [e[s], 1 - e[2]];
				w.push(...c(r), ...c(i), ...c(o), ...c(i), ...c(a), ...c(o));
			}
		}
		O += e.length;
	}
	let k = Float32Array.from(C);
	return {
		positions: k,
		normals: ne(k),
		uvs: Float32Array.from(w),
		indices: null
	};
}
// src/modeling-bezier.js
var re = Math.cos(40 * Math.PI / 180), A = 1e-12;
function j(e, t) {
	return [
		e[0] + t[0],
		e[1] + t[1],
		e[2] + t[2]
	];
}
function M(e, t) {
	return [
		e[0] - t[0],
		e[1] - t[1],
		e[2] - t[2]
	];
}
function N(e, t) {
	return [
		e[0] * t,
		e[1] * t,
		e[2] * t
	];
}
function P(e) {
	return Math.hypot(e[0], e[1], e[2]);
}
function ie(e, t) {
	let n = e.length;
	return e.map((r, i) => {
		let a = e[t ? (i + n - 1) % n : Math.max(i - 1, 0)].position, o = e[t ? (i + 1) % n : Math.min(i + 1, n - 1)].position, s = t || i > 0 && i < n - 1 ? N(M(o, a), 1 / 6) : null, c = r.handleOut, l = r.handleIn;
		return !c && l && (c = M(N(r.position, 2), l)), !l && c && (l = M(N(r.position, 2), c)), c || (c = s ? j(r.position, s) : j(r.position, N(M(o, r.position), 1 / 3)), l = s ? M(r.position, s) : j(r.position, N(M(a, r.position), 1 / 3))), {
			position: r.position,
			handleIn: l,
			handleOut: c
		};
	});
}
function ae(e, t, n, r, i) {
	let a = 1 - i, o = [
		a ** 3,
		3 * a * a * i,
		3 * a * i * i,
		i ** 3
	];
	return [
		0,
		1,
		2
	].map((i) => o[0] * e[i] + o[1] * t[i] + o[2] * n[i] + o[3] * r[i]);
}
function F(e, t, n, r, i) {
	let a = 1 - i;
	return [
		0,
		1,
		2
	].map((o) => 3 * (a * a * (t[o] - e[o]) + 2 * a * i * (n[o] - t[o]) + i * i * (r[o] - n[o])));
}
function oe(e, t, n) {
	let r = t ? e.length : e.length - 1, i = [], a = [];
	for (let t = 0; t < r; t++) {
		let r = e[t], o = e[(t + 1) % e.length];
		for (let e = 0; e < n; e++) {
			let t = e / n;
			i.push(ae(r.position, r.handleOut, o.handleIn, o.position, t)), a.push(F(r.position, r.handleOut, o.handleIn, o.position, t));
		}
	}
	if (!t) {
		let t = e.at(-2), n = e.at(-1);
		i.push(n.position), a.push(F(t.position, t.handleOut, n.handleIn, n.position, 1));
	}
	return {
		points: i,
		tangents: se(i, a, t)
	};
}
function se(e, t, n) {
	let r = e.length;
	return t.map((e) => {
		let t = P(e);
		return t > A ? N(e, 1 / t) : null;
	}).map((t, i) => {
		if (t) return t;
		for (let t = 1; t < r; t++) {
			let a = n ? (i + t) % r : i + t;
			if (a >= r) break;
			let o = M(e[a], e[i]), s = P(o);
			if (s > A) return N(o, 1 / s);
		}
		throw RangeError("The curve has no length. Move its points apart.");
	});
}
function I(e) {
	return Array.from({ length: e }, (t, n) => {
		let r = n / e * Math.PI * 2;
		return [-Math.cos(r), Math.sin(r)];
	});
}
function ce(e) {
	let t = 0;
	for (let n = 0; n < e.length; n++) {
		let r = e[(n + 1) % e.length];
		t += e[n][0] * r[1] - r[0] * e[n][1];
	}
	return t;
}
function le(e) {
	let t = ce(e) < 0 ? [...e].reverse() : e, n = t.map((e, n) => {
		let r = t[(n + 1) % t.length], i = r[0] - e[0], a = r[1] - e[1], o = Math.hypot(i, a);
		if (o === 0) throw RangeError("The profile cannot repeat a point.");
		return [a / o, -i / o];
	}), r = (e, t) => {
		if (e[0] * t[0] + e[1] * t[1] < re) return null;
		let n = [e[0] + t[0], e[1] + t[1]], r = Math.hypot(n[0], n[1]);
		return [n[0] / r, n[1] / r];
	};
	return t.map((e, i) => {
		let a = (i + 1) % t.length, o = n[(i + t.length - 1) % t.length], s = n[i], c = n[a];
		return {
			start: t[i],
			end: t[a],
			startNormal: r(o, s) ?? s,
			endNormal: r(s, c) ?? s
		};
	});
}
function L(e, t) {
	if (!e) return 1;
	let n = t * (e.length - 1), r = Math.min(Math.floor(n), e.length - 2), i = n - r;
	return e[r] * (1 - i) + e[r + 1] * i;
}
function ue({ handles: e, closed: t, radius: n, taper: r, profile: i, resolution: a, radialSegments: o }) {
	let { points: s, tangents: c } = oe(e, t, a), l = s.length, u = f(t ? [...c, c[0]] : c, t), d = [0];
	for (let e = 1; e < l; e++) d.push(d[e - 1] + P(M(s[e], s[e - 1])));
	let p = t ? d[l - 1] + P(M(s[0], s[l - 1])) : d[l - 1], m = le(i ?? I(o)), h = [], g = [], _ = [], v = [], y = t ? l + 1 : l, b = m.length * 2;
	for (let e = 0; e < y; e++) {
		let t = e % l, { normal: i, binormal: a } = u[t], o = p > 0 ? d[t] / p : 0, c = e === l ? 1 : o, f = n * L(r, o), v = (e, n, r) => {
			for (let r = 0; r < 3; r++) h.push(s[t][r] + f * (e[0] * i[r] + e[1] * a[r])), g.push(n[0] * i[r] + n[1] * a[r]);
			_.push(c, r);
		};
		m.forEach((e, t) => {
			v(e.start, e.startNormal, t / m.length), v(e.end, e.endNormal, (t + 1) / m.length);
		});
	}
	for (let e = 1; e < y; e++) for (let t = 0; t < m.length; t++) {
		let n = (e - 1) * b + t * 2, r = e * b + t * 2;
		v.push(n, n + 1, r, r, n + 1, r + 1);
	}
	return t || (z(h, g, _, v, {
		ring: 0,
		tangent: N(c[0], -1),
		flip: !0,
		...R(m, u, s, n, r, 0)
	}), z(h, g, _, v, {
		ring: l - 1,
		tangent: c[l - 1],
		flip: !1,
		...R(m, u, s, n, r, 1)
	})), {
		positions: Float32Array.from(h),
		normals: Float32Array.from(g),
		uvs: Float32Array.from(_),
		indices: Uint32Array.from(v)
	};
}
function R(e, t, n, r, i, a) {
	let o = a === 0 ? 0 : n.length - 1;
	return {
		edges: e,
		frame: t[o],
		center: n[o],
		size: r * L(i, a)
	};
}
function z(e, t, n, r, { tangent: i, flip: a, edges: o, frame: s, center: c, size: l }) {
	let u = e.length / 3, d = o.reduce((e, t) => [e[0] + t.start[0], e[1] + t.start[1]], [0, 0]).map((e) => e / o.length), f = Math.max(...o.map((e) => Math.hypot(e.start[0], e.start[1]))) || 1, p = (r) => {
		for (let n = 0; n < 3; n++) e.push(c[n] + l * (r[0] * s.normal[n] + r[1] * s.binormal[n])), t.push(i[n]);
		n.push(.5 + r[0] * .5 / f, .5 + r[1] * .5 / f);
	};
	p(d), o.forEach((e) => p(e.start));
	for (let e = 0; e < o.length; e++) {
		let t = u + 1 + e, n = u + 1 + (e + 1) % o.length;
		a ? r.push(u, n, t) : r.push(u, t, n);
	}
}
// src/modeling.js
var B = 4096, V = 25e4;
function H(e, t) {
	if (!Number.isFinite(e) || !Number.isFinite(Math.fround(e))) throw TypeError(`${t} must be a finite float.`);
	return Math.fround(e);
}
function U(e, t, n, r) {
	if (!Number.isInteger(e) || e < t || e > n) throw RangeError(`${r} must be an integer within ${t} and ${n}.`);
	return e;
}
function W(e, t, n, r) {
	if (!Array.isArray(e) || e.length < n || e.length > B) throw RangeError(`${r} needs ${n} to ${B} points.`);
	let i = e.map((e) => {
		if (!Array.isArray(e) && !ArrayBuffer.isView(e) || e.length !== t) throw TypeError(`${r} points need ${t} components.`);
		return Array.from(e, (e) => H(e, r));
	});
	for (let e = 1; e < i.length; e++) if (i[e].every((t, n) => t === i[e - 1][n])) throw RangeError(`${r} cannot contain consecutive duplicate points.`);
	return i;
}
function G(e, t) {
	if (!Array.isArray(e) || e.length !== 3) throw TypeError(`${t} needs three components.`);
	return e.map((e) => H(e, t));
}
function de(e, t) {
	if (Array.isArray(e)) return { position: G(e, "point") };
	if (!e || typeof e != "object") throw TypeError(`Curve point ${t} must be [x, y, z] or an object with position.`);
	for (let t of Object.keys(e)) if (![
		"position",
		"handleIn",
		"handleOut"
	].includes(t)) throw TypeError(`Unknown curve point field: ${t}.`);
	return {
		position: G(e.position, "position"),
		...e.handleIn === void 0 ? {} : { handleIn: G(e.handleIn, "handleIn") },
		...e.handleOut === void 0 ? {} : { handleOut: G(e.handleOut, "handleOut") }
	};
}
function fe(e) {
	if (e === void 0) return null;
	if (!Array.isArray(e) || e.length < 2 || e.length > 64) throw RangeError("taper needs 2 to 64 radius factors.");
	return e.map((e) => {
		if (H(e, "taper"), e < 0) throw RangeError("taper factors cannot be negative.");
		return e;
	});
}
function K(e, t) {
	if (U(t, 3, 1e6, "maxVertices"), e > t) throw RangeError(`Modeling requires up to ${e} vertices, exceeding maxVertices ${t}. Reduce detail.`);
}
function q(e, t) {
	K(e.positions.length / 3, t);
	let { positions: n, normals: r, uvs: i } = e, a = e.indices ?? Uint32Array.from({ length: n.length / 3 }, (e, t) => t);
	for (let e = 0; e < r.length; e += 3) {
		let t = Math.hypot(r[e], r[e + 1], r[e + 2]);
		if (!Number.isFinite(t) || t === 0) throw RangeError("Modeling produced an invalid normal. Adjust the profile or contour.");
		for (let n = 0; n < 3; n++) r[e + n] /= t;
	}
	for (let e of n) if (!Number.isFinite(e)) throw RangeError("Modeling geometry exceeds the finite Float32 range. Reduce coordinates.");
	for (let e of i) if (!Number.isFinite(e)) throw RangeError("Modeling produced invalid UVs. Adjust the profile or contour.");
	let o = !1;
	for (let e = 0; e < a.length; e += 3) {
		let t = a[e] * 3, r = a[e + 1] * 3, i = a[e + 2] * 3, s = n[r] - n[t], c = n[r + 1] - n[t + 1], l = n[r + 2] - n[t + 2], u = n[i] - n[t], d = n[i + 1] - n[t + 1], f = n[i + 2] - n[t + 2];
		if (Math.hypot(c * f - l * d, l * u - s * f, s * d - c * u) > 0) {
			o = !0;
			break;
		}
	}
	if (!o) throw RangeError("Modeling collapsed at Float32 precision. Center geometry locally and position it with a transform.");
	return {
		positions: n,
		normals: r,
		uvs: i,
		indices: a
	};
}
function pe(e, { segments: t = 64, startAngle: n = 0, sweep: r = Math.PI * 2, maxVertices: i = V } = {}) {
	if (U(t, 3, 2048, "segments"), H(n, "startAngle"), n %= Math.PI * 2, H(r, "sweep"), r <= 0 || r > Math.PI * 2) throw RangeError("sweep must be greater than zero and at most one full turn.");
	let a = W(e, 2, 2, "profile");
	if (a.some((e) => e[0] < 0) || !a.some((e) => e[0] > 0)) throw RangeError("Profile radii must be nonnegative, with at least one positive radius.");
	return K((t + 1) * a.length, i), q(T(a, t, n, r), i);
}
function J(e, t, n) {
	return (t[0] - e[0]) * (n[1] - e[1]) - (t[1] - e[1]) * (n[0] - e[0]);
}
function Y(e, t, n) {
	return J(e, t, n) === 0 && n[0] >= Math.min(e[0], t[0]) && n[0] <= Math.max(e[0], t[0]) && n[1] >= Math.min(e[1], t[1]) && n[1] <= Math.max(e[1], t[1]);
}
function X(e, t, n, r) {
	let i = J(e, t, n), a = J(e, t, r), o = J(n, r, e), s = J(n, r, t);
	return Math.sign(i) !== Math.sign(a) && Math.sign(o) !== Math.sign(s) || i === 0 && Y(e, t, n) || a === 0 && Y(e, t, r) || o === 0 && Y(n, r, e) || s === 0 && Y(n, r, t);
}
function Z(e, t) {
	let n = W(e, 2, 3, t);
	if (n[0].every((e, t) => e === n.at(-1)[t]) && n.pop(), n.length < 3) throw RangeError(`${t} needs three distinct points.`);
	let r = 0;
	for (let e = 0; e < n.length; e++) {
		let i = (e + 1) % n.length;
		r += n[e][0] * n[i][1] - n[i][0] * n[e][1];
		for (let r = e + 1; r < n.length; r++) {
			let a = (r + 1) % n.length;
			if (r !== i && a !== e && X(n[e], n[i], n[r], n[a])) throw RangeError(`${t} cannot intersect or touch itself.`);
		}
	}
	if (r === 0) throw RangeError(`${t} must enclose a nonzero area.`);
	return n;
}
function Q(e, t) {
	let n = !1;
	for (let r = 0, i = t.length - 1; r < t.length; i = r++) {
		let a = t[r], o = t[i];
		a[1] > e[1] != o[1] > e[1] && e[0] < (o[0] - a[0]) * (e[1] - a[1]) / (o[1] - a[1]) + a[0] && (n = !n);
	}
	return n;
}
function $(e, t) {
	for (let n = 0; n < e.length; n++) for (let r = 0; r < t.length; r++) if (X(e[n], e[(n + 1) % e.length], t[r], t[(r + 1) % t.length])) return !0;
	return !1;
}
function me(e) {
	let { positions: t, normals: n, uvs: r, indices: i } = e, a = (e) => `${t[e * 3]},${t[e * 3 + 1]},${t[e * 3 + 2]}`, o = (e, t) => {
		let n = a(e), r = a(t);
		return n < r ? `${n}|${r}` : `${r}|${n}`;
	}, s = /* @__PURE__ */ new Map();
	for (let e = 0; e < i.length; e += 3) for (let t = 0; t < 3; t++) {
		let n = o(i[e + t], i[e + (t + 1) % 3]);
		s.set(n, (s.get(n) ?? 0) + 1);
	}
	let c = new Set([...s].filter(([, e]) => e !== 2).map(([e]) => e));
	if (c.size === 0) return e;
	let l = /* @__PURE__ */ new Map();
	for (let e = 0; e < i.length; e += 3) for (let t = 0; t < 3; t++) {
		let n = i[e + t], r = i[e + (t + 1) % 3];
		c.has(o(n, r)) && (l.set(a(n), n), l.set(a(r), r));
	}
	let u = Array.from(t), d = Array.from(n), f = Array.from(r), p = (e, n) => {
		let r = [
			u[e * 3],
			u[e * 3 + 1],
			u[e * 3 + 2]
		], i = [
			0,
			1,
			2
		].map((e) => u[n * 3 + e] - r[e]), a = i[0] ** 2 + i[1] ** 2 + i[2] ** 2, o = 1e-6 * Math.max(Math.sqrt(a), ...r.map(Math.abs)), s = [];
		for (let e of l.values()) {
			let n = [
				0,
				1,
				2
			].map((n) => t[e * 3 + n] - r[n]), c = (n[0] * i[0] + n[1] * i[1] + n[2] * i[2]) / a;
			c <= 1e-6 || c >= 1 - 1e-6 || Math.hypot(...n.map((e, t) => e - i[t] * c)) <= o && s.push({
				candidate: e,
				along: c
			});
		}
		return s.sort((e, t) => e.along - t.along);
	}, m = (e, n, { candidate: r, along: i }) => {
		let a = u.length / 3;
		for (let a = 0; a < 3; a++) u.push(t[r * 3 + a]), d.push(d[e * 3 + a] + (d[n * 3 + a] - d[e * 3 + a]) * i);
		for (let t = 0; t < 2; t++) f.push(f[e * 2 + t] + (f[n * 2 + t] - f[e * 2 + t]) * i);
		return a;
	}, h = [], g = [];
	for (let e = i.length - 3; e >= 0; e -= 3) g.push([
		i[e],
		i[e + 1],
		i[e + 2]
	]);
	for (; g.length;) {
		let e = g.pop(), t = !1;
		for (let n = 0; n < 3 && !t; n++) {
			let r = e[n], i = e[(n + 1) % 3], a = e[(n + 2) % 3];
			if (!c.has(o(r, i))) continue;
			let s = p(r, i);
			if (!s.length) continue;
			let l = [
				r,
				...s.map((e) => m(r, i, e)),
				i
			];
			for (let e = l.length - 2; e >= 0; e--) g.push([
				l[e],
				l[e + 1],
				a
			]);
			t = !0;
		}
		t || h.push(...e);
	}
	return {
		positions: Float32Array.from(u),
		normals: Float32Array.from(d),
		uvs: Float32Array.from(f),
		indices: Uint32Array.from(h)
	};
}
function he(e, { holes: t = [], depth: n = 1, steps: r = 1, bevel: i = 0, bevelThickness: a = i, bevelSegments: o = 3, maxVertices: s = V } = {}) {
	if (n = H(n, "depth"), i = H(i, "bevel"), a = H(a, "bevelThickness"), n <= 0 || i < 0 || a < 0) throw RangeError("depth must be positive and bevel dimensions must be nonnegative.");
	if (U(r, 1, 256, "steps"), U(o, 1, 32, "bevelSegments"), !Array.isArray(t) || t.length > 128) throw RangeError("holes must be an array with at most 128 rings.");
	if ((e?.length ?? 0) + t.reduce((e, t) => e + (t?.length ?? 0), 0) > B + t.length + 1) throw RangeError(`Contours and holes must contain at most ${B} total points.`);
	let c = Z(e, "contour"), l = t.map((e, t) => Z(e, `hole ${t}`)), u = c.length + l.reduce((e, t) => e + t.length, 0);
	if (u > B) throw RangeError(`Contours and holes must contain at most ${B} total points.`);
	let d = i > 0 || a > 0;
	K(6 * (u + l.length * 2 - 2) + 6 * u * (r + (d ? o * 2 : 0)), s);
	for (let e = 0; e < l.length; e++) {
		if (!Q(l[e][0], c) || $(c, l[e])) throw RangeError("Every hole must lie strictly inside the contour.");
		for (let t = 0; t < e; t++) if ($(l[e], l[t]) || Q(l[e][0], l[t]) || Q(l[t][0], l[e])) throw RangeError("Holes cannot overlap, touch or contain each other.");
	}
	return me(q(k(c, l, {
		depth: n,
		steps: r,
		bevel: i,
		bevelThickness: a,
		bevelSegments: o
	}), s));
}
function ge(e, { closed: t = !1, radius: n = .05, taper: r, profile: i, resolution: a = 12, radialSegments: o = 8, maxVertices: s = V } = {}) {
	if (n = H(n, "radius"), n <= 0 || typeof t != "boolean") throw RangeError("radius must be positive and closed must be boolean.");
	if (U(a, 1, 64, "resolution"), U(o, 3, 128, "radialSegments"), !Array.isArray(e) || e.length < (t ? 3 : 2) || e.length > 1024) throw RangeError(`points needs ${t ? 3 : 2} to 1024 entries.`);
	let c = e.map(de), l = i === void 0 ? null : W(i, 2, 3, "profile");
	if (l && l.length > 256) throw RangeError("profile needs 3 to 256 points.");
	let u = l ? l.length : o;
	return K(((t ? c.length : c.length - 1) * a + 1) * u * 2 + (t ? 0 : 2 * (u + 1)), s), q(ue({
		handles: ie(c, t),
		closed: t,
		radius: n,
		taper: fe(r),
		profile: l,
		resolution: a,
		radialSegments: o
	}), s);
}
function _e(e, { radius: t = .1, segments: n = 64, radialSegments: r = 12, closed: i = !1, maxVertices: a = V } = {}) {
	if (t = H(t, "radius"), t <= 0 || typeof i != "boolean") throw RangeError("radius must be positive and closed must be boolean.");
	U(n, 3, 2048, "segments"), U(r, 3, 128, "radialSegments");
	let o = W(e, 3, i ? 3 : 2, "path");
	if (i && o[0].every((e, t) => e === o.at(-1)[t]) && o.pop(), o.length < (i ? 3 : 2)) throw RangeError("The path has too few distinct points.");
	return K((n + 1) * (r + 1), a), q(E(o, i, t, n, r), a);
}
export { _e as i, he as n, pe as r, ge as t };
