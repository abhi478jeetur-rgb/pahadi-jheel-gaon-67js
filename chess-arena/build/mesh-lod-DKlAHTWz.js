/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { r as e, t } from "./sculpt-strokes-DssfwB0s.js";
import { a as n, n as r, t as i } from "./triangle-bvh-MJBX52tQ.js";
import { i as a, n as o, t as s } from "./triangle-math-CatOnS0A.js";
import { createMeshPairQuery as c, createMeshQueryIndex as l, createTriangleSurfaceIndex as u } from "./mesh-query.js";
import { A as d, B as f, C as p, D as m, E as h, G as g, H as _, I as v, J as y, K as b, R as x, S, V as C, W as w, Y as ee, Z as te, _ as ne, a as re, b as ie, ct as ae, et as oe, f as se, g as ce, h as le, i as ue, it as de, j as fe, k as pe, l as me, m as he, n as ge, nt as _e, o as ve, ot as ye, p as be, r as T, s as xe, st as Se, t as Ce, tt as E, u as we, v as Te, w as D, x as Ee, y as De, z as Oe } from "./mesh-uv-YEnc7okb.js";
import { _ as ke, f as Ae, g as je, h as Me, m as Ne, t as Pe, v as Fe } from "./field-error-DPtscRqU.js";
import { d as Ie, f as O, l as Le, n as Re, o as ze, r as Be, s as Ve, u as He } from "./expression-BmPTs3mu.js";
import { o as Ue, t as We } from "./kernel-offload-CFdSENYy.js";
// src/mesh-validate.js
function k(e) {
	throw RangeError(`Topology invalid: ${e}`);
}
function Ge(e) {
	let t = e.vertices.arrays.edgeSlot, n = e.edges.arrays.diskNext, r = e.edges.arrays.diskPrev, i = e.edges.arrays.vertex, a = e.edges.count * 2, o = 0;
	for (let s of e.liveIndices("point")) {
		let c = t[s];
		if (c === -1) continue;
		let l = c, u = 0;
		do
			(l < 0 || l >= a || e.edges.removed[l >> 1]) && k(`vertex ${s} disk reaches a removed or missing edge.`), i[l] !== s && k(`vertex ${s} disk contains edge ${l >> 1}, which does not use it.`), r[n[l]] !== l && k(`vertex ${s} disk links are not symmetric at edge ${l >> 1}.`), u++, u > a && k(`vertex ${s} disk cycle does not close.`), l = n[l];
		while (l !== c);
		o += u;
	}
	return o;
}
function Ke(e, t) {
	let n = e.edges.arrays.vertex, r = e.edges.arrays.loop, i = e.loops.arrays, a = 0, o = 0;
	for (let t of e.liveIndices("edge")) {
		o++;
		let s = n[t * 2], c = n[t * 2 + 1];
		e.vertices.isLive(s) && e.vertices.isLive(c) || k(`edge ${t} uses a removed vertex.`), s === c && k(`edge ${t} is a loop on vertex ${s}.`), e.findEdge(s, c) !== t && k(`edge ${t} duplicates another edge between ${s} and ${c}.`);
		let l = r[t];
		if (l === -1) continue;
		let u = l, d = 0;
		do
			e.loops.isLive(u) || k(`edge ${t} radial cycle reaches a removed loop.`), i.edge[u] !== t && k(`edge ${t} radial cycle contains loop ${u} of edge ${i.edge[u]}.`), i.radialPrev[i.radialNext[u]] !== u && k(`edge ${t} radial links are not symmetric.`), d++, d > e.loops.count && k(`edge ${t} radial cycle does not close.`), u = i.radialNext[u];
		while (u !== l);
		a += d;
	}
	return t !== o * 2 && k(`disk cycles hold ${t} edge ends, expected ${o * 2}.`), a;
}
function qe(e, t) {
	let n = e.loops.arrays, r = 0, i = new Int32Array(e.vertices.count).fill(-1);
	for (let t of e.liveIndices("face")) {
		let a = e.faces.arrays.loop[t], o = e.faces.arrays.size[t];
		o < 3 && k(`face ${t} has ${o} corners.`);
		let s = a, c = 0;
		do {
			e.loops.isLive(s) || k(`face ${t} reaches a removed loop.`), n.face[s] !== t && k(`face ${t} contains loop ${s} of face ${n.face[s]}.`), n.prev[n.next[s]] !== s && k(`face ${t} loop links are not symmetric.`);
			let r = n.vertex[s], a = n.vertex[n.next[s]], l = n.edge[s], u = e.edges.arrays.vertex[l * 2], d = e.edges.arrays.vertex[l * 2 + 1];
			u === r && d === a || u === a && d === r || k(`face ${t} loop ${s} edge ${l} does not join vertices ${r} and ${a}.`), i[r] === t && k(`face ${t} repeats vertex ${r}.`), i[r] = t, c++, c > o && k(`face ${t} has more loops than its size ${o}.`), s = n.next[s];
		} while (s !== a);
		c !== o && k(`face ${t} has ${c} loops but size ${o}.`), r += c;
	}
	r !== e.loops.liveCount && k(`faces own ${r} loops but ${e.loops.liveCount} are live.`), t !== r && k(`radial cycles hold ${t} loops but faces own ${r}.`);
}
function Je(e) {
	return qe(e, Ke(e, Ge(e))), {
		vertices: e.vertexCount,
		edges: e.edgeCount,
		faces: e.faceCount,
		loops: e.loopCount,
		euler: e.vertexCount - e.edgeCount + e.faceCount
	};
}
// src/mesh-lint-geometry.js
var A = Object.freeze({
	maxTrianglesPerPart: 2e4,
	maxTotalTriangles: 6e4,
	maxPartPairs: 64,
	maxThinWallSamples: 256,
	maxSymmetryVertices: 5e4,
	maxSampleElements: 8
}), Ye = .005, Xe = 1e-4, Ze = 1e-4, Qe = .8, $e = Object.freeze([
	1,
	0,
	0,
	0,
	0,
	1,
	0,
	0,
	0,
	0,
	1,
	0,
	0,
	0,
	0,
	1
]);
function et(e, t) {
	let n = Array.from({ length: t }, () => []);
	for (let t = 0; t < e.length; t++) n[e[t]].push(t);
	return n;
}
function tt(e, t) {
	let n = /* @__PURE__ */ new Map(), r = [], i = [], a = (t) => {
		let i = n.get(t);
		return i === void 0 && (i = n.size, n.set(t, i), r.push(e.positions[t * 3], e.positions[t * 3 + 1], e.positions[t * 3 + 2])), i;
	};
	for (let n of t) {
		let t = e.faceOffsets[n], r = e.faceOffsets[n + 1], o = a(e.cornerVertices[t]);
		for (let n = t + 1; n + 1 < r; n++) i.push(o, a(e.cornerVertices[n]), a(e.cornerVertices[n + 1]));
	}
	return {
		positions: Float32Array.from(r),
		indices: Uint32Array.from(i)
	};
}
function nt(e) {
	let t = [
		Infinity,
		Infinity,
		Infinity
	], n = [
		-Infinity,
		-Infinity,
		-Infinity
	];
	for (let r = 0; r < e.positions.length; r += 3) for (let i = 0; i < 3; i++) t[i] = Math.min(t[i], e.positions[r + i]), n[i] = Math.max(n[i], e.positions[r + i]);
	return {
		min: t,
		max: n
	};
}
function rt(e, t) {
	let n = 0;
	for (let r = 0; r < 3; r++) {
		let i = Math.max(e.min[r] - t.max[r], t.min[r] - e.max[r], 0);
		n += i * i;
	}
	return Math.sqrt(n);
}
function it(e) {
	return e.slice(0, A.maxSampleElements);
}
function at(e, t) {
	if (e.length < 2) return [];
	let n = [];
	for (let r = 0; r < e.length; r++) e.some((n, i) => i !== r && rt(e[r], n) <= t) || n.push(r);
	return n;
}
function ot(e, t, n, r) {
	let i = [], a = 0;
	for (let o = 0; o < e.length; o++) for (let s = o + 1; s < e.length; s++) {
		if (rt(t[o], t[s]) > n) continue;
		if (a++ >= A.maxPartPairs) return r.add("intersecting-parts"), i;
		let u = l(e[o]), d = l(e[s]);
		try {
			c(u, d).evaluate($e, $e).kind === "surface-intersection" && i.push(o * 1e3 + s);
		} catch {
			r.add("intersecting-parts");
		} finally {
			u.dispose(), d.dispose();
		}
	}
	return i;
}
var st = /intersect|overlap/i;
function ct(e, t) {
	try {
		return l(e, { solid: !0 }).dispose(), !1;
	} catch (e) {
		return st.test(e.message) ? !0 : (t.add("self-intersection"), !1);
	}
}
function lt(e, t) {
	let n = e.faceOffsets[t], r = e.faceOffsets[t + 1], i = [
		0,
		0,
		0
	];
	for (let t = n; t < r; t++) for (let n = 0; n < 3; n++) i[n] += e.positions[e.cornerVertices[t] * 3 + n];
	return i.map((e) => e / (r - n));
}
function ut(e, t, n, r, i) {
	let a = l(t), o = i * Xe, s = i * Ye, c = Math.max(1, Math.ceil(n.length / A.maxThinWallSamples)), u = [];
	try {
		for (let t = 0; t < n.length; t += c) {
			let i = n[t], c = [
				r[i * 3],
				r[i * 3 + 1],
				r[i * 3 + 2]
			], l = lt(e, i).map((e, t) => e - c[t] * o), d = a.raycast($e, {
				origin: l,
				direction: c.map((e) => -e)
			});
			d && d.distance + o < s && u.push(i);
		}
	} finally {
		a.dispose();
	}
	return u;
}
function dt(e) {
	return `${e[0]},${e[1]},${e[2]}`;
}
function ft(e, t, n, r) {
	let i = r * 4, a = /* @__PURE__ */ new Set(), o = (e) => e.map((e) => Math.round(e / i)), s = (t) => [
		e.positions[t * 3],
		e.positions[t * 3 + 1],
		e.positions[t * 3 + 2]
	];
	for (let t = 0; t < e.vertexCount; t++) a.add(dt(o(s(t))));
	let c = [];
	for (let r = 0; r < e.vertexCount; r++) {
		let e = s(r);
		e[t] = 2 * n - e[t];
		let i = o(e), l = !1;
		for (let e = -1; e <= 1 && !l; e++) for (let t = -1; t <= 1 && !l; t++) for (let n = -1; n <= 1 && !l; n++) l = a.has(dt([
			i[0] + e,
			i[1] + t,
			i[2] + n
		]));
		l || c.push(r);
	}
	return c;
}
function pt(e, t, n) {
	let r = [];
	for (let [i, a] of [[0, "x"], [2, "z"]]) {
		let o = 0;
		for (let t = 0; t < e.vertexCount; t++) o += e.positions[t * 3 + i];
		let s = [
			0,
			(t.min[i] + t.max[i]) / 2,
			o / e.vertexCount
		].map((t) => ft(e, i, t, n * Ze)).reduce((e, t) => t.length < e.length ? t : e), c = 1 - s.length / e.vertexCount;
		s.length > 0 && c >= Qe && r.push({
			axis: a,
			unmatched: s
		});
	}
	return r;
}
function mt(e, t, n, r) {
	try {
		return n();
	} catch {
		return t.add(e), r;
	}
}
function ht(e, t, n = {}) {
	return {
		kind: e,
		count: t.length,
		sample: it(t),
		...n
	};
}
function gt(e, { facePart: t, partCount: n, solidParts: r, bounds: i, diagonal: a }) {
	let o = /* @__PURE__ */ new Set(), s = [], c = et(t, n), l = a * Xe;
	if (c.reduce((e, t) => e + t.length, 0) <= A.maxTotalTriangles && c.every((e) => e.length <= A.maxTrianglesPerPart)) {
		let t = c.map((t) => tt(e, t)), n = t.map(nt), i = mt("intersecting-parts", o, () => ot(t, n, l, o), []);
		i.length && s.push(ht("intersecting-parts", i));
		let u = r.filter((e) => ct(t[e], o));
		u.length && s.push(ht("self-intersection", u));
		let { normals: d } = f(e), p = r.flatMap((n) => mt("thin-wall", o, () => ut(e, t[n], c[n], d, a), []));
		p.length && s.push(ht("thin-wall", p));
		let m = at(n, l);
		m.length && s.push(ht("floating-part", m));
	} else for (let e of [
		"intersecting-parts",
		"self-intersection",
		"thin-wall",
		"floating-part"
	]) o.add(e);
	if (e.vertexCount <= A.maxSymmetryVertices) for (let { axis: t, unmatched: n } of pt(e, i, a)) s.push(ht("asymmetric", n, { axis: t }));
	else o.add("asymmetric");
	return {
		problems: s,
		skipped: [...o]
	};
}
// src/mesh-lint.js
var _t = 8, vt = Object.freeze({
	"non-manifold-edge": {
		severity: "error",
		fix: "Delete the extra faces or split the edge; booleans and solidify need two faces per edge."
	},
	"inconsistent-winding": {
		severity: "error",
		fix: "Run recalc_normals on the part so neighbouring faces wind the same way."
	},
	"inverted-part": {
		severity: "error",
		fix: "Run flip_normals on the part; its normals point inward."
	},
	"degenerate-face": {
		severity: "error",
		fix: "Run merge_by_distance or dissolve the zero-area faces."
	},
	"loose-vertex": {
		severity: "warning",
		fix: "Delete loose vertices; they do not render and confuse bounds."
	},
	"boundary-edge": {
		severity: "warning",
		fix: "Open surface. Run fill_holes to cap each boundary loop, or add solidify if the part must be closed."
	}
}), yt = Object.freeze({
	"intersecting-parts": {
		severity: "warning",
		fix: "Two parts cross each other (sample holds first * 1000 + second part index). Move them apart, or run a union boolean if they should be one solid."
	},
	"self-intersection": {
		severity: "warning",
		fix: "A closed part cuts through itself. Undo the last extrude, inset or translate that folded it, or lower its offset."
	},
	"thin-wall": {
		severity: "warning",
		fix: "The wall behind these faces (sample is face indices) is under 0.5% of the mesh size thick. Thicken it with solidify, or move the faces apart."
	},
	"floating-part": {
		severity: "warning",
		fix: "This part (sample is part indices) touches no other part. Translate it onto its neighbour, or ignore this if it is meant to stand alone."
	},
	asymmetric: {
		severity: "warning",
		fix: "The mesh is mirror-symmetric except for the vertices in sample. Rebuild one half and mirror it, or set_position those vertices to their partners."
	}
});
function j(e, t, n) {
	let r = e.get(t);
	r || (r = {
		kind: t,
		...vt[t],
		count: 0,
		sample: []
	}, e.set(t, r)), r.count++, r.sample.length < _t && r.sample.push(n);
}
function bt(e, t, n) {
	let r = new Float64Array(n), i = e.positions;
	for (let n = 0; n < e.faceCount; n++) {
		let a = e.faceOffsets[n], o = e.faceOffsets[n + 1], s = e.cornerVertices[a] * 3;
		for (let c = a + 1; c + 1 < o; c++) {
			let a = e.cornerVertices[c] * 3, o = e.cornerVertices[c + 1] * 3;
			r[t[n]] += (i[s] * (i[a + 1] * i[o + 2] - i[a + 2] * i[o + 1]) + i[s + 1] * (i[a + 2] * i[o] - i[a] * i[o + 2]) + i[s + 2] * (i[a] * i[o + 1] - i[a + 1] * i[o])) / 6;
		}
	}
	return r;
}
var xt = [
	.8017837,
	.5345225,
	.2672612
];
function St(e, t, n, r, i) {
	let a = [
		t[r] - t[n],
		t[r + 1] - t[n + 1],
		t[r + 2] - t[n + 2]
	], o = [
		t[i] - t[n],
		t[i + 1] - t[n + 1],
		t[i + 2] - t[n + 2]
	], [s, c, l] = xt, u = [
		c * o[2] - l * o[1],
		l * o[0] - s * o[2],
		s * o[1] - c * o[0]
	], d = a[0] * u[0] + a[1] * u[1] + a[2] * u[2];
	if (Math.abs(d) < 1e-12) return !1;
	let f = 1 / d, p = [
		e[0] - t[n],
		e[1] - t[n + 1],
		e[2] - t[n + 2]
	], m = (p[0] * u[0] + p[1] * u[1] + p[2] * u[2]) * f;
	if (m < 0 || m > 1) return !1;
	let h = [
		p[1] * a[2] - p[2] * a[1],
		p[2] * a[0] - p[0] * a[2],
		p[0] * a[1] - p[1] * a[0]
	], g = (s * h[0] + c * h[1] + l * h[2]) * f;
	return g < 0 || m + g > 1 ? !1 : (o[0] * h[0] + o[1] * h[1] + o[2] * h[2]) * f > 0;
}
function Ct(e, t, n) {
	let r = 0;
	for (; t[r] !== n;) r++;
	let i = e.cornerVertices[e.faceOffsets[r]] * 3, a = [
		e.positions[i],
		e.positions[i + 1],
		e.positions[i + 2]
	], o = 0;
	for (let r = 0; r < e.faceCount; r++) {
		if (t[r] === n) continue;
		let i = e.faceOffsets[r], s = e.cornerVertices[i] * 3;
		for (let t = i + 1; t + 1 < e.faceOffsets[r + 1]; t++) St(a, e.positions, s, e.cornerVertices[t] * 3, e.cornerVertices[t + 1] * 3) && o++;
	}
	return o % 2 == 1;
}
function wt(e, { geometry: t = !1 } = {}) {
	let n = /* @__PURE__ */ new Map(), r = g(e), i = w(e), { facePart: a, partCount: o } = b(e, r, i), s = new Uint8Array(o), c = new Uint8Array(o);
	for (let t = 0; t < e.edgeCount; t++) {
		let o = r.edgeOffsets[t], l = r.edgeOffsets[t + 1] - o, u = a[i[r.edgeCorners[o]]];
		l === 1 ? (j(n, "boundary-edge", t), s[u] = 1) : l > 2 ? (j(n, "non-manifold-edge", t), s[u] = 1) : e.cornerVertices[r.edgeCorners[o]] === e.cornerVertices[r.edgeCorners[o + 1]] && (j(n, "inconsistent-winding", t), c[u] = 1);
	}
	let l = de(e), u = Math.hypot(...l.max.map((e, t) => e - l.min[t])), d = (u * 1e-7) ** 2, { areas: p } = f(e);
	for (let t = 0; t < e.faceCount; t++) p[t] <= d && j(n, "degenerate-face", t);
	let m = new Uint8Array(e.vertexCount);
	for (let t of e.cornerVertices) m[t] = 1;
	for (let t = 0; t < e.vertexCount; t++) m[t] || j(n, "loose-vertex", t);
	let h = bt(e, a, o), _ = 0, v = 0, y = [];
	for (let t = 0; t < o; t++) s[t] || c[t] || (_++, h[t] >= 0 ? y.push(t) : Ct(e, a, t) ? v++ : j(n, "inverted-part", t));
	let x = [...n.values()], S;
	if (t) {
		let t = gt(e, {
			facePart: a,
			partCount: o,
			solidParts: y,
			bounds: l,
			diagonal: u
		});
		for (let e of t.problems) x.push({
			...e,
			...yt[e.kind]
		});
		t.skipped.length && (S = t.skipped);
	}
	return {
		ok: !x.some((e) => e.severity === "error"),
		counts: {
			vertices: e.vertexCount,
			edges: e.edgeCount,
			faces: e.faceCount,
			corners: e.cornerCount
		},
		parts: {
			count: o,
			closed: _,
			cavities: v
		},
		tags: ye(e),
		bounds: l,
		problems: x,
		...S ? { skippedChecks: S } : {}
	};
}
// src/mesh-boolean.js
var Tt = null, Et = null, Dt = () => import("manifold-3d");
function Ot(e) {
	if (typeof e != "function") throw TypeError("The Manifold loader must be a function returning a module promise.");
	Dt = e;
}
function kt({ wasmBinary: e } = {}) {
	return Tt ??= Dt().catch((e) => {
		throw Error(`Mesh booleans need the optional peer dependency manifold-3d 3.5.4: npm install manifold-3d@3.5.4 (${e.message}).`);
	}).then(async ({ default: t }) => {
		let n = await t(e ? { wasmBinary: e } : void 0);
		return n.setup(), Et = n, n;
	}).catch((e) => {
		throw Tt = null, e;
	}), Tt;
}
function At() {
	return Et !== null;
}
function jt() {
	if (!Et) throw Error("Mesh booleans are not loaded yet. Await loadMeshBooleans() before running a boolean edit.");
	return Et;
}
var M = Object.freeze([
	"union",
	"difference",
	"intersect"
]);
function Mt(e) {
	return e.attributes.corner.uv?.size === 2;
}
function Nt(e, t, n, r) {
	let { normals: i } = f(t), { triangleCorners: a, triangleFaces: o } = x(t, i), s = Mt(t) ? t.attributes.corner.uv.data : null, c = new Float32Array(t.cornerCount * r);
	for (let e = 0; e < t.cornerCount; e++) {
		let n = t.cornerVertices[e];
		c[e * r] = t.positions[n * 3], c[e * r + 1] = t.positions[n * 3 + 1], c[e * r + 2] = t.positions[n * 3 + 2], r === 5 && s && (c[e * r + 3] = s[e * 2], c[e * r + 4] = s[e * 2 + 1]);
	}
	let l = new Uint32Array(o.length);
	for (let e = 0; e < o.length; e++) l[e] = o[e] + n;
	let u = new e.Mesh({
		numProp: r,
		vertProperties: c,
		triVerts: new Uint32Array(a),
		faceID: l
	});
	return u.merge(), u;
}
function Pt(e, t, n) {
	let r = t.status();
	return r === "NoError" || r === e.ErrorStatus?.NoError || r === 0 ? null : `${n} is not a closed manifold for the boolean solver (${r}). Run mesh_inspect: every edge needs exactly two faces with matching winding. Fix open edges or merge_by_distance first.`;
}
function Ft(e, t, n) {
	let r = /* @__PURE__ */ new Map();
	for (let e = 0; e < n.length; e++) {
		let t = n[e];
		r.has(t) || r.set(t, []), r.get(t).push(e);
	}
	let i = [];
	for (let [n, a] of r) {
		let r = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Map();
		for (let n of a) for (let i = 0; i < 3; i++) {
			let a = e[n * 3 + i], s = e[n * 3 + (i + 1) % 3];
			r.add(`${a},${s}`), o.has(a) || o.set(a, t[n * 3 + i]);
		}
		let s = /* @__PURE__ */ new Map(), c = 0, l = !1;
		for (let e of r) {
			let [t, n] = e.split(",").map(Number);
			r.has(`${n},${t}`) || (c++, s.has(t) && (l = !0), s.set(t, n));
		}
		let u = null;
		if (!l && c >= 3) {
			let e = s.keys().next().value;
			u = [e];
			let t = s.get(e);
			for (; t !== e && u.length <= c;) u.push(t), t = s.get(t);
			(t !== e || u.length !== c) && (u = null);
		}
		if (u) i.push({
			sourceFace: n,
			vertices: u,
			properties: u.map((e) => o.get(e))
		});
		else for (let r of a) {
			let a = Array.from(e.subarray(r * 3, r * 3 + 3));
			new Set(a).size === 3 && i.push({
				sourceFace: n,
				vertices: a,
				properties: Array.from(t.subarray(r * 3, r * 3 + 3))
			});
		}
	}
	return i;
}
function It(e, t, n, { cutTag: r } = {}) {
	if (!M.includes(n)) throw RangeError(`Boolean operation must be one of ${M.join(", ")}.`);
	let i = jt();
	for (let [n, r] of [["The mesh", e], ["The cutter", t]]) {
		let e = wt(r).problems.filter((e) => [
			"boundary-edge",
			"non-manifold-edge",
			"inconsistent-winding"
		].includes(e.kind));
		if (e.length) throw RangeError(`${n} must be closed for a boolean: ${e.map((e) => `${e.count} ${e.kind}`).join(", ")}. ${e[0].fix}`);
	}
	let a = Mt(e) ? 5 : 3, o = [];
	try {
		let s = Nt(i, e, 0, a);
		o.push(s);
		let c = Nt(i, t, e.faceCount, a);
		o.push(c);
		let l = new i.Manifold(s);
		o.push(l);
		let u = new i.Manifold(c);
		o.push(u);
		let d = Pt(i, l, "The mesh") ?? Pt(i, u, "The cutter");
		if (d) throw RangeError(d);
		let f = n === "union" ? l.add(u) : n === "difference" ? l.subtract(u) : l.intersect(u);
		o.push(f);
		let p = f.getMesh();
		if (o.push(p), !p.triVerts.length) throw RangeError(`The ${n} leaves nothing. Check the cutter's position and size against mesh_inspect bounds.`);
		return Lt(e, p, a, r);
	} finally {
		for (let e of o.reverse()) e.delete?.();
	}
}
function Lt(e, t, n, r) {
	let i = t.numProp, a = t.vertProperties.length / i, o = /* @__PURE__ */ new Map(), s = new Uint32Array(a), c = [];
	for (let e = 0; e < a; e++) {
		let n = t.vertProperties[e * i], r = t.vertProperties[e * i + 1], a = t.vertProperties[e * i + 2], l = `${n},${r},${a}`, u = o.get(l);
		u === void 0 && (u = c.length / 3, o.set(l, u), c.push(n, r, a)), s[e] = u;
	}
	let l = new Uint32Array(t.triVerts.length);
	for (let e = 0; e < t.triVerts.length; e++) l[e] = s[t.triVerts[e]];
	let u = Ft(l, t.triVerts, t.faceID), f = new Uint32Array(u.length + 1), p = [], m = n === 5 ? [] : null, h = new Uint32Array(u.length);
	u.forEach((e, n) => {
		h[n] = e.sourceFace, e.vertices.forEach((n, r) => {
			if (p.push(n), m) {
				let n = e.properties[r];
				m.push(t.vertProperties[n * i + 3], t.vertProperties[n * i + 4]);
			}
		}), f[n + 1] = p.length;
	});
	let g = Uint32Array.from(p), _ = _e(c.length / 3, f, g), v = {}, y = (t) => h[t] >= e.faceCount;
	for (let [t, n] of Object.entries(e.attributes.face)) {
		let e = new n.data.constructor(u.length * n.size);
		for (let t = 0; t < u.length; t++) y(t) || e.set(n.data.subarray(h[t] * n.size, (h[t] + 1) * n.size), t * n.size);
		v[t] = {
			data: e,
			size: n.size
		};
	}
	let b = 0;
	if (r) {
		let e = v["tag:" + r]?.data ?? new Uint8Array(u.length);
		for (let t = 0; t < u.length; t++) y(t) && (e[t] = 1, b++);
		v[oe + r] = {
			data: e,
			size: 1
		};
	}
	let x = E({
		positions: Float32Array.from(c),
		faceOffsets: f,
		cornerVertices: g,
		edgeVertices: _.edgeVertices,
		cornerEdges: _.cornerEdges,
		attributes: {
			face: v,
			corner: m ? { uv: {
				data: Float32Array.from(m),
				size: 2
			} } : {}
		}
	}), S = d(x);
	return r && (b = Rt(S, r)), {
		mesh: S,
		cutterFaces: b
	};
}
function Rt(e, t) {
	let n = e.attributes.face[oe + t].data, r = 0;
	for (let t = 0; t < e.faceCount; t++) r += +!!n[t];
	return r;
}
// src/mesh-loopcut.js
function zt(e, t, n) {
	let r = e.loops.arrays, i = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Map(), o = [], s = (t) => e.faces.arrays.size[t] === 4;
	for (let c of t) {
		if (i.has(c)) continue;
		let [t, l] = e.edgeVertices(c), u = n(t), d = n(l), f = [
			0,
			1,
			2
		].map((e) => d[e] - u[e]), p = f[f.map(Math.abs).indexOf(Math.max(...f.map(Math.abs)))] >= 0 ? t : l, m = {
			index: o.length,
			edges: /* @__PURE__ */ new Map([[c, p]]),
			quads: [],
			closed: !1
		};
		i.set(c, m.index);
		for (let t of e.edgeLoops(c)) {
			let n = t, o = p;
			for (; s(r.face[n]);) {
				let t = r.face[n];
				if (a.has(t)) {
					if (a.get(t) === m.index) {
						m.closed = !0;
						break;
					}
					throw RangeError(`Loop cut rings cross at face ${t}. Cut them in separate edits.`);
				}
				a.set(t, m.index), m.quads.push({
					face: t,
					entryLoop: n,
					entryLow: o
				});
				let s = r.next[r.next[n]], c = r.edge[s], l = r.vertex[n] === o ? r.vertex[r.next[s]] : r.vertex[s];
				if (i.has(c) && i.get(c) !== m.index) throw RangeError(`Loop cut rings cross at edge ${c}. Cut them in separate edits.`);
				m.edges.set(c, l), i.set(c, m.index);
				let u = r.radialNext[s];
				if (u === s || e.edgeFaceCount(c) !== 2) break;
				n = u, o = l;
			}
		}
		o.push(m);
	}
	return o;
}
function Bt(e, t, { cuts: n = 1, factor: r = .5, name: i = "loop" } = {}) {
	let a = T(e), o = [];
	if (ue(e, t, a).forEach((e, t) => {
		e && o.push(t);
	}), !o.length) throw RangeError("The edge rule selects no edges to start a loop cut. Check with mesh_inspect; along [0, 1, 0] picks vertical edges.");
	let s = y(e), c = s.loops.arrays, l = (e) => s.vertexPosition(e), u = zt(s, o, l), d = n === 1 ? [r] : Array.from({ length: n }, (e, t) => (t + 1) / (n + 1)), f = new re(e), p = new Uint32Array(e.vertexCount);
	for (let t = 0; t < e.vertexCount; t++) p[t] = f.addVertex(...l(t));
	let m = /* @__PURE__ */ new Map(), h = /* @__PURE__ */ new Map();
	for (let e of u) for (let [t, n] of e.edges) {
		let e = s.edgeOtherVertex(t, n), r = l(n), i = l(e);
		m.set(t, d.map((e) => f.addVertex(...[
			0,
			1,
			2
		].map((t) => r[t] + (i[t] - r[t]) * e)))), h.set(t, n);
	}
	let g = (e) => {
		let t = c.edge[e], n = m.get(t);
		return n ? c.vertex[e] === h.get(t) ? n.map((e, t) => ({
			point: e,
			t: d[t]
		})) : n.map((e, t) => ({
			point: e,
			t: 1 - d[t]
		})).reverse() : [];
	}, _ = (t) => e.faceOffsets[c.face[t]] + s.faceLoops(c.face[t]).indexOf(t), v = /* @__PURE__ */ new Map();
	for (let e of u) for (let t of e.quads) v.set(t.face, t);
	for (let t = 0; t < e.faceCount; t++) {
		let e = v.get(t);
		if (!e) {
			let e = [], n = [];
			for (let r of s.faceLoops(t)) {
				let t = _(r);
				e.push(p[c.vertex[r]]), n.push(t);
				let i = _(c.next[r]);
				for (let { point: a, t: o } of g(r)) e.push(a), n.push({
					from: t,
					to: i,
					t: o
				});
			}
			f.addFace(e, {
				sourceFace: t,
				sourceCorners: n
			});
			continue;
		}
		let n = e.entryLoop, r = c.next[n], a = c.next[r], o = c.next[a], l = g(n), u = g(a).reverse(), d = _(n), m = _(r), h = _(a), y = _(o), b = [
			{
				point: p[c.vertex[n]],
				source: d
			},
			...l.map(({ point: e, t }) => ({
				point: e,
				source: {
					from: d,
					to: m,
					t
				}
			})),
			{
				point: p[c.vertex[r]],
				source: m
			}
		], x = [
			{
				point: p[c.vertex[o]],
				source: y
			},
			...u.map(({ point: e, t }) => ({
				point: e,
				source: {
					from: h,
					to: y,
					t
				}
			})),
			{
				point: p[c.vertex[a]],
				source: h
			}
		], S = c.vertex[n] === e.entryLow;
		for (let e = 0; e + 1 < b.length; e++) {
			let n = S ? e : b.length - 2 - e;
			f.addFace([
				b[e].point,
				b[e + 1].point,
				x[e + 1].point,
				x[e].point
			], {
				sourceFace: t,
				sourceCorners: [
					b[e].source,
					b[e + 1].source,
					x[e + 1].source,
					x[e].source
				],
				tags: [`${i}.band-${n}`]
			});
		}
	}
	return {
		mesh: f.build(),
		rings: u.length,
		closedRings: u.filter((e) => e.closed).length,
		splitEdges: m.size
	};
}
// src/mesh-polygons.js
function N(e) {
	let t = [];
	for (let n = 0; n < e.faceCount; n++) {
		let r = {
			vertices: [],
			sourceFace: n,
			sourceCorners: [],
			sourceEdges: [],
			tags: []
		};
		for (let t = e.faceOffsets[n]; t < e.faceOffsets[n + 1]; t++) r.vertices.push(e.cornerVertices[t]), r.sourceCorners.push(t), r.sourceEdges.push(e.cornerEdges[t]);
		t.push(r);
	}
	return t;
}
function P(e, t, n = []) {
	let r = /* @__PURE__ */ new Set();
	for (let e of t) for (let t of e.vertices) r.add(t);
	let i = new re(e), a = /* @__PURE__ */ new Map();
	for (let t of [...r].sort((e, t) => e - t)) {
		let r = t < e.vertexCount ? [
			e.positions[t * 3],
			e.positions[t * 3 + 1],
			e.positions[t * 3 + 2]
		] : n[t - e.vertexCount];
		a.set(t, i.addVertex(...r));
	}
	for (let e of t) i.addFace(e.vertices.map((e) => a.get(e)), {
		sourceFace: e.sourceFace,
		sourceCorners: e.sourceCorners,
		sourceEdges: e.sourceEdges,
		keepTags: e.keepTags ?? !0,
		tags: e.tags
	});
	return i.build();
}
function Vt(e) {
	let t = new Uint32Array(e.edgeCount);
	for (let n of e.cornerEdges) t[n]++;
	return t;
}
function Ht(e, t = null) {
	let n = Vt(e), r = /* @__PURE__ */ new Map();
	for (let i = 0; i < e.faceCount; i++) {
		let a = e.faceOffsets[i], o = e.faceOffsets[i + 1];
		for (let i = a; i < o; i++) {
			let a = e.cornerEdges[i];
			if (n[a] !== 1 || t && !t[a]) continue;
			let o = e.cornerVertices[i];
			r.has(o) || r.set(o, []), r.get(o).push(i);
		}
	}
	let i = (t) => {
		let n = F(e, t);
		return t + 1 === e.faceOffsets[n + 1] ? e.faceOffsets[n] : t + 1;
	}, a = /* @__PURE__ */ new Set(), o = [];
	for (let t of r.values()) for (let n of t) {
		if (a.has(n)) continue;
		let t = {
			vertices: [],
			corners: [],
			closed: !1
		}, s = n;
		for (; s !== void 0 && !a.has(s);) {
			a.add(s), t.vertices.push(e.cornerVertices[s]), t.corners.push(s);
			let n = e.cornerVertices[i(s)];
			if (n === t.vertices[0]) {
				t.closed = !0;
				break;
			}
			s = (r.get(n) ?? []).find((e) => !a.has(e));
		}
		o.push(t);
	}
	return o;
}
function F(e, t) {
	let n = 0, r = e.faceCount - 1;
	for (; n < r;) {
		let i = n + r + 1 >> 1;
		e.faceOffsets[i] <= t ? n = i : r = i - 1;
	}
	return n;
}
function Ut(e) {
	let t = /* @__PURE__ */ new Map(), n = (e, n) => {
		t.has(e) || t.set(e, /* @__PURE__ */ new Set()), t.get(e).add(n);
	};
	for (let t of e) t.vertices.forEach((e, r) => {
		let i = t.vertices[(r + 1) % t.vertices.length];
		n(e, i), n(i, e);
	});
	return t;
}
// src/mesh-dissolve.js
function Wt(e, { sides: t = Infinity, name: n = "fill" } = {}) {
	let r = N(e), i = 0, a = 0;
	for (let o of Ht(e)) !o.closed || o.vertices.length > t ? a++ : (r.push({
		vertices: [...o.vertices].reverse(),
		sourceFace: F(e, o.corners[0]),
		sourceCorners: [...o.corners].reverse(),
		sourceEdges: [...o.corners].reverse().map((t) => e.cornerEdges[t]),
		keepTags: !1,
		tags: [`${n}.fill`]
	}), i++);
	if (i === 0) throw RangeError(a === 0 ? "The mesh has no open boundary to fill." : `No boundary loop could be filled: ${a} skipped because they are open chains or have more than ${t} sides.`);
	return {
		mesh: P(e, r),
		filled: i,
		skipped: a
	};
}
function Gt(e, t) {
	let n = t;
	for (; e[n] !== n;) n = e[n];
	for (; e[t] !== n;) {
		let r = e[t];
		e[t] = n, t = r;
	}
	return n;
}
function Kt(e, t, n) {
	let r = T(e), i = Array.from({ length: e.faceCount }, (e, t) => t), a = new Uint8Array(e.edgeCount);
	for (let n = 0; n < e.edgeCount; n++) {
		let e = r.faces[n];
		t[n] && e.length === 2 && (a[n] = 1, i[Gt(i, e[0])] = Gt(i, e[1]));
	}
	let o = /* @__PURE__ */ new Map();
	for (let t = 0; t < e.faceCount; t++) {
		let e = Gt(i, t);
		o.has(e) || o.set(e, []), o.get(e).push(t);
	}
	let s = N(e), c = [], l = 0;
	for (let t of o.values()) t.length === 1 ? c.push(s[t[0]]) : (c.push(qt(e, t, a, n)), l++);
	return {
		polygons: c,
		merged: l,
		dissolvedEdges: a.reduce((e, t) => e + t, 0)
	};
}
function qt(e, t, n, r) {
	let i = /* @__PURE__ */ new Map(), a = 0;
	for (let r of t) for (let t = e.faceOffsets[r]; t < e.faceOffsets[r + 1]; t++) {
		if (n[e.cornerEdges[t]]) continue;
		let r = e.cornerVertices[t];
		if (i.has(r)) throw RangeError(`Dissolving would pinch a face at vertex ${r}. Dissolve fewer edges.`);
		i.set(r, t), a++;
	}
	let o = {
		vertices: [],
		sourceFace: Math.min(...t),
		sourceCorners: [],
		sourceEdges: [],
		tags: [`${r}.merged`]
	}, s = i.values().next().value, c = s;
	do {
		o.vertices.push(e.cornerVertices[c]), o.sourceCorners.push(c), o.sourceEdges.push(e.cornerEdges[c]);
		let t = F(e, c), n = c + 1 === e.faceOffsets[t + 1] ? e.faceOffsets[t] : c + 1;
		c = i.get(e.cornerVertices[n]);
	} while (c !== void 0 && c !== s);
	if (o.vertices.length !== a) throw RangeError("Dissolving would leave a face with a hole or a split outline. Dissolve fewer edges.");
	return o;
}
function Jt(e, t, { name: n = "dissolve" } = {}) {
	let r = T(e), i = new Uint8Array(e.edgeCount);
	for (let n = 0; n < e.edgeCount; n++) {
		let e = r.faces[n];
		i[n] = e.length === 2 && t[e[0]] && t[e[1]] ? 1 : 0;
	}
	let a = Kt(e, i, n);
	if (a.merged === 0) throw RangeError("The selection holds no two faces that share an edge, so nothing dissolves.");
	return {
		mesh: P(e, a.polygons),
		merged: a.merged
	};
}
function Yt(e, t, { name: n = "dissolve" } = {}) {
	let r = Kt(e, t, n);
	if (r.merged === 0) throw RangeError("The rule selects no edge with a face on each side, so nothing dissolves.");
	return {
		mesh: P(e, r.polygons),
		merged: r.merged,
		dissolvedEdges: r.dissolvedEdges
	};
}
function Xt(e, t) {
	for (let n of e) {
		let e = n.vertices.map((e) => !t.has(e));
		if (!e.every(Boolean)) {
			if (e.filter(Boolean).length < 3) throw RangeError("Removing the vertices would collapse a face below three corners.");
			for (let t of [
				"vertices",
				"sourceCorners",
				"sourceEdges"
			]) n[t] = n[t].filter((t, n) => e[n]);
		}
	}
}
function Zt(e, t, { name: n = "dissolve" } = {}) {
	let r = Ut(N(e)), i = new Uint8Array(e.edgeCount), a = /* @__PURE__ */ new Set();
	for (let n = 0; n < e.vertexCount; n++) t[n] && (r.get(n)?.size ?? 0) === 2 && a.add(n);
	for (let n = 0; n < e.edgeCount; n++) {
		let r = e.edgeVertices[n * 2], o = e.edgeVertices[n * 2 + 1];
		(t[r] && !a.has(r) || t[o] && !a.has(o)) && (i[n] = 1);
	}
	let o = Kt(e, i, n);
	if (Xt(o.polygons, a), t.reduce((e, t) => e + t, 0) === 0) throw RangeError("The rule selects no vertices.");
	return {
		mesh: P(e, o.polygons),
		merged: o.merged,
		removedStraight: a.size
	};
}
function Qt(e, t, n) {
	let r = [
		0,
		1,
		2
	].map((r) => e.positions[n * 3 + r] - e.positions[t * 3 + r]), i = Math.hypot(...r) || 1;
	return r.map((e) => e / i);
}
function $t(e, t, { angle: n = 5, name: r = "dissolve" } = {}) {
	let i = T(e), { normals: a } = f(e), o = Math.cos(n * Math.PI / 180) - 1e-9, s = new Uint8Array(e.edgeCount);
	for (let n = 0; n < e.edgeCount; n++) {
		let e = i.faces[n];
		if (!t[n] || e.length !== 2) continue;
		let [r, c] = e;
		[
			0,
			1,
			2
		].reduce((e, t) => e + a[r * 3 + t] * a[c * 3 + t], 0) >= o && (s[n] = 1);
	}
	let c = Kt(e, s, r), l = Ut(c.polygons), u = /* @__PURE__ */ new Set();
	for (let [t, n] of l) {
		if (n.size !== 2 || t >= e.vertexCount) continue;
		let [r, i] = [...n], a = Qt(e, r, t), s = Qt(e, t, i);
		a.reduce((e, t, n) => e + t * s[n], 0) >= o && u.add(t);
	}
	if (en(c.polygons, u), c.merged === 0 && u.size === 0) throw RangeError(`Nothing is within ${n} degrees of flat among the selected edges.`);
	return {
		mesh: P(e, c.polygons),
		merged: c.merged,
		removedStraight: u.size
	};
}
function en(e, t) {
	let n = /* @__PURE__ */ new Set();
	for (let r of e) {
		let e = r.vertices.filter((e) => t.has(e)).length;
		r.vertices.length - e < 3 && r.vertices.forEach((e) => n.add(e));
	}
	for (let e of n) t.delete(e);
	Xt(e, t);
}
function tn(e, t) {
	if (!t || typeof t != "object" || Array.isArray(t) || Object.keys(t).length !== 1) throw TypeError("Vertex rule takes exactly one of all, vertices, valence, inside.");
	let n = new Uint8Array(e.vertexCount);
	if (t.all === !0) return n.fill(1);
	if (Array.isArray(t.vertices)) {
		for (let r of t.vertices) {
			if (!Number.isInteger(r) || r < 0 || r >= e.vertexCount) throw RangeError(`Vertex ${r} does not exist.`);
			n[r] = 1;
		}
		return n;
	}
	if (Number.isInteger(t.valence)) {
		let r = Ut(N(e));
		for (let i = 0; i < e.vertexCount; i++) n[i] = +((r.get(i)?.size ?? 0) === t.valence);
		return n;
	}
	if (t.inside && Array.isArray(t.inside.min) && Array.isArray(t.inside.max)) {
		for (let r = 0; r < e.vertexCount; r++) n[r] = +!![
			0,
			1,
			2
		].every((n) => {
			let i = e.positions[r * 3 + n];
			return i >= t.inside.min[n] - 1e-6 && i <= t.inside.max[n] + 1e-6;
		});
		return n;
	}
	throw TypeError("Vertex rule takes exactly one of all, vertices (indices), valence (integer), inside ({ min, max }).");
}
// src/mesh-bisect.js
var nn = (e, t) => [
	e[0] - t[0],
	e[1] - t[1],
	e[2] - t[2]
], rn = (e, t) => e[0] * t[0] + e[1] * t[1] + e[2] * t[2], an = (e, t, n) => e.map((e, r) => e + (t[r] - e) * n), on = (e) => {
	let t = Math.hypot(...e);
	if (t === 0) throw RangeError("A direction cannot be zero.");
	return e.map((e) => e / t);
};
function sn(e, t, n) {
	return n >= e.vertexCount ? t[n - e.vertexCount] : [
		e.positions[n * 3],
		e.positions[n * 3 + 1],
		e.positions[n * 3 + 2]
	];
}
function cn(e, t, n) {
	let r = [];
	for (let i = t;; i = (i + 1) % e.length) if (r.push(e[i]), i === n) return r;
}
function ln(e, t, n, r, i) {
	let a = (t, n, r, i) => ({
		...e,
		vertices: [...cn(e.vertices, t, n), ...r],
		sourceCorners: [...cn(e.sourceCorners, t, n), ...i],
		sourceEdges: [...cn(e.sourceEdges, t, n), ...r.map(() => -1)]
	});
	return [a(t, n, [...r].reverse(), r.map(() => i)), a(n, t, r, r.map(() => i))];
}
function un(e, t, n, r) {
	let i = new Int8Array(e.vertexCount), a = new Float64Array(e.vertexCount);
	for (let o = 0; o < e.vertexCount; o++) {
		let s = rn(nn(sn(e, [], o), t), n);
		a[o] = s, i[o] = s > r ? 1 : s < -r ? -1 : 0;
	}
	return {
		signs: i,
		offsets: a
	};
}
function dn(e, t, n, r) {
	let i = /* @__PURE__ */ new Map();
	for (let a = 0; a < e.edgeCount; a++) {
		let o = e.edgeVertices[a * 2], s = e.edgeVertices[a * 2 + 1];
		if (t[o] * t[s] !== -1) continue;
		let c = n[o] / (n[o] - n[s]);
		r.push(an(sn(e, [], o), sn(e, [], s), c)), i.set(a, {
			vertex: e.vertexCount + r.length - 1,
			from: o,
			fraction: c
		});
	}
	return i;
}
function fn(e, t, n, r) {
	let i = {
		...t,
		vertices: [],
		sourceCorners: [],
		sourceEdges: []
	}, a = [], o = t.vertices.length;
	for (let e = 0; e < o; e++) {
		let s = t.vertices[e], c = t.sourceCorners[e], l = t.sourceEdges[e];
		i.vertices.push(s), i.sourceCorners.push(c), i.sourceEdges.push(l), a.push(n[s]);
		let u = r.get(l);
		if (!u) continue;
		let d = t.sourceCorners[(e + 1) % o], f = u.from === s ? u.fraction : 1 - u.fraction;
		i.vertices.push(u.vertex), i.sourceCorners.push({
			from: c,
			to: d,
			t: f
		}), i.sourceEdges.push(l), a.push(0);
	}
	return {
		outline: i,
		sides: a
	};
}
function pn(e) {
	return e.find((e) => e !== 0) ?? 0;
}
function mn(e, t, n, r, i) {
	let { outline: a, sides: o } = fn(e, t, n, r);
	if (!o.includes(1) || !o.includes(-1)) return {
		pieces: [{
			polygon: a,
			side: pn(o)
		}],
		cut: !1
	};
	let s = o.map((e, t) => e === 0 ? t : -1).filter((e) => e >= 0);
	if (s.length !== 2) throw RangeError(`Face ${i} crosses the plane ${s.length} times. Split it into convex faces first.`);
	let [c, l] = s, u = cn(o, c, l), d = ln(a, c, l, [], -1);
	return {
		pieces: [{
			polygon: d[0],
			side: pn(u)
		}, {
			polygon: d[1],
			side: -pn(u)
		}],
		cut: !0
	};
}
function hn(e, t) {
	let n = [];
	for (let { polygon: r } of e) r.vertices.forEach((e, i) => {
		let a = r.vertices[(i + 1) % r.vertices.length];
		t(e) && t(a) && n.push({
			from: e,
			to: a,
			polygon: r,
			position: i
		});
	});
	return n;
}
function gn(e, t, n) {
	let r = hn(e, n), i = new Set(hn([...e, ...t], n).map(({ from: e, to: t }) => `${e}>${t}`));
	return r.filter(({ from: e, to: t }) => !i.has(`${t}>${e}`));
}
function _n(e) {
	let t = new Map(e.map((e) => [e.from, e])), n = /* @__PURE__ */ new Set(), r = [], i = 0;
	for (let a of e) {
		if (n.has(a)) continue;
		let e = [], o = a;
		for (; o && !n.has(o);) n.add(o), e.push(o), o = t.get(o.to);
		o === a ? r.push(e) : i++;
	}
	return {
		loops: r,
		open: i
	};
}
function vn(e, t) {
	let n = [...e].reverse();
	return {
		vertices: n.map((e) => e.to),
		sourceFace: e[0].polygon.sourceFace,
		sourceCorners: n.map((e) => e.polygon.sourceCorners[e.position]),
		sourceEdges: n.map(() => -1),
		keepTags: !1,
		tags: [t]
	};
}
function yn(e, { point: t, normal: n, distance: r = 1e-4, clearInner: i = !1, clearOuter: a = !1, fill: o = !1, name: s = "bisect" }) {
	let { signs: c, offsets: l } = un(e, t, on(n), r), u = [], d = dn(e, c, l, u), f = [], p = 0;
	if (N(e).forEach((t, n) => {
		let r = mn(e, t, c, d, n);
		r.cut && p++, f.push(...r.pieces);
	}), p === 0) throw RangeError("The plane does not cross any face. Check point and normal against the mesh bounds.");
	let m = (t) => t >= e.vertexCount || c[t] === 0, h = f.filter((e) => e.side === -1), g = f.filter((e) => e.side === 1), _ = f.filter((e) => e.side === 0);
	for (let { polygon: e, side: t } of f) t === -1 && (e.tags = [...e.tags, `${s}.inner`]), t === 1 && (e.tags = [...e.tags, `${s}.outer`]);
	let v = f.filter(({ side: e }) => e === -1 && !i || e === 1 && !a || e === 0).map(({ polygon: e }) => e), y = (e) => {
		let { loops: t, open: n } = _n(gn(e, _, m));
		return {
			caps: t.map((e) => vn(e, `${s}.cap`)),
			open: n
		};
	}, b = 0, x = 0;
	if (o) {
		let t = i ? {
			caps: [],
			open: 0
		} : y(h), n = a ? {
			caps: [],
			open: 0
		} : y(g);
		!i && !a && bn(e, [...g.map(({ polygon: e }) => e), ...n.caps], m, u), v.push(...t.caps, ...n.caps), b = t.caps.length + n.caps.length, x = t.open + n.open;
	}
	return {
		mesh: P(e, v, u),
		cutFaces: p,
		capped: b,
		unfilled: x,
		newVertices: d.size
	};
}
function bn(e, t, n, r) {
	let i = /* @__PURE__ */ new Map(), a = (t) => (i.has(t) || (r.push(sn(e, r, t)), i.set(t, e.vertexCount + r.length - 1)), i.get(t));
	for (let e of t) e.vertices = e.vertices.map((e) => n(e) ? a(e) : e);
}
// src/mesh-bridge.js
var xn = 65536;
function I(e, t, n) {
	return n >= e.vertexCount ? t[n - e.vertexCount] : [
		e.positions[n * 3],
		e.positions[n * 3 + 1],
		e.positions[n * 3 + 2]
	];
}
var Sn = (e, t, n) => e.map((e, r) => e + (t[r] - e) * n), Cn = (e, t) => e.reduce((e, n, r) => e + (n - t[r]) ** 2, 0);
function wn(e, t, n) {
	return t.push(n), e.vertexCount + t.length - 1;
}
function Tn(e, t, n) {
	return {
		vertices: e,
		sourceFace: t,
		sourceCorners: e.map(() => -1),
		sourceEdges: e.map(() => -1),
		keepTags: !1,
		tags: [n]
	};
}
function En(e, t, n) {
	let r = 0, i = Infinity;
	for (let a = 0; a < t.length; a++) {
		let o = 0;
		for (let r = 0; r < t.length; r++) o += Cn(I(e, [], t[r]), I(e, [], n[(r + a) % n.length]));
		o < i - 1e-12 && (r = a, i = o);
	}
	return r;
}
function Dn(e, t, { segments: n = 1, twist: r = 0, name: i = "bridge" } = {}) {
	let a = Ht(e, t);
	if (a.length !== 2) throw RangeError(`The edge rule selects ${a.length} boundary loops; bridge needs exactly 2. Use { "open": true } for every hole, or { "open": { "inside": { "min": [x, y, z], "max": [x, y, z] } } } to pick some.`);
	let [o, s] = a;
	if (o.closed !== s.closed) throw RangeError("One loop is closed and the other is an open chain; bridge needs two of the same kind.");
	if (o.vertices.length !== s.vertices.length) throw RangeError(`The loops have ${o.vertices.length} and ${s.vertices.length} edges; bridge needs the same number. Run subdivide_edges on the shorter one first.`);
	let c = o.vertices.length, l = o.closed;
	if ((c + 1) * (n + 1) > xn) throw RangeError("The bridge would make too many vertices. Lower segments.");
	let u = kn(e, o), d = kn(e, s).reverse(), f = l ? (En(e, u, d) + r % c + c) % c : 0, p = u.map((e, t) => d[(t + f) % d.length]), m = [], h = [u];
	for (let t = 1; t < n; t++) h.push(u.map((r, i) => wn(e, m, Sn(I(e, m, r), I(e, m, p[i]), t / n))));
	h.push(p);
	let g = N(e), _ = F(e, o.corners[0]);
	for (let e = 0; e < n; e++) for (let t = 0; t < c; t++) {
		let n = (t + 1) % u.length;
		g.push(Tn([
			h[e][n],
			h[e][t],
			h[e + 1][t],
			h[e + 1][n]
		], _, `${i}.bridge`));
	}
	return {
		mesh: P(e, g, m),
		loopEdges: c,
		strips: n * c
	};
}
function On(e, t) {
	let n = F(e, t);
	return t + 1 === e.faceOffsets[n + 1] ? e.faceOffsets[n] : t + 1;
}
function kn(e, t) {
	if (t.closed) return [...t.vertices];
	let n = t.corners[t.corners.length - 1];
	return [...t.vertices, e.cornerVertices[On(e, n)]];
}
function An(e, t, n, r) {
	let i = I(e, [], n).map((n, r) => n - I(e, [], t)[r]), a = I(e, [], r).map((t, r) => t - I(e, [], n)[r]), o = Math.hypot(...i) * Math.hypot(...a) || 1, s = i.reduce((e, t, n) => e + t * a[n], 0) / o;
	return Math.acos(Math.max(-1, Math.min(1, s)));
}
function jn(e, t) {
	let n = t.length, r = null;
	for (let i = 1; i < n / 2; i++) {
		let a = n / 2 - i;
		for (let o = 0; o < n; o++) {
			let s = [
				0,
				i,
				i + a,
				2 * i + a
			].map((e) => (o + e) % n).reduce((r, i) => r + An(e, t[(i + n - 1) % n], t[i], t[(i + 1) % n]), 0) - Math.abs(i - a) * 1e-6;
			(!r || s > r.score + 1e-9) && (r = {
				score: s,
				a: i,
				b: a,
				start: o
			});
		}
	}
	return r;
}
function Mn(e, t, n, r) {
	let i = t.vertices, a = i.length, { a: o, b: s, start: c } = jn(e, i), l = (e) => i[(c + e) % a], u = Array.from({ length: o + 1 }, () => Array(s + 1));
	for (let e = 0; e <= o; e++) u[e][0] = l(e), u[e][s] = l(2 * o + s - e);
	for (let e = 0; e <= s; e++) u[o][e] = l(o + e), u[0][e] = l(a - e);
	let d = (t, n) => I(e, r, u[t][n]);
	for (let t = 1; t < o; t++) for (let n = 1; n < s; n++) {
		let i = t / o, a = n / s, c = [
			0,
			1,
			2
		].map((e) => (1 - a) * d(t, 0)[e] + a * d(t, s)[e] + (1 - i) * d(0, n)[e] + i * d(o, n)[e] - ((1 - i) * (1 - a) * d(0, 0)[e] + i * (1 - a) * d(o, 0)[e] + (1 - i) * a * d(0, s)[e] + i * a * d(o, s)[e]));
		u[t][n] = wn(e, r, c);
	}
	let f = F(e, t.corners[0]), p = [];
	for (let e = 0; e < o; e++) for (let t = 0; t < s; t++) p.push(Tn([
		u[e][t],
		u[e][t + 1],
		u[e + 1][t + 1],
		u[e + 1][t]
	], f, `${n}.fill`));
	return p;
}
function Nn(e, t, { name: n = "grid" } = {}) {
	let r = Ht(e, t);
	if (r.length === 0) throw RangeError("The edge rule selects no boundary loop. Use { \"open\": true } to pick the holes.");
	let i = N(e), a = [];
	for (let t of r) {
		let r = t.vertices.length;
		if (!t.closed) throw RangeError("A selected boundary chain is open; grid_fill needs closed loops.");
		if (r < 4 || r % 2 != 0) throw RangeError(`A loop has ${r} edges; grid_fill needs an even number, at least 4. Subdivide one edge or use fill_holes.`);
		i.push(...Mn(e, t, n, a));
	}
	return {
		mesh: P(e, i, a),
		loops: r.length
	};
}
// src/mesh-edgesplit.js
function Pn(e, t, n) {
	return e.map((e, r) => e + (t[r] - e) * n);
}
function Fn(e, t, n) {
	let r = 0;
	for (let n = 0; n < e.edgeCount; n++) r += +!!t[n];
	let i = n + 1;
	return {
		vertices: e.vertexCount + r * n + e.faceCount * n * n,
		faces: e.faceCount * i * i
	};
}
function In(e, t, { cuts: n = 1, name: r = "subdivide" } = {}) {
	let i = [], a = e.vertexCount, o = (t) => [
		e.positions[t * 3],
		e.positions[t * 3 + 1],
		e.positions[t * 3 + 2]
	], s = (e) => (i.push(e), a + i.length - 1), c = /* @__PURE__ */ new Map();
	for (let r = 0; r < e.edgeCount; r++) {
		if (!t[r]) continue;
		let i = o(e.edgeVertices[r * 2]), a = o(e.edgeVertices[r * 2 + 1]);
		c.set(r, Array.from({ length: n }, (e, t) => s(Pn(i, a, (t + 1) / (n + 1)))));
	}
	let l = (e) => e >= a ? i[e - a] : o(e), u = Array.from({ length: n }, (e, t) => (t + 1) / (n + 1)), d = (t, n) => {
		let r = c.get(t.sourceEdges[n]);
		return r ? (t.vertices[n] === e.edgeVertices[t.sourceEdges[n] * 2] ? r : [...r].reverse()).map((e, t) => ({
			vertex: e,
			t: u[t]
		})) : [];
	}, f = [], p = 0;
	for (let t of N(e)) {
		let e = t.vertices.length, i = t.vertices.map((e, n) => d(t, n).length > 0);
		if (!i.some(Boolean)) {
			f.push(t);
			continue;
		}
		p++;
		let a = e === 4 ? zn(t, i, d, l, s, n) : null;
		f.push(...(a ?? Ln(t, d)).map((e) => ({
			...e,
			tags: [...t.tags, `${r}.split`]
		})));
	}
	return {
		mesh: P(e, f, i),
		splitEdges: c.size,
		splitFaces: p
	};
}
function Ln(e, t) {
	let n = {
		...e,
		vertices: [],
		sourceCorners: [],
		sourceEdges: []
	}, r = e.vertices.length;
	return e.vertices.forEach((i, a) => {
		n.vertices.push(i), n.sourceCorners.push(e.sourceCorners[a]), n.sourceEdges.push(e.sourceEdges[a]);
		for (let { vertex: i, t: o } of t(e, a)) n.vertices.push(i), n.sourceCorners.push({
			from: e.sourceCorners[a],
			to: e.sourceCorners[(a + 1) % r],
			t: o
		}), n.sourceEdges.push(e.sourceEdges[a]);
	}), [n];
}
function Rn(e, t) {
	let n = (e) => e.map((n, r) => e[(r + t) % e.length]);
	return {
		...e,
		vertices: n(e.vertices),
		sourceCorners: n(e.sourceCorners),
		sourceEdges: n(e.sourceEdges)
	};
}
function zn(e, t, n, r, i, a) {
	let o = t.filter(Boolean).length, s = o === 2 && t[0] === t[2];
	if (o !== 4 && !s) return null;
	let c = o === 4 || t[0] ? e : Rn(e, 1), [l, u, d, f] = c.vertices, [p, m, h, g] = c.sourceCorners, _ = (e) => n(c, e), v = [
		{
			vertex: l,
			source: p
		},
		..._(0).map(({ vertex: e, t }) => ({
			vertex: e,
			source: {
				from: p,
				to: m,
				t
			}
		})),
		{
			vertex: u,
			source: m
		}
	], y = [
		{
			vertex: f,
			source: g
		},
		..._(2).reverse().map(({ vertex: e, t }) => ({
			vertex: e,
			source: {
				from: g,
				to: h,
				t: 1 - t
			}
		})),
		{
			vertex: d,
			source: h
		}
	];
	return o === 2 ? Vn(c, v, y) : Hn(c, v, y, _, r, i, a);
}
function Bn(e, t, n) {
	return {
		...e,
		vertices: t,
		sourceCorners: n,
		sourceEdges: t.map(() => -1)
	};
}
function Vn(e, t, n) {
	let r = [];
	for (let i = 0; i + 1 < t.length; i++) r.push(Bn(e, [
		t[i].vertex,
		t[i + 1].vertex,
		n[i + 1].vertex,
		n[i].vertex
	], [
		t[i].source,
		t[i + 1].source,
		n[i + 1].source,
		n[i].source
	]));
	return r;
}
function Hn(e, t, n, r, i, a, o) {
	let [s, c, l, u] = e.vertices, [d, f, p, m] = e.sourceCorners, h = o + 2, g = [
		c,
		...r(1).map(({ vertex: e }) => e),
		l
	], _ = [
		s,
		...r(3).reverse().map(({ vertex: e }) => e),
		u
	], v = Array.from({ length: h }, () => Array(h)), y = Array.from({ length: h }, () => Array(h));
	for (let e = 0; e < h; e++) v[e][0] = t[e].vertex, v[e][h - 1] = n[e].vertex;
	for (let e = 0; e < h; e++) v[0][e] = _[e], v[h - 1][e] = g[e];
	let b = [
		d,
		f,
		p,
		m
	];
	for (let e = 0; e < h; e++) for (let t = 0; t < h; t++) {
		let n = e / (h - 1), r = t / (h - 1), i = [
			(1 - n) * (1 - r),
			n * (1 - r),
			n * r,
			(1 - n) * r
		];
		y[e][t] = { weights: b.map((e, t) => [e, i[t]]) };
	}
	let [x, S, C, w] = [
		s,
		c,
		l,
		u
	].map(i);
	for (let e = 1; e < h - 1; e++) for (let t = 1; t < h - 1; t++) {
		let n = e / (h - 1), r = t / (h - 1);
		v[e][t] = a(Pn(Pn(x, S, n), Pn(w, C, n), r));
	}
	let ee = [];
	for (let t = 0; t + 1 < h; t++) for (let n = 0; n + 1 < h; n++) {
		let r = [
			[t, n],
			[t + 1, n],
			[t + 1, n + 1],
			[t, n + 1]
		];
		ee.push(Bn(e, r.map(([e, t]) => v[e][t]), r.map(([e, t]) => y[e][t])));
	}
	return ee;
}
// src/mesh-knife.js
var Un = 256, Wn = 1e-6, Gn = (e, t) => e[0] * t[0] + e[1] * t[1] + e[2] * t[2], Kn = (e, t) => [
	e[1] * t[2] - e[2] * t[1],
	e[2] * t[0] - e[0] * t[2],
	e[0] * t[1] - e[1] * t[0]
], qn = (e, t, n) => e.map((e, r) => e + (t[r] - e) * n), Jn = (e, t) => e[0] * t[1] - e[1] * t[0];
function Yn(e) {
	let t = Math.hypot(...e);
	if (t === 0) throw RangeError("direction cannot be zero.");
	let n = e.map((e) => e / t), r = n.map(Math.abs).indexOf(Math.min(...n.map(Math.abs))), i = [
		0,
		0,
		0
	];
	i[r] = 1;
	let a = Kn(n, i), o = Math.hypot(...a), s = a.map((e) => e / o);
	return {
		along: n,
		sideways: s,
		upwards: Kn(n, s)
	};
}
function Xn(e, t) {
	let n = !1;
	for (let r = 0, i = t.length - 1; r < t.length; i = r++) {
		let [a, o] = t[r], [s, c] = t[i];
		o > e[1] != c > e[1] && e[0] < (s - a) * (e[1] - o) / (c - o) + a && (n = !n);
	}
	return n;
}
function Zn(e, t, n, r, i) {
	let a = /* @__PURE__ */ new Map();
	for (let o = 0; o < e.edgeCount; o++) {
		let s = e.edgeVertices[o * 2], c = e.edgeVertices[o * 2 + 1], l = t[s], u = [t[c][0] - l[0], t[c][1] - l[1]], d = [];
		for (let t = 0; t + 1 < r.points.length; t++) {
			let a = r.points[t], o = [r.points[t + 1][0] - a[0], r.points[t + 1][1] - a[1]], f = Jn(u, o);
			if (Math.abs(f) < 1e-12) continue;
			let p = [a[0] - l[0], a[1] - l[1]], m = Jn(p, o) / f, h = Jn(p, u) / f;
			if (m < -1e-6 || m > 1.000001 || h < -1e-6 || h > 1.000001) continue;
			let g = Math.min(1, Math.max(0, m)), _ = r.lengths[t] + Math.min(1, Math.max(0, h)) * (r.lengths[t + 1] - r.lengths[t]);
			d.some((e) => Math.abs(e.t - g) < Wn) || (g < Wn ? d.push({
				t: 0,
				vertex: s,
				s: _,
				inserted: !1
			}) : g > .999999 ? d.push({
				t: 1,
				vertex: c,
				s: _,
				inserted: !1
			}) : (i.push(qn(n(s), n(c), g)), d.push({
				t: g,
				vertex: e.vertexCount + i.length - 1,
				s: _,
				inserted: !0
			})));
		}
		d.length && a.set(o, d.sort((e, t) => e.t - t.t));
	}
	return a;
}
function Qn(e, t, n) {
	let r = {
		...t,
		vertices: [],
		sourceCorners: [],
		sourceEdges: []
	}, i = t.vertices.length, a = [];
	return t.vertices.forEach((o, s) => {
		r.vertices.push(o), r.sourceCorners.push(t.sourceCorners[s]), r.sourceEdges.push(t.sourceEdges[s]);
		let c = t.sourceEdges[s], l = n.get(c);
		if (!l) return;
		let u = o === e.edgeVertices[c * 2];
		for (let e of u ? l : [...l].reverse()) a.push(e), e.inserted && (r.vertices.push(e.vertex), r.sourceCorners.push({
			from: t.sourceCorners[s],
			to: t.sourceCorners[(s + 1) % i],
			t: u ? e.t : 1 - e.t
		}), r.sourceEdges.push(c));
	}), {
		outline: r,
		events: a
	};
}
function $n(e) {
	let t = [
		0,
		0,
		0
	];
	return e.forEach((n, r) => {
		let i = e[(r + 1) % e.length];
		t[0] += (n[1] - i[1]) * (n[2] + i[2]), t[1] += (n[2] - i[2]) * (n[0] + i[0]), t[2] += (n[0] - i[0]) * (n[1] + i[1]);
	}), t;
}
function er(e, t) {
	let n = 0;
	for (; n + 2 < e.lengths.length && e.lengths[n + 1] < t;) n++;
	let r = e.lengths[n + 1] - e.lengths[n] || 1;
	return qn(e.points[n], e.points[n + 1], (t - e.lengths[n]) / r);
}
function tr(e, t, n, r) {
	let i = t.sideways.map((n, r) => n * e[0] + t.upwards[r] * e[1]), a = Gn(r, n.map((e, t) => e - i[t])) / Gn(r, t.along);
	return i.map((e, n) => e + t.along[n] * a);
}
function nr(e, { path: t, direction: n, name: r = "knife" }) {
	if (!Array.isArray(t) || t.length < 2 || t.length > Un) throw RangeError(`path needs 2 to ${Un} points.`);
	let i = Yn(n), a = (t) => [
		e.positions[t * 3],
		e.positions[t * 3 + 1],
		e.positions[t * 3 + 2]
	], o = (e) => [Gn(e, i.sideways), Gn(e, i.upwards)], s = Array.from({ length: e.vertexCount }, (e, t) => o(a(t))), c = t.map(o), l = [0];
	for (let e = 1; e < c.length; e++) l.push(l[e - 1] + Math.hypot(c[e][0] - c[e - 1][0], c[e][1] - c[e - 1][1]));
	let u = {
		points: c,
		lengths: l
	}, d = [], f = Zn(e, s, a, u, d), p = [], m = 0;
	for (let t of N(e)) {
		let { outline: n, events: o } = Qn(e, t, f), c = rr(e, t, n, o, {
			basis: i,
			line: u,
			flat: s,
			vertexPoint: a,
			extraPositions: d,
			name: r
		});
		c.length > 1 && m++, p.push(...c);
	}
	if (m === 0) throw RangeError("The line does not cross any face when projected along the direction. Check path and direction against the mesh bounds.");
	return {
		mesh: P(e, p, d),
		cutFaces: m,
		newVertices: d.length
	};
}
function rr(e, t, n, r, i) {
	let { basis: a, line: o, flat: s, vertexPoint: c, extraPositions: l, name: u } = i, d = t.vertices.map(c), f = $n(d);
	if (Math.abs(Gn(f, a.along)) < 1e-9 * Math.hypot(...f)) return [n];
	let p = [];
	for (let e of [...r].sort((e, t) => e.s - t.s)) {
		let t = p[p.length - 1];
		t && t.vertex === e.vertex && Math.abs(t.s - e.s) < 1e-6 || p.push(e);
	}
	let m = t.vertices.map((e) => s[e]), h = d[0], g = [n];
	for (let n = 0; n + 1 < p.length; n++) {
		let r = p[n], i = p[n + 1];
		if (r.vertex === i.vertex || !Xn(er(o, (r.s + i.s) / 2), m)) continue;
		let s = [];
		o.lengths.forEach((t, n) => {
			t <= r.s + 1e-9 || t >= i.s - 1e-9 || (l.push(tr(o.points[n], a, h, f)), s.push(e.vertexCount + l.length - 1));
		}), g = g.flatMap((e) => {
			let n = e.vertices.indexOf(r.vertex), a = e.vertices.indexOf(i.vertex);
			return n < 0 || a < 0 ? [e] : ln(e, n, a, s, e.sourceCorners[n]).map((e) => ({
				...e,
				tags: [...t.tags, `${u}.cut`]
			}));
		});
	}
	return g;
}
// src/mesh-cut-edits.js
var ir = Object.freeze([
	"fill_holes",
	"dissolve_faces",
	"dissolve_edges",
	"dissolve_verts",
	"dissolve_limited",
	"bisect_plane",
	"bridge_edge_loops",
	"subdivide_edges",
	"grid_fill",
	"knife_project"
]), ar = 256, or = "an edge rule such as { \"all\": true }, { \"angle\": 30 }, { \"along\": [x, y, z] } or { \"open\": true }";
function sr(e, t, n, r) {
	if (!e || typeof e != "object" || Array.isArray(e)) throw TypeError(`Mesh edit ${t} (${n} must be ${r})`);
	return e;
}
function cr(e, t, n, r, i) {
	if (!Number.isInteger(e) || e < r || e > i) throw TypeError(`Mesh edit ${t} (${n} must be an integer from ${r} to ${i})`);
	return e;
}
function lr(e, t, n) {
	if (e !== void 0 && typeof e != "boolean") throw TypeError(`Mesh edit ${t} (${n} must be boolean)`);
	return e ?? !1;
}
function ur(e, t, n, { finiteNumber: r, vector: i }) {
	switch (e.op) {
		case "fill_holes":
			e.sides !== void 0 && (t.sides = cr(e.sides, n, "sides", 3, 4096));
			break;
		case "dissolve_faces": break;
		case "dissolve_edges":
		case "bridge_edge_loops":
		case "subdivide_edges":
		case "grid_fill":
			t.edges = sr(e.edges, n, "edges", or);
			break;
		case "dissolve_verts":
			t.verts = sr(e.verts, n, "verts", "a vertex rule: { \"all\": true }, { \"vertices\": [indices] }, { \"valence\": 2 } or { \"inside\": { \"min\": [x, y, z], \"max\": [x, y, z] } }");
			break;
		case "dissolve_limited":
			t.edges = e.edges === void 0 ? { all: !0 } : sr(e.edges, n, "edges", or), t.angle = e.angle === void 0 ? 5 : r(e.angle, n, "angle", {
				minimum: 0,
				maximum: 180
			});
			break;
		case "bisect_plane":
			if (t.point = i(e.point, n, "point"), t.normal = i(e.normal, n, "normal"), t.normal.every((e) => e === 0)) throw TypeError(`Mesh edit ${n} (normal cannot be zero)`);
			if (t.distance = e.distance === void 0 ? 1e-4 : r(e.distance, n, "distance", {
				minimum: 0,
				maximum: 1e3
			}), t.clearInner = lr(e.clearInner, n, "clearInner"), t.clearOuter = lr(e.clearOuter, n, "clearOuter"), t.fill = lr(e.fill, n, "fill"), t.clearInner && t.clearOuter) throw TypeError(`Mesh edit ${n} (clearInner and clearOuter together would remove everything)`);
			break;
		case "bridge_edge_loops": break;
		case "knife_project":
			if (!Array.isArray(e.path) || e.path.length < 2 || e.path.length > ar) throw TypeError(`Mesh edit ${n} (path needs 2 to ${ar} points [x, y, z] in object space)`);
			if (t.path = e.path.map((e) => i(e, n, "path point")), t.direction = i(e.direction, n, "direction"), t.direction.every((e) => e === 0)) throw TypeError(`Mesh edit ${n} (direction cannot be zero)`);
	}
	e.op === "bridge_edge_loops" && (t.segments = e.segments === void 0 ? 1 : cr(e.segments, n, "segments", 1, 64), t.twistOffset = e.twistOffset === void 0 ? 0 : cr(e.twistOffset, n, "twistOffset", -4096, 4096)), e.op === "subdivide_edges" && (t.cuts = e.cuts === void 0 ? 1 : cr(e.cuts, n, "cuts", 1, 16));
}
function dr(e, t, n, r) {
	if (t.op !== "subdivide_edges") return;
	let i = Fn(e, ue(e, t.edges, T(e)), t.cuts);
	if (i.vertices > n.maxVertices || i.faces > n.maxFaces) throw RangeError(`Mesh edit ${r} (subdivide_edges) would make up to ${i.vertices} vertices and ${i.faces} faces, over the limit of ${n.maxVertices} vertices and ${n.maxFaces} faces. Lower cuts or select fewer edges.`);
}
function fr(e, t) {
	return ue(e, t, T(e));
}
function pr(e, t) {
	switch (t.op) {
		case "fill_holes": {
			let n = Wt(e, {
				sides: t.sides ?? Infinity,
				name: t.name
			});
			return {
				mesh: n.mesh,
				result: {
					filled: n.filled,
					skipped: n.skipped
				}
			};
		}
		case "dissolve_faces": {
			let n = S(e, t.select);
			if (Ee(n) === 0) throw RangeError("The rule selects no faces. Check it with mesh_inspect tags and counts.");
			let r = Jt(e, n, { name: t.name });
			return {
				mesh: r.mesh,
				result: { merged: r.merged }
			};
		}
		case "dissolve_edges": {
			let n = Yt(e, fr(e, t.edges), { name: t.name });
			return {
				mesh: n.mesh,
				result: {
					merged: n.merged,
					dissolvedEdges: n.dissolvedEdges
				}
			};
		}
		case "dissolve_verts": {
			let n = Zt(e, tn(e, t.verts), { name: t.name });
			return {
				mesh: n.mesh,
				result: {
					merged: n.merged,
					removedStraight: n.removedStraight
				}
			};
		}
		case "dissolve_limited": {
			let n = $t(e, fr(e, t.edges), {
				angle: t.angle,
				name: t.name
			});
			return {
				mesh: n.mesh,
				result: {
					merged: n.merged,
					removedStraight: n.removedStraight
				}
			};
		}
		case "bisect_plane": {
			let n = yn(e, t);
			return {
				mesh: n.mesh,
				result: {
					cutFaces: n.cutFaces,
					capped: n.capped,
					unfilled: n.unfilled
				}
			};
		}
		case "bridge_edge_loops": {
			let n = Dn(e, fr(e, t.edges), {
				segments: t.segments,
				twist: t.twistOffset,
				name: t.name
			});
			return {
				mesh: n.mesh,
				result: {
					loopEdges: n.loopEdges,
					strips: n.strips
				}
			};
		}
		case "subdivide_edges": {
			let n = In(e, fr(e, t.edges), {
				cuts: t.cuts,
				name: t.name
			});
			return {
				mesh: n.mesh,
				result: {
					splitEdges: n.splitEdges,
					splitFaces: n.splitFaces
				}
			};
		}
		case "grid_fill": {
			let n = Nn(e, fr(e, t.edges), { name: t.name });
			return {
				mesh: n.mesh,
				result: { loops: n.loops }
			};
		}
		case "knife_project": {
			let n = nr(e, t);
			return {
				mesh: n.mesh,
				result: {
					cutFaces: n.cutFaces,
					newVertices: n.newVertices
				}
			};
		}
	}
	throw TypeError(`Not a cutting edit: ${t.op}`);
}
// src/mesh-field-edits.js
var mr = Object.freeze([
	"normal",
	"x",
	"y",
	"z"
]), hr = /* @__PURE__ */ new Map([
	["x", [
		1,
		0,
		0
	]],
	["y", [
		0,
		1,
		0
	]],
	["z", [
		0,
		0,
		1
	]]
]);
function L(e, t) {
	return E({
		positions: t,
		faceOffsets: e.faceOffsets,
		cornerVertices: e.cornerVertices,
		edgeVertices: e.edgeVertices,
		cornerEdges: e.cornerEdges,
		attributes: e.attributes
	});
}
function R(e, t) {
	let n = new Uint8Array(e.vertexCount);
	if (!t) return n.fill(1), n;
	let r = S(e, t);
	for (let t = 0; t < e.faceCount; t++) if (r[t]) for (let r = e.faceOffsets[t]; r < e.faceOffsets[t + 1]; r++) n[e.cornerVertices[r]] = 1;
	return n;
}
function gr(e, { select: t, position: n, offset: r }, i) {
	let a = D(e, "point", i), o = n === void 0 ? null : p(n, a, { kind: "vector" }).values, s = r === void 0 ? null : p(r, a, { kind: "vector" }).values, c = R(e, t), l = new Float32Array(e.positions), u = 0;
	for (let t = 0; t < e.vertexCount; t++) if (c[t]) {
		u++;
		for (let n = 0; n < 3; n++) {
			let r = o ? o[t * 3 + n] : e.positions[t * 3 + n];
			l[t * 3 + n] = r + (s ? s[t * 3 + n] : 0);
		}
	}
	return {
		mesh: L(e, l),
		movedVertices: u
	};
}
function _r(e, { select: t, field: n, strength: r = 1, midlevel: i = .5, direction: a = "normal", group: o }, s) {
	let c = D(e, "point", s), { values: l } = p(n, c, { kind: "scalar" }), u = a === "normal" ? C(e) : null, d = hr.get(a), f = R(e, t), m = o === void 0 ? null : ae(e, o), h = new Float32Array(e.positions), g = 0;
	for (let t = 0; t < e.vertexCount; t++) {
		if (!f[t]) continue;
		let e = m ? m[t] : 1;
		if (e === 0) continue;
		g++;
		let n = (l[t] - i) * r * e;
		for (let e = 0; e < 3; e++) {
			let r = u ? u[t * 3 + e] : d[e];
			h[t * 3 + e] += n * r;
		}
	}
	return {
		mesh: L(e, h),
		movedVertices: g
	};
}
// src/mesh-attribute-edits.js
var vr = Object.freeze([
	"x",
	"y",
	"z"
]), yr = "color", br = Object.freeze({
	x: 0,
	y: 1,
	z: 2
});
function z(e, t) {
	return /* @__PURE__ */ TypeError(`Mesh edit ${e} (${t})`);
}
function xr(e, t, n, r) {
	return r(e, t, n, {
		minimum: 0,
		maximum: 1
	});
}
function Sr(e, t, n, { finiteNumber: r, valuesKey: i, readValue: a }) {
	if (!e || typeof e != "object" || Array.isArray(e)) throw z(n, `gradient must be { axis, range: [low, high], ${i}: [atLow, atHigh] }`);
	for (let t of Object.keys(e)) if (![
		"axis",
		"range",
		i
	].includes(t)) throw z(n, `gradient does not take ${t}; fields: axis, range, ${i}`);
	if (!vr.includes(e.axis)) throw z(n, `gradient.axis must be one of ${vr.join(", ")}`);
	if (!Array.isArray(e.range) || e.range.length !== 2) throw z(n, "gradient.range needs two numbers, low then high");
	let o = e.range.map((e) => r(e, n, "gradient.range"));
	if (!(o[0] < o[1])) throw z(n, "gradient.range must have low below high");
	if (!Array.isArray(e[i]) || e[i].length !== 2) throw z(n, `gradient.${i} needs two entries, the value at the low end then at the high end`);
	t.gradient = {
		axis: e.axis,
		range: o,
		[i]: e[i].map((e, t) => a(e, `gradient.${i}[${t}]`))
	};
}
function Cr(e, t, n) {
	let r = n.filter((t) => e[t] !== void 0);
	if (r.length > 1) throw z(t, `give only one of ${n.join(", ")}`);
	return r[0];
}
function wr(e, t, n, { finiteNumber: r, checkedField: i }) {
	let a = Cr(e, n, [
		"weight",
		"field",
		"gradient"
	]);
	a === "field" ? t.field = i(e.field, n, "field", "scalar") : a === "gradient" ? Sr(e.gradient, t, n, {
		finiteNumber: r,
		valuesKey: "weights",
		readValue: (e, t) => xr(e, n, t, r)
	}) : t.weight = e.weight === void 0 ? 1 : xr(e.weight, n, "weight", r);
}
function Tr(e, t, n, { finiteNumber: r, checkedField: i }) {
	let a = (e, t) => {
		if (!Array.isArray(e) || e.length !== 3) throw z(n, `${t} needs three numbers from 0 to 1`);
		return e.map((e) => xr(e, n, t, r));
	}, o = Cr(e, n, [
		"color",
		"field",
		"gradient"
	]);
	o === "field" ? t.field = i(e.field, n, "field", "vector") : o === "gradient" ? Sr(e.gradient, t, n, {
		finiteNumber: r,
		valuesKey: "colors",
		readValue: a
	}) : t.color = e.color === void 0 ? [
		1,
		1,
		1
	] : a(e.color, "color");
}
function Er(e, t, n, r) {
	let i = {
		point: { ...e.attributes.point },
		edge: { ...e.attributes.edge },
		face: { ...e.attributes.face },
		corner: { ...e.attributes.corner }
	};
	return i[t][n] = r, E({
		positions: e.positions,
		faceOffsets: e.faceOffsets,
		cornerVertices: e.cornerVertices,
		edgeVertices: e.edgeVertices,
		cornerEdges: e.cornerEdges,
		attributes: i
	});
}
function Dr(e, t) {
	let n = br[t.axis], [r, i] = t.range, a = new Float64Array(e.vertexCount);
	for (let t = 0; t < e.vertexCount; t++) {
		let o = (e.positions[t * 3 + n] - r) / (i - r);
		a[t] = Math.min(1, Math.max(0, o));
	}
	return a;
}
function Or(e, { select: t, name: n, weight: r, field: i, gradient: a }, o) {
	let s = te + n, c = e.attributes.point[s];
	if (!c && Se(e).length >= 32) throw RangeError("A mesh holds at most 32 vertex groups.");
	let l = c ? Float32Array.from(c.data) : new Float32Array(e.vertexCount), u = R(e, t), d = i === void 0 ? null : p(i, D(e, "point", o), { kind: "scalar" }).values, f = a ? Dr(e, a) : null, m = 0;
	for (let t = 0; t < e.vertexCount; t++) {
		if (!u[t]) continue;
		m++;
		let e = r;
		d && (e = d[t]), f && (e = a.weights[0] + (a.weights[1] - a.weights[0]) * f[t]), l[t] = Math.min(1, Math.max(0, e));
	}
	return {
		mesh: Er(e, "point", s, {
			data: l,
			size: 1
		}),
		assignedVertices: m
	};
}
function kr(e, { select: t, color: n, field: r, gradient: i }, a) {
	let o = e.attributes.corner[yr], s = o?.size === 3 ? Float32Array.from(o.data) : new Float32Array(e.cornerCount * 3).fill(1), c = t ? S(e, t) : null, l = r === void 0 ? null : p(r, D(e, "point", a), { kind: "vector" }).values, u = i ? Dr(e, i) : null, d = 0;
	for (let t = 0; t < e.faceCount; t++) if (!c || c[t]) for (let r = e.faceOffsets[t]; r < e.faceOffsets[t + 1]; r++) {
		let t = e.cornerVertices[r];
		d++;
		for (let e = 0; e < 3; e++) {
			let a = n?.[e];
			l && (a = l[t * 3 + e]), u && (a = i.colors[0][e] + (i.colors[1][e] - i.colors[0][e]) * u[t]), s[r * 3 + e] = Math.min(1, Math.max(0, a));
		}
	}
	return {
		mesh: Er(e, "corner", yr, {
			data: s,
			size: 3
		}),
		assignedCorners: d
	};
}
function Ar(e, t) {
	let n = e.vertexCount, r = e.edgeCount, i = e.faceCount, a = e.cornerCount;
	for (let e = 0; e < t; e++) n += r + i, r = 2 * r + a, i = a, a *= 4;
	return {
		vertices: n,
		edges: r,
		faces: i,
		corners: a
	};
}
function jr(e, t, n) {
	let r = new Float64Array(e.edgeCount);
	if (!t) return r;
	let i = ue(e, t, T(e));
	if (!i.includes(1)) throw RangeError("The crease rule selects no edges with two faces. Check tags with mesh_inspect, or lower angle.");
	for (let t = 0; t < e.edgeCount; t++) i[t] && (r[t] = n);
	return r;
}
function Mr(e, t, n) {
	return e + 1 === n ? t : e + 1;
}
function Nr(e) {
	let { positions: t, faceOffsets: n, cornerVertices: r, faceCount: i } = e, a = new Float64Array(i * 3);
	for (let e = 0; e < i; e++) {
		let i = n[e], o = n[e + 1];
		for (let n = i; n < o; n++) {
			let i = r[n] * 3;
			a[e * 3] += t[i], a[e * 3 + 1] += t[i + 1], a[e * 3 + 2] += t[i + 2];
		}
		let s = o - i;
		a[e * 3] /= s, a[e * 3 + 1] /= s, a[e * 3 + 2] /= s;
	}
	return a;
}
function Pr(e) {
	let { faceOffsets: t, cornerEdges: n, edgeCount: r, faceCount: i } = e, a = new Int32Array(r).fill(-1), o = new Int32Array(r).fill(-1), s = new Uint32Array(r);
	for (let e = 0; e < i; e++) for (let r = t[e]; r < t[e + 1]; r++) {
		let t = n[r];
		s[t] === 0 && (a[t] = e), s[t] === 1 && (o[t] = e), s[t]++;
	}
	return {
		firstFace: a,
		secondFace: o,
		faceUses: s
	};
}
function Fr(e, t) {
	let n = new Float64Array(e.edgeCount);
	for (let r = 0; r < e.edgeCount; r++) n[r] = t.faceUses[r] === 2 ? e.edgeSharpness[r] : Infinity;
	return n;
}
function Ir(e, t, n, r) {
	let { positions: i, edgeVertices: a, edgeCount: o } = e, s = new Float64Array(o * 3);
	for (let e = 0; e < o; e++) {
		let o = a[e * 2] * 3, c = a[e * 2 + 1] * 3, l = Math.min(1, r[e]), u = n.firstFace[e] * 3, d = n.secondFace[e] * 3;
		for (let n = 0; n < 3; n++) {
			let r = (i[o + n] + i[c + n]) / 2;
			if (l >= 1) {
				s[e * 3 + n] = r;
				continue;
			}
			let a = (i[o + n] + i[c + n] + t[u + n] + t[d + n]) / 4;
			s[e * 3 + n] = a + (r - a) * l;
		}
	}
	return s;
}
function Lr(e, t, n) {
	let { positions: r, vertexCount: i, edgeVertices: a, edgeCount: o, faceOffsets: s, cornerVertices: c, faceCount: l } = e, u = new Float64Array(i * 3), d = new Float64Array(i * 3), f = new Float64Array(i * 3), p = new Uint32Array(i), m = new Uint32Array(i), h = new Uint32Array(i), g = new Float64Array(i);
	for (let e = 0; e < l; e++) for (let n = s[e]; n < s[e + 1]; n++) {
		let r = c[n];
		p[r]++;
		for (let n = 0; n < 3; n++) u[r * 3 + n] += t[e * 3 + n];
	}
	for (let e = 0; e < o; e++) {
		let t = n[e] > 0;
		for (let i = 0; i < 2; i++) {
			let o = a[e * 2 + i], s = a[e * 2 + 1 - i];
			m[o]++;
			for (let e = 0; e < 3; e++) d[o * 3 + e] += (r[o * 3 + e] + r[s * 3 + e]) / 2, t && (f[o * 3 + e] += r[s * 3 + e]);
			t && (h[o]++, g[o] += Math.min(1, n[e]));
		}
	}
	return {
		faceSum: u,
		midpointSum: d,
		sharpNeighborSum: f,
		faceTotal: p,
		edgeTotal: m,
		sharpTotal: h,
		sharpnessSum: g
	};
}
function Rr(e, t, n) {
	let { positions: r, vertexCount: i } = e, a = Lr(e, t, n), o = new Float64Array(i * 3);
	for (let e = 0; e < i; e++) {
		let t = a.sharpTotal[e], n = a.edgeTotal[e], i = t >= 3 || t === 2 && a.faceTotal[e] === 1 && n === 2, s = t === 2 && !i, c = t >= 2 ? a.sharpnessSum[e] / t : 0;
		for (let t = 0; t < 3; t++) {
			let l = r[e * 3 + t], u = (a.faceSum[e * 3 + t] / Math.max(a.faceTotal[e], 1) + 2 * (a.midpointSum[e * 3 + t] / Math.max(n, 1)) + (n - 3) * l) / n, d = u;
			i && (d = l), s && (d = (6 * l + a.sharpNeighborSum[e * 3 + t]) / 8), o[e * 3 + t] = u + (d - u) * Math.min(1, c);
		}
	}
	return o;
}
function zr(e, t) {
	let n = {}, { faceOffsets: r, faceCount: i } = e;
	for (let [a, o] of Object.entries(t)) {
		let { data: t, size: s } = o, c = t instanceof Float32Array, l = new t.constructor(e.cornerCount * 4 * s);
		for (let e = 0; e < i; e++) {
			let n = r[e], i = r[e + 1];
			for (let e = 0; e < s; e++) {
				let r = 0;
				for (let a = n; a < i; a++) r += t[a * s + e];
				let a = c ? r / (i - n) : t[n * s + e];
				for (let r = n; r < i; r++) {
					let o = r * 4 * s + e, u = t[r * s + e], d = t[Mr(r, n, i) * s + e], f = t[(r === n ? i - 1 : r - 1) * s + e];
					l[o] = u, l[o + s] = c ? (u + d) / 2 : u, l[o + 2 * s] = a, l[o + 3 * s] = c ? (u + f) / 2 : u;
				}
			}
		}
		n[a] = {
			data: l,
			size: s
		};
	}
	return n;
}
function Br(e, t) {
	let n = {};
	for (let [r, i] of Object.entries(t)) {
		let { data: t, size: a } = i, o = new t.constructor(e.cornerCount * a);
		for (let n = 0; n < e.faceCount; n++) for (let r = e.faceOffsets[n]; r < e.faceOffsets[n + 1]; r++) o.set(t.subarray(n * a, (n + 1) * a), r * a);
		n[r] = {
			data: o,
			size: a
		};
	}
	return n;
}
function Vr(e, t, n) {
	let r = new Float64Array(t.edgeCount), i = new Int32Array(t.edgeCount).fill(-1);
	for (let n = 0; n < e.cornerCount; n++) {
		let a = e.cornerEdges[n], o = e.cornerFaceStarts[n], s = n === o ? e.cornerFaceEnds[n] - 1 : n - 1, c = [t.cornerEdges[n * 4], t.cornerEdges[n * 4 + 3]], l = [a, e.cornerEdges[s]];
		c.forEach((t, n) => {
			i[t] = l[n], r[t] = Math.max(0, e.edgeSharpness[l[n]] - 1);
		});
	}
	let a = {};
	for (let [e, r] of Object.entries(n)) {
		let { data: n, size: o } = r, s = new n.constructor(t.edgeCount * o);
		i.forEach((e, t) => {
			e !== -1 && s.set(n.subarray(e * o, (e + 1) * o), t * o);
		}), a[e] = {
			data: s,
			size: o
		};
	}
	return {
		sharpness: r,
		attributes: a
	};
}
function Hr(e) {
	let t = new Uint32Array(e.cornerCount), n = new Uint32Array(e.cornerCount);
	for (let r = 0; r < e.faceCount; r++) for (let i = e.faceOffsets[r]; i < e.faceOffsets[r + 1]; i++) t[i] = e.faceOffsets[r], n[i] = e.faceOffsets[r + 1];
	return {
		cornerFaceStarts: t,
		cornerFaceEnds: n
	};
}
function Ur(e, t, n, r) {
	let { vertexCount: i, edgeCount: a, faceCount: o, faceOffsets: s, cornerVertices: c, cornerEdges: l } = e, u = new Float64Array((i + a + o) * 3);
	u.set(r), u.set(n, i * 3), u.set(t, (i + a) * 3);
	let d = new Uint32Array(e.cornerCount * 4);
	for (let e = 0; e < o; e++) {
		let t = s[e], n = s[e + 1];
		for (let r = t; r < n; r++) {
			let o = r === t ? n - 1 : r - 1;
			d[r * 4] = c[r], d[r * 4 + 1] = i + l[r], d[r * 4 + 2] = i + a + e, d[r * 4 + 3] = i + l[o];
		}
	}
	let f = new Uint32Array(e.cornerCount + 1);
	for (let t = 0; t <= e.cornerCount; t++) f[t] = t * 4;
	return {
		positions: u,
		faceOffsets: f,
		cornerVertices: d
	};
}
function Wr(e) {
	let t = Nr(e), n = Pr(e), r = Fr(e, n), i = Ur(e, t, Ir(e, t, n, r), Rr(e, t, r)), a = _e(i.positions.length / 3, i.faceOffsets, i.cornerVertices), o = {
		...i,
		vertexCount: i.positions.length / 3,
		faceCount: e.cornerCount,
		cornerCount: e.cornerCount * 4,
		edgeVertices: a.edgeVertices,
		cornerEdges: a.cornerEdges,
		edgeCount: a.edgeCount
	}, s = Vr({
		...e,
		...Hr(e)
	}, o, e.attributes.edge);
	return o.edgeSharpness = s.sharpness, o.attributes = {
		face: Br(e, e.attributes.face),
		corner: zr(e, e.attributes.corner),
		edge: s.attributes
	}, o;
}
function Gr(e, { levels: t = 1, crease: n, sharpness: r = 10 } = {}) {
	let i = {
		positions: Float64Array.from(e.positions),
		vertexCount: e.vertexCount,
		edgeCount: e.edgeCount,
		faceCount: e.faceCount,
		cornerCount: e.cornerCount,
		faceOffsets: e.faceOffsets,
		cornerVertices: e.cornerVertices,
		edgeVertices: e.edgeVertices,
		cornerEdges: e.cornerEdges,
		edgeSharpness: jr(e, n, r),
		attributes: e.attributes
	};
	for (let e = 0; e < t; e++) i = Wr(i);
	return E({
		positions: Float32Array.from(i.positions),
		faceOffsets: i.faceOffsets,
		cornerVertices: i.cornerVertices,
		edgeVertices: i.edgeVertices,
		cornerEdges: i.cornerEdges,
		attributes: {
			point: {},
			...i.attributes
		}
	});
}
var Kr = 100, qr = .2, Jr = 1.5, Yr = class {
	constructor() {
		this.entries = [];
	}
	get size() {
		return this.entries.length;
	}
	push(e) {
		let t = this.entries, n = t.length;
		for (t.push(e); n > 0;) {
			let r = n - 1 >> 1;
			if (t[r].cost <= e.cost) break;
			t[n] = t[r], n = r;
		}
		t[n] = e;
	}
	pop() {
		let e = this.entries, t = e[0], n = e.pop();
		if (e.length) {
			let t = 0;
			for (;;) {
				let r = t * 2 + 1;
				if (r >= e.length || (r + 1 < e.length && e[r + 1].cost < e[r].cost && r++, e[r].cost >= n.cost)) break;
				e[t] = e[r], t = r;
			}
			e[t] = n;
		}
		return t;
	}
};
function Xr(e, t, n, r, i, a, o) {
	let s = t * 10;
	e[s] += o * n * n, e[s + 1] += o * n * r, e[s + 2] += o * n * i, e[s + 3] += o * n * a, e[s + 4] += o * r * r, e[s + 5] += o * r * i, e[s + 6] += o * r * a, e[s + 7] += o * i * i, e[s + 8] += o * i * a, e[s + 9] += o * a * a;
}
function Zr(e, t, n, r) {
	return e[0] * t * t + 2 * e[1] * t * n + 2 * e[2] * t * r + 2 * e[3] * t + e[4] * n * n + 2 * e[5] * n * r + 2 * e[6] * n + e[7] * r * r + 2 * e[8] * r + e[9];
}
function Qr(e) {
	let [t, n, r, i, a, o, s, c, l] = e, u = t * (a * c - o * o) - n * (n * c - o * r) + r * (n * o - a * r), d = Math.abs(t) * Math.abs(a) * Math.abs(c);
	return Math.abs(u) <= 1e-9 * d || d === 0 ? null : [
		-(i * (a * c - o * o) - n * (s * c - o * l) + r * (s * o - a * l)) / u,
		-(t * (s * c - o * l) - i * (n * c - o * r) + r * (n * l - s * r)) / u,
		-(t * (a * l - s * o) - n * (n * l - s * r) + i * (n * o - a * r)) / u
	];
}
function $r(e, t, n) {
	return Math.sqrt(e * e + t * t + n * n);
}
function B(e, t, n) {
	return e < t ? e * n + t : t * n + e;
}
function ei(e) {
	let t = Object.entries(e.attributes.face).filter(([e]) => e.startsWith(oe)).map(([, e]) => e.data);
	return Uint32Array.from({ length: e.faceCount }, (e, n) => {
		let r = 0;
		return t.forEach((e, t) => {
			r = r * 31 + (e[n] ? t + 1 : 0) >>> 0;
		}), r;
	});
}
var ti = class {
	constructor(e) {
		this.mesh = e, this.vertexCount = e.vertexCount, this.positions = Float64Array.from(e.positions), this.cornerBuffer = /* @__PURE__ */ new Float64Array(9), this.combinedQuadric = /* @__PURE__ */ new Float64Array(10);
		let { triangleCorners: t, triangleFaces: n } = x(e, f(e).normals);
		this.triangleCount = n.length, this.sourceFaces = n, this.triangles = Int32Array.from(t, (t) => e.cornerVertices[t]), this.alive = new Uint8Array(this.triangleCount).fill(1), this.aliveCount = this.triangleCount, this.vertexAlive = new Uint8Array(this.vertexCount).fill(1), this.vertexTriangles = Array.from({ length: this.vertexCount }, () => []);
		for (let e = 0; e < this.triangleCount; e++) for (let t = 0; t < 3; t++) this.vertexTriangles[this.triangles[e * 3 + t]].push(e);
		this.quadrics = new Float64Array(this.vertexCount * 10), this.constrainedVertex = new Uint8Array(this.vertexCount), this.constraintEdges = /* @__PURE__ */ new Set(), this.buildQuadrics();
	}
	triangleNormal(e, t = -1, n = null) {
		let r = this.cornerBuffer;
		for (let i = 0; i < 3; i++) {
			let a = this.triangles[e * 3 + i], o = a === t ? n : this.positions, s = a === t ? 0 : a * 3;
			r[i * 3] = o[s], r[i * 3 + 1] = o[s + 1], r[i * 3 + 2] = o[s + 2];
		}
		let i = r[3] - r[0], a = r[4] - r[1], o = r[5] - r[2], s = r[6] - r[0], c = r[7] - r[1], l = r[8] - r[2];
		return [
			a * l - o * c,
			o * s - i * l,
			i * c - a * s
		];
	}
	buildQuadrics() {
		let e = ei(this.mesh), t = /* @__PURE__ */ new Map();
		for (let e = 0; e < this.triangleCount; e++) {
			let n = this.triangleNormal(e), r = Math.hypot(...n);
			if (r > 0) {
				let t = n.map((e) => e / r), i = this.triangles[e * 3] * 3, a = -(t[0] * this.positions[i] + t[1] * this.positions[i + 1] + t[2] * this.positions[i + 2]);
				for (let n = 0; n < 3; n++) Xr(this.quadrics, this.triangles[e * 3 + n], t[0], t[1], t[2], a, r / 2);
			}
			for (let n = 0; n < 3; n++) {
				let r = B(this.triangles[e * 3 + n], this.triangles[e * 3 + (n + 1) % 3], this.vertexCount);
				t.has(r) || t.set(r, []), t.get(r).push(e);
			}
		}
		for (let [n, r] of t) {
			let t = r.every((t) => e[this.sourceFaces[t]] === e[this.sourceFaces[r[0]]]);
			if (r.length === 2 && t) continue;
			this.constraintEdges.add(n);
			let i = Math.floor(n / this.vertexCount), a = n - i * this.vertexCount;
			this.constrainedVertex[i] = 1, this.constrainedVertex[a] = 1;
			for (let e of r) this.addConstraintPlane(i, a, e);
		}
	}
	addConstraintPlane(e, t, n) {
		let r = [
			0,
			1,
			2
		].map((n) => this.positions[t * 3 + n] - this.positions[e * 3 + n]), i = this.triangleNormal(n), a = [
			r[1] * i[2] - r[2] * i[1],
			r[2] * i[0] - r[0] * i[2],
			r[0] * i[1] - r[1] * i[0]
		], o = Math.hypot(...a);
		if (o === 0) return;
		let s = a.map((e) => e / o), c = -(s[0] * this.positions[e * 3] + s[1] * this.positions[e * 3 + 1] + s[2] * this.positions[e * 3 + 2]), l = Kr * (r[0] ** 2 + r[1] ** 2 + r[2] ** 2);
		Xr(this.quadrics, e, s[0], s[1], s[2], c, l), Xr(this.quadrics, t, s[0], s[1], s[2], c, l);
	}
	neighbors(e) {
		let t = /* @__PURE__ */ new Set();
		for (let n of this.vertexTriangles[e]) for (let e = 0; e < 3; e++) t.add(this.triangles[n * 3 + e]);
		return t.delete(e), t;
	}
	evaluate(e, t) {
		let n = this.vertexTriangles[e].filter((e) => this.vertexTriangles[t].includes(e));
		if (!n.length) return null;
		let r = this.constrainedVertex[e] === 1, i = this.constrainedVertex[t] === 1;
		if (r && i && !this.constraintEdges.has(B(e, t, this.vertexCount))) return null;
		let a = this.neighbors(t);
		if ([...this.neighbors(e)].filter((e) => a.has(e)).length !== n.length) return null;
		let o = this.chooseTarget(e, t, r, i);
		return this.keepsOrientation(e, t, n, o.point) ? o : null;
	}
	chooseTarget(e, t, n, r) {
		let i = this.combinedQuadric;
		for (let n = 0; n < 10; n++) i[n] = this.quadrics[e * 10 + n] + this.quadrics[t * 10 + n];
		let a = (e) => [
			this.positions[e * 3],
			this.positions[e * 3 + 1],
			this.positions[e * 3 + 2]
		], o = a(e), s = a(t), c = [];
		if (n !== r) c.push(n ? o : s);
		else {
			let e = [
				(o[0] + s[0]) / 2,
				(o[1] + s[1]) / 2,
				(o[2] + s[2]) / 2
			];
			c.push(o, s, e);
			let t = n ? null : Qr(i), r = t && $r(t[0] - e[0], t[1] - e[1], t[2] - e[2]);
			t && r <= Jr * $r(o[0] - s[0], o[1] - s[1], o[2] - s[2]) && c.push(t);
		}
		let l = null;
		for (let e of c) {
			let t = Zr(i, e[0], e[1], e[2]);
			(!l || t < l.cost) && (l = {
				point: e,
				cost: Math.max(t, 0)
			});
		}
		return l;
	}
	keepsOrientation(e, t, n, r) {
		for (let i of [e, t]) for (let e of this.vertexTriangles[i]) {
			if (n.includes(e)) continue;
			let t = this.triangleNormal(e), a = this.triangleNormal(e, i, r), o = $r(t[0], t[1], t[2]) * $r(a[0], a[1], a[2]);
			if (o === 0 || (t[0] * a[0] + t[1] * a[1] + t[2] * a[2]) / o < qr) return !1;
		}
		return !0;
	}
	collapse(e, t, n) {
		for (let n of [...this.vertexTriangles[t]]) {
			let r = [
				0,
				1,
				2
			].map((e) => this.triangles[n * 3 + e]);
			if (r.includes(e)) {
				this.alive[n] = 0, this.aliveCount--;
				for (let e of r) this.dropTriangle(e, n);
			} else this.triangles[n * 3 + r.indexOf(t)] = e, this.vertexTriangles[e].push(n);
		}
		this.moveConstraintEdges(e, t), this.positions.set(n, e * 3);
		for (let n = 0; n < 10; n++) this.quadrics[e * 10 + n] += this.quadrics[t * 10 + n];
		this.constrainedVertex[e] ||= this.constrainedVertex[t], this.vertexAlive[t] = 0, this.vertexTriangles[t] = [];
	}
	moveConstraintEdges(e, t) {
		if (this.constrainedVertex[t]) for (let n of this.neighbors(t)) {
			let r = B(t, n, this.vertexCount);
			this.constraintEdges.has(r) && (this.constraintEdges.delete(r), n !== e && this.constraintEdges.add(B(e, n, this.vertexCount)));
		}
	}
	dropTriangle(e, t) {
		let n = this.vertexTriangles[e], r = n.indexOf(t);
		r >= 0 && (n[r] = n[n.length - 1], n.pop());
	}
	run(e) {
		let t = new Yr(), n = (e, n) => {
			let r = this.constrainedVertex[e] === 1, i = this.constrainedVertex[n] === 1;
			r && i && !this.constraintEdges.has(B(e, n, this.vertexCount)) || t.push({
				cost: this.chooseTarget(e, n, r, i).cost,
				first: e,
				second: n
			});
		};
		for (let e = 0; e < this.triangleCount; e++) for (let t = 0; t < 3; t++) {
			let r = this.triangles[e * 3 + t], i = this.triangles[e * 3 + (t + 1) % 3];
			(r < i || !this.hasTriangleOnOtherSide(r, i, e)) && n(r, i);
		}
		for (; this.aliveCount > e && t.size;) {
			let { cost: e, first: r, second: i } = t.pop();
			if (!this.vertexAlive[r] || !this.vertexAlive[i]) continue;
			let a = this.evaluate(r, i);
			if (a) {
				if (a.cost > e * 1.0001 + 1e-18) t.push({
					cost: a.cost,
					first: r,
					second: i
				});
				else {
					this.collapse(r, i, a.point);
					for (let e of this.neighbors(r)) n(r, e);
				}
			}
		}
	}
	hasTriangleOnOtherSide(e, t, n) {
		return this.vertexTriangles[e].some((e) => e !== n && this.vertexTriangles[t].includes(e));
	}
	result() {
		let e = new Int32Array(this.vertexCount).fill(-1), t = [];
		for (let e = 0; e < this.triangleCount; e++) this.alive[e] && t.push(e);
		let n = [], r = new Uint32Array(t.length * 3);
		t.forEach((t, i) => {
			for (let a = 0; a < 3; a++) {
				let o = this.triangles[t * 3 + a];
				e[o] < 0 && (e[o] = n.length / 3, n.push(this.positions[o * 3], this.positions[o * 3 + 1], this.positions[o * 3 + 2])), r[i * 3 + a] = e[o];
			}
		});
		let i = Uint32Array.from({ length: t.length + 1 }, (e, t) => t * 3), a = {};
		for (let [e, n] of Object.entries(this.mesh.attributes.face)) e.startsWith("tag:") && (a[e] = {
			data: Uint8Array.from(t, (e) => n.data[this.sourceFaces[e]]),
			size: 1
		});
		return E({
			positions: Float32Array.from(n),
			faceOffsets: i,
			cornerVertices: r,
			attributes: { face: a }
		});
	}
};
function ni(e, { ratio: t }) {
	if (typeof t != "number" || !(t > 0) || t > 1) throw RangeError("ratio must be above 0 and at most 1.");
	let n = new ti(e), r = n.aliveCount, i = Math.max(4, Math.ceil(r * t));
	n.run(i);
	let a = n.result();
	return {
		mesh: a,
		triangles: {
			before: r,
			after: a.faceCount
		},
		reachedTarget: a.faceCount <= i
	};
}
// src/mesh-restructure.js
var ri = 1e-6;
function ii(e, t, n) {
	return t + 1 === e.faceOffsets[n + 1] ? e.faceOffsets[n] : t + 1;
}
function ai(e, t) {
	for (let n = 0; n < e.vertexCount; n++) t.addVertex(e.positions[n * 3], e.positions[n * 3 + 1], e.positions[n * 3 + 2]);
}
function oi(e, t) {
	let n = [];
	for (let r = e.faceOffsets[t]; r < e.faceOffsets[t + 1]; r++) n.push(r);
	return n;
}
function si(e, t, n) {
	let r = oi(t, n);
	e.addFace(r.map((e) => t.cornerVertices[e]), {
		sourceFace: n,
		sourceCorners: r,
		sourceEdges: r.map((e) => t.cornerEdges[e])
	});
}
function ci(e, t, n, r) {
	let i = r.map((e, i) => {
		let a = r[(i + 1) % 3];
		return ii(t, e, n) === a ? t.cornerEdges[e] : -1;
	});
	e.addFace(r.map((e) => t.cornerVertices[e]), {
		sourceFace: n,
		sourceCorners: r,
		sourceEdges: i
	});
}
function li(e, { minVertices: t = 4, maxFaces: n = Infinity } = {}) {
	let r = 0;
	for (let n = 0; n < e.faceCount; n++) {
		let i = e.faceOffsets[n + 1] - e.faceOffsets[n];
		r += i >= t ? i - 2 : 1;
	}
	if (r > n) throw RangeError(`triangulate would make ${r} faces, over the limit of ${n}.`);
	let { triangleCorners: i, triangleFaces: a } = x(e, f(e).normals), o = new re(e);
	ai(e, o);
	let s = 0, c = 0;
	for (let n = 0; n < e.faceCount; n++) {
		let r = e.faceOffsets[n + 1] - e.faceOffsets[n];
		if (r < t) si(o, e, n), s += r - 2;
		else {
			r > 3 && c++;
			for (let t = r - 2; t > 0; t--, s++) ci(o, e, n, Array.from(i.subarray(s * 3, s * 3 + 3)));
		}
	}
	return {
		mesh: o.build(),
		triangulated: c,
		triangles: r
	};
}
function ui(e, t, n, r) {
	return e.cornerVertices[n] === r ? n : ii(e, n, t[n]);
}
function di(e, t) {
	let n = f(e).normals, r = g(e), i = w(e), a = Math.cos(t * Math.PI / 180) - ri, o = new _(e.cornerCount);
	for (let t = 0; t < e.edgeCount; t++) {
		let s = r.edgeOffsets[t];
		if (r.edgeOffsets[t + 1] - s !== 2) continue;
		let c = r.edgeCorners[s], l = r.edgeCorners[s + 1], u = i[c] * 3, d = i[l] * 3;
		if (!(n[u] * n[d] + n[u + 1] * n[d + 1] + n[u + 2] * n[d + 2] < a)) for (let n of [e.edgeVertices[t * 2], e.edgeVertices[t * 2 + 1]]) o.union(ui(e, i, c, n), ui(e, i, l, n));
	}
	return o;
}
function fi(e, { angle: t = 30, maxVertices: n = Infinity } = {}) {
	let r = di(e, t), i = /* @__PURE__ */ new Map(), a = new Uint8Array(e.vertexCount), o = e.vertexCount, s = new Uint32Array(e.cornerCount);
	for (let t = 0; t < e.cornerCount; t++) {
		let n = r.find(t);
		if (s[t] = n, i.has(n)) continue;
		let c = e.cornerVertices[t];
		i.set(n, a[c] ? -1 : c), a[c] && o++, a[c] = 1;
	}
	if (o > n) throw RangeError(`edge_split would make ${o} vertices, over the limit of ${n}.`);
	let c = new re(e);
	ai(e, c);
	let l = [];
	for (let t = 0; t < e.faceCount; t++) {
		let n = oi(e, t), r = n.map((t) => {
			let n = s[t];
			if (i.get(n) === -1) {
				let r = e.cornerVertices[t] * 3, a = c.addVertex(e.positions[r], e.positions[r + 1], e.positions[r + 2]);
				i.set(n, a), l.push(a);
			}
			return i.get(n);
		});
		c.addFace(r, {
			sourceFace: t,
			sourceCorners: n,
			sourceEdges: n.map((t) => e.cornerEdges[t])
		});
	}
	return {
		mesh: c.build(),
		addedVertices: l.length
	};
}
var pi = Object.freeze({
	x: 0,
	y: 1,
	z: 2
}), mi = 1e-6, hi = 1e-12;
function gi(e, t, n, { maxVertices: r, maxFaces: i }, a) {
	if (t > r || n > i) throw RangeError(`${e} would make ${t} vertices and ${n} faces, over the limit of ${r} vertices and ${i} faces. ${a}`);
}
function _i(e, t) {
	let n = new Uint32Array(t.length / 4 + 1);
	for (let e = 0; e < n.length; e++) n[e] = e * 4;
	return E({
		positions: Float32Array.from(e),
		faceOffsets: n,
		cornerVertices: Uint32Array.from(t)
	});
}
function vi(e, t, n) {
	let r = (t + 1) % 3, i = (t + 2) % 3, a = Math.cos(n), o = Math.sin(n), s = [...e];
	return s[r] = e[r] * a - e[i] * o, s[i] = e[r] * o + e[i] * a, s;
}
function yi(e, { axis: t, angle: n, steps: r, iterations: i, lift: a }, o) {
	let s = r * i, c = n * i / 360, l = a === 0 && Math.abs(c) >= .999999 && Math.abs(c - Math.round(c)) < mi, u = l ? s : s + 1;
	gi("screw", e.vertexCount * u, e.edgeCount * s, o, "Lower steps or iterations, or revolve a smaller profile.");
	let d = pi[t], f = n * Math.PI / 180 / r, p = a / r, m = [];
	for (let t = 0; t < u; t++) for (let n = 0; n < e.vertexCount; n++) {
		let r = vi([
			e.positions[n * 3],
			e.positions[n * 3 + 1],
			e.positions[n * 3 + 2]
		], d, f * t);
		r[d] += p * t, m.push(...r);
	}
	let h = [];
	for (let t = 0; t < s; t++) {
		let n = t * e.vertexCount, r = (t + 1) % u * e.vertexCount;
		for (let t = 0; t < e.edgeCount; t++) {
			let i = e.edgeVertices[t * 2], a = e.edgeVertices[t * 2 + 1];
			h.push(n + i, n + a, r + a, r + i);
		}
	}
	return {
		mesh: _i(m, h),
		result: {
			steps: s,
			closed: l
		}
	};
}
function bi(e, t) {
	return [
		e[1] * t[2] - e[2] * t[1],
		e[2] * t[0] - e[0] * t[2],
		e[0] * t[1] - e[1] * t[0]
	];
}
function V(e) {
	let t = Math.hypot(...e);
	return t > 0 ? e.map((e) => e / t) : e;
}
function xi(e, { thickness: t, offset: n, evenOffset: r, replace: i }, a) {
	let o = i ? 0 : e.vertexCount, s = i ? 0 : e.faceCount;
	gi("wireframe", o + e.vertexCount * 2 + e.cornerCount, s + e.cornerCount * 2, a, "Use a mesh with fewer faces.");
	let c = C(e), l = f(e).normals, u = t / 2, d = [];
	i || d.push(...e.positions);
	for (let t = 0; t < e.vertexCount; t++) for (let r of [(n - 1) * u, (1 + n) * u]) for (let n = 0; n < 3; n++) d.push(e.positions[t * 3 + n] + c[t * 3 + n] * r);
	let p = o + e.vertexCount * 2, m = (t) => [
		e.positions[t * 3],
		e.positions[t * 3 + 1],
		e.positions[t * 3 + 2]
	];
	for (let t = 0; t < e.faceCount; t++) {
		let i = e.faceOffsets[t], a = e.faceOffsets[t + 1], o = [...l.subarray(t * 3, t * 3 + 3)];
		for (let t = i; t < a; t++) {
			let s = e.cornerVertices[t], l = m(e.cornerVertices[t === i ? a - 1 : t - 1]), f = m(e.cornerVertices[t + 1 === a ? i : t + 1]), p = m(s), h = V(p.map((e, t) => e - l[t])), g = V(f.map((e, t) => e - p[t])), _ = bi(o, h), v = bi(o, g), y = _.map((e, t) => e + v[t]), b = _[0] * v[0] + _[1] * v[1] + _[2] * v[2], x = r ? y.map((e) => e * u / Math.max(1 + b, .001)) : V(y).map((e) => e * u);
			for (let e = 0; e < 3; e++) d.push(p[e] + c[s * 3 + e] * n * u + x[e]);
		}
	}
	let h = (e) => o + e * 2, g = (e) => o + e * 2 + 1, _ = [0], v = [], y = (e) => {
		v.push(...e), _.push(v.length);
	};
	if (!i) for (let t = 0; t < e.faceCount; t++) y(Array.from(e.cornerVertices.subarray(e.faceOffsets[t], e.faceOffsets[t + 1])));
	for (let t = 0; t < e.faceCount; t++) {
		let n = e.faceOffsets[t], r = e.faceOffsets[t + 1];
		for (let t = n; t < r; t++) {
			let i = t + 1 === r ? n : t + 1, a = e.cornerVertices[t], o = e.cornerVertices[i];
			y([
				p + t,
				p + i,
				h(o),
				h(a)
			]), y([
				p + i,
				p + t,
				g(a),
				g(o)
			]);
		}
	}
	return {
		mesh: E({
			positions: Float32Array.from(d),
			faceOffsets: Uint32Array.from(_),
			cornerVertices: Uint32Array.from(v)
		}),
		result: {}
	};
}
function Si(e) {
	let t = e.map(Math.abs).indexOf(Math.min(...e.map(Math.abs))), n = [
		0,
		0,
		0
	];
	n[t] = 1;
	let r = V(bi(e, n));
	return [r, bi(e, r)];
}
function Ci(e, t) {
	if (typeof t == "number") return new Float64Array(e.vertexCount).fill(t);
	let { values: n } = p(t, D(e, "point"), { kind: "scalar" });
	for (let t = 0; t < e.vertexCount; t++) if (!(n[t] > 0) || !Number.isFinite(n[t])) throw RangeError(`skin radius must be above zero at every vertex; vertex ${t} has ${n[t]}. Change the radius field, for example wrap it in max.`);
	return n;
}
function wi(e, { radius: t }, n) {
	gi("skin", e.edgeCount * 8, e.edgeCount * 6, n, "Skin a mesh with fewer edges.");
	let r = Ci(e, t), i = [], a = [], o = [];
	for (let t = 0; t < e.edgeCount; t++) {
		let n = e.edgeVertices[t * 2], s = e.edgeVertices[t * 2 + 1], c = [
			e.positions[n * 3],
			e.positions[n * 3 + 1],
			e.positions[n * 3 + 2]
		], l = [
			e.positions[s * 3],
			e.positions[s * 3 + 1],
			e.positions[s * 3 + 2]
		], u = l.map((e, t) => e - c[t]);
		if (Math.hypot(...u) < hi) throw RangeError(`skin edge ${t} has no length. Weld the mesh first.`);
		let [d, f] = Si(V(u)), p = i.length / 3;
		for (let [e, t] of [[c, r[n]], [l, r[s]]]) for (let [n, r] of [
			[-1, -1],
			[1, -1],
			[1, 1],
			[-1, 1]
		]) for (let a = 0; a < 3; a++) i.push(e[a] + (d[a] * n + f[a] * r) * t);
		for (let e = 0; e < 4; e++) {
			let t = (e + 1) % 4;
			a.push(p + e, p + t, p + 4 + t, p + 4 + e);
		}
		o.push([
			p + 3,
			p + 2,
			p + 1,
			p
		], [
			p + 4,
			p + 5,
			p + 6,
			p + 7
		]);
	}
	let s = [0], c = [];
	for (let e = 0; e < a.length; e += 4) c.push(a[e], a[e + 1], a[e + 2], a[e + 3]), s.push(c.length);
	for (let e of o) c.push(...e), s.push(c.length);
	return {
		mesh: E({
			positions: Float32Array.from(i),
			faceOffsets: Uint32Array.from(s),
			cornerVertices: Uint32Array.from(c)
		}),
		result: { tubes: e.edgeCount }
	};
}
function Ti(e, t, n, { finiteNumber: r, integerInRange: i, checkedField: a }) {
	switch (e.op) {
		case "screw":
			if (t.axis = e.axis ?? "z", !Object.hasOwn(pi, t.axis)) throw TypeError(`Mesh edit ${n} (axis must be x, y or z)`);
			t.angle = e.angle === void 0 ? 360 : r(e.angle, n, "angle", {
				minimum: -3600,
				maximum: 3600
			}), t.steps = e.steps === void 0 ? 16 : i(e.steps, n, "steps", 1, 256), t.iterations = e.iterations === void 0 ? 1 : i(e.iterations, n, "iterations", 1, 64), t.lift = e.lift === void 0 ? 0 : r(e.lift, n, "lift", {
				minimum: -1e4,
				maximum: 1e4
			});
			break;
		case "wireframe":
			if (t.thickness = e.thickness === void 0 ? .02 : r(e.thickness, n, "thickness", {
				minimum: 0,
				maximum: 1e3,
				exclusiveMinimum: !0
			}), t.offset = e.offset === void 0 ? 0 : r(e.offset, n, "offset", {
				minimum: -1,
				maximum: 1
			}), t.evenOffset = e.evenOffset ?? !0, t.replace = e.replace ?? !0, typeof t.evenOffset != "boolean" || typeof t.replace != "boolean") throw TypeError(`Mesh edit ${n} (evenOffset and replace must be booleans)`);
			break;
		case "skin": t.radius = e.radius === void 0 ? .1 : typeof e.radius == "number" ? r(e.radius, n, "radius", {
			minimum: 0,
			maximum: 1e3,
			exclusiveMinimum: !0
		}) : a(e.radius, n, "radius", "scalar");
	}
}
var Ei = Object.freeze({
	screw: yi,
	wireframe: xi,
	skin: wi
}), Di = 50, Oi = 1e-6;
function ki(e, { edge: t = {}, corner: n = {} }) {
	return E({
		positions: e.positions,
		faceOffsets: e.faceOffsets,
		cornerVertices: e.cornerVertices,
		edgeVertices: e.edgeVertices,
		cornerEdges: e.cornerEdges,
		attributes: {
			...e.attributes,
			edge: {
				...e.attributes.edge,
				...t
			},
			corner: {
				...e.attributes.corner,
				...n
			}
		}
	});
}
function Ai(e, { angle: t, ignoreSharp: n }) {
	let r = f(e).normals, i = g(e), a = w(e), o = Math.cos(t * Math.PI / 180) - Oi, s = new Uint8Array(e.edgeCount), c = new Uint8Array(e.edgeCount), l = e.attributes.edge.sharp?.data;
	for (let t = 0; t < e.edgeCount; t++) {
		let e = !!l?.[t];
		if (i.edgeOffsets[t + 1] - i.edgeOffsets[t] !== 2) {
			s[t] = +!!e;
			continue;
		}
		let u = a[i.edgeCorners[i.edgeOffsets[t]]] * 3, d = a[i.edgeCorners[i.edgeOffsets[t] + 1]] * 3, f = r[u] * r[d] + r[u + 1] * r[d + 1] + r[u + 2] * r[d + 2] < o;
		s[t] = f || e && !n ? 1 : 0, c[t] = +!s[t];
	}
	return ki(e, { edge: {
		sharp: {
			data: s,
			size: 1
		},
		smooth: {
			data: c,
			size: 1
		}
	} });
}
function ji(e, { angle: t, weight: n }) {
	let { groupOfCorner: r, groupCount: i } = Oe(e, { sharpAngle: t * Math.PI / 180 }), { normals: a, areas: o } = f(e), s = w(e), c = n / Di, l = new Float64Array(i * 3);
	for (let t = 0; t < e.cornerCount; t++) {
		let e = s[t], n = o[e] ** +c;
		for (let i = 0; i < 3; i++) l[r[t] * 3 + i] += a[e * 3 + i] * n;
	}
	let u = new Float32Array(e.cornerCount * 3);
	for (let t = 0; t < e.cornerCount; t++) {
		let e = r[t] * 3, n = Math.hypot(l[e], l[e + 1], l[e + 2]), i = s[t] * 3;
		for (let r = 0; r < 3; r++) u[t * 3 + r] = n > 0 ? l[e + r] / n : a[i + r];
	}
	return ki(e, { corner: { normal: {
		data: u,
		size: 3
	} } });
}
function Mi(e, t, n, { finiteNumber: r }) {
	if (t.angle = e.angle === void 0 ? 30 : r(e.angle, n, "angle", {
		minimum: 0,
		maximum: 180
	}), e.op === "smooth_by_angle") {
		if (t.ignoreSharp = e.ignoreSharp ?? !1, typeof t.ignoreSharp != "boolean") throw TypeError(`Mesh edit ${n} (ignoreSharp must be a boolean)`);
	} else t.weight = e.weight === void 0 ? Di : r(e.weight, n, "weight", {
		minimum: 1,
		maximum: 100
	});
}
var Ni = Object.freeze({
	smooth_by_angle: Ai,
	weighted_normal: ji
}), Pi = Object.freeze([
	"smooth",
	"linear",
	"constant"
]), Fi = Object.freeze([
	"xy",
	"x",
	"y"
]), Ii = Object.freeze({
	x: 0,
	y: 1,
	z: 2
}), Li = 16, Ri = 1e-9;
function zi(e) {
	let t = [
		Infinity,
		Infinity,
		Infinity
	], n = [
		-Infinity,
		-Infinity,
		-Infinity
	];
	for (let r = 0; r < e.vertexCount; r++) for (let i = 0; i < 3; i++) t[i] = Math.min(t[i], e.positions[r * 3 + i]), n[i] = Math.max(n[i], e.positions[r * 3 + i]);
	return {
		low: t,
		high: n
	};
}
function Bi(e, { divisions: t, moves: n }) {
	let [r, i, a] = t, o = new Float64Array(r * i * a * 3), s = (e, t, n) => ((n * i + t) * r + e) * 3;
	for (let { point: e, offset: t } of n) for (let n = 0; n < 3; n++) o[s(...e) + n] += t[n];
	let { low: c, high: l } = zi(e), u = [
		r,
		i,
		a
	], d = new Float32Array(e.positions);
	for (let t = 0; t < e.vertexCount; t++) {
		let n = [
			0,
			0,
			0
		], r = [
			0,
			0,
			0
		];
		for (let i = 0; i < 3; i++) {
			let a = l[i] - c[i], o = a > Ri ? (e.positions[t * 3 + i] - c[i]) / a * (u[i] - 1) : 0;
			n[i] = Math.min(Math.floor(o), u[i] - 2), r[i] = o - n[i];
		}
		for (let e = 0; e < 8; e++) {
			let i = e & 1, a = e >> 1 & 1, c = e >> 2 & 1, l = (i ? r[0] : 1 - r[0]) * (a ? r[1] : 1 - r[1]) * (c ? r[2] : 1 - r[2]);
			if (l === 0) continue;
			let u = s(n[0] + i, n[1] + a, n[2] + c);
			for (let e = 0; e < 3; e++) d[t * 3 + e] += o[u + e] * l;
		}
	}
	return d;
}
function Vi(e, t, n) {
	if (t >= n) return 0;
	let r = 1 - t / n;
	return e === "constant" ? 1 : e === "linear" ? r : r * r * (3 - 2 * r);
}
function Hi(e, { center: t, radius: n, translation: r, strength: i, falloff: a }) {
	let o = new Float32Array(e.positions);
	for (let s = 0; s < e.vertexCount; s++) {
		let c = Vi(a, Math.hypot(e.positions[s * 3] - t[0], e.positions[s * 3 + 1] - t[1], e.positions[s * 3 + 2] - t[2]), n) * i;
		if (c !== 0) for (let e = 0; e < 3; e++) o[s * 3 + e] += r[e] * c;
	}
	return o;
}
function Ui(e, { height: t, width: n, narrowness: r, speed: i, time: a, timeOffset: o, start: s, cyclic: c, axes: l, normal: u }) {
	let d = new Float32Array(e.positions), f = u ? C(e) : null, p = 1 / Math.exp(n * r * n * r);
	for (let u = 0; u < e.vertexCount; u++) {
		let m = e.positions[u * 3] - s[0], h = e.positions[u * 3 + 1] - s[1], g = l === "xy" ? Math.hypot(m, h) : l === "x" ? m : h;
		if (g -= (a - o) * i, c && (g = (g - n) % (n * 2) + n), !(g > -n && g < n)) continue;
		let _ = g * r, v = t * (1 / Math.exp(_ * _) - p);
		if (f) for (let e = 0; e < 3; e++) d[u * 3 + e] += f[u * 3 + e] * v;
		else d[u * 3 + 2] += v;
	}
	return d;
}
function Wi(e, t, n, r, i) {
	let a = i * i, o = a * i;
	return t.map((t, s) => .5 * (2 * t + (n[s] - e[s]) * i + (2 * e[s] - 5 * t + 4 * n[s] - r[s]) * a + (3 * t - e[s] - 3 * n[s] + r[s]) * o));
}
function Gi(e) {
	let t = Math.hypot(...e);
	return e.map((e) => e / t);
}
function Ki(e, t) {
	return e[0] * t[0] + e[1] * t[1] + e[2] * t[2];
}
function qi(e, t) {
	return [
		e[1] * t[2] - e[2] * t[1],
		e[2] * t[0] - e[0] * t[2],
		e[0] * t[1] - e[1] * t[0]
	];
}
function Ji(e, t) {
	let n = [];
	for (let t = 0; t + 1 < e.length; t++) {
		let r = e[Math.max(t - 1, 0)], i = e[Math.min(t + 2, e.length - 1)];
		for (let a = 0; a < Li; a++) n.push(Wi(r, e[t], e[t + 1], i, a / Li));
	}
	n.push(e.at(-1));
	let r = [0];
	for (let e = 1; e < n.length; e++) r.push(r[e - 1] + Math.hypot(...n[e].map((t, r) => t - n[e - 1][r])));
	if (!(r.at(-1) > Ri)) throw RangeError("curve path has no length. Give points that are apart.");
	let i = n.map((e, t) => {
		let r = n[Math.min(t + 1, n.length - 1)], i = n[Math.max(t - 1, 0)], a = r.map((e, t) => e - i[t]);
		return Math.hypot(...a) > 0 ? Gi(a) : [
			1,
			0,
			0
		];
	}), a = [
		0,
		0,
		0
	];
	a[t] = 1;
	let o = [], s = a;
	return i.forEach((e, i) => {
		let a = s.map((t, n) => t - Ki(s, e) * e[n]);
		if (Math.hypot(...a) < 1e-6) {
			let n = [
				0,
				0,
				0
			];
			n[(t + 1) % 3] = 1, a = n.map((t, r) => t - Ki(n, e) * e[r]);
		}
		s = Gi(a), o.push({
			tangent: e,
			normal: s,
			binormal: qi(e, s),
			point: n[i],
			distance: r[i]
		});
	}), o;
}
function Yi(e, t) {
	let n = e.length - 1;
	if (t <= 0) return {
		...e[0],
		along: t
	};
	if (t >= e[n].distance) return {
		...e[n],
		along: t - e[n].distance
	};
	let r = 0, i = n;
	for (; i - r > 1;) {
		let n = r + i >> 1;
		e[n].distance <= t ? r = n : i = n;
	}
	let a = e[i].distance - e[r].distance, o = a > 0 ? (t - e[r].distance) / a : 0, s = (e, t) => e.map((e, n) => e + (t[n] - e) * o), c = Gi(s(e[r].tangent, e[i].tangent)), l = Gi(s(e[r].normal, e[i].normal));
	return {
		tangent: c,
		normal: l,
		binormal: qi(c, l),
		point: s(e[r].point, e[i].point),
		along: 0
	};
}
function Xi(e, { path: t, axis: n }) {
	let r = Ii[n], i = Ji(t, (r + 1) % 3), a = new Float32Array(e.positions);
	for (let t = 0; t < e.vertexCount; t++) {
		let n = e.positions[t * 3 + r], o = e.positions[t * 3 + (r + 1) % 3], s = e.positions[t * 3 + (r + 2) % 3], c = Yi(i, n);
		for (let e = 0; e < 3; e++) a[t * 3 + e] = c.point[e] + c.tangent[e] * c.along + c.normal[e] * o + c.binormal[e] * s;
	}
	return a;
}
function Zi(e, t, n, r) {
	if (!Array.isArray(e) || e.length !== 3) throw TypeError(`Mesh edit ${t} (${n} needs three numbers)`);
	return e.map((e) => r(e, t, n));
}
function Qi(e, t, n, { finiteNumber: r, integerInRange: i }) {
	let a = e.divisions ?? [
		2,
		2,
		2
	];
	if (!Array.isArray(a) || a.length !== 3) throw TypeError(`Mesh edit ${n} (divisions needs three integers from 2 to 8)`);
	t.divisions = a.map((e) => i(e, n, "divisions", 2, 8));
	let o = e.moves ?? [];
	if (!Array.isArray(o) || o.length > 64) throw RangeError(`Mesh edit ${n} (moves is a list of at most 64 of { point, offset })`);
	t.moves = o.map((e, a) => {
		if (!e || typeof e != "object" || Array.isArray(e)) throw TypeError(`Mesh edit ${n} (moves[${a}] must be { point, offset })`);
		if (!Array.isArray(e.point) || e.point.length !== 3) throw TypeError(`Mesh edit ${n} (moves[${a}].point needs three grid indices)`);
		return {
			point: e.point.map((e, r) => i(e, n, `moves[${a}].point`, 0, t.divisions[r] - 1)),
			offset: Zi(e.offset, n, `moves[${a}].offset`, r)
		};
	});
}
function $i(e, t, n, { finiteNumber: r }) {
	if (!Array.isArray(e.path) || e.path.length < 2 || e.path.length > 64) throw TypeError(`Mesh edit ${n} (path needs 2 to 64 points of three numbers)`);
	if (t.path = e.path.map((e) => Zi(e, n, "path", r)), t.axis = e.axis ?? "x", !Object.hasOwn(Ii, t.axis)) throw TypeError(`Mesh edit ${n} (axis must be x, y or z)`);
}
function ea(e, t, n, { finiteNumber: r }) {
	if (t.center = Zi(e.center ?? [
		0,
		0,
		0
	], n, "center", r), t.radius = e.radius === void 0 ? 1 : r(e.radius, n, "radius", {
		minimum: 0,
		maximum: 1e4,
		exclusiveMinimum: !0
	}), t.translation = Zi(e.translation ?? [
		0,
		0,
		0
	], n, "translation", r), t.strength = e.strength === void 0 ? 1 : r(e.strength, n, "strength", {
		minimum: 0,
		maximum: 1
	}), t.falloff = e.falloff ?? "smooth", !Pi.includes(t.falloff)) throw TypeError(`Mesh edit ${n} (falloff must be one of ${Pi.join(", ")})`);
}
function ta(e, t, n, { finiteNumber: r }) {
	t.height = e.height === void 0 ? .5 : r(e.height, n, "height", {
		minimum: -1e4,
		maximum: 1e4
	}), t.width = e.width === void 0 ? 1.5 : r(e.width, n, "width", {
		minimum: 0,
		maximum: 1e4,
		exclusiveMinimum: !0
	}), t.narrowness = e.narrowness === void 0 ? 1.5 : r(e.narrowness, n, "narrowness", {
		minimum: 0,
		maximum: 50
	}), t.speed = e.speed === void 0 ? .25 : r(e.speed, n, "speed", {
		minimum: -1e4,
		maximum: 1e4
	}), t.time = e.time === void 0 ? 0 : r(e.time, n, "time", {
		minimum: -1e6,
		maximum: 1e6
	}), t.timeOffset = e.timeOffset === void 0 ? 0 : r(e.timeOffset, n, "timeOffset", {
		minimum: -1e6,
		maximum: 1e6
	});
	let i = e.start ?? [0, 0];
	if (!Array.isArray(i) || i.length !== 2) throw TypeError(`Mesh edit ${n} (start needs two numbers, x and y)`);
	if (t.start = i.map((e) => r(e, n, "start")), t.cyclic = e.cyclic ?? !0, t.normal = e.normal ?? !1, typeof t.cyclic != "boolean" || typeof t.normal != "boolean") throw TypeError(`Mesh edit ${n} (cyclic and normal must be booleans)`);
	if (t.axes = e.axes ?? "xy", !Fi.includes(t.axes)) throw TypeError(`Mesh edit ${n} (axes must be one of ${Fi.join(", ")})`);
}
var na = Object.freeze({
	lattice: Qi,
	curve: $i,
	hook: ea,
	wave: ta
}), ra = Object.freeze({
	lattice: Bi,
	curve: Xi,
	hook: Hi,
	wave: Ui
}), ia = (e) => Object.hasOwn(ra, e);
function aa(e, t, n, r) {
	na[e.op](e, t, n, r);
}
function oa(e, t) {
	return {
		mesh: L(e, ra[t.op](e, t)),
		result: {}
	};
}
// src/mesh-modifiers.js
var sa = Object.freeze([
	"twist",
	"bend",
	"taper",
	"stretch"
]), ca = Object.freeze({
	x: 0,
	y: 1,
	z: 2
}), la = 64, ua = 1e-7;
function da(e) {
	return Object.hasOwn(Me, e);
}
function fa(e, t, n, r, i) {
	if (!Number.isInteger(e) || e < r || e > i) throw TypeError(`Mesh edit ${t} (${n} must be an integer from ${r} to ${i})`);
	return e;
}
function pa(e, t, n, r) {
	if (e[n] !== void 0) throw TypeError(`Mesh edit ${t} (${e.op} ${e.mode ?? ""} does not take ${n}: ${r})`);
}
function ma(e, t, n, r) {
	if (!sa.includes(e.mode)) throw TypeError(`Mesh edit ${n} (mode must be one of ${sa.join(", ")})`);
	if (t.mode = e.mode, t.axis = e.axis ?? "z", !Object.hasOwn(ca, t.axis)) throw TypeError(`Mesh edit ${n} (axis must be x, y or z)`);
	e.mode === "twist" || e.mode === "bend" ? (pa(e, n, "factor", "it uses angle in degrees"), t.angle = e.angle === void 0 ? 45 : r(e.angle, n, "angle", {
		minimum: -3600,
		maximum: 3600
	})) : (pa(e, n, "angle", "it uses factor"), t.factor = e.factor === void 0 ? .5 : r(e.factor, n, "factor", {
		minimum: -10,
		maximum: 10
	}));
}
function ha(e, t, n, { finiteNumber: r, checkedField: i }) {
	if (Object.hasOwn(Ei, e.op)) Ti(e, t, n, {
		finiteNumber: r,
		integerInRange: fa,
		checkedField: i
	});
	else if (Object.hasOwn(Ni, e.op)) Mi(e, t, n, { finiteNumber: r });
	else if (ia(e.op)) aa(e, t, n, {
		finiteNumber: r,
		integerInRange: fa
	});
	else switch (e.op) {
		case "weld":
			t.distance = e.distance === void 0 ? .001 : r(e.distance, n, "distance", {
				minimum: 0,
				maximum: 1e3,
				exclusiveMinimum: !0
			});
			break;
		case "triangulate":
			t.minVertices = e.minVertices === void 0 ? 4 : fa(e.minVertices, n, "minVertices", 4, 4096);
			break;
		case "edge_split":
			t.angle = e.angle === void 0 ? 30 : r(e.angle, n, "angle", {
				minimum: 0,
				maximum: 180
			});
			break;
		case "smooth":
			t.factor = e.factor === void 0 ? .5 : r(e.factor, n, "factor", {
				minimum: -2,
				maximum: 2
			}), t.iterations = e.iterations === void 0 ? 1 : fa(e.iterations, n, "iterations", 1, 64);
			break;
		case "simple_deform":
			ma(e, t, n, r);
			break;
		case "cast": t.factor = e.factor === void 0 ? .5 : r(e.factor, n, "factor", {
			minimum: 0,
			maximum: 1
		}), t.size = e.size === void 0 ? 0 : r(e.size, n, "size", {
			minimum: 0,
			maximum: 1e6
		});
	}
}
function ga(e, { factor: t, iterations: n }) {
	let r = Float64Array.from(e.positions), i = new Float64Array(r.length), a = new Uint32Array(e.vertexCount);
	for (let o = 0; o < n; o++) {
		i.fill(0), a.fill(0);
		for (let t = 0; t < e.edgeCount; t++) {
			let n = e.edgeVertices[t * 2], o = e.edgeVertices[t * 2 + 1];
			for (let e = 0; e < 3; e++) i[n * 3 + e] += r[o * 3 + e], i[o * 3 + e] += r[n * 3 + e];
			a[n]++, a[o]++;
		}
		for (let n = 0; n < e.vertexCount; n++) if (a[n] !== 0) for (let e = 0; e < 3; e++) {
			let o = n * 3 + e;
			r[o] += t / 2 * (i[o] / a[n] - r[o]);
		}
	}
	return Float32Array.from(r);
}
function _a(e, { factor: t, size: n }) {
	let r = new Float64Array(e.vertexCount), i = 0;
	for (let t = 0; t < e.vertexCount; t++) r[t] = Math.hypot(e.positions[t * 3], e.positions[t * 3 + 1], e.positions[t * 3 + 2]), i += r[t];
	let a = n > 0 ? n : i / e.vertexCount, o = new Float32Array(e.positions);
	for (let n = 0; n < e.vertexCount; n++) {
		if (r[n] === 0) continue;
		let i = a / r[n];
		for (let r = 0; r < 3; r++) {
			let a = n * 3 + r;
			o[a] = e.positions[a] * (1 - t) + e.positions[a] * i * t;
		}
	}
	return o;
}
function va(e, t) {
	return e === "bend" ? [
		[
			0,
			1,
			2
		],
		[
			1,
			0,
			2
		],
		[
			2,
			1,
			0
		]
	][t] : [
		(t + 1) % 3,
		(t + 2) % 3,
		t
	];
}
function ya(e, [t, n, r], i) {
	if (e === "twist") {
		let e = r * i;
		return [
			t * Math.cos(e) - n * Math.sin(e),
			t * Math.sin(e) + n * Math.cos(e),
			r
		];
	}
	if (e === "taper") {
		let e = 1 + r * i;
		return [
			t * e,
			n * e,
			r
		];
	}
	if (e === "stretch") {
		let e = r * r * i - i + 1;
		return [
			t * e,
			n * e,
			r * (1 + i)
		];
	}
	let a = r * i;
	return [
		t,
		n * Math.cos(a) + (1 - Math.cos(a)) / i,
		-(n - 1 / i) * Math.sin(a)
	];
}
function ba(e, { mode: t, axis: n, angle: r, factor: i }) {
	let a = va(t, ca[n]), o = Infinity, s = -Infinity;
	for (let t = 0; t < e.vertexCount; t++) o = Math.min(o, e.positions[t * 3 + a[2]]), s = Math.max(s, e.positions[t * 3 + a[2]]);
	let c = s - o, l = (t === "twist" || t === "bend" ? r * Math.PI / 180 : i) / c, u = new Float32Array(e.positions);
	if (!(c > 1e-9) || t === "bend" && Math.abs(l) < ua) return u;
	for (let n = 0; n < e.vertexCount; n++) {
		let r = ya(t, a.map((t) => e.positions[n * 3 + t]), l);
		a.forEach((e, t) => {
			u[n * 3 + e] = r[t];
		});
	}
	return u;
}
var xa = Object.create(null);
function Sa(e, t) {
	xa[e] = t;
}
function Ca(e, t, { maxVertices: n, maxFaces: r }) {
	if (Object.hasOwn(Ei, t.op)) return Ei[t.op](e, t, {
		maxVertices: n,
		maxFaces: r
	});
	if (Object.hasOwn(Ni, t.op)) return {
		mesh: Ni[t.op](e, t),
		result: {}
	};
	if (Object.hasOwn(xa, t.op)) return xa[t.op](e, t);
	if (ia(t.op)) return oa(e, t);
	switch (t.op) {
		case "weld": {
			let n = Te(e, t.distance);
			return {
				mesh: n.mesh,
				result: {
					removedVertices: n.removedVertices,
					removedFaces: n.removedFaces
				}
			};
		}
		case "triangulate": {
			let n = li(e, {
				minVertices: t.minVertices,
				maxFaces: r
			});
			return {
				mesh: n.mesh,
				result: { triangulated: n.triangulated }
			};
		}
		case "edge_split": {
			let r = fi(e, {
				angle: t.angle,
				maxVertices: n
			});
			return {
				mesh: r.mesh,
				result: { addedVertices: r.addedVertices }
			};
		}
		case "smooth": return {
			mesh: L(e, ga(e, t)),
			result: {}
		};
		case "cast": return {
			mesh: L(e, _a(e, t)),
			result: {}
		};
		case "simple_deform": return {
			mesh: L(e, ba(e, t)),
			result: {}
		};
	}
	throw TypeError(`Not a modifier: ${t.op}`);
}
// src/mesh-sculpt.js
function wa(e, t) {
	let n = C(e), r = [];
	for (let i = 0; i < e.vertexCount; i++) {
		let a = i * 3;
		r.push({
			point: Array.from(e.positions.subarray(a, a + 3)),
			normal: Array.from(n.subarray(a, a + 3)),
			neighbors: t ? /* @__PURE__ */ new Set() : null
		});
	}
	if (t) for (let t = 0; t < e.edgeVertices.length; t += 2) {
		let n = e.edgeVertices[t], i = e.edgeVertices[t + 1];
		r[n].neighbors.add(i), r[i].neighbors.add(n);
	}
	return r;
}
function Ta(e, t) {
	if (t > 32) throw RangeError("A sculpt edit takes at most 32 strokes. Split the work into several sculpt edits.");
	if (e.vertexCount * t > 5e6) throw RangeError("Sculpting would visit too many vertices. Use fewer strokes or a coarser mesh.");
}
function Ea(n, { select: r, strokes: i }) {
	let a = e(i), o = wa(n, a.some((e) => e.type === "smooth"));
	for (let e of a) t(o, e);
	let s = R(n, r), c = new Float32Array(n.positions), l = 0;
	for (let e = 0; e < n.vertexCount; e++) {
		if (!s[e]) continue;
		let t = o[e].point;
		t.some((t, n) => Math.fround(t) !== c[e * 3 + n]) && l++, c.set(t, e * 3);
	}
	return {
		mesh: L(n, c),
		movedVertices: l
	};
}
// src/mesh-surface-distance.js
function H(e) {
	let { triangleCorners: t } = x(e, f(e).normals), n = new Uint32Array(t.length);
	for (let r = 0; r < n.length; r++) n[r] = e.cornerVertices[t[r]];
	return {
		positions: e.positions,
		indices: n
	};
}
function Da(e, { signed: t = !1 } = {}) {
	let { positions: c, indices: l } = H(e), u = i(c, l), d = t ? C(e) : null, f = /* @__PURE__ */ new Float64Array(9), p = [
		0,
		0,
		0
	], m = [
		0,
		0,
		0
	];
	function h(e, t) {
		if (a(c, l, t, f), o(e, f, p), !s(p, f, m)) return 1;
		let n = 0;
		for (let r = 0; r < 3; r++) {
			let i = 0;
			for (let e = 0; e < 3; e++) i += m[e] * d[l[t * 3 + e] * 3 + r];
			n += i * (e[r] - p[r]);
		}
		return n < 0 ? -1 : 1;
	}
	function g(e) {
		let i = Infinity, s = -1;
		return n(u, (t, n) => r(e, t, n), (e) => e <= i, (t) => {
			a(c, l, t, f), o(e, f, p);
			let n = Math.hypot(p[0] - e[0], p[1] - e[1], p[2] - e[2]);
			return n < i && (i = n, s = t), !1;
		}), {
			distance: t && s >= 0 ? i * h(e, s) : i,
			triangle: s
		};
	}
	return {
		query: g,
		triangleCount: l.length / 3
	};
}
function Oa(e, t) {
	let n = [
		0,
		0,
		0
	], r = new Uint8Array(e.vertexCount), i = 0;
	for (let a of e.cornerVertices) if (!r[a]) {
		r[a] = 1;
		for (let t = 0; t < 3; t++) n[t] = e.positions[a * 3 + t];
		i = Math.max(i, t.query(n).distance);
	}
	return i;
}
function ka(e, t) {
	let n = Oa(e, Da(t)), r = Oa(t, Da(e));
	return {
		toReference: n,
		fromReference: r,
		hausdorff: Math.max(n, r)
	};
}
function Aa(e) {
	let { positions: t, indices: n } = H(e), r = 0;
	for (let e = 0; e < n.length / 3; e++) {
		let [i, a, o] = [
			0,
			1,
			2
		].map((t) => n[e * 3 + t] * 3);
		r += (t[i] * (t[a + 1] * t[o + 2] - t[a + 2] * t[o + 1]) + t[i + 1] * (t[a + 2] * t[o] - t[a] * t[o + 2]) + t[i + 2] * (t[a] * t[o + 1] - t[a + 1] * t[o])) / 6;
	}
	return r;
}
// src/mesh-shrinkwrap.js
function ja(e, t, { mode: n, direction: r, maxDistance: i }, a) {
	return n === "project" ? e.project({
		origin: t,
		direction: r,
		maxDistance: i,
		maxTriangleTests: a
	}) : e.nearest(t, {
		maxDistance: i,
		maxTriangleTests: a
	});
}
function Ma(e, { mode: t, direction: n }) {
	return t === "project" && e[0] * n[0] + e[1] * n[1] + e[2] * n[2] > 0 ? -1 : 1;
}
function Na(e, t, n) {
	let { select: r, offset: i, onMiss: a } = n, o = R(e, r), s = H(t), c = l({
		positions: new Float32Array(s.positions),
		indices: s.indices
	}), u = new Float32Array(e.positions), d = 0, f = 0, p = 0;
	try {
		for (let t = 0; t < e.vertexCount; t++) {
			if (!o[t]) continue;
			let r = Ae - p;
			if (r <= 0) throw RangeError("Shrinkwrap searched too many triangles. Select fewer faces or use a simpler target.");
			let s = ja(c, Array.from(e.positions.subarray(t * 3, t * 3 + 3)), n, r);
			if (p += s.triangleTests, !s.hit) {
				if (f++, a === "error") throw RangeError(`Shrinkwrap found no surface for vertex ${t}. Raise maxDistance, change the direction, or set onMiss to keep.`);
				continue;
			}
			let l = Ma(s.hit.normal, n);
			for (let e = 0; e < 3; e++) u[t * 3 + e] = s.hit.point[e] + s.hit.normal[e] * l * i;
			d++;
		}
	} finally {
		c.dispose();
	}
	return {
		mesh: L(e, u),
		movedVertices: d,
		missedVertices: f
	};
}
// src/mesh-field-surfaces.js
var Pa = Object.freeze([
	"distance",
	"point",
	"normal"
]), Fa = Object.freeze([
	"hit",
	"distance",
	"point",
	"normal"
]), Ia = /* @__PURE__ */ new Set(["point", "normal"]), La = 2e7;
function U(e) {
	return /* @__PURE__ */ TypeError(`Field expression: ${e}`);
}
function Ra(e, t, n) {
	for (let r of Object.keys(e)) if (!t.includes(r)) throw U(`${n} does not take ${JSON.stringify(r.slice(0, 24))}; fields: ${t.join(", ")}.`);
}
function za(e) {
	let t = /* @__PURE__ */ new Map();
	return {
		budget: { remaining: La },
		indexOf(n) {
			if (!e) throw RangeError("This context has no surfaces to sample.");
			let r = typeof n == "string" ? n : JSON.stringify(n);
			return t.has(r) || t.set(r, e(n)), t.get(r);
		}
	};
}
function Ba(e, t) {
	let n = e.surface;
	if (typeof n != "string" && !Ve(n)) throw U(`${t} needs a surface: a geometry id or a geometry record.`);
	return n;
}
function Va(e, t, n, r) {
	let i = e.read ?? n;
	if (!t.includes(i)) throw U(`${r} read must be one of ${t.join(", ")}.`);
	return i;
}
function Ha(e, t, n, r, i) {
	let a = e.at === void 0 ? i() : Re(e.at, t, n + 1);
	if (a.kind !== "vector") throw U(`${r} "at" needs a vector.`);
	return a.parts;
}
function Ua(e, t, n) {
	let r = n ?? 0, i = {
		index: -1,
		found: null
	}, a = (e) => (i.index !== e && (i.found = t(e), i.index = e), i.found);
	if (!Ia.has(e)) return Ie((t) => {
		let n = a(t);
		return e === "hit" ? +!!n : n ? n.distance : r;
	});
	let o = (t) => (n) => {
		let i = a(n);
		return i ? i[e][t] : r;
	};
	return O(o(0), o(1), o(2));
}
function Wa(e, t) {
	let { budget: n } = Ja(e.context), r = t(n.remaining);
	if (n.remaining -= r.triangleTests, n.remaining <= 0) throw RangeError("Field expression searched too many surface triangles. Use fewer elements or a simpler surface.");
	return r.hit;
}
function Ga(e, t, n, r) {
	let i = e.nearest;
	if (!Ve(i)) throw U("nearest takes { surface, at, read }.");
	Ra(i, [
		"surface",
		"at",
		"read"
	], "nearest");
	let a = Ba(i, "nearest"), o = Va(i, Pa, "distance", "nearest"), [s, c, l] = Ha(i, t, n, "nearest", r), u = Ja(t.context);
	if (!u) return Ia.has(o) ? O(() => 0, () => 0, () => 0) : Be(0);
	let d = u.indexOf(a);
	return Ua(o, (e) => Wa(t, (t) => d.nearest([
		s(e),
		c(e),
		l(e)
	], { maxTriangleTests: t })), 0);
}
function Ka(e, t, n, r) {
	let i = e.raycast;
	if (!Ve(i)) throw U("raycast takes { surface, at, direction, read, miss }.");
	Ra(i, [
		"surface",
		"at",
		"direction",
		"read",
		"miss",
		"maxDistance"
	], "raycast");
	let a = Ba(i, "raycast"), o = Va(i, Fa, "hit", "raycast"), s = i.direction;
	if (!Array.isArray(s) || s.length !== 3 || !s.every(ze) || s.every((e) => e === 0)) throw U("raycast direction needs three numbers, not all 0.");
	if (i.miss !== void 0 && !ze(i.miss)) throw U("raycast miss must be a number.");
	if (i.maxDistance !== void 0 && !(ze(i.maxDistance) && i.maxDistance > 0)) throw U("raycast maxDistance must be above 0.");
	let [c, l, u] = Ha(i, t, n, "raycast", r), d = Ja(t.context);
	if (!d) return Ia.has(o) ? O(() => 0, () => 0, () => 0) : Be(0);
	let f = d.indexOf(a), p = i.maxDistance ?? Infinity;
	return Ua(o, (e) => Wa(t, (t) => f.project({
		origin: [
			c(e),
			l(e),
			u(e)
		],
		direction: s,
		maxDistance: p,
		maxTriangleTests: t
	})), i.miss);
}
var qa = /* @__PURE__ */ new WeakMap();
function Ja(e) {
	return e.loadSurface ? (qa.has(e) || qa.set(e, za(e.loadSurface)), qa.get(e)) : null;
}
m("nearest", Ga), m("raycast", Ka);
// src/field-rotation.js
var W = Object.freeze([
	0,
	1,
	0
]), Ya = 1 - 1e-9;
function Xa(e) {
	let t = Math.hypot(e[0], e[1], e[2]);
	return t === 0 ? [
		0,
		0,
		0
	] : [
		e[0] / t,
		e[1] / t,
		e[2] / t
	];
}
function Za(e, t, n) {
	let r = Xa(t);
	if (r[0] === 0 && r[1] === 0 && r[2] === 0) return [...e];
	let i = Math.cos(n), a = Math.sin(n), o = r[0] * e[0] + r[1] * e[1] + r[2] * e[2], s = [
		r[1] * e[2] - r[2] * e[1],
		r[2] * e[0] - r[0] * e[2],
		r[0] * e[1] - r[1] * e[0]
	];
	return e.map((e, t) => e * i + s[t] * a + r[t] * o * (1 - i));
}
function Qa([e, t, n]) {
	let [r, i, a, o, s, c] = [
		Math.sin(e),
		Math.cos(e),
		Math.sin(t),
		Math.cos(t),
		Math.sin(n),
		Math.cos(n)
	];
	return [
		c * o,
		c * a * r - s * i,
		c * a * i + s * r,
		s * o,
		s * a * r + c * i,
		s * a * i - c * r,
		-a,
		o * r,
		o * i
	];
}
function $a(e) {
	let t = Xa(e), n = t[1];
	if (t[0] === 0 && t[1] === 0 && t[2] === 0) return [
		0,
		0,
		0
	];
	let r = [
		W[1] * t[2] - W[2] * t[1],
		W[2] * t[0] - W[0] * t[2],
		W[0] * t[1] - W[1] * t[0]
	];
	n <= -.999999999999 && (r = [
		1,
		0,
		0
	]);
	let i = Math.acos(Math.min(1, Math.max(-1, n))), a = [
		[
			1,
			0,
			0
		],
		[
			0,
			1,
			0
		],
		[
			0,
			0,
			1
		]
	].map((e) => Za(e, r, i)), o = (e, t) => a[t][e];
	return Math.abs(o(2, 0)) >= Ya ? [
		Math.atan2(-o(1, 2), o(1, 1)),
		Math.asin(Math.max(-1, Math.min(1, -o(2, 0)))),
		0
	] : [
		Math.atan2(o(2, 1), o(2, 2)),
		Math.asin(-o(2, 0)),
		Math.atan2(o(1, 0), o(0, 0))
	];
}
function G(e, t) {
	if (e.kind !== "vector") throw TypeError(`${t} needs a vector.`);
	return e.parts;
}
function eo(e) {
	let t = -1, n = null;
	return (r) => (i) => (i !== t && (n = e(i), t = i), n[r]);
}
function K(e, t) {
	return [
		e[0](t),
		e[1](t),
		e[2](t)
	];
}
function to([e, t, n]) {
	let r = G(e, "rotate"), i = G(t, "rotate"), a = He(n, "rotate"), o = eo((e) => Za(K(r, e), K(i, e), a(e)));
	return O(o(0), o(1), o(2));
}
function no([e]) {
	let t = G(e, "align"), n = eo((e) => $a(K(t, e)));
	return O(n(0), n(1), n(2));
}
function ro([e, t, n, r]) {
	let i = G(e, "transform"), a = t === void 0 ? null : Le(t), o = n === void 0 ? null : G(n, "transform"), s = r === void 0 ? null : Le(r), c = eo((e) => {
		let t = K(i, e).map((t, n) => s ? t * s[n](e) : t), n = o ? Qa(K(o, e)) : null;
		return (n ? [
			0,
			1,
			2
		].map((e) => n[e * 3] * t[0] + n[e * 3 + 1] * t[1] + n[e * 3 + 2] * t[2]) : t).map((t, n) => a ? t + a[n](e) : t);
	});
	return O(c(0), c(1), c(2));
}
var io = Object.freeze({
	rotate: {
		min: 3,
		max: 3,
		build: to
	},
	align: {
		min: 1,
		max: 1,
		build: no
	},
	transform: {
		min: 1,
		max: 4,
		build: ro
	}
});
for (let [e, t] of Object.entries(io)) h(e, t);
// src/mesh-hull-modifiers.js
var ao = 8192, oo = 1e-9, so = Object.freeze([
	[
		0,
		4,
		6,
		2
	],
	[
		1,
		3,
		7,
		5
	],
	[
		0,
		1,
		5,
		4
	],
	[
		2,
		6,
		7,
		3
	],
	[
		0,
		2,
		3,
		1
	],
	[
		4,
		5,
		7,
		6
	]
]);
function co(e) {
	let t = [
		Infinity,
		Infinity,
		Infinity
	], n = [
		-Infinity,
		-Infinity,
		-Infinity
	];
	for (let r = 0; r < e.vertexCount; r++) for (let i = 0; i < 3; i++) {
		let a = e.positions[r * 3 + i];
		a < t[i] && (t[i] = a), a > n[i] && (n[i] = a);
	}
	let r = /* @__PURE__ */ new Float32Array(24);
	for (let e = 0; e < 8; e++) for (let i = 0; i < 3; i++) r[e * 3 + i] = e >> i & 1 ? n[i] : t[i];
	let i = Uint32Array.from({ length: 7 }, (e, t) => t * 4);
	return E({
		positions: r,
		faceOffsets: i,
		cornerVertices: Uint32Array.from(so.flat())
	});
}
function q(e, t) {
	return [
		e[t * 3],
		e[t * 3 + 1],
		e[t * 3 + 2]
	];
}
function J(e, t) {
	return [
		e[0] - t[0],
		e[1] - t[1],
		e[2] - t[2]
	];
}
function lo(e, t) {
	return [
		e[1] * t[2] - e[2] * t[1],
		e[2] * t[0] - e[0] * t[2],
		e[0] * t[1] - e[1] * t[0]
	];
}
function uo(e, t) {
	return e[0] * t[0] + e[1] * t[1] + e[2] * t[2];
}
function fo(e, t, n, r) {
	let i = q(e, t), a = lo(J(q(e, n), i), J(q(e, r), i)), o = Math.hypot(a[0], a[1], a[2]) || 1, s = [
		a[0] / o,
		a[1] / o,
		a[2] / o
	];
	return {
		corners: [
			t,
			n,
			r
		],
		normal: s,
		offset: uo(s, i),
		alive: !0
	};
}
function po(e, t) {
	return uo(e.normal, t) - e.offset;
}
function mo(e, t, n) {
	let r = [0, 0];
	for (let n = 1; n < t; n++) e[n * 3] < e[r[0] * 3] && (r[0] = n), e[n * 3] > e[r[1] * 3] && (r[1] = n);
	let i = r[0], a = r[1];
	(i === a || Math.hypot(...J(q(e, i), q(e, a))) <= n) && (a = Array.from({ length: t }, (e, t) => t).reduce((t, n) => Math.hypot(...J(q(e, n), q(e, i))) > Math.hypot(...J(q(e, t), q(e, i))) ? n : t, i));
	let o = J(q(e, a), q(e, i)), s = -1, c = n;
	for (let n = 0; n < t; n++) {
		let t = Math.hypot(...lo(o, J(q(e, n), q(e, i))));
		t > c && (c = t, s = n);
	}
	if (s < 0) throw RangeError("convex_hull needs vertices that do not all lie on one line.");
	let l = lo(o, J(q(e, s), q(e, i))), u = -1, d = n * Math.hypot(...l);
	for (let n = 0; n < t; n++) {
		let t = Math.abs(uo(l, J(q(e, n), q(e, i))));
		t > d && (d = t, u = n);
	}
	if (u < 0) throw RangeError("convex_hull needs vertices that do not all lie in one plane.");
	return [
		i,
		a,
		s,
		u
	];
}
function ho(e) {
	if (e.vertexCount > 8192) throw RangeError(`convex_hull takes at most ${ao} vertices and the mesh has ${e.vertexCount}. Decimate or weld first.`);
	let { positions: t } = e, n = e.vertexCount, r = co(e).positions, i = Math.hypot(r[21] - r[0], r[22] - r[1], r[23] - r[2]) * oo, [a, o, s, c] = mo(t, n, i), l = [
		0,
		1,
		2
	].map((e) => (t[a * 3 + e] + t[o * 3 + e] + t[s * 3 + e] + t[c * 3 + e]) / 4), u = [];
	for (let [e, n, r] of [
		[
			a,
			o,
			s
		],
		[
			a,
			o,
			c
		],
		[
			a,
			s,
			c
		],
		[
			o,
			s,
			c
		]
	]) {
		let i = fo(t, e, n, r);
		po(i, l) > 0 && (i.corners = [
			e,
			r,
			n
		], i.normal = i.normal.map((e) => -e), i.offset = -i.offset), u.push(i);
	}
	let d = /* @__PURE__ */ new Set([
		a,
		o,
		s,
		c
	]);
	for (let e = 0; e < n; e++) {
		if (d.has(e)) continue;
		let n = q(t, e), r = u.filter((e) => e.alive && po(e, n) > i);
		if (r.length === 0) continue;
		let a = /* @__PURE__ */ new Map();
		for (let e of r) {
			e.alive = !1;
			for (let t = 0; t < 3; t++) a.set(`${e.corners[t]}:${e.corners[(t + 1) % 3]}`, [e.corners[t], e.corners[(t + 1) % 3]]);
		}
		for (let [n, r] of a.values()) a.has(`${r}:${n}`) || u.push(fo(t, n, r, e));
	}
	let f = u.filter((e) => e.alive), p = /* @__PURE__ */ new Map(), m = [], h = [];
	for (let e of f) for (let n of e.corners) p.has(n) || (p.set(n, p.size), m.push(...q(t, n))), h.push(p.get(n));
	let g = Uint32Array.from({ length: f.length + 1 }, (e, t) => t * 3);
	return E({
		positions: Float32Array.from(m),
		faceOffsets: g,
		cornerVertices: Uint32Array.from(h)
	});
}
var go = Object.freeze({
	bounding_box: (e) => ({
		mesh: co(e),
		result: {}
	}),
	convex_hull: (e) => {
		let t = ho(e);
		return {
			mesh: t,
			result: { hullVertices: t.vertexCount }
		};
	}
});
for (let [e, t] of Object.entries(go)) Sa(e, t);
// src/mesh-remesh.js
var _o = 192, vo = 4194304, yo = 2, bo = 3;
function xo(e) {
	let t = g(e);
	for (let n = 0; n < e.edgeCount; n++) if (t.edgeOffsets[n + 1] - t.edgeOffsets[n] !== 2) throw RangeError("remesh needs a closed surface: every edge must join exactly two faces. Run fill_holes first.");
}
function So(e, { voxelSize: t, resolution: n }) {
	let r = de(e), i = r.max.map((e, t) => e - r.min[t]), a = Math.max(...i);
	if (t === void 0 == (n === void 0)) throw RangeError("remesh takes either voxelSize or resolution.");
	let o = t ?? a / n;
	if (!(o > 0) || !(a > 0)) throw RangeError("remesh needs a positive voxel size and a mesh with volume.");
	let s = i.map((e) => Math.ceil(e / o) + 1 + 6), c = s.reduce((e, t) => e * (t - 1), 1);
	if (a / o > 192 || c > 4194304) throw RangeError(`remesh would use ${c} cells and ${Math.ceil(a / o)} along the longest side, over the limits of ${vo} cells and 192 per side. Use a larger voxelSize or a lower resolution.`);
	return {
		bounds: r,
		edge: o,
		points: s,
		cells: c
	};
}
function Co(e, t) {
	let { positions: n, indices: r } = e, [i, a, o] = t.points, s = new Uint8Array(i * a * o), c = [
		0,
		0,
		0
	], l = [
		0,
		0,
		0
	];
	for (let e = 0; e < r.length / 3; e++) {
		for (let i = 0; i < 3; i++) {
			let a = [
				0,
				1,
				2
			].map((t) => n[r[e * 3 + t] * 3 + i]), o = t.bounds.min[i] - bo * t.edge;
			c[i] = Math.max(0, Math.floor((Math.min(...a) - o) / t.edge) - yo), l[i] = Math.min(t.points[i] - 1, Math.ceil((Math.max(...a) - o) / t.edge) + yo);
		}
		for (let e = c[2]; e <= l[2]; e++) for (let t = c[1]; t <= l[1]; t++) {
			let n = (e * a + t) * i;
			s.fill(1, n + c[0], n + l[0] + 1);
		}
	}
	return s;
}
function wo(e, t) {
	let [n, r, i] = t, a = new Uint8Array(e.length), o = [0];
	a[0] = 1;
	let s = [
		1,
		n,
		n * r
	];
	for (; o.length;) {
		let t = o.pop(), c = [
			t % n,
			Math.floor(t / n) % r,
			Math.floor(t / (n * r))
		];
		for (let l = 0; l < 3; l++) for (let u of [-1, 1]) {
			let d = c[l] + u;
			if (d < 0 || d >= [
				n,
				r,
				i
			][l]) continue;
			let f = t + u * s[l];
			e[f] || a[f] || (a[f] = 1, o.push(f));
		}
	}
	return a;
}
function To(e, t, n) {
	let [r, i] = n.points, a = Co(t, n), o = wo(a, n.points), s = new Float32Array(a.length), c = Da(e, { signed: !0 }).query, l = 3 * n.edge, u = n.bounds.min.map((e) => e - bo * n.edge), d = [
		0,
		0,
		0
	];
	for (let e = 0; e < a.length; e++) a[e] ? (d[0] = u[0] + e % r * n.edge, d[1] = u[1] + Math.floor(e / r) % i * n.edge, d[2] = u[2] + Math.floor(e / (r * i)) * n.edge, s[e] = c(d).distance) : s[e] = o[e] ? l : -l;
	return {
		distances: s,
		origin: u
	};
}
var Eo = [
	[
		0,
		0,
		0
	],
	[
		1,
		0,
		0
	],
	[
		0,
		1,
		0
	],
	[
		1,
		1,
		0
	],
	[
		0,
		0,
		1
	],
	[
		1,
		0,
		1
	],
	[
		0,
		1,
		1
	],
	[
		1,
		1,
		1
	]
], Do = [
	[0, 1],
	[2, 3],
	[4, 5],
	[6, 7],
	[0, 2],
	[1, 3],
	[4, 6],
	[5, 7],
	[0, 4],
	[1, 5],
	[2, 6],
	[3, 7]
];
function Oo(e, t, n) {
	let [r, i, a] = t.points, o = r - 1, s = i - 1, c = new Int32Array(o * s * (a - 1)).fill(-1), l = [], u = /* @__PURE__ */ new Float64Array(8);
	for (let d = 0; d < a - 1; d++) for (let a = 0; a < s; a++) for (let f = 0; f < o; f++) {
		let p = 0;
		for (let t = 0; t < 8; t++) {
			let [n, o, s] = Eo[t];
			u[t] = e[((d + s) * i + a + o) * r + f + n], u[t] < 0 && p++;
		}
		if (p === 0 || p === 8) continue;
		let m = [
			0,
			0,
			0
		], h = 0;
		for (let [e, t] of Do) {
			if (u[e] < 0 == u[t] < 0) continue;
			let n = u[e] / (u[e] - u[t]);
			for (let r = 0; r < 3; r++) m[r] += Eo[e][r] + n * (Eo[t][r] - Eo[e][r]);
			h++;
		}
		c[(d * s + a) * o + f] = l.length / 3, l.push(n[0] + (f + m[0] / h) * t.edge, n[1] + (a + m[1] / h) * t.edge, n[2] + (d + m[2] / h) * t.edge);
	}
	return {
		cellVertex: c,
		positions: l
	};
}
var ko = [
	[1, 2],
	[2, 0],
	[0, 1]
], Ao = [
	[-1, -1],
	[0, -1],
	[0, 0],
	[-1, 0]
];
function jo(e, t, n) {
	let r = t.points.map((e) => e - 1), [i, a, o] = t.points, s = [
		1,
		i,
		i * a
	], c = [], l = [
		0,
		0,
		0
	];
	for (let u = 0; u < o; u++) for (let o = 0; o < a; o++) for (let d = 0; d < i; d++) {
		l[0] = d, l[1] = o, l[2] = u;
		let f = (u * a + o) * i + d;
		for (let i = 0; i < 3; i++) {
			let [a, o] = ko[i];
			if (l[i] + 1 >= t.points[i] || l[a] === 0 || l[o] === 0) continue;
			let u = e[f];
			if (u < 0 == e[f + s[i]] < 0) continue;
			let d = Ao.map(([e, t]) => Mo(n, r, l, i, a, o, e, t));
			d.includes(-1) || c.push(u < 0 ? d : d.reverse());
		}
	}
	return c;
}
function Mo(e, t, n, r, i, a, o, s) {
	let c = [
		n[0],
		n[1],
		n[2]
	];
	return c[i] += o, c[a] += s, c[0] >= t[0] || c[1] >= t[1] || c[2] >= t[2] ? -1 : e[(c[2] * t[1] + c[1]) * t[0] + c[0]];
}
function No(e, t) {
	xo(e);
	let n = So(e, t), { distances: r, origin: i } = To(e, H(e), n), { cellVertex: a, positions: o } = Oo(r, n, i), s = jo(r, n, a);
	if (!s.length) throw RangeError("remesh found no surface: the voxel size is larger than the mesh.");
	let c = Uint32Array.from({ length: s.length + 1 }, (e, t) => t * 4);
	return {
		mesh: E({
			positions: Float32Array.from(o),
			faceOffsets: c,
			cornerVertices: Uint32Array.from(s.flat())
		}),
		voxelSize: n.edge,
		cells: n.cells
	};
}
// src/mesh-recipe.js
var Po = /^[A-Za-z0-9][A-Za-z0-9._-]{0,47}$/, Fo = 1e6;
function Y(e, t, n, r) {
	return Pe(`edits[${e}].${t}`, n, r, TypeError);
}
function X(e, t) {
	return /* @__PURE__ */ TypeError(`Mesh edit ${e} (${t})`);
}
function Z(e, t, n, { minimum: r = -1e6, maximum: i = Fo, exclusiveMinimum: a = !1 } = {}) {
	if (typeof e != "number" || !Number.isFinite(e) || e < r || e > i || a && e === r) throw Y(t, n, e, `a number ${a ? "above" : "from"} ${r}${i < Fo ? ` to ${i}` : ""}, such as ${a ? r + 1 : Math.min(Math.max(1, r), i)}`);
	return e;
}
function Q(e, t, n) {
	if (!Array.isArray(e) || e.length !== 3) throw Y(t, n, e, "an array of three numbers, such as [0, 1, 0]");
	return e.map((e) => Z(e, t, n));
}
function $(e, t, n, r) {
	try {
		pe(e, { kind: r });
	} catch (e) {
		throw X(t, `${n}: ${e.message}`);
	}
	return e;
}
function Io(e, t, n) {
	if (t.translation = e.translation === void 0 ? [
		0,
		0,
		0
	] : Q(e.translation, n, "translation"), t.scale = e.scale === void 0 ? [
		1,
		1,
		1
	] : Q(e.scale, n, "scale"), t.scale.some((e) => e <= 0)) throw X(n, "scale components must be positive");
	if (e.rotation === void 0) {
		t.rotation = [
			0,
			0,
			0,
			1
		];
		return;
	}
	if (!Array.isArray(e.rotation) || e.rotation.length !== 4) throw X(n, "rotation is an XYZW quaternion");
	let r = e.rotation.map((e) => Z(e, n, "rotation")), i = Math.hypot(...r);
	if (i === 0) throw X(n, "rotation quaternion must be nonzero");
	t.rotation = r.map((e) => e / i);
}
function Lo(e, t, n) {
	let r = `strokes[${n}]`;
	if (!e || typeof e != "object" || Array.isArray(e)) throw X(t, `${r} must be an object`);
	for (let n of Object.keys(e)) if (![
		"type",
		"center",
		"radius",
		"strength",
		"direction"
	].includes(n)) throw X(t, `${r} does not take ${n}; fields: type, center, radius, strength, direction`);
	if (!je.includes(e.type)) throw X(t, `${r}.type must be one of ${je.join(", ")}`);
	let i = {
		type: e.type,
		center: Q(e.center, t, `${r}.center`),
		radius: Z(e.radius, t, `${r}.radius`, {
			minimum: 0,
			exclusiveMinimum: !0
		}),
		strength: Z(e.strength, t, `${r}.strength`)
	};
	if (e.type === "smooth" && (i.strength < 0 || i.strength > 1)) throw X(t, `${r}.strength of a smooth stroke is from 0 to 1`);
	if (e.type === "displace") {
		if (i.direction = Q(e.direction, t, `${r}.direction`), i.direction.every((e) => e === 0)) throw X(t, `${r}.direction must be nonzero`);
	} else if (e.direction !== void 0) throw X(t, `${r}.direction applies only to a displace stroke`);
	return i;
}
function Ro(e) {
	if (!Array.isArray(e)) throw TypeError("edits must be an array.");
	if (e.length > 64) throw RangeError("A mesh holds at most 64 edits. Apply fewer or start from a new base.");
	return e.map((e, t) => {
		if (!e || typeof e != "object" || Array.isArray(e)) throw X(t, "each edit must be an object");
		let n = Ne[e.op];
		if (!n) throw Y(t, "op", e.op, `one of ${Object.keys(Ne).join(", ")}`);
		for (let r of Object.keys(e)) if (r !== "op" && !n.fields.includes(r)) throw X(t, `${e.op} does not take ${r}; fields: ${n.fields.join(", ")}`);
		let r = { op: e.op };
		if (n.fields.includes("select")) {
			if (e.select === void 0 && [
				"delete",
				"tag",
				"dissolve_faces"
			].includes(e.op)) throw X(t, `${e.op} needs select`);
			r.select = e.select ?? { all: !0 };
		}
		if (n.fields.includes("name")) {
			let n = e.name ?? (["tag", "vertex_group"].includes(e.op) ? void 0 : `${e.op.split("_")[0]}-${t + 1}`);
			if (typeof n != "string" || !Po.test(n)) throw Y(t, "name", n, "1 to 48 letters, digits, dots, dashes or underscores, such as \"lid.cap\"");
			r.name = n;
		}
		switch (e.op) {
			case "extrude_face_region":
			case "extrude_individual":
				if (r.offset = Z(e.offset, t, "offset"), e.direction !== void 0 && (r.direction = Q(e.direction, t, "direction")), e.alongNormals !== void 0) {
					if (typeof e.alongNormals != "boolean") throw Y(t, "alongNormals", e.alongNormals, "true or false");
					if (e.alongNormals && e.direction !== void 0) throw X(t, "alongNormals and direction cannot be combined");
					r.alongNormals = e.alongNormals;
				}
				break;
			case "inset_region":
			case "inset_individual":
				r.thickness = Z(e.thickness, t, "thickness", {
					minimum: 0,
					exclusiveMinimum: !0
				}), r.depth = e.depth === void 0 ? 0 : Z(e.depth, t, "depth");
				break;
			case "translate":
				if (r.offset = Q(e.offset, t, "offset"), e.falloff !== void 0) {
					let n = e.falloff;
					if (!n || typeof n != "object") throw X(t, "falloff must be { radius, curve, connected }");
					for (let e of Object.keys(n)) if (![
						"radius",
						"curve",
						"connected"
					].includes(e)) throw X(t, `falloff does not take ${e}`);
					let i = n.curve ?? "smooth";
					if (!Object.hasOwn(we, i)) throw Y(t, "falloff.curve", i, `one of ${Object.keys(we).join(", ")}`);
					if (n.connected !== void 0 && typeof n.connected != "boolean") throw X(t, "falloff.connected must be boolean");
					r.falloff = {
						radius: Z(n.radius, t, "falloff.radius", {
							minimum: 0,
							exclusiveMinimum: !0
						}),
						curve: i,
						connected: n.connected ?? !1
					};
				}
				break;
			case "boolean":
				if (!M.includes(e.operation)) throw Y(t, "operation", e.operation, `one of ${M.join(", ")}`);
				if (r.operation = e.operation, !e.cutter || typeof e.cutter != "object" || Array.isArray(e.cutter) || typeof e.cutter.type != "string") throw X(t, "cutter must be a primitive record such as { \"type\": \"cylinder\", \"segments\": 32 }");
				r.cutter = e.cutter, Io(e, r, t);
				break;
			case "sculpt":
				if (!Array.isArray(e.strokes) || e.strokes.length < 1 || e.strokes.length > 32) throw X(t, "strokes must be an array of 1 to 32 brush strokes");
				r.strokes = e.strokes.map((e, n) => Lo(e, t, n));
				break;
			case "shrinkwrap":
				if (!e.target || typeof e.target != "object" || Array.isArray(e.target) || typeof e.target.type != "string") throw X(t, "target must be a primitive record such as { \"type\": \"sphere\", \"radius\": 0.5 }");
				if (r.target = e.target, Io(e, r, t), !ke.includes(e.mode ?? "nearest")) throw Y(t, "mode", e.mode, `one of ${ke.join(", ")}`);
				if (r.mode = e.mode ?? "nearest", r.mode === "project") {
					if (r.direction = Q(e.direction, t, "direction"), r.direction.every((e) => e === 0)) throw X(t, "direction must be nonzero");
				} else if (e.direction !== void 0) throw X(t, "direction applies only to mode project");
				if (r.offset = e.offset === void 0 ? 0 : Z(e.offset, t, "offset", { minimum: 0 }), e.maxDistance !== void 0 && (r.maxDistance = Z(e.maxDistance, t, "maxDistance", { minimum: 0 })), !["error", "keep"].includes(e.onMiss ?? "error")) throw Y(t, "onMiss", e.onMiss, "\"error\" or \"keep\"");
				r.onMiss = e.onMiss ?? "error";
				break;
			case "mirror":
				if (![
					"x",
					"y",
					"z"
				].includes(e.axis ?? "x")) throw Y(t, "axis", e.axis, "\"x\", \"y\" or \"z\"");
				r.axis = e.axis ?? "x", r.merge = e.merge === void 0 ? .001 : Z(e.merge, t, "merge", {
					minimum: 0,
					maximum: 1e3
				});
				break;
			case "array":
				if (!Number.isInteger(e.count ?? 2) || (e.count ?? 2) < 1 || (e.count ?? 2) > 256) throw Y(t, "count", e.count, "a whole number from 1 to 256, such as 4");
				r.count = e.count ?? 2, r.offset = e.offset === void 0 ? [
					0,
					0,
					0
				] : Q(e.offset, t, "offset"), r.relativeOffset = e.relativeOffset === void 0 ? e.offset === void 0 ? [
					1,
					0,
					0
				] : [
					0,
					0,
					0
				] : Q(e.relativeOffset, t, "relativeOffset"), r.merge = e.merge === void 0 ? 0 : Z(e.merge, t, "merge", {
					minimum: 0,
					maximum: 1e3
				});
				break;
			case "solidify":
				if (r.thickness = Z(e.thickness, t, "thickness", {
					minimum: 0,
					exclusiveMinimum: !0
				}), r.offset = e.offset === void 0 ? -1 : Z(e.offset, t, "offset", {
					minimum: -1,
					maximum: 1
				}), e.evenThickness !== void 0 && typeof e.evenThickness != "boolean") throw Y(t, "evenThickness", e.evenThickness, "true or false");
				r.evenThickness = e.evenThickness ?? !0;
				break;
			case "bevel":
				if (e.edges !== void 0 && (!e.edges || typeof e.edges != "object" || Array.isArray(e.edges))) throw X(t, "edges must be a rule: { \"between\": [faceRule, faceRule] }, { \"angle\": degrees }, { \"boundaryOf\": faceRule } or { \"all\": true }");
				if (r.edges = e.edges ?? { angle: 30 }, r.width = Z(e.width, t, "width", {
					minimum: 0,
					exclusiveMinimum: !0
				}), !Number.isInteger(e.segments ?? 1) || (e.segments ?? 1) < 1 || (e.segments ?? 1) > 16) throw Y(t, "segments", e.segments, "a whole number from 1 to 16, such as 3");
				if (r.segments = e.segments ?? 1, r.profile = e.profile === void 0 ? .5 : Z(e.profile, t, "profile", {
					minimum: 0,
					maximum: 1
				}), e.clampOverlap !== void 0 && typeof e.clampOverlap != "boolean") throw Y(t, "clampOverlap", e.clampOverlap, "true or false");
				r.clampOverlap = e.clampOverlap ?? !0;
				break;
			case "loop_cut":
				if (!e.edges || typeof e.edges != "object" || Array.isArray(e.edges)) throw X(t, "edges must be a rule that picks the ring, for example { \"along\": [0, 1, 0] } for the vertical edges");
				if (r.edges = e.edges, !Number.isInteger(e.cuts ?? 1) || (e.cuts ?? 1) < 1 || (e.cuts ?? 1) > 16) throw Y(t, "cuts", e.cuts, "a whole number from 1 to 16, such as 1");
				if (r.cuts = e.cuts ?? 1, e.factor !== void 0 && r.cuts !== 1) throw X(t, "factor applies only to a single cut");
				if (r.factor = e.factor === void 0 ? .5 : Z(e.factor, t, "factor", {
					minimum: 0,
					maximum: 1
				}), r.factor === 0 || r.factor === 1) throw Y(t, "factor", r.factor, "a number above 0 and below 1, such as 0.5");
				break;
			case "uv_unwrap":
				if (e.seams !== void 0 && (!e.seams || typeof e.seams != "object" || Array.isArray(e.seams))) throw X(t, "seams must be an edge rule, for example { \"angle\": 60 } or { \"boundaryOf\": { \"tag\": \"lid.cap\" } }");
				r.seams = e.seams ?? { angle: 60 }, r.margin = e.margin === void 0 ? .01 : Z(e.margin, t, "margin", {
					minimum: 0,
					maximum: .2
				}), r.maxDistortion = e.maxDistortion === void 0 ? .25 : Z(e.maxDistortion, t, "maxDistortion", {
					minimum: 0,
					maximum: 100
				});
				break;
			case "subdivide":
				if (!Number.isInteger(e.levels ?? 1) || (e.levels ?? 1) < 1 || (e.levels ?? 1) > 4) throw Y(t, "levels", e.levels, "a whole number from 1 to 4, such as 1");
				if (r.levels = e.levels ?? 1, e.crease !== void 0) {
					if (!e.crease || typeof e.crease != "object" || Array.isArray(e.crease)) throw X(t, "crease must be an edge rule, for example { \"angle\": 60 } or { \"between\": [faceRule, faceRule] }");
					r.crease = e.crease, r.sharpness = e.sharpness === void 0 ? 10 : Z(e.sharpness, t, "sharpness", {
						minimum: 0,
						maximum: 10,
						exclusiveMinimum: !0
					});
				} else if (e.sharpness !== void 0) throw X(t, "sharpness needs a crease rule");
				break;
			case "set_position":
				if (e.position === void 0 && e.offset === void 0) throw X(t, "set_position needs a position or an offset expression");
				e.position !== void 0 && (r.position = $(e.position, t, "position", "vector")), e.offset !== void 0 && (r.offset = $(e.offset, t, "offset", "vector"));
				break;
			case "displace":
				if (r.field = $(e.field, t, "field", "scalar"), r.strength = e.strength === void 0 ? 1 : Z(e.strength, t, "strength"), r.midlevel = e.midlevel === void 0 ? .5 : Z(e.midlevel, t, "midlevel"), e.direction !== void 0 && !mr.includes(e.direction)) throw Y(t, "direction", e.direction, `one of ${mr.join(", ")}`);
				if (r.direction = e.direction ?? "normal", e.group !== void 0) {
					if (typeof e.group != "string" || !Po.test(e.group)) throw X(t, "group must be the name of a vertex group");
					r.group = e.group;
				}
				break;
			case "vertex_group":
				wr(e, r, t, {
					finiteNumber: Z,
					checkedField: $
				});
				break;
			case "vertex_color":
				Tr(e, r, t, {
					finiteNumber: Z,
					checkedField: $
				});
				break;
			case "decimate":
				r.ratio = Z(e.ratio, t, "ratio", {
					minimum: 0,
					maximum: 1,
					exclusiveMinimum: !0
				});
				break;
			case "remesh":
				if (e.voxelSize === void 0 == (e.resolution === void 0)) throw X(t, "remesh needs exactly one of voxelSize or resolution");
				if (e.voxelSize !== void 0 && (r.voxelSize = Z(e.voxelSize, t, "voxelSize", {
					minimum: 0,
					exclusiveMinimum: !0
				})), e.resolution !== void 0) {
					if (!Number.isInteger(e.resolution) || e.resolution < 4 || e.resolution > 192) throw X(t, "resolution must be an integer from 4 to 192");
					r.resolution = e.resolution;
				}
				break;
			case "merge_by_distance": r.distance = Z(e.distance ?? 1e-4, t, "distance", {
				minimum: 0,
				maximum: 1e3
			});
		}
		return ir.includes(e.op) && ur(e, r, t, {
			finiteNumber: Z,
			vector: Q
		}), da(e.op) && ha(e, r, t, {
			finiteNumber: Z,
			checkedField: $
		}), r;
	});
}
function zo(e, t, n, r) {
	let i = Ar(e, t.levels);
	if (i.vertices > n.maxVertices || i.faces > n.maxFaces) throw RangeError(`Mesh edit ${r} (subdivide) would make ${i.vertices} vertices and ${i.faces} faces, over the limit of ${n.maxVertices} vertices and ${n.maxFaces} faces. Lower levels, or use a simpler mesh.`);
}
function Bo(e, t, n, r) {
	if (dr(e, t, n, r), t.op === "sculpt") {
		try {
			Ta(e, t.strokes.length);
		} catch (e) {
			throw new e.constructor(`Mesh edit ${r} (sculpt): ${e.message}`);
		}
		return;
	}
	if (t.op === "subdivide") {
		zo(e, t, n, r);
		return;
	}
	if (t.op === "remesh") {
		try {
			So(e, t);
		} catch (e) {
			throw new e.constructor(`Mesh edit ${r} (remesh): ${e.message}`);
		}
		return;
	}
	if (t.op !== "array") return;
	let i = e.vertexCount * t.count, a = e.faceCount * t.count;
	if (i > n.maxVertices || a > n.maxFaces) throw RangeError(`Mesh edit ${r} (array) would make ${i} vertices and ${a} faces, over the limit of ${n.maxVertices} vertices and ${n.maxFaces} faces. Lower count, or use a simpler mesh.`);
}
function Vo(e, t, n, r) {
	if (e.vertexCount > t.maxVertices || e.faceCount > t.maxFaces) throw RangeError(`Mesh edit ${n} (${r}) grows the mesh to ${e.vertexCount} vertices and ${e.faceCount} faces, over the limit of ${t.maxVertices} vertices or ${t.maxFaces} faces.`);
}
function Ho(e, { translation: t, rotation: n, scale: r }) {
	let [i, a, o, s] = n, c = new Float32Array(e.positions.length);
	for (let n = 0; n < c.length; n += 3) {
		let l = e.positions[n] * r[0], u = e.positions[n + 1] * r[1], d = e.positions[n + 2] * r[2], f = a * d - o * u, p = o * l - i * d, m = i * u - a * l;
		c[n] = l + 2 * (s * f + a * m - o * p) + t[0], c[n + 1] = u + 2 * (s * p + o * f - i * m) + t[1], c[n + 2] = d + 2 * (s * m + i * p - a * f) + t[2];
	}
	return E({
		positions: c,
		faceOffsets: e.faceOffsets,
		cornerVertices: e.cornerVertices,
		edgeVertices: e.edgeVertices,
		cornerEdges: e.cornerEdges,
		attributes: e.attributes
	});
}
function Uo(e, t, n) {
	if (!n) throw TypeError("shrinkwrap needs a target resolver; recipe meshes provide one.");
	return Na(e, Ho(n(t.target), t), t);
}
function Wo(e) {
	return (t) => {
		if (!e || typeof t == "string") throw TypeError("A mesh edit field reads a surface given as a geometry record such as { \"type\": \"terrain\", ... }, not an id.");
		return u(H(e(t)));
	};
}
function Go(e, t, n, { resolveCutter: r, limits: i }) {
	let a = Wo(r), o = { op: t.op };
	if (t.name && (o.name = t.name), da(t.op)) {
		let r;
		try {
			r = Ca(e, t, i);
		} catch (e) {
			throw new e.constructor(`Mesh edit ${n} (${t.op}): ${e.message}`);
		}
		return Object.assign(o, r.result), {
			mesh: r.mesh,
			result: o
		};
	}
	if (t.op === "boolean") {
		if (!r) throw TypeError(`Mesh edit ${n} (boolean) needs a cutter resolver; recipe meshes provide one.`);
		let i;
		try {
			i = Ho(r(t.cutter), t);
		} catch (e) {
			throw new e.constructor(`Mesh edit ${n} (boolean cutter): ${e.message}`);
		}
		let a = `${t.name}.cut`, s;
		try {
			s = It(e, i, t.operation, { cutTag: a });
		} catch (e) {
			throw new e.constructor(`Mesh edit ${n} (boolean ${t.operation}): ${e.message}`);
		}
		return o.operation = t.operation, o.tags = { [a]: s.cutterFaces }, {
			mesh: s.mesh,
			result: o
		};
	}
	if (t.op === "merge_by_distance") {
		let n = Te(e, t.distance);
		return o.removedVertices = n.removedVertices, o.removedFaces = n.removedFaces, {
			mesh: n.mesh,
			result: o
		};
	}
	if (t.op === "loop_cut") {
		let r;
		try {
			r = Bt(e, t.edges, t);
		} catch (e) {
			throw new e.constructor(`Mesh edit ${n} (loop_cut): ${e.message}`);
		}
		return o.rings = r.rings, o.closedRings = r.closedRings, o.splitEdges = r.splitEdges, o.tags = qo(r.mesh, t.name), {
			mesh: r.mesh,
			result: o
		};
	}
	if (t.op === "bevel") {
		let r;
		try {
			r = ge(e, t.edges, t);
		} catch (e) {
			throw new e.constructor(`Mesh edit ${n} (bevel): ${e.message}`);
		}
		return o.edges = r.bevelEdges, o.width = r.width, r.clamped && (o.clamped = !0), o.tags = qo(r.mesh, t.name), {
			mesh: r.mesh,
			result: o
		};
	}
	if (ir.includes(t.op)) {
		let r;
		try {
			r = pr(e, t);
		} catch (e) {
			throw new e.constructor(`Mesh edit ${n} (${t.op}): ${e.message}`);
		}
		Object.assign(o, r.result);
		let i = qo(r.mesh, t.name);
		return Object.keys(i).length && (o.tags = i), {
			mesh: r.mesh,
			result: o
		};
	}
	if (t.op === "set_position" || t.op === "displace") {
		let r;
		try {
			r = t.op === "set_position" ? gr(e, t, a) : _r(e, t, a);
		} catch (e) {
			throw new e.constructor(`Mesh edit ${n} (${t.op}): ${e.message}`);
		}
		return o.movedVertices = r.movedVertices, {
			mesh: r.mesh,
			result: o
		};
	}
	if (t.op === "vertex_group" || t.op === "vertex_color") {
		let r;
		try {
			r = t.op === "vertex_group" ? Or(e, t, a) : kr(e, t, a);
		} catch (e) {
			throw new e.constructor(`Mesh edit ${n} (${t.op}): ${e.message}`);
		}
		return t.op === "vertex_group" ? (o.group = t.name, o.assignedVertices = r.assignedVertices) : o.assignedCorners = r.assignedCorners, {
			mesh: r.mesh,
			result: o
		};
	}
	if (t.op === "sculpt" || t.op === "shrinkwrap") {
		let i;
		try {
			i = t.op === "sculpt" ? Ea(e, t) : Uo(e, t, r);
		} catch (e) {
			throw new e.constructor(`Mesh edit ${n} (${t.op}): ${e.message}`);
		}
		return o.movedVertices = i.movedVertices, i.missedVertices && (o.missedVertices = i.missedVertices), {
			mesh: i.mesh,
			result: o
		};
	}
	if (t.op === "subdivide") {
		let r;
		try {
			r = Gr(e, {
				levels: t.levels,
				crease: t.crease,
				sharpness: t.sharpness
			});
		} catch (e) {
			throw new e.constructor(`Mesh edit ${n} (subdivide): ${e.message}`);
		}
		return o.levels = t.levels, {
			mesh: r,
			result: o
		};
	}
	if (t.op === "decimate") {
		let r;
		try {
			r = ni(e, t);
		} catch (e) {
			throw new e.constructor(`Mesh edit ${n} (decimate): ${e.message}`);
		}
		return o.triangles = r.triangles, r.reachedTarget || (o.stoppedEarly = !0), {
			mesh: r.mesh,
			result: o
		};
	}
	if (t.op === "remesh") {
		let r;
		try {
			r = No(e, t);
		} catch (e) {
			throw new e.constructor(`Mesh edit ${n} (remesh): ${e.message}`);
		}
		return o.voxelSize = Number(r.voxelSize.toPrecision(5)), {
			mesh: r.mesh,
			result: o
		};
	}
	if (t.op === "uv_unwrap") {
		let r;
		try {
			let n = Ue("uvUnwrap", [e, t], Ce);
			r = {
				...n,
				mesh: E(n.mesh)
			};
		} catch (e) {
			throw e instanceof We ? e : new e.constructor(`Mesh edit ${n} (uv_unwrap): ${e.message}`);
		}
		return o.islands = r.islands, o.seamEdges = r.seamEdges, o.cutEdges = r.cutEdges, o.chartEdges = r.chartEdges, o.flipped = r.flipped, o.areaDistortion = Number(r.areaDistortion.toFixed(4)), o.utilization = Number(r.utilization.toFixed(4)), {
			mesh: r.mesh,
			result: o
		};
	}
	if (Object.hasOwn(Ko, t.op)) {
		let n = Ko[t.op](e, t);
		return o.tags = qo(n, t.name), {
			mesh: n,
			result: o
		};
	}
	let s;
	try {
		s = S(e, t.select);
	} catch (e) {
		throw new e.constructor(`Mesh edit ${n} (${t.op}): ${e.message}`);
	}
	let c = Ee(s);
	if (c === 0) throw RangeError(`Mesh edit ${n} (${t.op}) selects no faces. Check the rule with mesh_inspect tags and counts.`);
	o.selected = c;
	let l = y(e), u = null;
	switch (t.op) {
		case "extrude_face_region":
			u = be(l, s, t);
			break;
		case "extrude_individual":
			u = he(l, s, t);
			break;
		case "inset_region":
		case "inset_individual": {
			let e = t.op === "inset_region" ? ne(l, s, t) : ce(l, s, t);
			u = {
				capFaces: e.capFaces,
				sideFaces: e.sideFaces,
				sideTag: "rim"
			};
			break;
		}
		case "delete":
			o.deletedFaces = se(l, s).deletedFaces;
			break;
		case "flip_normals":
			le(l, s);
			break;
		case "translate":
			o.movedVertices = ie(l, s, t).movedVertices;
			break;
		case "tag": De(l, Array.from(s.keys()).filter((e) => s[e]), t.name), o.tags = { [t.name]: c };
	}
	if (u) {
		let e = `${t.name}.${u.sideTag ?? "side"}`;
		De(l, u.capFaces, `${t.name}.cap`), De(l, u.sideFaces, e), o.tags = {
			[`${t.name}.cap`]: u.capFaces.length,
			[e]: u.sideFaces.length
		};
	}
	return {
		mesh: ee(l),
		result: o
	};
}
var Ko = Object.freeze({
	mirror: (e, t) => xe(e, t),
	array: (e, t) => ve(e, t),
	solidify: (e, t) => me(e, t)
});
function qo(e, t) {
	let n = {};
	for (let [r, i] of Object.entries(e.attributes.face)) {
		if (!r.startsWith(`tag:${t}.`)) continue;
		let a = 0;
		for (let t = 0; t < e.faceCount; t++) a += +!!i.data[t];
		n[r.slice(4)] = a;
	}
	return n;
}
function Jo(e, t, { maxVertices: n = 25e4, maxFaces: r = 25e4, resolveCutter: i } = {}) {
	let a = Ro(t), o = {
		maxVertices: n,
		maxFaces: r
	}, s = [], c = e;
	return a.forEach((e, t) => {
		Bo(c, e, o, t);
		let n = Go(c, e, t, {
			resolveCutter: i,
			limits: o
		});
		c = n.mesh, Vo(c, o, t, e.op), n.result.after = {
			vertices: c.vertexCount,
			faces: c.faceCount
		}, s.push(n.result);
	}), {
		mesh: c,
		results: s
	};
}
function Yo(e) {
	if (!Array.isArray(e)) throw TypeError("stack must be an array.");
	if (e.length > 16) throw RangeError("A stack holds at most 16 nodes.");
	for (let [t, n] of e.entries()) if (!Fe.includes(n?.op)) throw TypeError(`Stack node ${t} op must be one of ${Fe.join(", ")}.`);
	return Ro(e.map((e, t) => Ne[e.op].fields.includes("name") ? {
		...e,
		name: e.name ?? `${e.op}-s${t + 1}`
	} : e));
}
function Xo(e, t, { maxVertices: n = 25e4, maxFaces: r = 25e4, cache: i, cacheKey: a } = {}) {
	let o = Yo(t), s = {
		maxVertices: n,
		maxFaces: r
	}, c = [], l = e, u = a;
	return o.forEach((e, t) => {
		u = u === void 0 ? void 0 : `${u}|${JSON.stringify(e)}`;
		let n = u === void 0 ? void 0 : i?.get(u), r;
		if (n) l = n.mesh, r = {
			...n.result,
			cached: !0
		};
		else {
			Bo(l, e, s, t);
			let n = Go(l, e, t, { limits: s });
			l = n.mesh, Vo(l, s, t, e.op), n.result.after = {
				vertices: l.vertexCount,
				faces: l.faceCount
			}, r = n.result, u !== void 0 && i?.set(u, {
				mesh: l,
				result: r
			});
		}
		c.push(r);
	}), {
		mesh: l,
		results: c
	};
}
// src/mesh-lod.js
var Zo = Object.freeze([
	.5,
	.25,
	.1
]);
function Qo(e) {
	if (!Array.isArray(e) || e.length < 1 || e.length > 8) throw RangeError("ratios needs 1 to 8 numbers.");
	e.forEach((t, n) => {
		if (typeof t != "number" || !(t > 0) || !(t < 1) || n > 0 && t >= e[n - 1]) throw RangeError("ratios must be strictly decreasing numbers above 0 and below 1.");
	});
}
function $o(e, t) {
	let n = [
		0,
		0,
		0
	], r = new Uint8Array(e.vertexCount), i = 0;
	for (let a of e.cornerVertices) if (!r[a]) {
		r[a] = 1;
		for (let t = 0; t < 3; t++) n[t] = e.positions[a * 3 + t];
		i = Math.max(i, t.query(n).distance);
	}
	return i;
}
function es(e, { ratios: t = Zo } = {}) {
	Qo(t);
	let n = Da(e), r = de(e), i = Math.hypot(...r.max.map((e, t) => e - r.min[t])), a = [{
		level: 0,
		ratio: 1,
		mesh: e,
		triangles: n.triangleCount,
		error: 0,
		relativeError: 0
	}], o = 1, s = e;
	return t.forEach((e, t) => {
		let r = ni(s, { ratio: e / o }), c = $o(r.mesh, n);
		a.push({
			level: t + 1,
			ratio: e,
			mesh: r.mesh,
			triangles: r.triangles.after,
			error: c,
			relativeError: c / i
		}), s = r.mesh, o = e;
	}), a;
}
function ts(e, { ratios: t = Zo, smoothAngle: n = 30 } = {}) {
	return es(fe(e, {
		quads: !1,
		tags: "none"
	}), { ratios: t }).map(({ mesh: t, ...r }) => ({
		...r,
		geometry: r.level === 0 ? e : v(t, { sharpAngle: n * Math.PI / 180 }).geometry
	}));
}
function ns(e, t = {}) {
	let n = e?.parts;
	if (!Array.isArray(n) || !n.length) throw TypeError("An asset needs a parts array.");
	for (let e of n) if (e.skin || e.morph) throw RangeError(`Part ${e.name ?? e.id ?? "?"} is skinned or morphed; LODs support static parts only.`);
	let r = /* @__PURE__ */ new Map();
	for (let e of n) r.has(e.geometry) || r.set(e.geometry, ts(e.geometry, t));
	let i = r.get(n[0].geometry).length;
	return Array.from({ length: i }, (t, i) => {
		let a = n.map((e) => ({
			...e,
			geometry: r.get(e.geometry)[i].geometry
		})), o = [...r.values()].map((e) => e[i]);
		return {
			level: i,
			ratio: o[0].ratio,
			triangles: o.reduce((e, t) => e + t.triangles, 0),
			error: Math.max(...o.map((e) => e.error)),
			asset: {
				...e,
				parts: a
			}
		};
	});
}
export { M as C, Ot as D, At as E, wt as O, Bt as S, It as T, ha as _, Jo as a, li as b, Yo as c, _o as d, No as f, sa as g, la as h, es as i, Je as k, Ho as l, ka as m, ns as n, Xo as o, Aa as p, ts as r, Ro as s, Zo as t, vo as u, Ca as v, kt as w, ni as x, fi as y };
