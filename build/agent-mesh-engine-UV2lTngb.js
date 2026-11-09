/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { C as e, F as t, I as n, J as r, O as i, T as a, et as o, j as s, rt as c, tt as l } from "./mesh-uv-YEnc7okb.js";
import { D as u, E as d, O as f, a as p, c as m, i as h, k as g, n as _, o as v, r as ee, s as y, w as te } from "./mesh-lod-DKlAHTWz.js";
import "./agent-scene-capabilities-BGAS_VVR.js";
import "./agent-scene-CyG0Wljh.js";
import { d as ne, l as re, n as b, s as ie } from "./quat-Bl7gjwWK.js";
import { a as ae, l as x, o as oe } from "./field-error-DPtscRqU.js";
import { createTriangleSurfaceIndex as se } from "./mesh-query.js";
import { a as ce, n as le, t as ue } from "./triangle-bvh-MJBX52tQ.js";
import { i as S, n as de, t as C } from "./triangle-math-CatOnS0A.js";
var fe = /^[A-Za-z0-9][A-Za-z0-9._-]{0,47}$/, w = [
	"name",
	"edits",
	"offsets",
	"value"
], T = [
	"select",
	"offset",
	"falloff"
];
function E(e, t) {
	return /* @__PURE__ */ TypeError(`Shape key ${e} (${t})`);
}
function pe(e, t) {
	if (!e || typeof e != "object" || Array.isArray(e)) throw E(t, "each offsets entry must be { select, offset, falloff }");
	for (let n of Object.keys(e)) if (!T.includes(n)) throw E(t, `offsets entries do not take ${n}; fields: ${T.join(", ")}`);
	return {
		op: "translate",
		...e
	};
}
function D(e) {
	if (!Array.isArray(e) || e.length > 16) throw RangeError("shapeKeys must be an array of at most 16 keys.");
	let t = /* @__PURE__ */ new Set();
	return e.map((e, n) => {
		if (!e || typeof e != "object" || Array.isArray(e)) throw E(n, "each key must be an object");
		for (let t of Object.keys(e)) if (!w.includes(t)) throw E(n, `does not take ${t}; fields: ${w.join(", ")}`);
		if (typeof e.name != "string" || !fe.test(e.name)) throw E(n, "name must be 1 to 48 letters, digits, dots, dashes or underscores");
		if (t.has(e.name)) throw E(n, `name ${e.name} is used twice`);
		if (t.add(e.name), e.edits === void 0 == (e.offsets === void 0)) throw E(n, "give exactly one of edits or offsets");
		let r = e.value ?? 0;
		if (typeof r != "number" || !(r >= 0 && r <= 1)) throw E(n, "value is the starting weight, from 0 to 1");
		let i = e.edits ?? (Array.isArray(e.offsets) ? e.offsets.map((e) => pe(e, n)) : null);
		if (!i) throw E(n, "offsets must be an array");
		return y(i), {
			name: e.name,
			value: r,
			edits: i
		};
	});
}
function me(e, t, n, r) {
	return n.map((n) => {
		let i = p(e, n.edits, r).mesh;
		if (i.vertexCount !== e.vertexCount || i.faceCount !== e.faceCount) throw RangeError(`Shape key ${n.name} changed the mesh from ${e.vertexCount} to ${i.vertexCount} vertices. Use edits that only move vertices (translate, set_position, displace, sculpt, shrinkwrap, smooth, simple_deform, lattice, hook, wave) or offsets.`);
		let a = new Float32Array(t.length * 3);
		for (let n = 0; n < t.length; n++) {
			let r = t[n];
			for (let t = 0; t < 3; t++) a[n * 3 + t] = i.positions[r * 3 + t] - e.positions[r * 3 + t];
		}
		return { positions: a };
	});
}
// src/agent-mesh.js
var O = /* @__PURE__ */ new WeakMap(), k = /* @__PURE__ */ new WeakMap(), he = 64, A = 67108864, ge = class {
	constructor() {
		this.entries = /* @__PURE__ */ new Map(), this.bytes = 0, this.hits = 0, this.misses = 0;
	}
	get(e) {
		let t = this.entries.get(e);
		if (!t) this.misses++;
		else return this.hits++, this.entries.delete(e), this.entries.set(e, t), t.value;
	}
	set(e, t) {
		let n = _e(t.mesh);
		if (n > A) return;
		let r = this.entries.get(e);
		for (r && (this.bytes -= r.bytes, this.entries.delete(e)), this.entries.set(e, {
			value: t,
			bytes: n
		}), this.bytes += n; this.entries.size > he || this.bytes > A;) {
			let [e, t] = this.entries.entries().next().value;
			this.entries.delete(e), this.bytes -= t.bytes;
		}
	}
};
function _e(e) {
	let t = e.positions.byteLength + e.faceOffsets.byteLength + e.cornerVertices.byteLength + e.edgeVertices.byteLength + e.cornerEdges.byteLength;
	for (let n of Object.values(e.attributes)) for (let e of Object.values(n)) t += e.data.byteLength;
	return t;
}
var j = new ge();
function ve(e, t, { maxVertices: r, smoothAngle: i = 30, resolveCutter: a, stack: o = [], cacheKey: c, shapeKeys: l = [] }) {
	let u = c === void 0 ? void 0 : `${c}|edits|${JSON.stringify(t)}`, d = u === void 0 ? void 0 : j.get(u);
	if (!d) {
		let n = s(e()), i = p(n, t, {
			maxVertices: r,
			maxFaces: r,
			resolveCutter: a && ((e) => s(a(e)))
		});
		d = {
			mesh: i.mesh,
			result: i.results
		}, u !== void 0 && j.set(u, d);
	}
	let f = v(d.mesh, o, {
		maxVertices: r,
		maxFaces: r,
		cache: j,
		cacheKey: u
	}), { geometry: m, renderVertexSource: h } = n(f.mesh, { sharpAngle: i * Math.PI / 180 });
	if (m.positions.length / 3 > r) throw RangeError(`The edited mesh needs ${m.positions.length / 3} render vertices, over maxVertices ${r}.`);
	let g = D(l);
	return g.length && (m.morphTargets = me(f.mesh, h, g, {
		maxVertices: r,
		maxFaces: r,
		resolveCutter: a && ((e) => s(a(e)))
	}), m.morphTargetNames = g.map((e) => e.name), m.morphTargetValues = Float32Array.from(g, (e) => e.value)), k.set(m, {
		mesh: f.mesh,
		results: d.result,
		stack: f.results
	}), m;
}
function ye(e, t, n) {
	k.set(e, {
		mesh: t,
		results: n,
		stack: []
	});
}
function M(e, t) {
	let n = k.get(e);
	if (!n) throw RangeError("this part is a plain shape with no tagged faces. Use a mesh geometry and tag faces with a mesh_edit tag op, or drop region.");
	let { mesh: r } = n, i = [];
	for (let e of c(r, t)) for (let t = r.faceOffsets[e]; t < r.faceOffsets[e + 1]; t++) {
		let e = r.cornerVertices[t];
		i.push(r.positions[e * 3], r.positions[e * 3 + 1], r.positions[e * 3 + 2]);
	}
	if (i.length === 0) throw RangeError(`tag ${t} is on no faces. Tag some faces, or use another region.`);
	return { positions: Float32Array.from(i) };
}
function N(e) {
	let t = {
		triangles: 0,
		quads: 0,
		ngons: 0
	};
	for (let n = 0; n < e.faceCount; n++) {
		let r = e.faceOffsets[n + 1] - e.faceOffsets[n];
		r === 3 ? t.triangles++ : r === 4 ? t.quads++ : t.ngons++;
	}
	return t;
}
function P(e) {
	let t = (e) => Math.round(e * 1e5) / 1e5;
	return {
		min: e.min.map(t),
		max: e.max.map(t)
	};
}
function F(e) {
	let t = O.get(e);
	if (t) return t;
	let n = k.get(e), r = n?.mesh ?? s(e), i = f(r, { geometry: !0 });
	return t = Object.freeze({
		ok: i.ok,
		counts: {
			...i.counts,
			triangles: e.indices.length / 3,
			renderVertices: e.positions.length / 3
		},
		faces: N(r),
		parts: i.parts,
		tags: i.tags,
		bounds: P(i.bounds),
		problems: i.problems,
		...i.skippedChecks ? { skippedChecks: i.skippedChecks } : {},
		...n ? {
			edits: n.results,
			stack: n.stack
		} : {}
	}), O.set(e, t), t;
}
// src/curve-operations.js
var be = 4096, I = 1e-9, xe = 1 - 1e-9;
function L(e, t) {
	return [
		e[0] - t[0],
		e[1] - t[1],
		e[2] - t[2]
	];
}
function R(e, t, n) {
	return [
		e[0] + t[0] * n,
		e[1] + t[1] * n,
		e[2] + t[2] * n
	];
}
function z(e, t) {
	return e[0] * t[0] + e[1] * t[1] + e[2] * t[2];
}
function B(e) {
	return Math.hypot(e[0], e[1], e[2]);
}
function V(e) {
	let t = B(e);
	return t < I ? [
		0,
		0,
		0
	] : [
		e[0] / t,
		e[1] / t,
		e[2] / t
	];
}
function Se(e, t) {
	let n = [], r = t ? e.length : e.length - 1;
	for (let t = 0; t < r; t++) {
		let r = e[t], i = e[(t + 1) % e.length];
		n.push({
			from: r,
			to: i,
			length: B(L(i, r))
		});
	}
	return n;
}
function Ce(e, t, n = !1) {
	let r = Se(e, n), i = r.reduce((e, t) => e + t.length, 0);
	if (!(i > I)) throw RangeError("The curve has no length.");
	let a = n ? i / t : i / (t - 1), o = [], s = 0, c = 0;
	for (let e = 0; e < t; e++) {
		let t = e * a;
		for (; s < r.length - 1 && t > c + r[s].length;) c += r[s].length, s++;
		let n = r[s], i = n.length < I ? 0 : Math.min(1, Math.max(0, (t - c) / n.length));
		o.push({
			point: R(n.from, L(n.to, n.from), i),
			direction: V(L(n.to, n.from))
		});
	}
	return o;
}
function we(e, t, n, r, i) {
	let a = V(L(e, t)), o = V(L(n, t)), s = z(a, o);
	if (s <= -.999999999 || s >= xe) return [t];
	let c = Math.acos(s) / 2, l = Math.min(B(L(e, t)), B(L(n, t))) / 2, u = Math.min(r / Math.tan(c), l), d = u * Math.tan(c), f = R(t, a, u), p = R(t, o, u), m = R(t, V([
		a[0] + o[0],
		a[1] + o[1],
		a[2] + o[2]
	]), d / Math.sin(c)), h = L(f, m), g = L(p, m), _ = Math.acos(Math.min(1, Math.max(-1, z(V(h), V(g))))), v = [];
	for (let e = 0; e <= i; e++) {
		let t = e / i, n = Math.sin((1 - t) * _) / Math.sin(_), r = Math.sin(t * _) / Math.sin(_);
		v.push([
			0,
			1,
			2
		].map((e) => m[e] + h[e] * n + g[e] * r));
	}
	return v;
}
function Te(e, t, n, r = !1) {
	let i = [], a = e.length;
	for (let o = 0; o < a; o++) {
		if (!r && (o === 0 || o === a - 1)) {
			i.push(e[o]);
			continue;
		}
		let s = e[(o + a - 1) % a], c = e[(o + 1) % a];
		if (i.push(...we(s, e[o], c, t, n)), i.length > 4096) throw RangeError(`Fillet makes more than ${be} points; use fewer corners or arc segments.`);
	}
	return i;
}
// src/mesh-instances.js
var H = 1e6, U = oe, Ee = Object.freeze([
	...U,
	"seed",
	"where",
	"yaw",
	"alignToNormal",
	"scale"
]), De = 2147483647, Oe = 8, W = Object.freeze([
	0,
	1,
	0
]), ke = 20, Ae = 10, je = 11, Me = 30, Ne = 31, Pe = 32;
function G(e) {
	return /* @__PURE__ */ TypeError(`Instances: ${e}`);
}
function K(e, t, n) {
	if (!e || typeof e != "object" || Array.isArray(e)) throw G(`${t} must be an object.`);
	for (let r of Object.keys(e)) if (!n.includes(r)) throw G(`${t} does not take ${JSON.stringify(r.slice(0, 24))}; fields: ${n.join(", ")}.`);
	return e;
}
function q(e, t) {
	if (!Array.isArray(e) || e.length !== 3 || !e.every((e) => typeof e == "number" && Number.isFinite(e) && Math.abs(e) <= H)) throw G(`${t} needs three finite numbers.`);
	return e;
}
function J(e, t, n, r) {
	if (!Number.isInteger(e) || e < t || e > n) throw G(`${r} must be an integer from ${t} to ${n}.`);
	return e;
}
function Fe(e) {
	K(e, "grid", ["counts", "spacing"]);
	let t = q(e.counts, "grid counts").map((e) => J(e, 1, x, "grid count")), n = t[0] * t[1] * t[2];
	if (n > 2048) throw G(`a grid of ${n} points is over the limit of ${x}.`);
	let r = q(e.spacing, "grid spacing"), i = new Float64Array(n * 3), a = 0;
	for (let e = 0; e < t[2]; e++) for (let n = 0; n < t[1]; n++) for (let o = 0; o < t[0]; o++) i[a * 3] = (o - (t[0] - 1) / 2) * r[0], i[a * 3 + 1] = (n - (t[1] - 1) / 2) * r[1], i[a * 3 + 2] = (e - (t[2] - 1) / 2) * r[2], a++;
	return {
		positions: i,
		normals: null
	};
}
function Ie(e, t) {
	K(e, "scatter", [
		"count",
		"min",
		"max"
	]);
	let n = J(e.count, 1, x, "scatter count"), r = q(e.min, "scatter min"), a = q(e.max, "scatter max"), o = new Float64Array(n * 3);
	for (let e = 0; e < n; e++) for (let n = 0; n < 3; n++) {
		let s = i(e, ke + n, t);
		o[e * 3 + n] = r[n] + (a[n] - r[n]) * s;
	}
	return {
		positions: o,
		normals: null
	};
}
function Le(e) {
	let t = e.indices.length / 3, n = new Float64Array(t), r = 0;
	for (let i = 0; i < t; i++) {
		let [t, a, o] = [
			0,
			1,
			2
		].map((t) => e.indices[i * 3 + t] * 3), s = [
			0,
			1,
			2
		].map((n) => e.positions[a + n] - e.positions[t + n]), c = [
			0,
			1,
			2
		].map((n) => e.positions[o + n] - e.positions[t + n]), l = Math.hypot(s[1] * c[2] - s[2] * c[1], s[2] * c[0] - s[0] * c[2], s[0] * c[1] - s[1] * c[0]) / 2;
		r += l, n[i] = r;
	}
	return {
		cumulative: n,
		total: r
	};
}
function Re(e, t) {
	let n = 0, r = e.length - 1;
	for (; n < r;) {
		let i = n + r >> 1;
		e[i] >= t ? r = i : n = i + 1;
	}
	return n;
}
function ze(e, t, n) {
	let { cumulative: r, total: a } = Le(e);
	if (!(a > 0)) throw G("the surface geometry has no area.");
	let o = new Float64Array(t * 3), s = new Float64Array(t * 3);
	for (let c = 0; c < t; c++) {
		let t = Re(r, i(c, Me, n) * a), l = Math.sqrt(i(c, Ne, n)), u = i(c, Pe, n), d = [
			1 - l,
			l * (1 - u),
			l * u
		], f = [
			0,
			1,
			2
		].map((n) => e.indices[t * 3 + n] * 3);
		for (let t = 0; t < 3; t++) o[c * 3 + t] = f.reduce((n, r, i) => n + e.positions[r + t] * d[i], 0), s[c * 3 + t] = f.reduce((n, r, i) => n + e.normals[r + t] * d[i], 0);
		let p = Math.hypot(s[c * 3], s[c * 3 + 1], s[c * 3 + 2]) || 1;
		for (let e = 0; e < 3; e++) s[c * 3 + e] /= p;
	}
	return {
		positions: o,
		normals: s
	};
}
function Be(e) {
	if (K(e, "curve", [
		"points",
		"count",
		"closed",
		"fillet"
	]), !Array.isArray(e.points) || e.points.length < 2 || e.points.length > 256) throw G("curve points are 2 to 256 positions.");
	let t = e.points.map((e) => q(e, "curve point")), n = e.closed === !0;
	if (e.closed !== void 0 && typeof e.closed != "boolean") throw G("curve closed must be boolean.");
	let r = J(e.count, n ? 3 : 2, x, "curve count");
	if (e.fillet !== void 0 && !(typeof e.fillet == "number" && e.fillet > 0 && e.fillet <= H)) throw G("curve fillet is a radius above 0.");
	let i = Ce(e.fillet === void 0 ? t : Te(t, e.fillet, Oe, n), r, n), a = new Float64Array(r * 3), o = new Float64Array(r * 3);
	return i.forEach(({ point: e, direction: t }, n) => {
		a.set(e, n * 3), o.set(t, n * 3);
	}), {
		positions: a,
		normals: o
	};
}
function Ve(e, t, n) {
	let r = U.filter((t) => Object.hasOwn(e, t));
	if (r.length !== 1) throw G(`give exactly one point source: ${U.join(", ")}.`);
	if (r[0] === "grid") return Fe(e.grid);
	if (r[0] === "scatter") return Ie(e.scatter, t);
	if (r[0] === "curve") return Be(e.curve);
	let i = K(e.surface, "surface", ["geometry", "count"]), a = J(i.count, 1, x, "surface count");
	if (typeof i.geometry != "string") throw G("surface needs a geometry id.");
	return ze(n(i.geometry), a, t);
}
function He(t, n, r) {
	let i = n.positions.length / 3, o = [];
	if (t.where === void 0) {
		for (let e = 0; e < i; e++) o.push(e);
		return o;
	}
	let s = n.normals ?? Float64Array.from({ length: i * 3 }, (e, t) => W[t % 3]), { values: c } = e(t.where, a(n.positions, s, (e) => {
		if (typeof e != "string") throw G("a where field reads a surface by its geometry id.");
		return se(r(e));
	}), { kind: "scalar" });
	for (let e = 0; e < i; e++) c[e] !== 0 && o.push(e);
	return o;
}
function Ue(e, t, n, r) {
	let a = b();
	if (e.alignToNormal && r) {
		let e = [
			r[n * 3],
			r[n * 3 + 1],
			r[n * 3 + 2]
		];
		re(a, W, e);
	}
	if (e.yaw) {
		let e = ne(b(), W, i(n, Ae, t) * Math.PI * 2);
		ie(a, a, e);
	}
	return Array.from(a);
}
function We(e, t, n) {
	return e.scale === void 0 ? 1 : e.scale[0] + (e.scale[1] - e.scale[0]) * i(n, je, t);
}
function Ge(e) {
	K(e, "instances", Ee);
	let t = e.seed === void 0 ? 0 : J(e.seed, 0, De, "seed");
	for (let t of ["yaw", "alignToNormal"]) if (e[t] !== void 0 && typeof e[t] != "boolean") throw G(`${t} must be boolean.`);
	if (e.alignToNormal && !Object.hasOwn(e, "surface") && !Object.hasOwn(e, "curve")) throw G("alignToNormal needs a surface or curve source, because only those have normals.");
	if (e.scale !== void 0) {
		let t = e.scale;
		if (!Array.isArray(t) || t.length !== 2 || !t.every((e) => typeof e == "number" && Number.isFinite(e) && e > 0 && e <= 1e3) || t[0] > t[1]) throw G("scale is [minimum, maximum] with 0 < minimum <= maximum <= 1000.");
	}
	return t;
}
function Y(e, { resolveSurface: t, maxNodes: n }) {
	if (!Array.isArray(e)) return e;
	let r = [];
	for (let i of e) {
		if (!i || typeof i != "object" || !Object.hasOwn(i, "instances")) {
			r.push(i);
			continue;
		}
		let { instances: e, geometry: a, material: o, ...s } = i;
		if (typeof a != "string" || typeof o != "string") throw G(`node ${JSON.stringify(String(i.id).slice(0, 48))} needs geometry and material ids to instance.`);
		let c = Ge(e), l = Ve(e, c, t);
		r.push(s);
		for (let [s, u] of He(e, l, t).entries()) {
			let t = We(e, c, u);
			if (r.push({
				id: `${i.id}.${s}`,
				parent: i.id,
				geometry: a,
				material: o,
				translation: [
					l.positions[u * 3],
					l.positions[u * 3 + 1],
					l.positions[u * 3 + 2]
				],
				rotation: Ue(e, c, u, l.normals),
				scale: [
					t,
					t,
					t
				]
			}), r.length > n) throw RangeError(`Instances expand past the limit of ${n} nodes.`);
		}
	}
	return r;
}
// src/mesh-import.js
var Ke = 1 - 1e-6, X = 4;
function qe(e) {
	let t = Float64Array.from(e.positions), n = ue(t, e.indices), r = /* @__PURE__ */ new Float64Array(9), i = /* @__PURE__ */ new Float64Array(3), a = /* @__PURE__ */ new Float64Array(3), o = /* @__PURE__ */ new Float64Array(3), s = /* @__PURE__ */ new Float64Array(3);
	function c(c, l, u, d) {
		s[0] = c, s[1] = l, s[2] = u;
		let f = Infinity, p = 0;
		ce(n, (e, t) => le(s, e, t), (e) => e * e <= f, (n) => {
			S(t, e.indices, n, r), de(s, r, i);
			let o = (i[0] - c) ** 2 + (i[1] - l) ** 2 + (i[2] - u) ** 2;
			return o < f && (f = o, p = n, a.set(i)), !1;
		}), S(t, e.indices, p, r);
		let m = C(a, r, o);
		d.triangle = p, d.distance = Math.sqrt(f);
		for (let e = 0; e < 3; e++) d.weights[e] = m ? Math.max(0, m[e]) : +(e === 0);
		let h = d.weights[0] + d.weights[1] + d.weights[2];
		for (let e = 0; e < 3; e++) d.weights[e] /= h;
		return d;
	}
	return {
		nearest: c,
		triangleVertex: (t, n) => e.indices[t * 3 + n]
	};
}
function Z() {
	return {
		triangle: 0,
		distance: 0,
		weights: /* @__PURE__ */ new Float64Array(3)
	};
}
function Q(e) {
	for (let t = 0; t < 3; t++) if (e[t] >= Ke) return t;
	return -1;
}
function $(e, t, n, r, i, a) {
	let o = Q(r);
	for (let s = 0; s < t; s++) {
		let c = 0;
		if (o >= 0) c = e[n[o] * t + s];
		else for (let i = 0; i < 3; i++) c += e[n[i] * t + s] * r[i];
		i[a * t + s] = c;
	}
}
function Je(e, t, n, r, i, a, o) {
	let s = Q(r), c = /* @__PURE__ */ new Map();
	for (let i = 0; i < 3; i++) {
		if (s >= 0 && i !== s) continue;
		let a = s >= 0 ? 1 : r[i];
		for (let r = 0; r < X; r++) {
			let o = t[n[i] * X + r] * a;
			if (o <= 0) continue;
			let s = e[n[i] * X + r];
			c.set(s, (c.get(s) ?? 0) + o);
		}
	}
	let l = [...c].sort((e, t) => t[1] - e[1]).slice(0, X), u = l.reduce((e, [, t]) => e + t, 0), d = 0;
	for (let e of c.values()) d += e;
	let f = s >= 0 || u === 0 ? 1 : d / u;
	for (let e = 0; e < X; e++) {
		let [t, n] = l[e] ?? [0, 0];
		i[o * X + e] = t, a[o * X + e] = n * f;
	}
}
function Ye(e) {
	let t = [
		Infinity,
		Infinity,
		Infinity
	], n = [
		-Infinity,
		-Infinity,
		-Infinity
	];
	for (let r = 0; r < e.length; r++) {
		let i = r % 3;
		t[i] = Math.min(t[i], e[r]), n[i] = Math.max(n[i], e[r]);
	}
	return Math.hypot(n[0] - t[0], n[1] - t[1], n[2] - t[2]);
}
function Xe(e, t, n) {
	for (let r = t; r < n; r++) if (e.data[r * 2] === 0 && e.data[r * 2 + 1] === 0) return !0;
	return !1;
}
function Ze(e, t, n) {
	let r = e.attributes.corner.uv?.size === 2 ? e.attributes.corner.uv : void 0, i = r ? Float32Array.from(r.data) : new Float32Array(e.cornerCount * 2), a = Z(), o = /* @__PURE__ */ new Float64Array(9), s = /* @__PURE__ */ new Float64Array(3), c = /* @__PURE__ */ new Float64Array(3), u = 0;
	for (let l = 0; l < e.faceCount; l++) {
		let d = e.faceOffsets[l], f = e.faceOffsets[l + 1];
		if (r && !Xe(r, d, f)) continue;
		let p = 0, m = 0, h = 0;
		for (let t = d; t < f; t++) p += e.positions[e.cornerVertices[t] * 3] / (f - d), m += e.positions[e.cornerVertices[t] * 3 + 1] / (f - d), h += e.positions[e.cornerVertices[t] * 3 + 2] / (f - d);
		n.nearest(p, m, h, a), S(t.positions, t.indices, a.triangle, o);
		for (let r = d; r < f; r++) {
			let l = e.cornerVertices[r];
			c.set(e.positions.subarray(l * 3, l * 3 + 3));
			let u = C(c, o, s);
			for (let e = 0; e < 2; e++) {
				let o = 0;
				for (let r = 0; r < 3; r++) {
					let i = u ? u[r] : +(r === 0);
					o += t.uvs[n.triangleVertex(a.triangle, r) * 2 + e] * i;
				}
				i[r * 2 + e] = o;
			}
		}
		u++;
	}
	if (!u) return {
		mesh: e,
		rebuilt: u
	};
	let d = {
		point: { ...e.attributes.point },
		edge: { ...e.attributes.edge },
		face: { ...e.attributes.face },
		corner: { ...e.attributes.corner }
	};
	return d.corner.uv = {
		data: i,
		size: 2
	}, {
		rebuilt: u,
		mesh: l({
			positions: e.positions,
			faceOffsets: e.faceOffsets,
			cornerVertices: e.cornerVertices,
			edgeVertices: e.edgeVertices,
			cornerEdges: e.cornerEdges,
			attributes: d
		})
	};
}
function Qe(e, t, n) {
	let r = t.positions.length / 3, i = !!(e.skinIndices && e.skinWeights), a = e.morphTargets ?? [];
	if (i && (t.skinIndices = new Uint16Array(r * X), t.skinWeights = new Float32Array(r * X)), e.colors && (t.colors = new Float32Array(r * 3)), a.length && (t.morphTargets = a.map((e) => ({
		...e.positions ? { positions: new Float32Array(r * 3) } : {},
		...e.normals ? { normals: new Float32Array(r * 3) } : {}
	}))), !i && !e.colors && !a.length) return 0;
	let o = Z(), s = [
		0,
		0,
		0
	], c = 0;
	for (let l = 0; l < r; l++) {
		n.nearest(t.positions[l * 3], t.positions[l * 3 + 1], t.positions[l * 3 + 2], o), c = Math.max(c, o.distance);
		for (let e = 0; e < 3; e++) s[e] = n.triangleVertex(o.triangle, e);
		i && Je(e.skinIndices, e.skinWeights, s, o.weights, t.skinIndices, t.skinWeights, l), e.colors && $(e.colors, 3, s, o.weights, t.colors, l), a.forEach((e, n) => {
			e.positions && $(e.positions, 3, s, o.weights, t.morphTargets[n].positions, l), e.normals && $(e.normals, 3, s, o.weights, t.morphTargets[n].normals, l);
		});
	}
	return c;
}
function $e(e, n) {
	return n ? t(e, { [`${o}${n}`]: {
		data: new Uint8Array(e.faceCount).fill(1),
		size: 1
	} }) : e;
}
function et(e, t, { maxVertices: i, smoothAngle: a, resolveCutter: o, materialTag: c }) {
	let l = $e(s(e), c), u = p(l, t, {
		maxVertices: i,
		maxFaces: i,
		resolveCutter: o && ((e) => s(o(e)))
	});
	g(r(u.mesh));
	let d = qe(e), f = e.uvs ? Ze(u.mesh, e, d) : {
		mesh: u.mesh,
		rebuilt: 0
	}, { geometry: m } = n(f.mesh, { sharpAngle: a * Math.PI / 180 });
	if (m.positions.length / 3 > i) throw RangeError(`The edited part needs ${m.positions.length / 3} render vertices, over maxVertices ${i}. Use fewer or coarser edits.`);
	let h = Qe(e, m, d), _ = Ye(e.positions) * ae.maxTransferFraction, v = !!e.skinIndices || !!e.morphTargets?.length;
	if (v && h > _) throw RangeError(`This edit puts geometry ${h.toPrecision(3)} from the imported surface, over the ${_.toPrecision(3)} limit, so skin weights and morph targets would be guesses. Keep edits within ${_.toPrecision(3)} of the surface (smaller offsets, cut instead of extrude), or edit a part without skin or morphs.`);
	return {
		geometry: m,
		mesh: f.mesh,
		results: u.results,
		transfer: {
			skinWeights: !!e.skinIndices,
			morphTargets: e.morphTargets?.length ?? 0,
			colors: !!e.colors,
			uvs: !!e.uvs,
			uvFacesRebuilt: f.rebuilt,
			reach: Number(h.toPrecision(4)),
			limit: v ? Number(_.toPrecision(4)) : null
		}
	};
}
export { et as editImportedGeometry, Y as expandInstancedNodes, _ as generateAssetLods, ee as generateGeometryLods, ve as generateMeshGeometry, h as generateMeshLods, F as importedMeshReport, F as meshReport, te as loadMeshBooleans, d as meshBooleansLoaded, y as normalizeMeshEdits, m as normalizeMeshStack, D as normalizeShapeKeys, ye as registerEditedMesh, u as setManifoldModuleLoader, M as taggedFacePositions };
