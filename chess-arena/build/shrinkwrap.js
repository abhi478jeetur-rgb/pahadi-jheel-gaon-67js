/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { r as e } from "./mat3-BUCH0Dej.js";
import { f as t, r as n } from "./mat4-BCZClxna.js";
import { b as r, c as i, d as a, o, p as s, s as c, t as l, x as u, y as d } from "./vec3-BRYC6f_g.js";
import { createMeshQueryIndex as f } from "./mesh-query.js";
import { t as p } from "./geometry-normals-DRzK4L7V.js";
// src/shrinkwrap.js
var m = /* @__PURE__ */ new Set([
	"sourceToTarget",
	"mode",
	"direction",
	"maxDistance",
	"clearance",
	"onMiss",
	"maxVertices",
	"maxTriangles",
	"maxQueries",
	"maxTriangleTests",
	"memoryBudgetMiB"
]);
function h(e, t) {
	if (typeof e != "number" || !Number.isFinite(e) || !Number.isFinite(Math.fround(e))) throw TypeError(`${t} must remain finite in Float32.`);
	return e;
}
function g(e = 0, t = 0, n = 0) {
	return Float64Array.of(e, t, n);
}
function _(e, t, n) {
	if (!Number.isSafeInteger(e) || e < 1 || e > t) throw RangeError(`${n} must be an integer from 1 through ${t}.`);
	return e;
}
function v(e) {
	if (e === void 0) return t(/* @__PURE__ */ new Float64Array(16));
	if (!Array.isArray(e) && !ArrayBuffer.isView(e) || e.length !== 16) throw TypeError("sourceToTarget requires 16 affine components.");
	let r = Array.from(e, (e) => Math.fround(h(e, "sourceToTarget")));
	if (r[3] !== 0 || r[7] !== 0 || r[11] !== 0 || r[15] !== 1) throw RangeError("sourceToTarget must be affine.");
	let i = Float64Array.from(r), a = n(i);
	if (!Number.isFinite(a) || a === 0) throw RangeError("sourceToTarget must remain nonsingular.");
	return i;
}
function y(e, t, n) {
	let r = t[n] * 3, i = t[n + 1] * 3, s = t[n + 2] * 3, l = g(e[i] - e[r], e[i + 1] - e[r + 1], e[i + 2] - e[r + 2]), u = g(e[s] - e[r], e[s + 1] - e[r + 1], e[s + 2] - e[r + 2]), d = o(g(), l, u), f = Math.max(a(l), a(u), c(l, u));
	return {
		normal: d,
		altitude: a(d) / f
	};
}
function b(e, t, n) {
	let { positions: r, normals: i, indices: a } = e ?? {};
	if (!(r instanceof Float32Array) || r.length < 9 || r.length % 3 || !(i instanceof Float32Array) || i.length !== r.length || !(a instanceof Uint32Array) || !a.length || a.length % 3) throw TypeError("Shrinkwrap requires Float32 positions and normals with Uint32 triangles.");
	if (e.skinIndices !== void 0 || e.skinWeights !== void 0 || e.morphTargets !== void 0) throw TypeError("Shrinkwrap requires static geometry without skin or morph channels.");
	let o = r.length / 3;
	if (o > t || a.length / 3 > n) throw RangeError("Source exceeds maxVertices or maxTriangles.");
	for (let e of r) h(e, "Source position");
	for (let e = 0; e < i.length; e += 3) {
		let t = Math.hypot(i[e], i[e + 1], i[e + 2]);
		if (!Number.isFinite(t) || Math.abs(t - 1) > .001) throw TypeError("Source normals must be finite unit vectors.");
	}
	for (let e of a) if (e >= o) throw RangeError("Source index exceeds the vertex count.");
	for (let [t, n] of [["uvs", 2], ["colors", 3]]) if (e[t] !== void 0 && (!(e[t] instanceof Float32Array) || e[t].length !== o * n || !e[t].every(Number.isFinite))) throw TypeError(`Source ${t} must contain finite Float32 values matching the vertex count.`);
	for (let e = 0; e < a.length; e += 3) if (!(y(r, a, e).altitude > 0)) throw RangeError("Source contains a degenerate triangle.");
	return o;
}
function x(e, t, n, r) {
	for (let a = 0; a < n.length; a += 3) {
		let o = y(e, n, a), s = y(t, n, a), c = Math.max(...Array.from(n.subarray(a, a + 3)).flatMap((e) => Array.from(t.subarray(e * 3, e * 3 + 3), Math.abs)));
		if (!Number.isFinite(s.altitude) || s.altitude <= c * 2 ** -21 + 2 ** -149) throw RangeError("Shrinkwrap collapses a triangle within Float32 precision. Reduce projection or clearance.");
		if (i(s.normal, o.normal) <= 0) throw RangeError("Shrinkwrap flips or folds a triangle relative to the transformed source.");
		let u = g(), d = !0;
		for (let e = 0; e < 3; e++) {
			let t = n[a + e];
			r[t] ? l(u, u, r[t]) : d = !1;
		}
		if (d && i(s.normal, u) < 0) throw RangeError("Shrinkwrap triangle faces away from its matched target surface.");
	}
}
function S(t, n, o = {}) {
	if (!o || typeof o != "object" || Array.isArray(o)) throw TypeError("Shrinkwrap options require an object.");
	for (let e of Object.keys(o)) if (!m.has(e)) throw TypeError(`Unsupported shrinkwrap option ${e}.`);
	let c = _(o.maxVertices ?? 25e4, 1e6, "maxVertices"), l = _(o.maxTriangles ?? 25e4, 1e6, "maxTriangles"), y = _(o.maxQueries ?? 25e4, 1e6, "maxQueries"), S = _(o.maxTriangleTests ?? 2e7, 1e8, "maxTriangleTests"), C = b(t, c, l), w = v(o.sourceToTarget), T = e(/* @__PURE__ */ new Float64Array(9), w);
	if (!T || !T.every(Number.isFinite)) throw RangeError("sourceToTarget normal transform exceeds the precision domain.");
	let E = o.mode ?? "nearest";
	if (E !== "nearest" && E !== "project") throw RangeError("Shrinkwrap mode must be nearest or project.");
	let D;
	if (E === "project") {
		if (!Array.isArray(o.direction) && !ArrayBuffer.isView(o.direction) || o.direction.length !== 3) throw TypeError("Project mode requires a target-local direction.");
		if (D = Array.from(o.direction, (e) => h(e, "direction")), Math.hypot(...D) === 0) throw RangeError("Projection direction must be nonzero.");
	} else if (o.direction !== void 0) throw TypeError("direction applies only to project mode.");
	let O = o.maxDistance ?? Infinity;
	if (O !== Infinity && h(O, "maxDistance"), O < 0) throw RangeError("maxDistance must be nonnegative.");
	let k = h(o.clearance ?? 0, "clearance");
	if (k < 0) throw RangeError("clearance must be nonnegative.");
	let A = o.onMiss ?? "error";
	if (A !== "error" && A !== "keep") throw RangeError("onMiss must be error or keep.");
	let j = new Float32Array(t.positions.length), M = new Float32Array(t.normals.length), N = g();
	for (let e = 0; e < C; e++) {
		let n = e * 3;
		N.set(t.positions.subarray(n, n + 3)), u(N, N, w);
		for (let e of N) h(e, "Transformed position");
		if (j.set(N, n), N.set(t.normals.subarray(n, n + 3)), r(N, N, T), s(N, N), !N.every(Number.isFinite) || a(N) === 0) throw RangeError("Transformed source normal is invalid.");
		M.set(N, n);
	}
	let P = /* @__PURE__ */ new Map();
	for (let e = 0; e < C; e++) {
		let n = e * 3, r = t.positions.subarray(n, n + 3).join(",");
		P.has(r) || P.set(r, []), P.get(r).push(e);
	}
	if (P.size > y) throw RangeError("Shrinkwrap exceeds maxQueries. Reduce source detail.");
	let F = {
		positions: new Float32Array(j),
		normals: null,
		indices: new Uint32Array(t.indices)
	};
	for (let e of ["uvs", "colors"]) t[e] !== void 0 && (F[e] = new Float32Array(t[e]));
	let I = Array(C), L = {
		queriedVertices: 0,
		matchedVertices: 0,
		missedVertices: 0,
		triangleTests: 0
	}, R = f(n, {
		maxVertices: c,
		maxTriangles: l,
		memoryBudgetMiB: o.memoryBudgetMiB ?? 64
	});
	try {
		for (let e of P.values()) {
			let t = S - L.triangleTests;
			if (t <= 0) throw RangeError("Shrinkwrap maxTriangleTests exhausted. Reduce source detail or raise the budget.");
			let n = j.subarray(e[0] * 3, e[0] * 3 + 3), r = E === "nearest" ? R.nearest(n, {
				maxDistance: O,
				maxTriangleTests: t
			}) : R.project({
				origin: n,
				direction: D,
				maxDistance: O,
				maxTriangleTests: t
			});
			if (L.queriedVertices++, L.triangleTests += r.triangleTests, !r.hit) {
				if (L.missedVertices++, A === "error") throw RangeError(`Shrinkwrap missed source vertex ${e[0]}. Change maxDistance, direction, or onMiss.`);
				continue;
			}
			L.matchedVertices++;
			let a = g(...r.hit.normal), o = r.hit.point.map(Math.fround), s = r.hit.point.map((e, t) => Math.fround(h(e + r.hit.normal[t] * k, "Shrinkwrap position")));
			if (k > 0) {
				let e = d(g(), s, o), t = i(d(g(), s, r.hit.point), a);
				if (i(e, a) <= 0 || t <= 0) throw RangeError("Clearance collapses against the geometric face at Float32 precision. Increase clearance or reduce coordinates.");
			}
			for (let t of e) F.positions.set(s, t * 3), I[t] = a;
		}
		return x(j, F.positions, F.indices, I), F.normals = p(t, F.positions, M), {
			geometry: F,
			stats: L
		};
	} finally {
		R.dispose();
	}
}
export { S as shrinkwrapGeometry };
