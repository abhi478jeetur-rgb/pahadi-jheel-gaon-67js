/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { f as e, h as t, p as n, r } from "./mat4-BCZClxna.js";
import { c as i, d as a, h as o, m as s, o as c, p as l, s as u, t as d, x as f, y as p } from "./vec3-BRYC6f_g.js";
import { a as m, i as h, n as g, r as _, t as v } from "./triangle-bvh-MJBX52tQ.js";
import { a as y, i as b, n as x, o as S, r as C, t as w } from "./triangle-math-CatOnS0A.js";
// src/mesh-query.js
var T = /* @__PURE__ */ new WeakMap(), E = 1e-9, D = /* @__PURE__ */ new Set([
	"maxTriangles",
	"maxVertices",
	"memoryBudgetMiB",
	"solid",
	"maxValidationPairs"
]), O = /* @__PURE__ */ new Set(["mode", "maxTriangleTests"]), k = /* @__PURE__ */ new Set(["maxDistance", "maxTriangleTests"]), A = /* @__PURE__ */ new Set([
	"origin",
	"direction",
	"maxDistance",
	"maxTriangleTests"
]), j = [
	[
		0,
		0,
		1
	],
	[
		1,
		.41421356237,
		.73205080757
	],
	[
		.61803398875,
		1,
		.27182818285
	],
	[
		.17320508075,
		.4472135955,
		1
	],
	[
		-1,
		.31622776602,
		.14142135624
	],
	[
		.22360679775,
		-1,
		.70710678118
	]
];
function M(e = 0, t = 0, n = 0) {
	return Float64Array.of(e, t, n);
}
function N() {
	return e(/* @__PURE__ */ new Float64Array(16));
}
function P(e, t) {
	if (!e || typeof e != "object" || Array.isArray(e)) throw TypeError("Query options require an object.");
	for (let n of Object.keys(e)) if (!t.has(n)) throw TypeError(`Unsupported query option ${n}.`);
}
function F(e, t, n) {
	if (!Number.isSafeInteger(e) || e < 1 || e > t) throw RangeError(`${n} requires an integer within one and ${t}.`);
	return e;
}
function I(e, t) {
	let n = 0;
	return {
		charge() {
			if (n++, n > e) throw RangeError(`${t} exhausted. Raise the query budget or reduce geometry detail.`);
		},
		get tests() {
			return n;
		}
	};
}
function L(e) {
	let t = T.get(e);
	if (!t) throw TypeError("Use an index from createMeshQueryIndex().");
	if (t.disposed) throw Error("Mesh query index was disposed. Create a new index.");
	return t;
}
function R(e) {
	return (Array.isArray(e) || ArrayBuffer.isView(e)) && e.length === 3 && Array.from(e).every((e) => typeof e == "number" && Number.isFinite(e) && Number.isFinite(Math.fround(e)));
}
function ee(e, t) {
	let n = new Float64Array(e.length), r = M();
	for (let i = 0; i < e.length; i += 3) r[0] = e[i], r[1] = e[i + 1], r[2] = e[i + 2], f(r, r, t), n.set(r, i);
	return n;
}
function z(e, t) {
	let n = Float64Array.of(Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity), r = M();
	for (let i = 0; i < 8; i++) {
		r[0] = e[i & 1 ? 3 : 0], r[1] = e[i & 2 ? 4 : 1], r[2] = e[i & 4 ? 5 : 2], f(r, r, t);
		for (let e = 0; e < 3; e++) n[e] = Math.min(n[e], r[e]), n[3 + e] = Math.max(n[3 + e], r[e]);
	}
	return n;
}
function te(e, t) {
	for (let n = 0; n < 3; n++) if (t[n] < e[n] || t[n] > e[3 + n]) return !1;
	return !0;
}
function ne(e, t) {
	for (let n = 0; n < 3; n++) if (e[n] > t[3 + n] || t[n] > e[3 + n]) return !1;
	return !0;
}
function re(e, t) {
	return M(t[0] * e[0] + t[4] * e[1] + t[8] * e[2], t[1] * e[0] + t[5] * e[1] + t[9] * e[2], t[2] * e[0] + t[6] * e[1] + t[10] * e[2]);
}
function B(e) {
	return Math.hypot(...[
		0,
		1,
		2,
		4,
		5,
		6,
		8,
		9,
		10
	].map((t) => e[t]));
}
function V(e) {
	return Math.max(...Array.from(e, Math.abs));
}
function H(e, t, n, r, i) {
	let a = ee(t.positions, n), o = /* @__PURE__ */ new Float64Array(9), s = /* @__PURE__ */ new Float64Array(9);
	return h(e.bvh, t.bvh, a, (n, c) => (r.charge(), b(e.positions, e.bvh.indices, n, o), b(a, t.bvh.indices, c, s), i(o, s, n, c)));
}
function ie(e, t, n) {
	if (!e || typeof e != "object") throw TypeError("Mesh queries require geometry.");
	if (e.skinIndices !== void 0 || e.skinWeights !== void 0 || e.morphTargets !== void 0) throw RangeError("Mesh queries require static geometry without skinning or morph targets.");
	let r = e.positions, i = e.indices;
	if (!(r instanceof Float32Array) || r.length === 0 || r.length % 3 != 0) throw TypeError("Query positions require nonempty Float32 XYZ vertices.");
	if (!(i instanceof Uint32Array) || i.length === 0 || i.length % 3 != 0) throw TypeError("Query indices require nonempty Uint32 triangles.");
	if (r.length / 3 > t || i.length / 3 > n) throw RangeError("Geometry exceeds maxVertices or maxTriangles.");
	let a = [
		Infinity,
		Infinity,
		Infinity
	], o = [
		-Infinity,
		-Infinity,
		-Infinity
	];
	for (let e = 0; e < r.length; e += 3) for (let t = 0; t < 3; t++) {
		let n = r[e + t];
		if (!Number.isFinite(n)) throw RangeError("Query positions must remain finite.");
		a[t] = Math.min(a[t], n), o[t] = Math.max(o[t], n);
	}
	for (let e of i) if (e >= r.length / 3) throw RangeError("Query index exceeds the vertex count.");
	let s = M(...a.map((e, t) => (e + o[t]) / 2)), c = Math.max(...o.map((e, t) => e - a[t]));
	if (c === 0) throw RangeError("Query geometry has no drawable extent.");
	return {
		center: s,
		scale: c,
		minimumAltitude: ae(r, i, c),
		vertexCount: r.length / 3,
		triangleCount: i.length / 3
	};
}
function ae(e, t, n) {
	let r = M(), i = M(), o = M(), s = M(), l = Infinity;
	for (let u = 0; u < t.length; u += 3) {
		let d = t[u] * 3;
		for (let a = 0; a < 3; a++) r[a] = (e[t[u + 1] * 3 + a] - e[d + a]) / n, i[a] = (e[t[u + 2] * 3 + a] - e[d + a]) / n;
		p(o, r, i);
		let f = Math.max(a(r), a(i), a(o));
		c(s, r, i);
		let m = a(s) / f;
		if (!Number.isFinite(m) || m <= 1e-8) throw RangeError("Query triangle is degenerate or below the normalized precision domain.");
		l = Math.min(l, m);
	}
	return l;
}
function oe(e) {
	let t = new Uint32Array(e.positions.length / 3), n = /* @__PURE__ */ new Map();
	for (let r = 0; r < t.length; r++) {
		let i = r * 3, a = Array.from(e.positions.subarray(i, i + 3), (e) => e === 0 ? 0 : e).join(",");
		n.has(a) || n.set(a, n.size), t[r] = n.get(a);
	}
	let r = Uint32Array.from(e.indices, (e) => t[e]), i = /* @__PURE__ */ new Map(), a = Array.from({ length: r.length / 3 }, () => []), o = Array.from({ length: n.size }, () => []);
	for (let e = 0; e < r.length / 3; e++) {
		let t = Array.from(r.subarray(e * 3, e * 3 + 3));
		for (let n = 0; n < 3; n++) {
			let r = t[n], a = t[(n + 1) % 3];
			o[r].push(e);
			let s = `${Math.min(r, a)}:${Math.max(r, a)}`;
			i.has(s) || i.set(s, []), i.get(s).push({
				first: r,
				second: a,
				face: e
			});
		}
	}
	for (let e of i.values()) {
		if (e.length !== 2 || e[0].first !== e[1].second || e[0].second !== e[1].first) throw RangeError("Solid geometry requires closed oriented manifold edges after exact position welding.");
		a[e[0].face].push(e[1].face), a[e[1].face].push(e[0].face);
	}
	let s = /* @__PURE__ */ new Set([0]), c = [0];
	for (; c.length;) for (let e of a[c.pop()]) s.has(e) || (s.add(e), c.push(e));
	if (s.size !== r.length / 3) throw RangeError("Solid geometry requires one connected boundary.");
	for (let e = 0; e < o.length; e++) {
		if (o[e].length === 0) continue;
		let t = /* @__PURE__ */ new Map();
		for (let n of o[e]) {
			let i = Array.from(r.subarray(n * 3, n * 3 + 3)).filter((t) => t !== e);
			for (let e = 0; e < 2; e++) t.has(i[e]) || t.set(i[e], []), t.get(i[e]).push(i[1 - e]);
		}
		if (Array.from(t.values()).some((e) => e.length !== 2)) throw RangeError("Solid geometry requires manifold vertex links.");
		let n = /* @__PURE__ */ new Set(), i = [t.keys().next().value];
		for (; i.length;) {
			let e = i.pop();
			n.has(e) || (n.add(e), i.push(...t.get(e)));
		}
		if (n.size !== t.size) throw RangeError("Solid geometry requires a single cycle at each vertex link.");
	}
	return r;
}
function U(e, t) {
	return p(M(), e, t);
}
function W(e, t) {
	return M(e[t * 3], e[t * 3 + 1], e[t * 3 + 2]);
}
function G(e, t, n, r, a) {
	let o = U(t, e), s = U(n, e), l = U(r, e), u = M(), d = i(c(u, o, s), a), f = i(c(u, l, s), a) / d, p = i(c(u, o, l), a) / d;
	return f >= -1e-9 && p >= -1e-9;
}
function se(e, t, n) {
	let r = I(n, "maxValidationPairs"), o = /* @__PURE__ */ new Float64Array(6);
	return H(e, e, N(), r, (e, n, r, s) => {
		if (r >= s || !S(e, n, o)) return !1;
		let l = Array.from(t.subarray(r * 3, r * 3 + 3)), d = Array.from(t.subarray(s * 3, s * 3 + 3)), f = l.filter((e) => d.includes(e));
		if (f.length === 0 || f.length === 3) throw RangeError("Solid boundary intersects itself.");
		let p = [
			0,
			1,
			2
		].map((t) => W(e, t)), m = [
			0,
			1,
			2
		].map((e) => W(n, e)), h = y(e, M()), g = y(n, M()), _ = a(c(M(), h, g)) <= E;
		if (f.length === 2) {
			if (_) {
				let e = p[l.indexOf(f[0])], t = U(p[l.indexOf(f[1])], e), n = U(p[l.findIndex((e) => !f.includes(e))], e), r = U(m[d.findIndex((e) => !f.includes(e))], e);
				if (i(c(M(), t, n), h) * i(c(M(), t, r), h) >= 0) throw RangeError("Solid adjacent faces overlap or have ambiguous coplanar sides.");
			}
			return !1;
		}
		let v = p[l.indexOf(f[0])];
		if (!_) {
			let e = o.subarray(0, 3), t = o.subarray(3, 6);
			if (u(e, v) > E || u(t, v) > E) throw RangeError("Solid faces intersect beyond their shared vertex.");
			return !1;
		}
		let b = p.filter((e, t) => l[t] !== f[0]), x = m.filter((e, t) => d[t] !== f[0]);
		if (x.some((e) => G(v, ...b, e, h)) || b.some((e) => G(v, ...x, e, g))) throw RangeError("Solid coplanar faces intersect beyond their shared vertex.");
		return !1;
	}), r.tests;
}
function K(e, t) {
	let n = e.matrixCache;
	if (n && ArrayBuffer.isView(t) === n.typed && t.length === 16 && n.source.every((e, n) => e === t[n])) return n.state;
	let r = ce(e, t);
	return e.matrixCache = {
		source: Array.from(t),
		typed: ArrayBuffer.isView(t),
		state: r
	}, r;
}
function ce(e, i) {
	if (!Array.isArray(i) && !ArrayBuffer.isView(i) || i.length !== 16) throw TypeError("Query matrix requires 16 affine components.");
	let a = Array.from(i, (e) => {
		if (typeof e != "number" || !Number.isFinite(e) || !Number.isFinite(Math.fround(e))) throw RangeError("Query matrix requires finite Float32 components.");
		return Math.fround(e);
	});
	if (a[3] !== 0 || a[7] !== 0 || a[11] !== 0 || a[15] !== 1) throw RangeError("Query matrix must be affine.");
	let o = t(N(), Float64Array.from(a), e.normalization), s = r(o);
	if (!Number.isFinite(s) || s === 0) throw RangeError("Query matrix must be nonsingular.");
	let c = n(N(), o);
	if (!c || !c.every(Number.isFinite)) throw RangeError("Query matrix inverse exceeds the precision domain.");
	let l = z(e.bounds, o);
	if (!l.every((e) => Number.isFinite(e) && Number.isFinite(Math.fround(e)))) throw RangeError("Query world coordinates exceed finite Float32 bounds.");
	let u = V(l) * 2 ** -21 + 2 ** -149;
	if (e.minimumAltitude / B(c) <= u) throw RangeError("Query transformed triangles collapse within the Float32 precision domain.");
	return {
		matrix: o,
		inverse: c,
		bounds: l
	};
}
function q(e, t) {
	let r = n(N(), t), i = r ? B(r) : 0, a = V(z(e.bounds, t));
	if (!Number.isFinite(a) || a > 1e6 || e.minimumAltitude / i <= 1e-8) throw RangeError("Relative mesh transform exceeds the normalized triangle precision domain.");
}
function J(e, t, n) {
	if (!te(e.bounds, t)) return {
		inside: !1,
		attempts: 0
	};
	let r = /* @__PURE__ */ new Float64Array(9), a = M(), s = M(), c = M(), u, d = 0, f = 0;
	for (let p of j) {
		f++;
		let h = l(M(), p), g = 0, v = !1;
		if (m(e.bvh, (e, n) => _(t, h, e, n), (e) => Number.isFinite(e), (l) => {
			n.charge(), b(e.positions, e.bvh.indices, l, r), y(r, a);
			let u = U(t, W(r, 0));
			if (Math.abs(i(a, h)) <= E && Math.abs(i(a, u)) <= E) return v = !0, !0;
			let d = C(t, h, r);
			return d < 0 ? !1 : (o(s, t, h, d), w(s, r, c), d <= E || Math.min(c[0], c[1], c[2]) <= E ? (v = !0, !0) : (g++, !1));
		}), v) continue;
		let x = g % 2 == 1;
		if (d && u !== x) throw RangeError("Solid containment has inconsistent ray witnesses.");
		if (u = x, d++, d === 2) return {
			inside: x,
			attempts: f
		};
	}
	throw RangeError("Solid containment is indeterminate after bounded ray retries.");
}
function Y(e, t) {
	if (!R(e)) throw TypeError(`${t} requires three finite Float32-representable components.`);
	return M(...e);
}
function X(e, t, n, r) {
	let i = Y(t, "Query point"), c = s(M(), U(i, e.center), 1 / e.scale);
	if (V(c) > 1e6) throw RangeError("Query point exceeds the normalized precision domain.");
	let f = r.maxDistance ?? Infinity;
	if (f !== Infinity && (!Number.isFinite(f) || !Number.isFinite(Math.fround(f))) || f < 0) throw RangeError("maxDistance must be nonnegative and Float32-representable, or Infinity.");
	let p = I(F(r.maxTriangleTests ?? 2e6, 1e8, "maxTriangleTests"), "maxTriangleTests"), h;
	if (n !== void 0) {
		let e = Y(n, "Projection direction");
		if (a(e) === 0) throw RangeError("Projection direction must be nonzero.");
		h = l(e, e);
	}
	let v = f / e.scale, S = f, T = Infinity, D, O, k, A = /* @__PURE__ */ new Float64Array(9), j = M(), N = M();
	if (m(e.bvh, (e, t) => h ? _(c, h, e, t) : g(c, e, t), (e) => Number.isFinite(e) && e <= v + E, (t) => {
		if (p.charge(), b(e.positions, e.bvh.indices, t, A), h) {
			let e = C(c, h, A);
			if (e < 0) return !1;
			o(j, c, h, e);
		} else x(c, A, j);
		let n = u(j, c);
		if (!Number.isFinite(n)) throw RangeError("Surface query exceeds the numerical precision domain.");
		d(N, s(N, j, e.scale), e.center);
		let r = u(N, i);
		if (r > S || r === S && t >= T) return !1;
		let l = w(j, A, M()), f = y(A, M());
		if (!l || !l.every(Number.isFinite) || a(f) === 0) throw RangeError("Surface query has invalid triangle coordinates.");
		return v = n, S = r, T = t, D = Float64Array.from(N), k = l, O = f, !1;
	}), !D) return {
		hit: null,
		triangleTests: p.tests
	};
	let P = S;
	if (!Number.isFinite(P) || !D.every((e) => Number.isFinite(Math.fround(e)))) throw RangeError("Surface query hit exceeds finite Float32 coordinates.");
	return {
		hit: {
			point: Array.from(D),
			distance: P,
			triangle: T,
			barycentric: Array.from(k),
			normal: Array.from(O)
		},
		triangleTests: p.tests
	};
}
function le(e, t, n) {
	let r = /* @__PURE__ */ new Float64Array(9), i = Infinity, a = -1;
	return m(e.bvh, (e, r) => _(t, n, e, r), (e) => Number.isFinite(e) && e <= i, (o) => {
		b(e.positions, e.bvh.indices, o, r);
		let s = C(t, n, r);
		return s >= 0 && s < i && (i = s, a = o), !1;
	}), a < 0 ? null : {
		triangle: a,
		point: o(M(), t, n, i)
	};
}
function Z(e, t) {
	let n = e[t];
	if (!R(n)) throw TypeError(`Ray ${t} requires three finite Float32 values.`);
	return M(...Array.from(n, Math.fround));
}
function ue(e, t, n) {
	let r = K(e, t);
	if (!n || typeof n != "object") throw TypeError("ray requires origin and direction.");
	let i = Z(n, "origin"), o = Z(n, "direction");
	if (a(o) === 0) throw RangeError("Ray direction must be nonzero.");
	let s = n.maxDistance ?? Infinity;
	if (s !== Infinity && !Number.isFinite(s) || s < 0) throw RangeError("Ray maxDistance must be nonnegative.");
	let c = f(M(), i, r.inverse), d = l(M(), re(l(M(), o), r.inverse));
	if (V(c) > 1e6) throw RangeError("Ray origin exceeds the normalized query precision domain.");
	let p = le(e, c, d);
	if (!p) return null;
	let m = f(M(), p.point, r.matrix), h = u(m, i);
	if (!Number.isFinite(h) || !m.every((e) => Number.isFinite(Math.fround(e)))) throw RangeError("Ray hit exceeds finite world coordinates.");
	if (h > s) return null;
	let g = /* @__PURE__ */ new Float64Array(9);
	b(e.positions, e.bvh.indices, p.triangle, g);
	let _ = w(p.point, g, M());
	if (!_ || !_.every(Number.isFinite)) throw RangeError("Ray barycentric coordinates exceed the query precision domain.");
	return {
		point: Array.from(m),
		distance: h,
		triangle: p.triangle,
		barycentric: Array.from(_)
	};
}
function Q(e, t) {
	let n = e.bvh.indices[0] * 3;
	return f(M(), e.positions.subarray(n, n + 3), t);
}
function $(e, t = {}) {
	P(t, D);
	let n = F(t.maxTriangles ?? 25e4, 1e6, "maxTriangles"), r = F(t.maxVertices ?? 25e4, 1e6, "maxVertices"), i = F(t.maxValidationPairs ?? 2e6, 1e8, "maxValidationPairs"), a = t.solid ?? !1;
	if (typeof a != "boolean") throw TypeError("solid must be boolean.");
	let o = t.memoryBudgetMiB ?? 64;
	if (!Number.isFinite(o) || o <= 0 || o > 1024) throw RangeError("memoryBudgetMiB must be within zero and 1024.");
	let s = ie(e, r, n), c = s.vertexCount * (a ? 152 : 24) + s.triangleCount * (a ? 512 : 128);
	if (c > o * 1024 * 1024) throw RangeError("Mesh query allocation estimate exceeds memoryBudgetMiB.");
	let l = a ? oe(e) : null, u = new Float64Array(e.positions.length);
	for (let t = 0; t < u.length; t += 3) for (let n = 0; n < 3; n++) u[t + n] = (e.positions[t + n] - s.center[n]) / s.scale;
	let d = Float64Array.of(s.scale, 0, 0, 0, 0, s.scale, 0, 0, 0, 0, s.scale, 0, s.center[0], s.center[1], s.center[2], 1), f = Float64Array.of(Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity);
	for (let e = 0; e < u.length; e += 3) for (let t = 0; t < 3; t++) f[t] = Math.min(f[t], u[e + t]), f[3 + t] = Math.max(f[3 + t], u[e + t]);
	let p = v(u, new Uint32Array(e.indices), {
		leafSize: 8,
		maxDepth: 64
	}), m = {
		...s,
		normalization: d,
		positions: u,
		bounds: f,
		bvh: p,
		disposed: !1,
		solid: a
	}, h = a ? se(m, l, i) : 0, g = Object.freeze({
		reservedBytes: c,
		memoryBudgetMiB: o,
		vertexCount: s.vertexCount,
		triangleCount: s.triangleCount,
		validationPairs: h
	}), _ = Object.freeze({
		solid: a,
		memoryPlan: g,
		info: Object.freeze({
			vertexCount: s.vertexCount,
			triangleCount: s.triangleCount,
			estimatedBytes: c
		}),
		nearest(e, t = {}) {
			return P(t, k), X(L(_), e, void 0, t);
		},
		project(e) {
			if (P(e, A), e.direction === void 0) throw TypeError("Projection requires direction.");
			return X(L(_), e.origin, e.direction, e);
		},
		raycast(e, t) {
			return ue(L(_), e, t);
		},
		dispose() {
			m.disposed || (m.disposed = !0, m.positions = null, m.bvh = null);
		}
	});
	return T.set(_, m), _;
}
function de(e, n, r = {}) {
	P(r, O);
	let i = L(e), a = L(n), o = r.mode ?? "surfaces";
	if (o !== "surfaces" && o !== "closed-solids") throw RangeError("Query mode must be surfaces or closed-solids.");
	if (o === "closed-solids" && (!i.solid || !a.solid)) throw RangeError("Closed-solid queries require two validated solid indices.");
	let s = F(r.maxTriangleTests ?? 2e6, 1e8, "maxTriangleTests");
	return Object.freeze({ evaluate(r, i) {
		let a = L(e), c = L(n), l = K(a, r), u = K(c, i), d = {
			kind: o === "surfaces" ? "surface-disjoint" : "separate",
			solidRelation: o === "surfaces" ? "not-tested" : "outside",
			triangles: null,
			triangleTests: 0,
			rayAttempts: 0
		};
		if (!ne(l.bounds, u.bounds)) return d;
		let f = t(N(), l.inverse, u.matrix), p = t(N(), u.inverse, l.matrix);
		q(c, f), q(a, p);
		let m = I(s, "maxTriangleTests");
		if (H(a, c, f, m, (e, t, n, r) => S(e, t) ? (d.triangles = [n, r], !0) : !1)) d.kind = "surface-intersection", d.solidRelation = o === "surfaces" ? "not-tested" : "boundaries-intersect";
		else if (o === "closed-solids") {
			let e = J(c, Q(a, p), m), t = J(a, Q(c, f), m);
			if (d.rayAttempts = e.attempts + t.attempts, e.inside && t.inside) throw RangeError("Solid containment witnesses are inconsistent.");
			(e.inside || t.inside) && (d.kind = "contained", d.solidRelation = e.inside ? "a-in-b" : "b-in-a");
		}
		return d.triangleTests = m.tests, d;
	} });
}
function fe({ positions: e, indices: t }) {
	return $({
		positions: Float32Array.from(e),
		indices: Uint32Array.from(t)
	});
}
export { de as createMeshPairQuery, $ as createMeshQueryIndex, fe as createTriangleSurfaceIndex };
