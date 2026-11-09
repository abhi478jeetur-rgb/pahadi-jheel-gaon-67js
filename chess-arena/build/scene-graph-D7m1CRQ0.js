/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { h as e, n as t, p as n, r } from "./mat4-BCZClxna.js";
// src/scene-graph.js
var i = Object.freeze([
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
]), a = Object.freeze([
	0,
	0,
	0
]);
function o(e, t, n) {
	if (!Array.isArray(e) && !ArrayBuffer.isView(e) || e.length !== t) throw TypeError(`${n} needs ${t} finite Float32 values.`);
	let r = new Float32Array(t);
	for (let i = 0; i < t; i++) {
		if (!Number.isFinite(e[i]) || !Number.isFinite(Math.fround(e[i]))) throw TypeError(`${n} needs ${t} finite Float32 values.`);
		r[i] = e[i];
	}
	return r;
}
function s(e, t) {
	for (let n = 0; n < 16; n++) if (!Number.isFinite(e[n]) || !Number.isFinite(Math.fround(e[n]))) throw RangeError(`Node ${t} matrix must contain finite Float32 values.`);
	if (e[3] !== 0 || e[7] !== 0 || e[11] !== 0 || e[15] !== 1) throw RangeError(`Node ${t} matrix must be affine.`);
	let n = r(e);
	if (!Number.isFinite(n) || n === 0) throw RangeError(`Node ${t} matrix must be nonsingular.`);
}
function c(e, t) {
	if (!Number.isSafeInteger(e) || e <= 0) throw RangeError(`${t} must be a positive safe integer.`);
	return e;
}
function l(e, t) {
	let n = Array.from({ length: e.length }, () => []), r = [], i = new Uint32Array(e.length);
	for (let t = 0; t < e.length; t++) e[t] < 0 ? (r.push(t), i[t] = 1) : n[e[t]].push(t);
	for (let e = 0; e < r.length; e++) {
		let a = r[e];
		if (i[a] > t) throw RangeError("Scene graph exceeds maxDepth.");
		let o = n[a];
		for (let e = 0; e < o.length; e++) {
			let t = o[e];
			i[t] = i[a] + 1, r.push(t);
		}
	}
	if (r.length !== e.length) throw RangeError("Scene graph parent references contain a cycle.");
	return r;
}
function u(e, t) {
	return Object.freeze({
		name: e.name,
		geometry: e.geometry,
		matrix: t,
		get material() {
			return e.material;
		},
		set material(t) {
			e.material = t;
		}
	});
}
function d(r = [], { maxNodes: d = 4096, maxDepth: f = 256 } = {}) {
	if (c(d, "maxNodes"), c(f, "maxDepth"), !Array.isArray(r)) throw TypeError("Scene graph definitions must be an array.");
	if (r.length > d) throw RangeError("Scene graph exceeds maxNodes.");
	let p = /* @__PURE__ */ new Map(), m = r.map((e, n) => {
		if (!e || typeof e.name != "string" || !e.name.trim()) throw TypeError("Scene graph nodes need names.");
		if (p.has(e.name)) throw RangeError(`Duplicate scene graph node name: ${e.name}`);
		p.set(e.name, n);
		let r = e.parent ?? null;
		if (r !== null && (typeof r != "string" || !r.trim())) throw TypeError("Node parent must be a name or null.");
		let c = e.geometry, l = e.material;
		if (c != null != (l != null)) throw TypeError("Mesh nodes need both geometry and material.");
		if (c != null && (typeof c != "object" || typeof l != "object")) throw TypeError("Node geometry and material must be objects.");
		let u = o(e.matrix ?? i, 16, `${e.name} matrix`);
		return s(u, e.name), {
			name: e.name,
			parent: r,
			localMatrix: u,
			worldMatrix: t(),
			stagedWorld: t(),
			effectiveLocal: /* @__PURE__ */ new Float64Array(16),
			pivot: o(e.pivot ?? a, 3, `${e.name} pivot`),
			geometry: c,
			material: l
		};
	}), h = new Int32Array(m.length);
	for (let e = 0; e < m.length; e++) {
		let t = m[e].parent;
		if (t !== null && !p.has(t)) throw RangeError(`Node ${m[e].name} parent was not found: ${t}. Add that node first, or set parent to null for a root.`);
		h[e] = t === null ? -1 : p.get(t);
	}
	let g = l(h, f), _ = [], v = [], y = m.map((e) => (e.geometry != null && _.push(u(e, e.worldMatrix)), v.push(u(e, e.localMatrix)), Object.freeze({
		name: e.name,
		localMatrix: e.localMatrix,
		worldMatrix: e.worldMatrix,
		pivot: e.pivot,
		geometry: e.geometry,
		get parent() {
			return e.parent;
		},
		get material() {
			return e.material;
		},
		set material(t) {
			e.material = t;
		}
	})));
	function b(t, n, r = -1, i = null) {
		for (let a = 0; a < t.length; a++) {
			let o = t[a], c = m[o], l = o === r ? i : c.localMatrix;
			s(l, c.name);
			let u = c.pivot;
			for (let e = 0; e < 3; e++) if (!Number.isFinite(u[e])) throw RangeError(`Node ${c.name} pivot must stay finite.`);
			let d = c.effectiveLocal;
			d.set(l);
			for (let e = 0; e < 3; e++) d[12 + e] += u[e] - l[e] * u[0] - l[4 + e] * u[1] - l[8 + e] * u[2];
			let f = n[o];
			f < 0 ? c.stagedWorld.set(d) : e(c.stagedWorld, m[f].stagedWorld, d), s(c.stagedWorld, c.name);
		}
	}
	function x() {
		for (let e = 0; e < m.length; e++) m[e].worldMatrix.set(m[e].stagedWorld);
	}
	function S(e) {
		if (!p.has(e)) throw RangeError(`Scene graph node was not found: ${e}`);
		return p.get(e);
	}
	let C = Object.freeze({
		nodes: Object.freeze(y),
		parts: Object.freeze(_),
		animationTargets: Object.freeze(v),
		getNode(e) {
			return y[S(e)];
		},
		update() {
			return b(g, h), x(), _;
		},
		reparent(t, r = null, { keepWorld: i = !1 } = {}) {
			if (typeof i != "boolean") throw TypeError("keepWorld must be boolean.");
			let a = S(t), o = r === null ? -1 : S(r), c = new Int32Array(h);
			c[a] = o;
			let u = l(c, f), d = null;
			if (i) {
				b(g, h);
				let r = new Float64Array(m[a].stagedWorld);
				if (o >= 0) {
					let t = /* @__PURE__ */ new Float64Array(16);
					if (!n(t, m[o].stagedWorld)) throw RangeError("New parent world matrix must be invertible.");
					e(r, t, r);
				}
				let i = m[a].pivot;
				for (let e = 0; e < 3; e++) r[12 + e] = r[12 + e] - i[e] + r[e] * i[0] + r[4 + e] * i[1] + r[8 + e] * i[2];
				d = new Float32Array(r), s(d, t);
			}
			return b(u, c, d ? a : -1, d), d && m[a].localMatrix.set(d), m[a].parent = r, h = c, g = u, x(), C;
		}
	});
	return C.update(), C;
}
export { d as t };
