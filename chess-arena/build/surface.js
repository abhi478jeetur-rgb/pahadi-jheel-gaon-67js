/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { c as e, d as t, m as n, o as r, p as i, x as a, y as o } from "./vec3-BRYC6f_g.js";
import { p as s } from "./mat4-BCZClxna.js";
// src/surface-decal.js
var c = [
	[0, 1],
	[0, -1],
	[1, 1],
	[1, -1],
	[2, 1],
	[2, -1]
];
function l(e, t) {
	let [n, r, i] = t, a = Math.cos(n), o = Math.sin(n), s = Math.cos(r), c = Math.sin(r), l = Math.cos(i), u = Math.sin(i), d = a * l, f = a * u, p = o * l, m = o * u;
	return Float64Array.of(s * l, f + p * c, m - d * c, 0, -s * u, d - m * c, p + f * c, 0, c, -o * s, a * s, 0, e[0], e[1], e[2], 1);
}
function u(e) {
	return s(/* @__PURE__ */ new Float64Array(16), e);
}
function d(e, t, n) {
	let r = /* @__PURE__ */ new Float64Array(6);
	for (let i = 0; i < 6; i++) r[i] = e[i] + n * (t[i] - e[i]);
	return r;
}
function f(e, t, n, r, i) {
	let a = r * e[n] - i;
	return d(e, t, a / (a - (r * t[n] - i)));
}
function p(e, t, n, r) {
	let i = .5 * r[t], a = [];
	for (let r = 0; r < e.length; r += 3) {
		let o = [
			e[r],
			e[r + 1],
			e[r + 2]
		], s = o.map((e) => n * e[t] - i > 0), c = s.filter(Boolean).length;
		if (c === 0) a.push(...o);
		else if (c === 1) a.push(...m(o, s.indexOf(!0), t, n, i));
		else if (c === 2) {
			let e = s.indexOf(!1), r = o[e], c = o[(e + 1) % 3], l = o[(e + 2) % 3];
			a.push(r, f(r, c, t, n, i), f(r, l, t, n, i));
		}
	}
	return a;
}
function m(e, t, n, r, i) {
	let a = e[t], o = e[(t + 1) % 3], s = e[(t + 2) % 3], c = f(a, o, n, r, i), l = f(a, s, n, r, i);
	return t === 1 ? [
		l,
		o,
		s,
		o,
		l,
		c
	] : [
		o,
		s,
		c,
		l,
		c,
		s
	];
}
function h(e, t, n, r, o) {
	let s = u(r), l = [], d = /* @__PURE__ */ new Float64Array(3);
	for (let r of n) {
		let n = /* @__PURE__ */ new Float64Array(6);
		d.set(e.subarray(r * 3, r * 3 + 3)), a(d, d, s), n.set(d, 0), n.set(i(/* @__PURE__ */ new Float64Array(3), t.subarray(r * 3, r * 3 + 3)), 3), l.push(n);
	}
	for (let [e, t] of c) l = p(l, e, t, o);
	let f = {
		positions: new Float32Array(l.length * 3),
		normals: new Float32Array(l.length * 3),
		uvs: new Float32Array(l.length * 2)
	};
	return l.forEach((e, t) => {
		f.uvs[t * 2] = .5 + e[0] / o[0], f.uvs[t * 2 + 1] = .5 + e[1] / o[1], a(d, e.subarray(0, 3), r), f.positions.set(d, t * 3), f.normals.set(e.subarray(3, 6), t * 3);
	}), f;
}
// src/surface.js
var g = /* @__PURE__ */ new Set([
	"armor",
	"floor",
	"water",
	"foliage",
	"grass",
	"terrain",
	"fire",
	"smoke"
]), _ = /* @__PURE__ */ new Set([
	"position",
	"rotation",
	"size",
	"clearance",
	"maxAngle",
	"maxVertices",
	"maxTriangles"
]);
function v(e = 0, t = 0, n = 0) {
	return Float64Array.of(e, t, n);
}
function y(e, t) {
	if (typeof e != "number" || !Number.isFinite(e) || !Number.isFinite(Math.fround(e))) throw TypeError(`${t} must be a finite Float32 value.`);
	return Math.fround(e);
}
function b(e, t, n) {
	let r = e ?? t;
	if (!Array.isArray(r) && !ArrayBuffer.isView(r) || r.length !== 3) throw TypeError(`${n} requires three components.`);
	return Array.from(r, (e) => y(e, n));
}
function x(e, t, n) {
	if (!Number.isSafeInteger(e) || e < t || e > 1e6) throw RangeError(`${n} must be an integer within ${t} and 1000000.`);
	return e;
}
function S(e, t) {
	let n = e?.geometry;
	if (!n || typeof n != "object") throw TypeError("Surface patches require a target part with geometry.");
	if (e.skin || n.skinIndices !== void 0 || n.skinWeights !== void 0) throw RangeError("Surface patches cannot follow skinning. Use a static target.");
	if (e.morph || n.morphTargets !== void 0) throw RangeError("Surface patches cannot follow morphing. Use a static target.");
	if (e.assembly) throw RangeError("Surface patches cannot follow assembly shader offsets. Use a static target.");
	if (g.has(e.material?.tag)) throw RangeError("Surface patches require a standard material target without procedural deformation or shading.");
	let r = n.positions, i = n.normals, a = n.indices;
	if (!(a instanceof Uint32Array) || a.length === 0 || a.length % 3 != 0) throw TypeError("Target indices require a nonempty Uint32Array of triangles.");
	if (a.length / 3 > t) throw RangeError("Surface target exceeds maxTriangles. Reduce target detail or raise the limit.");
	if (!(r instanceof Float32Array) || r.length === 0 || r.length % 3 != 0 || r.length / 3 > t * 3) throw TypeError("Target positions require bounded nonempty Float32 XYZ vertices.");
	if (!(i instanceof Float32Array) || i.length !== r.length) throw TypeError("Target normals require matching Float32 XYZ vertices.");
	for (let e = 0; e < r.length; e += 3) {
		for (let t = 0; t < 3; t++) if (!Number.isFinite(r[e + t]) || !Number.isFinite(i[e + t])) throw RangeError("Surface target vertices and normals must remain finite.");
		let t = Math.hypot(i[e], i[e + 1], i[e + 2]);
		if (Math.abs(t - 1) > .001) throw RangeError("Surface target normals require unit vectors.");
	}
	for (let e of a) if (e >= r.length / 3) throw RangeError("Surface target index exceeds the vertex count.");
	return n;
}
function C(e, t) {
	return v(e[t * 3], e[t * 3 + 1], e[t * 3 + 2]);
}
function w(e) {
	let i = o(v(), e[1], e[0]), a = o(v(), e[2], e[0]), s = r(v(), i, a), c = t(s);
	return c === 0 ? null : n(s, s, 1 / c);
}
function T(t, n, r, i, o, s) {
	let c = [], l = Math.max(0, Math.cos(o)), u = 0, d = !1;
	for (let o = 0; o < t.indices.length; o += 3) {
		let f = [
			0,
			1,
			2
		].map((e) => t.indices[o + e]), p = f.map((e) => C(t.positions, e)), m = w(p);
		if (!m) continue;
		d = !0;
		let h = e(m, r);
		if (h <= 0 || h < l) continue;
		for (let n of f) if (e(C(t.normals, n), m) <= 0) throw RangeError("Surface target normals must face outward with their triangles.");
		let g = p.map((e) => a(v(), e, n)), _ = !1, y = 0;
		for (let e = 0; e < 3; e++) {
			let t = Math.min(g[0][e], g[1][e], g[2][e]), n = Math.max(g[0][e], g[1][e], g[2][e]), r = i[e] / 2;
			(t > r || n < -r) && (_ = !0), n > r && y++, t < -r && y++;
		}
		if (!_) {
			if (u += 3 * 2 ** y, u > s) throw RangeError("Surface clipping reservation exceeds maxVertices. Reduce the projector or raise the limit.");
			c.push(...f);
		}
	}
	if (!d) throw RangeError("Surface target has no drawable triangles.");
	if (c.length === 0) throw RangeError("Surface projector misses all outward-facing target triangles.");
	return c;
}
function E(n, i, a) {
	let s = n.positions, c = s.length / 3;
	if (c === 0) throw RangeError("Surface projector clips to an empty patch.");
	if (c > a) throw RangeError("Surface output exceeds maxVertices.");
	let l = new Float32Array(s), u = new Float32Array(n.normals), d = new Float32Array(n.uvs);
	for (let e = 0; e < c; e++) {
		let t = e * 3, n = Math.hypot(u[t], u[t + 1], u[t + 2]);
		if (!Number.isFinite(n) || n === 0) throw RangeError("Surface projection produced an invalid normal.");
		let r = 0;
		for (let e = 0; e < 3; e++) {
			if (u[t + e] /= n, l[t + e] = s[t + e] + u[t + e] * i, !Number.isFinite(l[t + e])) throw RangeError("Surface clearance exceeds finite Float32 coordinates.");
			r += (l[t + e] - s[t + e]) * u[t + e];
		}
		if (i > 0 && r <= 0) throw RangeError("Surface clearance collapses at Float32 precision. Increase clearance or center the target locally.");
		for (let t = 0; t < 2; t++) {
			let n = d[e * 2 + t];
			if (!Number.isFinite(n) || n < -1e-6 || n > 1 + 1e-6) throw RangeError("Surface projection produced invalid projector UVs.");
		}
	}
	let f = [];
	for (let n = 0; n < c; n += 3) {
		let a = [
			0,
			1,
			2
		].map((e) => C(s, n + e)), c = w(a);
		if (!c) continue;
		if (i > 0) for (let t = 0; t < 3; t++) {
			let r = o(v(), C(l, n + t), a[t]);
			if (e(r, c) <= 0) throw RangeError("Surface clearance cannot create a positive triangle-plane gap at Float32 precision. Increase clearance or center the target locally.");
		}
		let u = [
			0,
			1,
			2
		].map((e) => C(l, n + e)), d = o(v(), u[1], u[0]), p = o(v(), u[2], u[0]), m = r(v(), d, p);
		if (t(m) === 0 || e(m, c) <= 0) throw RangeError("Surface clearance collapses or reverses a triangle. Reduce clearance.");
		f.push(n, n + 1, n + 2);
	}
	if (f.length === 0) throw RangeError("Surface output has no drawable triangles at Float32 precision.");
	return {
		positions: l,
		normals: u,
		uvs: d,
		indices: new Uint32Array(f)
	};
}
function D(e, t = {}) {
	if (!t || typeof t != "object" || Array.isArray(t)) throw TypeError("Surface options require an object.");
	for (let e of Object.keys(t)) if (!_.has(e)) throw TypeError(`Unsupported surface option ${e}.`);
	let n = b(t.position, [
		0,
		0,
		0
	], "position"), r = b(t.rotation, [
		0,
		0,
		0
	], "rotation").map((e) => e % (Math.PI * 2)), a = b(t.size, [
		1,
		1,
		1
	], "size");
	if (a.some((e) => e <= 0)) throw RangeError("Surface projector size must stay positive after Float32 conversion.");
	let o = y(t.clearance ?? .001, "clearance");
	if (o < 0) throw RangeError("Surface clearance must be nonnegative.");
	if (t.clearance > 0 && o === 0) throw RangeError("Surface clearance collapses at Float32 precision. Increase clearance.");
	let s = t.maxAngle ?? Math.PI / 2;
	if (!Number.isFinite(s) || s <= 0 || s > Math.PI / 2) throw RangeError("maxAngle must be greater than zero and at most PI/2.");
	let c = x(t.maxVertices ?? 25e4, 3, "maxVertices"), d = S(e, x(t.maxTriangles ?? 25e4, 1, "maxTriangles")), f = l(n, r), p = i(v(), v(f[8], f[9], f[10])), m = T(d, u(f), p, a, s, c);
	return E(h(d.positions, d.normals, m, f, a), o, c);
}
export { D as createSurfacePatch };
