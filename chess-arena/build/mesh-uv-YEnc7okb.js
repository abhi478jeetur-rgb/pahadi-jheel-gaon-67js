/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { c as e, r as t, s as n } from "./field-error-DPtscRqU.js";
import { a as r, d as i, f as a, i as o, n as s, o as c, s as l, t as u, u as d } from "./expression-BmPTs3mu.js";
// src/mesh-data.js
var f = Object.freeze([
	"point",
	"edge",
	"face",
	"corner"
]), p = 4e6, m = 16e6, h = "tag:", g = "group:", _ = /* @__PURE__ */ new Set([
	"__proto__",
	"constructor",
	"prototype"
]), v = /* @__PURE__ */ new Map([
	[Float32Array, "float32"],
	[Uint8Array, "uint8"],
	[Uint16Array, "uint16"],
	[Uint32Array, "uint32"],
	[Int32Array, "int32"]
]);
function y(e) {
	for (let t = 0; t < e.length; t++) if (!Number.isFinite(e[t])) return !1;
	return !0;
}
function b(e, t) {
	return t === "point" ? e.vertexCount : t === "edge" ? e.edgeCount : t === "face" ? e.faceCount : e.cornerCount;
}
function x(e, t, n) {
	if (_.has(e)) throw TypeError(`Attribute name ${e} is reserved; pick another name.`);
	if (!t || typeof t != "object") throw TypeError(`Attribute ${e} must be { data, size }.`);
	let { data: r, size: i } = t;
	if (!v.has(r?.constructor)) throw TypeError(`Attribute ${e} needs a Float32, Uint8, Uint16, Uint32 or Int32 array.`);
	if (!Number.isInteger(i) || i < 1 || i > 16) throw RangeError(`Attribute ${e} size must be an integer from 1 to 16.`);
	if (r.length !== n * i) throw RangeError(`Attribute ${e} needs ${n * i} values, not ${r.length}.`);
	if (r instanceof Float32Array && !y(r)) throw RangeError(`Attribute ${e} contains non-finite values.`);
	return Object.freeze({
		data: r,
		size: i
	});
}
function S(e, t, n) {
	if (!(t instanceof Uint32Array) || t.length < 2 || t[0] !== 0) throw TypeError("faceOffsets must be a Uint32Array that starts at 0 and has faceCount + 1 entries.");
	if (!(n instanceof Uint32Array) || t.at(-1) !== n.length) throw TypeError("cornerVertices must be a Uint32Array whose length equals the last face offset.");
	if (n.length > 16e6) throw RangeError(`Meshes support at most ${m} corners.`);
	for (let r = 0; r + 1 < t.length; r++) {
		let i = t[r], a = t[r + 1];
		if (a - i < 3) throw RangeError(`Face ${r} needs at least three corners.`);
		for (let t = i; t < a; t++) {
			let o = n[t];
			if (o >= e) throw RangeError(`Face ${r} references missing vertex ${o}.`);
			if ((t + 1 === a ? n[i] : n[t + 1]) === o) throw RangeError(`Face ${r} repeats vertex ${o} on consecutive corners.`);
		}
	}
}
function C(e, t, n, r, i) {
	if (!(r instanceof Uint32Array) || r.length % 2 != 0) throw TypeError("edgeVertices must be a Uint32Array of vertex pairs.");
	if (!(i instanceof Uint32Array) || i.length !== n.length) throw TypeError("cornerEdges needs one edge per corner.");
	let a = r.length / 2;
	for (let t = 0; t < a; t++) {
		let n = r[t * 2], i = r[t * 2 + 1];
		if (n >= e || i >= e || n === i) throw RangeError(`Edge ${t} has invalid vertices.`);
	}
	for (let e = 0; e + 1 < t.length; e++) {
		let o = t[e], s = t[e + 1];
		for (let e = o; e < s; e++) {
			let t = i[e];
			if (t >= a) throw RangeError(`Corner ${e} references missing edge ${t}.`);
			let c = n[e], l = e + 1 === s ? n[o] : n[e + 1], u = r[t * 2], d = r[t * 2 + 1];
			if (!(u === c && d === l || u === l && d === c)) throw RangeError(`Corner ${e} edge ${t} does not join its vertices.`);
		}
	}
}
function w(e, t, n) {
	let r = n.length, i = new Int32Array(e).fill(-1), a = new Int32Array(r), o = new Uint32Array(r * 2), s = new Uint32Array(r), c = 0, l = t.length - 1;
	for (let e = 0; e < l; e++) {
		let r = t[e], l = t[e + 1];
		for (let e = r; e < l; e++) {
			let t = n[e], u = e + 1 === l ? n[r] : n[e + 1], d = Math.min(t, u), f = Math.max(t, u), p = i[d];
			for (; p !== -1 && o[p * 2 + 1] !== f;) p = a[p];
			p === -1 && (p = c, c++, o[p * 2] = d, o[p * 2 + 1] = f, a[p] = i[d], i[d] = p), s[e] = p;
		}
	}
	return {
		edgeVertices: o.slice(0, c * 2),
		cornerEdges: s,
		edgeCount: c
	};
}
function T({ positions: e, faceOffsets: t, cornerVertices: n, edgeVertices: r, cornerEdges: i, attributes: a = {} }) {
	if (!(e instanceof Float32Array) || e.length % 3 != 0 || e.length === 0) throw TypeError("positions must be a nonempty Float32Array of XYZ triples.");
	let o = e.length / 3;
	if (o > 4e6) throw RangeError(`Meshes support at most ${p} vertices.`);
	if (!y(e)) throw RangeError("positions must be finite.");
	S(o, t, n);
	let s;
	if (r && i) C(o, t, n, r, i), s = {
		edgeVertices: r,
		cornerEdges: i,
		edgeCount: r.length / 2
	};
	else {
		if (a.edge && Object.keys(a.edge).length) throw TypeError("Edge attributes need explicit edgeVertices and cornerEdges.");
		s = w(o, t, n);
	}
	let c = {
		vertexCount: o,
		edgeCount: s.edgeCount,
		faceCount: t.length - 1,
		cornerCount: n.length,
		positions: e,
		faceOffsets: t,
		cornerVertices: n,
		edgeVertices: s.edgeVertices,
		cornerEdges: s.cornerEdges
	}, l = {};
	for (let e of f) {
		let t = a[e] ?? {}, n = {};
		for (let [r, i] of Object.entries(t)) n[r] = x(r, i, b(c, e));
		l[e] = Object.freeze(n);
	}
	for (let e of Object.keys(l.face)) if (e.startsWith("tag:") && (!(l.face[e].data instanceof Uint8Array) || l.face[e].size !== 1)) throw TypeError(`Tag ${e} must be a Uint8Array face attribute of size 1.`);
	return c.attributes = Object.freeze(l), Object.freeze(c);
}
function E(e) {
	return Object.keys(e.attributes.face).filter((e) => e.startsWith(h)).map((e) => e.slice(4));
}
function D(e) {
	return Object.keys(e.attributes.point).filter((e) => e.startsWith(g)).map((e) => e.slice(6));
}
function O(e, t) {
	let n = e.attributes.point[g + t];
	if (!n || n.size !== 1) throw RangeError(`Unknown vertex group ${t}. Known groups: ${D(e).join(", ") || "none"}. Make one with a vertex_group edit before this one.`);
	return n.data;
}
function k(e, t) {
	let n = e.attributes.face[h + t];
	if (!n) throw RangeError(`Unknown tag ${t}. Known tags: ${E(e).join(", ") || "none"}.`);
	let r = [];
	for (let t = 0; t < e.faceCount; t++) n.data[t] && r.push(t);
	return r;
}
function ee(e) {
	let t = {};
	for (let n of E(e)) {
		let r = e.attributes.face[h + n].data, i = 0;
		for (let t = 0; t < e.faceCount; t++) i += +!!r[t];
		t[n] = i;
	}
	return t;
}
function te(e) {
	let t = [
		Infinity,
		Infinity,
		Infinity
	], n = [
		-Infinity,
		-Infinity,
		-Infinity
	], r = e.positions;
	for (let e = 0; e < r.length; e += 3) for (let i = 0; i < 3; i++) {
		let a = r[e + i];
		a < t[i] && (t[i] = a), a > n[i] && (n[i] = a);
	}
	return {
		min: t,
		max: n
	};
}
// src/mesh-edit.js
var A = 16;
function j(e, t, n) {
	let r = new e.constructor(t);
	return r.set(e), n !== void 0 && r.fill(n, e.length), r;
}
var ne = class {
	constructor(e, t) {
		this.fields = e, this.capacity = t, this.count = 0, this.liveCount = 0, this.free = [], this.removed = new Uint8Array(t), this.arrays = {};
		for (let [n, { type: r, width: i, fill: a }] of Object.entries(e)) this.arrays[n] = new r(t * i), a !== void 0 && this.arrays[n].fill(a);
		this.attributes = /* @__PURE__ */ new Map();
	}
	ensureCapacity(e) {
		if (e <= this.capacity) return;
		let t = this.capacity;
		for (; t < e;) t *= 2;
		for (let [e, { width: n, fill: r }] of Object.entries(this.fields)) this.arrays[e] = j(this.arrays[e], t * n, r);
		for (let e of this.attributes.values()) e.data = j(e.data, t * e.size);
		this.removed = j(this.removed, t), this.capacity = t;
	}
	allocate() {
		let e;
		this.free.length ? (e = this.free.pop(), this.removed[e] = 0) : (this.ensureCapacity(this.count + 1), e = this.count, this.count++);
		for (let t of this.attributes.values()) t.data.fill(0, e * t.size, (e + 1) * t.size);
		return this.liveCount++, e;
	}
	release(e) {
		this.removed[e] = 1, this.free.push(e), this.liveCount--;
	}
	isLive(e) {
		return e >= 0 && e < this.count && !this.removed[e];
	}
}, re = class {
	constructor(e = {}) {
		this.vertices = new ne({
			position: {
				type: Float32Array,
				width: 3
			},
			edgeSlot: {
				type: Int32Array,
				width: 1,
				fill: -1
			}
		}, Math.max(A, e.vertices ?? 0)), this.edges = new ne({
			vertex: {
				type: Int32Array,
				width: 2,
				fill: -1
			},
			diskNext: {
				type: Int32Array,
				width: 2,
				fill: -1
			},
			diskPrev: {
				type: Int32Array,
				width: 2,
				fill: -1
			},
			loop: {
				type: Int32Array,
				width: 1,
				fill: -1
			}
		}, Math.max(A, e.edges ?? 0)), this.loops = new ne({
			vertex: {
				type: Int32Array,
				width: 1
			},
			edge: {
				type: Int32Array,
				width: 1
			},
			face: {
				type: Int32Array,
				width: 1
			},
			next: {
				type: Int32Array,
				width: 1
			},
			prev: {
				type: Int32Array,
				width: 1
			},
			radialNext: {
				type: Int32Array,
				width: 1
			},
			radialPrev: {
				type: Int32Array,
				width: 1
			}
		}, Math.max(A, e.loops ?? 0)), this.faces = new ne({
			loop: {
				type: Int32Array,
				width: 1,
				fill: -1
			},
			size: {
				type: Int32Array,
				width: 1
			}
		}, Math.max(A, e.faces ?? 0));
	}
	storeForDomain(e) {
		if (e === "point") return this.vertices;
		if (e === "edge") return this.edges;
		if (e === "face") return this.faces;
		if (e === "corner") return this.loops;
		throw RangeError(`Unknown domain ${e}.`);
	}
	ensureAttribute(e, t, n = Float32Array, r = 1) {
		let i = this.storeForDomain(e), a = i.attributes.get(t);
		if (a) {
			if (a.data.constructor !== n || a.size !== r) throw TypeError(`Attribute ${t} already exists with another type or size.`);
			return a;
		}
		return a = {
			data: new n(i.capacity * r),
			size: r
		}, i.attributes.set(t, a), a;
	}
	attribute(e, t) {
		return this.storeForDomain(e).attributes.get(t);
	}
	get vertexCount() {
		return this.vertices.liveCount;
	}
	get edgeCount() {
		return this.edges.liveCount;
	}
	get faceCount() {
		return this.faces.liveCount;
	}
	get loopCount() {
		return this.loops.liveCount;
	}
	createVertex(e, t, n) {
		let r = this.vertices.allocate(), i = this.vertices.arrays.position;
		return i[r * 3] = e, i[r * 3 + 1] = t, i[r * 3 + 2] = n, this.vertices.arrays.edgeSlot[r] = -1, r;
	}
	vertexPosition(e, t = [
		0,
		0,
		0
	]) {
		let n = this.vertices.arrays.position;
		return t[0] = n[e * 3], t[1] = n[e * 3 + 1], t[2] = n[e * 3 + 2], t;
	}
	setVertexPosition(e, t, n, r) {
		let i = this.vertices.arrays.position;
		i[e * 3] = t, i[e * 3 + 1] = n, i[e * 3 + 2] = r;
	}
	slotVertex(e) {
		return this.edges.arrays.vertex[e];
	}
	vertexEdges(e) {
		let t = [], n = this.vertices.arrays.edgeSlot[e];
		if (n === -1) return t;
		let r = this.edges.arrays.diskNext, i = n;
		do
			t.push(i >> 1), i = r[i];
		while (i !== n);
		return t;
	}
	vertexDegree(e) {
		let t = this.vertices.arrays.edgeSlot[e];
		if (t === -1) return 0;
		let n = this.edges.arrays.diskNext, r = 0, i = t;
		do
			r++, i = n[i];
		while (i !== t);
		return r;
	}
	findEdge(e, t) {
		let n = this.vertices.arrays.edgeSlot[e];
		if (n === -1) return -1;
		let r = this.edges.arrays.diskNext, i = this.edges.arrays.vertex, a = n;
		do {
			if (i[a ^ 1] === t) return a >> 1;
			a = r[a];
		} while (a !== n);
		return -1;
	}
	linkSlot(e) {
		let t = this.edges.arrays.vertex[e], n = this.vertices.arrays.edgeSlot, r = this.edges.arrays.diskNext, i = this.edges.arrays.diskPrev, a = n[t];
		if (a === -1) {
			r[e] = e, i[e] = e, n[t] = e;
			return;
		}
		let o = i[a];
		r[o] = e, i[e] = o, r[e] = a, i[a] = e;
	}
	unlinkSlot(e) {
		let t = this.edges.arrays.vertex[e], n = this.vertices.arrays.edgeSlot, r = this.edges.arrays.diskNext, i = this.edges.arrays.diskPrev, a = r[e];
		if (a === e) n[t] = -1;
		else {
			let o = i[e];
			r[o] = a, i[a] = o, n[t] === e && (n[t] = a);
		}
		r[e] = -1, i[e] = -1;
	}
	ensureEdge(e, t) {
		if (e === t) throw RangeError("An edge needs two distinct vertices.");
		let n = this.findEdge(e, t);
		if (n !== -1) return n;
		let r = this.edges.allocate();
		return this.edges.arrays.vertex[r * 2] = e, this.edges.arrays.vertex[r * 2 + 1] = t, this.edges.arrays.loop[r] = -1, this.linkSlot(r * 2), this.linkSlot(r * 2 + 1), r;
	}
	edgeVertices(e) {
		return [this.edges.arrays.vertex[e * 2], this.edges.arrays.vertex[e * 2 + 1]];
	}
	edgeOtherVertex(e, t) {
		let n = this.edges.arrays.vertex;
		return n[e * 2] === t ? n[e * 2 + 1] : n[e * 2];
	}
	edgeLoops(e) {
		let t = [], n = this.edges.arrays.loop[e];
		if (n === -1) return t;
		let r = this.loops.arrays.radialNext, i = n;
		do
			t.push(i), i = r[i];
		while (i !== n);
		return t;
	}
	edgeFaceCount(e) {
		let t = this.edges.arrays.loop[e];
		if (t === -1) return 0;
		let n = this.loops.arrays.radialNext, r = 0, i = t;
		do
			r++, i = n[i];
		while (i !== t);
		return r;
	}
	removeEdge(e) {
		for (; this.edges.arrays.loop[e] !== -1;) this.removeFace(this.loops.arrays.face[this.edges.arrays.loop[e]]);
		this.unlinkSlot(e * 2), this.unlinkSlot(e * 2 + 1), this.edges.release(e);
	}
	linkRadial(e, t) {
		let n = this.edges.arrays.loop, r = this.loops.arrays.radialNext, i = this.loops.arrays.radialPrev, a = n[t];
		if (a === -1) {
			r[e] = e, i[e] = e, n[t] = e;
			return;
		}
		let o = i[a];
		r[o] = e, i[e] = o, r[e] = a, i[a] = e;
	}
	unlinkRadial(e) {
		let t = this.loops.arrays.edge[e], n = this.edges.arrays.loop, r = this.loops.arrays.radialNext, i = this.loops.arrays.radialPrev, a = r[e];
		if (a === e) {
			n[t] = -1;
			return;
		}
		let o = i[e];
		r[o] = a, i[a] = o, n[t] === e && (n[t] = a);
	}
	createFace(e) {
		let t = e.length;
		if (t < 3) throw RangeError("A face needs at least three vertices.");
		if (new Set(e).size !== t) throw RangeError("A face cannot repeat a vertex.");
		for (let t of e) if (!this.vertices.isLive(t)) throw RangeError(`Vertex ${t} does not exist.`);
		let n = Array(t);
		for (let r = 0; r < t; r++) n[r] = this.ensureEdge(e[r], e[(r + 1) % t]);
		let r = this.faces.allocate(), i = this.loops.arrays, a = -1, o = -1;
		for (let s = 0; s < t; s++) {
			let t = this.loops.allocate();
			i.vertex[t] = e[s], i.edge[t] = n[s], i.face[t] = r, o === -1 ? a = t : (i.next[o] = t, i.prev[t] = o), o = t, this.linkRadial(t, n[s]);
		}
		return i.next[o] = a, i.prev[a] = o, this.faces.arrays.loop[r] = a, this.faces.arrays.size[r] = t, r;
	}
	removeFace(e) {
		let t = this.loops.arrays, n = this.faces.arrays.loop[e], r = n;
		do {
			let e = t.next[r];
			this.unlinkRadial(r), this.loops.release(r), r = e;
		} while (r !== n);
		this.faces.arrays.loop[e] = -1, this.faces.release(e);
	}
	removeVertex(e) {
		for (; this.vertices.arrays.edgeSlot[e] !== -1;) this.removeEdge(this.vertices.arrays.edgeSlot[e] >> 1);
		this.vertices.release(e);
	}
	faceLoops(e) {
		let t = [], n = this.loops.arrays.next, r = this.faces.arrays.loop[e], i = r;
		do
			t.push(i), i = n[i];
		while (i !== r);
		return t;
	}
	faceVertices(e) {
		return this.faceLoops(e).map((e) => this.loops.arrays.vertex[e]);
	}
	faceNeighbors(e) {
		let t = /* @__PURE__ */ new Set();
		for (let n of this.faceLoops(e)) for (let r of this.edgeLoops(this.loops.arrays.edge[n])) {
			let n = this.loops.arrays.face[r];
			n !== e && t.add(n);
		}
		return [...t];
	}
	*liveIndices(e) {
		let t = this.storeForDomain(e);
		for (let e = 0; e < t.count; e++) t.removed[e] || (yield e);
	}
};
function M(e, t) {
	e.ensureCapacity(t), e.count = t, e.liveCount = t;
}
function ie(e) {
	let t = new re({
		vertices: e.vertexCount,
		edges: e.edgeCount,
		loops: e.cornerCount,
		faces: e.faceCount
	});
	for (let n of f) for (let [r, i] of Object.entries(e.attributes[n])) t.ensureAttribute(n, r, i.data.constructor, i.size);
	M(t.vertices, e.vertexCount), M(t.edges, e.edgeCount), M(t.loops, e.cornerCount), M(t.faces, e.faceCount), t.vertices.arrays.position.set(e.positions);
	let n = t.edges.arrays.vertex;
	for (let r = 0; r < e.edgeCount; r++) {
		let i = e.edgeVertices[r * 2], a = e.edgeVertices[r * 2 + 1];
		if (t.findEdge(i, a) !== -1) throw RangeError(`MeshData has a duplicate edge at ${r}.`);
		n[r * 2] = i, n[r * 2 + 1] = a, t.linkSlot(r * 2), t.linkSlot(r * 2 + 1);
	}
	let r = t.loops.arrays, i = t.faces.arrays.loop, a = t.faces.arrays.size;
	for (let n = 0; n < e.faceCount; n++) {
		let o = e.faceOffsets[n], s = e.faceOffsets[n + 1];
		i[n] = o, a[n] = s - o;
		for (let i = o; i < s; i++) r.vertex[i] = e.cornerVertices[i], r.edge[i] = e.cornerEdges[i], r.face[i] = n, r.next[i] = i + 1 === s ? o : i + 1, r.prev[i] = i === o ? s - 1 : i - 1, t.linkRadial(i, e.cornerEdges[i]);
	}
	for (let n of f) {
		let r = t.storeForDomain(n);
		for (let [t, i] of Object.entries(e.attributes[n])) r.attributes.get(t).data.set(i.data);
	}
	return t;
}
function ae(e, t) {
	let n = e.size, r = new e.data.constructor(t.length * n);
	for (let i = 0; i < t.length; i++) {
		let a = t[i];
		for (let t = 0; t < n; t++) r[i * n + t] = e.data[a * n + t];
	}
	return {
		data: r,
		size: n
	};
}
function oe(e) {
	let t = new Uint32Array(e.liveCount), n = 0;
	for (let r = 0; r < e.count; r++) e.removed[r] || (t[n] = r, n++);
	return t;
}
function se(e) {
	let t = oe(e.vertices);
	if (!t.length) throw RangeError("The mesh has no vertices left.");
	let n = new Int32Array(e.vertices.count).fill(-1);
	for (let e = 0; e < t.length; e++) n[t[e]] = e;
	let r = e.vertices.arrays.position, i = new Float32Array(t.length * 3);
	for (let e = 0; e < t.length; e++) {
		let n = t[e];
		i[e * 3] = r[n * 3], i[e * 3 + 1] = r[n * 3 + 1], i[e * 3 + 2] = r[n * 3 + 2];
	}
	let a = oe(e.faces);
	if (!a.length) throw RangeError("The mesh has no faces left.");
	let o = new Uint32Array(a.length + 1), s = e.faces.arrays.size;
	for (let e = 0; e < a.length; e++) o[e + 1] = o[e] + s[a[e]];
	let c = o[a.length], l = new Uint32Array(c), u = new Uint32Array(c), d = new Uint32Array(c), p = new Int32Array(e.edges.count).fill(-1), m = new Uint32Array(e.edges.liveCount), h = 0, g = e.loops.arrays, _ = e.faces.arrays.loop, v = 0;
	for (let e = 0; e < a.length; e++) {
		let t = _[a[e]], r = t;
		do {
			let e = g.edge[r];
			p[e] === -1 && (p[e] = h, m[h] = e, h++), l[v] = n[g.vertex[r]], u[v] = p[e], d[v] = r, v++, r = g.next[r];
		} while (r !== t);
	}
	let y = m.subarray(0, h), b = new Uint32Array(h * 2), x = e.edges.arrays.vertex;
	for (let e = 0; e < h; e++) {
		let t = y[e];
		b[e * 2] = n[x[t * 2]], b[e * 2 + 1] = n[x[t * 2 + 1]];
	}
	let S = {
		point: t,
		edge: y,
		face: a,
		corner: d
	}, C = {};
	for (let t of f) {
		C[t] = {};
		for (let [n, r] of e.storeForDomain(t).attributes) C[t][n] = ae(r, S[t]);
	}
	return T({
		positions: i,
		faceOffsets: o,
		cornerVertices: l,
		edgeVertices: b,
		cornerEdges: u,
		attributes: C
	});
}
// src/mesh-topology.js
function N(e) {
	let t = new Uint32Array(e.cornerCount);
	for (let n = 0; n < e.faceCount; n++) t.fill(n, e.faceOffsets[n], e.faceOffsets[n + 1]);
	return t;
}
function ce(e) {
	let t = new Uint32Array(e.cornerCount), n = new Uint32Array(e.cornerCount);
	for (let r = 0; r < e.faceCount; r++) {
		let i = e.faceOffsets[r], a = e.faceOffsets[r + 1];
		for (let e = i; e < a; e++) {
			let r = e + 1 === a ? i : e + 1;
			t[e] = r, n[r] = e;
		}
	}
	return {
		nextCorner: t,
		previousCorner: n
	};
}
function P(e) {
	let t = new Uint32Array(e.edgeCount + 1);
	for (let n = 0; n < e.cornerCount; n++) t[e.cornerEdges[n] + 1]++;
	for (let n = 0; n < e.edgeCount; n++) t[n + 1] += t[n];
	let n = t.slice(0, e.edgeCount), r = new Uint32Array(e.cornerCount);
	for (let t = 0; t < e.cornerCount; t++) {
		let i = e.cornerEdges[t];
		r[n[i]] = t, n[i]++;
	}
	return {
		edgeOffsets: t,
		edgeCorners: r
	};
}
var le = class {
	constructor(e) {
		this.parent = new Uint32Array(e), this.size = new Uint32Array(e).fill(1);
		for (let t = 0; t < e; t++) this.parent[t] = t;
	}
	find(e) {
		let t = this.parent;
		for (; t[e] !== e;) t[e] = t[t[e]], e = t[e];
		return e;
	}
	union(e, t) {
		let n = this.find(e), r = this.find(t);
		if (n === r) return n;
		if (this.size[n] < this.size[r]) {
			let e = n;
			n = r, r = e;
		}
		return this.parent[r] = n, this.size[n] += this.size[r], n;
	}
};
function ue(e, t = P(e), n = N(e)) {
	let r = new le(e.faceCount);
	for (let i = 0; i < e.edgeCount; i++) {
		let e = t.edgeOffsets[i], a = t.edgeOffsets[i + 1];
		for (let i = e + 1; i < a; i++) r.union(n[t.edgeCorners[e]], n[t.edgeCorners[i]]);
	}
	let i = /* @__PURE__ */ new Map(), a = new Uint32Array(e.faceCount);
	for (let t = 0; t < e.faceCount; t++) {
		let e = r.find(t), n = i.get(e);
		n === void 0 && (n = i.size, i.set(e, n)), a[t] = n;
	}
	return {
		facePart: a,
		partCount: i.size
	};
}
// src/mesh-normals.js
function F(e) {
	let t = new Float32Array(e.faceCount * 3), n = new Float64Array(e.faceCount), r = e.positions;
	for (let i = 0; i < e.faceCount; i++) {
		let a = e.faceOffsets[i], o = e.faceOffsets[i + 1], s = 0, c = 0, l = 0;
		for (let t = a; t < o; t++) {
			let n = e.cornerVertices[t] * 3, i = e.cornerVertices[t + 1 === o ? a : t + 1] * 3;
			s += (r[n + 1] - r[i + 1]) * (r[n + 2] + r[i + 2]), c += (r[n + 2] - r[i + 2]) * (r[n] + r[i]), l += (r[n] - r[i]) * (r[n + 1] + r[i + 1]);
		}
		let u = Math.sqrt(s * s + c * c + l * l);
		n[i] = u / 2, u > 0 && (t[i * 3] = s / u, t[i * 3 + 1] = c / u, t[i * 3 + 2] = l / u);
	}
	return {
		normals: t,
		areas: n
	};
}
function de(e, t, n, r) {
	let i = e[t] - e[n], a = e[t + 1] - e[n + 1], o = e[t + 2] - e[n + 2], s = e[r] - e[n], c = e[r + 1] - e[n + 1], l = e[r + 2] - e[n + 2], u = a * l - o * c, d = o * s - i * l, f = i * c - a * s, p = Math.sqrt(u * u + d * d + f * f);
	return Math.atan2(p, i * s + a * c + o * l);
}
function fe(e, { sharpAngle: t = Infinity } = {}) {
	let { normals: n } = F(e), { nextCorner: r, previousCorner: i } = ce(e), a = N(e), o = P(e), s = e.attributes.edge.sharp?.data, c = e.attributes.edge.smooth?.data, l = Number.isFinite(t) ? Math.cos(t) : -2, u = new le(e.cornerCount);
	for (let t = 0; t < e.edgeCount; t++) {
		if (o.edgeOffsets[t + 1] - o.edgeOffsets[t] !== 2 || s && s[t]) continue;
		let i = o.edgeCorners[o.edgeOffsets[t]], d = o.edgeCorners[o.edgeOffsets[t] + 1];
		if (e.cornerVertices[i] === e.cornerVertices[d]) continue;
		let f = a[i], p = a[d];
		n[f * 3] * n[p * 3] + n[f * 3 + 1] * n[p * 3 + 1] + n[f * 3 + 2] * n[p * 3 + 2] < l && !(c && c[t]) || (u.union(i, r[d]), u.union(r[i], d));
	}
	let d = new Uint32Array(e.cornerCount), f = new Int32Array(e.cornerCount).fill(-1), p = new Uint32Array(e.cornerCount), m = 0;
	for (let t = 0; t < e.cornerCount; t++) {
		let e = u.find(t);
		f[e] === -1 && (f[e] = m, p[m] = t, m++), d[t] = f[e];
	}
	let h = p.subarray(0, m), g = new Float64Array(m * 3), _ = e.positions;
	for (let t = 0; t < e.cornerCount; t++) {
		let o = a[t], s = de(_, e.cornerVertices[i[t]] * 3, e.cornerVertices[t] * 3, e.cornerVertices[r[t]] * 3), c = d[t];
		g[c * 3] += n[o * 3] * s, g[c * 3 + 1] += n[o * 3 + 1] * s, g[c * 3 + 2] += n[o * 3 + 2] * s;
	}
	let v = new Float32Array(m * 3);
	for (let e = 0; e < m; e++) {
		let t = g[e * 3], r = g[e * 3 + 1], i = g[e * 3 + 2], o = Math.sqrt(t * t + r * r + i * i);
		if (o === 0) {
			let s = a[h[e]];
			t = n[s * 3], r = n[s * 3 + 1], i = n[s * 3 + 2], o = Math.sqrt(t * t + r * r + i * i), o === 0 && (i = 1, o = 1);
		}
		v[e * 3] = t / o, v[e * 3 + 1] = r / o, v[e * 3 + 2] = i / o;
	}
	return {
		groupNormals: v,
		groupOfCorner: d,
		groupCount: m,
		groupFirstCorner: h,
		faceNormals: n
	};
}
function pe(e) {
	let t = new Float64Array(e.faceCount * 3);
	for (let n = 0; n < e.faceCount; n++) {
		let r = e.faceOffsets[n], i = e.faceOffsets[n + 1];
		for (let a = r; a < i; a++) {
			let r = e.cornerVertices[a] * 3;
			t[n * 3] += e.positions[r], t[n * 3 + 1] += e.positions[r + 1], t[n * 3 + 2] += e.positions[r + 2];
		}
		let a = i - r;
		t[n * 3] /= a, t[n * 3 + 1] /= a, t[n * 3 + 2] /= a;
	}
	return t;
}
function me(e) {
	let { normals: t } = F(e), n = new Float64Array(e.vertexCount * 3);
	for (let r = 0; r < e.faceCount; r++) {
		let i = e.faceOffsets[r], a = e.faceOffsets[r + 1];
		for (let o = i; o < a; o++) {
			let s = e.cornerVertices[o === i ? a - 1 : o - 1] * 3, c = e.cornerVertices[o] * 3, l = e.cornerVertices[o + 1 === a ? i : o + 1] * 3, u = [
				0,
				1,
				2
			].map((t) => e.positions[s + t] - e.positions[c + t]), d = [
				0,
				1,
				2
			].map((t) => e.positions[l + t] - e.positions[c + t]), f = Math.hypot(...u) * Math.hypot(...d), p = f > 0 ? Math.acos(Math.max(-1, Math.min(1, (u[0] * d[0] + u[1] * d[1] + u[2] * d[2]) / f))) : 0;
			for (let e = 0; e < 3; e++) n[c + e] += t[r * 3 + e] * p;
		}
	}
	let r = new Float64Array(e.vertexCount * 3);
	for (let t = 0; t < e.vertexCount; t++) {
		let e = Math.hypot(n[t * 3], n[t * 3 + 1], n[t * 3 + 2]);
		if (e !== 0) for (let i = 0; i < 3; i++) r[t * 3 + i] = n[t * 3 + i] / e;
	}
	return r;
}
// src/mesh-render.js
var he = 4096;
function ge(e, t) {
	let n = 0;
	for (let r = 0; r < t.length; r++) {
		let i = t[r], a = t[(r + 1) % t.length];
		n += e[i * 2] * e[a * 2 + 1] - e[a * 2] * e[i * 2 + 1];
	}
	return n / 2;
}
function _e(e, t, n, r) {
	return (e[n * 2] - e[t * 2]) * (e[r * 2 + 1] - e[t * 2 + 1]) - (e[n * 2 + 1] - e[t * 2 + 1]) * (e[r * 2] - e[t * 2]);
}
function ve(e, t, n, r, i) {
	let a = _e(e, n, r, t), o = _e(e, r, i, t), s = _e(e, i, n, t);
	return a >= 0 && o >= 0 && s >= 0;
}
function ye(e, t, n) {
	let r = Array.from({ length: t }, (e, t) => t), i = ge(e, r) < 0;
	i && r.reverse();
	let a = (e, t, r) => {
		i ? n.push(r, t, e) : n.push(e, t, r);
	}, o = 0;
	for (; r.length > 3 && o < t * t;) {
		o++;
		let t = !1;
		for (let n = 0; n < r.length; n++) {
			let i = r[(n + r.length - 1) % r.length], o = r[n], s = r[(n + 1) % r.length];
			if (_e(e, i, o, s) <= 0) continue;
			let c = !1;
			for (let t of r) if (t !== i && t !== o && t !== s && ve(e, t, i, o, s)) {
				c = !0;
				break;
			}
			if (!c) {
				a(i, o, s), r.splice(n, 1), t = !0;
				break;
			}
		}
		if (!t) break;
	}
	for (let e = 1; e + 1 < r.length; e++) a(r[0], r[e], r[e + 1]);
}
function be(e, t, n, r) {
	let i = r.map(Math.abs), a = 2;
	i[0] >= i[1] && i[0] >= i[2] ? a = 0 : i[1] >= i[2] && (a = 1);
	let o = (a + 1) % 3, s = (a + 2) % 3, c = r[a] < 0, l = new Float64Array((n - t) * 2);
	for (let r = t; r < n; r++) {
		let n = e.cornerVertices[r] * 3, i = r - t;
		l[i * 2] = e.positions[n + (c ? s : o)], l[i * 2 + 1] = e.positions[n + (c ? o : s)];
	}
	return l;
}
function xe(e, t, n) {
	let r = e[t * 3] - e[n * 3], i = e[t * 3 + 1] - e[n * 3 + 1], a = e[t * 3 + 2] - e[n * 3 + 2];
	return r * r + i * i + a * a;
}
function Se(e, t) {
	let n = 0;
	for (let t = 0; t < e.faceCount; t++) n += e.faceOffsets[t + 1] - e.faceOffsets[t] - 2;
	let r = new Uint32Array(n * 3), i = new Uint32Array(n), a = e.cornerVertices, o = [], s = 0, c = (e, t, n, a) => {
		r[s * 3] = t, r[s * 3 + 1] = n, r[s * 3 + 2] = a, i[s] = e, s++;
	};
	for (let n = 0; n < e.faceCount; n++) {
		let r = e.faceOffsets[n], i = e.faceOffsets[n + 1], s = i - r;
		if (s === 3) c(n, r, r + 1, r + 2);
		else if (s === 4) xe(e.positions, a[r], a[r + 2]) <= xe(e.positions, a[r + 1], a[r + 3]) ? (c(n, r, r + 1, r + 2), c(n, r, r + 2, r + 3)) : (c(n, r, r + 1, r + 3), c(n, r + 1, r + 2, r + 3));
		else {
			if (s > he) throw RangeError(`Face ${n} has ${s} corners; triangulation supports ${he}.`);
			let a = [
				t[n * 3],
				t[n * 3 + 1],
				t[n * 3 + 2]
			];
			o.length = 0, ye(be(e, r, i, a), s, o);
			for (let e = 0; e < o.length; e += 3) c(n, r + o[e], r + o[e + 1], r + o[e + 2]);
		}
	}
	return {
		triangleCorners: r,
		triangleFaces: i
	};
}
function Ce(e, t, n) {
	for (let r of e) for (let e = 0; e < r.size; e++) if (r.data[t * r.size + e] !== r.data[n * r.size + e]) return !1;
	return !0;
}
function we(e, t, n, r, i) {
	t[r] === t[i] && Ce(n, r, i) && e.union(r, i);
}
function Te(e, t) {
	let n = D(e);
	if (!n.length) return;
	let r = {};
	for (let i of n) {
		let n = O(e, i);
		r[i] = Float32Array.from(t, (e) => n[e]);
	}
	return r;
}
function Ee(e, { sharpAngle: t = Infinity } = {}) {
	let { groupNormals: n, groupOfCorner: r, groupCount: i, groupFirstCorner: a, faceNormals: o } = fe(e, { sharpAngle: t }), s = e.attributes.corner.uv?.size === 2 ? e.attributes.corner.uv : void 0, c = e.attributes.corner.color?.size === 3 ? e.attributes.corner.color : void 0, l = e.attributes.corner.normal?.size === 3 ? e.attributes.corner.normal : void 0, u = [
		s,
		c,
		l
	].filter(Boolean), d = r, f = a, p = i;
	if (u.length) {
		let { nextCorner: t } = ce(e), n = P(e), i = new le(e.cornerCount);
		for (let a = 0; a < e.edgeCount; a++) {
			if (n.edgeOffsets[a + 1] - n.edgeOffsets[a] !== 2) continue;
			let o = n.edgeCorners[n.edgeOffsets[a]], s = n.edgeCorners[n.edgeOffsets[a] + 1];
			e.cornerVertices[o] !== e.cornerVertices[s] && (we(i, r, u, o, t[s]), we(i, r, u, t[o], s));
		}
		d = new Uint32Array(e.cornerCount);
		let a = new Int32Array(e.cornerCount).fill(-1), o = new Uint32Array(e.cornerCount);
		p = 0;
		for (let t = 0; t < e.cornerCount; t++) {
			let e = i.find(t);
			a[e] === -1 && (a[e] = p, o[p] = t, p++), d[t] = a[e];
		}
		f = o.subarray(0, p);
	}
	let m = new Float32Array(p * 3), h = new Float32Array(p * 3), g = new Uint32Array(p), _ = s ? new Float32Array(p * 2) : void 0, v = c ? new Float32Array(p * 3) : void 0;
	for (let t = 0; t < p; t++) {
		let i = f[t], a = e.cornerVertices[i], o = r[i];
		g[t] = a, m[t * 3] = e.positions[a * 3], m[t * 3 + 1] = e.positions[a * 3 + 1], m[t * 3 + 2] = e.positions[a * 3 + 2];
		let u = l ? l.data : n, d = l ? i : o;
		if (h[t * 3] = u[d * 3], h[t * 3 + 1] = u[d * 3 + 1], h[t * 3 + 2] = u[d * 3 + 2], _ && (_[t * 2] = s.data[i * 2], _[t * 2 + 1] = s.data[i * 2 + 1]), v) for (let e = 0; e < 3; e++) v[t * 3 + e] = c.data[i * 3 + e];
	}
	let { triangleCorners: y, triangleFaces: b } = Se(e, o), x = new Uint32Array(y.length);
	for (let e = 0; e < y.length; e++) x[e] = d[y[e]];
	let S = {
		positions: m,
		normals: h,
		indices: x
	};
	_ && (S.uvs = _), v && (S.colors = v);
	let C = Te(e, g);
	return C && (S.vertexGroups = C), {
		geometry: S,
		renderVertexSource: g,
		cornerRenderVertex: d,
		triangleFaces: b
	};
}
function De(e, t, n = new Float32Array(t.length * 3)) {
	for (let r = 0; r < t.length; r++) {
		let i = t[r];
		n[r * 3] = e.positions[i * 3], n[r * 3 + 1] = e.positions[i * 3 + 1], n[r * 3 + 2] = e.positions[i * 3 + 2];
	}
	return n;
}
// src/mesh-convert.js
var Oe = 1e-4, ke = Object.freeze([
	{
		name: "right",
		axis: 0,
		sign: 1,
		side: !0
	},
	{
		name: "left",
		axis: 0,
		sign: -1,
		side: !0
	},
	{
		name: "top",
		axis: 1,
		sign: 1,
		side: !1
	},
	{
		name: "bottom",
		axis: 1,
		sign: -1,
		side: !1
	},
	{
		name: "front",
		axis: 2,
		sign: 1,
		side: !0
	},
	{
		name: "back",
		axis: 2,
		sign: -1,
		side: !0
	}
]);
function Ae(e, t, n, r) {
	return (Math.imul(e, 73856093) ^ Math.imul(t, 19349663) ^ Math.imul(n, 83492791)) & r;
}
function je(e, t) {
	let n = e.length / 3, r = new Uint32Array(n), i = [], a = 1;
	for (; a < n * 2;) a *= 2;
	let o = a - 1, s = new Int32Array(a).fill(-1), c = new Int32Array(n).fill(-1), l = t > 0 ? t : 1, u = t * t, d = +(t > 0);
	for (let t = 0; t < n; t++) {
		let n = e[t * 3], a = e[t * 3 + 1], f = e[t * 3 + 2], p = Math.floor(n / l), m = Math.floor(a / l), h = Math.floor(f / l), g = -1;
		for (let t = -d; t <= d && g === -1; t++) for (let r = -d; r <= d && g === -1; r++) for (let l = -d; l <= d && g === -1; l++) {
			let d = s[Ae(p + t, m + r, h + l, o)];
			for (; d !== -1;) {
				let t = i[d], r = e[t * 3] - n, o = e[t * 3 + 1] - a, s = e[t * 3 + 2] - f;
				if (r * r + o * o + s * s <= u) {
					g = d;
					break;
				}
				d = c[d];
			}
		}
		if (g === -1) {
			g = i.length, i.push(t);
			let e = Ae(p, m, h, o);
			c[g] = s[e], s[e] = g;
		}
		r[t] = g;
	}
	return {
		weldMap: r,
		representatives: i
	};
}
function Me(e, t, n, r) {
	let i = new Uint32Array(n.length);
	for (let t = 0; t < n.length; t++) i[t] = e.cornerVertices[n[t]];
	let a = w(e.vertexCount, t, i), o = {
		point: { ...e.attributes.point },
		edge: {},
		face: {},
		corner: {}
	};
	for (let [t, r] of Object.entries(e.attributes.corner)) o.corner[t] = Ne(r, n);
	for (let [t, n] of Object.entries(e.attributes.face)) o.face[t] = Ne(n, r);
	let s = Object.entries(e.attributes.edge);
	if (s.length) {
		let t = new Int32Array(a.edgeCount).fill(-1), n = Pe(e);
		for (let e = 0; e < a.edgeCount; e++) t[e] = n(a.edgeVertices[e * 2], a.edgeVertices[e * 2 + 1]);
		for (let [e, n] of s) {
			let r = new n.data.constructor(a.edgeCount * n.size);
			for (let e = 0; e < a.edgeCount; e++) {
				let i = t[e];
				if (i !== -1) for (let t = 0; t < n.size; t++) r[e * n.size + t] = n.data[i * n.size + t];
			}
			o.edge[e] = {
				data: r,
				size: n.size
			};
		}
	}
	return T({
		positions: e.positions,
		faceOffsets: t,
		cornerVertices: i,
		edgeVertices: a.edgeVertices,
		cornerEdges: a.cornerEdges,
		attributes: o
	});
}
function Ne(e, t) {
	let n = new e.data.constructor(t.length * e.size);
	for (let r = 0; r < t.length; r++) for (let i = 0; i < e.size; i++) n[r * e.size + i] = e.data[t[r] * e.size + i];
	return {
		data: n,
		size: e.size
	};
}
function Pe(e) {
	let t = new Int32Array(e.vertexCount).fill(-1), n = new Int32Array(e.edgeCount).fill(-1);
	for (let r = 0; r < e.edgeCount; r++) {
		let i = Math.min(e.edgeVertices[r * 2], e.edgeVertices[r * 2 + 1]);
		n[r] = t[i], t[i] = r;
	}
	return (r, i) => {
		let a = Math.min(r, i), o = Math.max(r, i), s = t[a];
		for (; s !== -1;) {
			if (Math.max(e.edgeVertices[s * 2], e.edgeVertices[s * 2 + 1]) === o) return s;
			s = n[s];
		}
		return -1;
	};
}
function Fe(e) {
	return Object.values(e);
}
function Ie(e, t, n) {
	for (let r of e) {
		let e = r.size, i = r.data;
		for (let r = 0; r < e; r++) if (i[t * e + r] !== i[n * e + r]) return !1;
	}
	return !0;
}
var I = /* @__PURE__ */ new Float64Array(12);
function Le(e, t, n, r, i) {
	let a = [
		t,
		n,
		r,
		i
	], o = 0;
	for (let t = 0; t < 4; t++) {
		let n = a[t + 3 & 3] * 3, r = a[t] * 3, i = a[t + 1 & 3] * 3, s = e[n] - e[r], c = e[n + 1] - e[r + 1], l = e[n + 2] - e[r + 2], u = e[i] - e[r], d = e[i + 1] - e[r + 1], f = e[i + 2] - e[r + 2], p = d * l - f * c, m = f * s - u * l, h = u * c - d * s;
		I[t * 3] = p, I[t * 3 + 1] = m, I[t * 3 + 2] = h;
		let g = Math.sqrt(p * p + m * m + h * h), _ = Math.atan2(g, s * u + c * d + l * f);
		o += Math.abs(_ - Math.PI / 2);
	}
	for (let e = 1; e < 4; e++) if (I[0] * I[e * 3] + I[1] * I[e * 3 + 1] + I[2] * I[e * 3 + 2] <= 0) return -1;
	return o;
}
var Re = 65536, ze = 2 * Math.PI;
function Be(e, t) {
	let n = new Uint32Array(t), r = /* @__PURE__ */ new Uint32Array(65537);
	for (let i = 0; i < t; i++) {
		let t = Math.min(65535, Math.floor(e[i] / ze * Re));
		n[i] = t, r[t + 1]++;
	}
	for (let e = 0; e < Re; e++) r[e + 1] += r[e];
	let i = new Uint32Array(t);
	for (let e = 0; e < t; e++) i[r[n[e]]] = e, r[n[e]]++;
	return i;
}
function Ve(e, { maxAngle: t = Math.PI / 180 } = {}) {
	let { normals: n } = F(e), r = P(e), { nextCorner: i } = ce(e), a = N(e), o = e.attributes.edge.sharp?.data, s = Fe(e.attributes.corner), c = Fe(e.attributes.face), l = Math.cos(t), u = e.cornerVertices, d = new Float64Array(e.edgeCount), f = new Uint32Array(e.edgeCount), p = new Uint32Array(e.edgeCount), m = 0;
	for (let t = 0; t < e.edgeCount; t++) {
		let h = r.edgeOffsets[t];
		if (r.edgeOffsets[t + 1] - h !== 2 || o && o[t]) continue;
		let g = r.edgeCorners[h], _ = r.edgeCorners[h + 1], v = a[g], y = a[_];
		if (e.faceOffsets[v + 1] - e.faceOffsets[v] !== 3 || e.faceOffsets[y + 1] - e.faceOffsets[y] !== 3 || u[g] === u[_] || n[v * 3] * n[y * 3] + n[v * 3 + 1] * n[y * 3 + 1] + n[v * 3 + 2] * n[y * 3 + 2] < l || !Ie(c, v, y)) continue;
		let b = i[g], x = i[b], S = i[_], C = i[S];
		if (!Ie(s, g, S) || !Ie(s, b, _) || u[x] === u[C]) continue;
		let w = Le(e.positions, u[g], u[C], u[b], u[x]);
		w < 0 || (d[m] = w, f[m] = g, p[m] = _, m++);
	}
	if (!m) return e;
	let h = Be(d, m), g = new Uint8Array(e.faceCount), _ = new Int32Array(e.faceCount).fill(-1), v = new Uint32Array(e.faceCount), y = 0;
	for (let e = 0; e < m; e++) {
		let t = h[e], n = f[t], r = p[t], i = a[n], o = a[r];
		if (g[i] || g[o]) continue;
		g[i] = 1, g[o] = 1;
		let s = Math.min(i, o);
		_[s] = n, v[s] = r, y++;
	}
	let b = e.faceCount - y, x = new Uint32Array(b + 1), S = new Uint32Array(e.cornerCount - y * 2), C = new Uint32Array(b), w = 0, T = 0;
	for (let t = 0; t < e.faceCount; t++) {
		let n = _[t];
		if (!(g[t] && n === -1)) {
			if (n !== -1) {
				let e = i[n];
				S[T] = n, S[T + 1] = i[i[v[t]]], S[T + 2] = e, S[T + 3] = i[e], T += 4;
			} else for (let n = e.faceOffsets[t]; n < e.faceOffsets[t + 1]; n++) S[T] = n, T++;
			C[w] = t, w++, x[w] = T;
		}
	}
	return Me(e, x, S, C);
}
function He(e) {
	let { normals: t } = F(e), n = /* @__PURE__ */ new Map(), r = (t) => (n.has(t) || n.set(t, e.attributes.face["tag:" + t]?.data.slice() ?? new Uint8Array(e.faceCount)), n.get(t)), i = Math.SQRT1_2;
	for (let n = 0; n < e.faceCount; n++) for (let e of ke) t[n * 3 + e.axis] * e.sign < i || (r(e.name)[n] = 1, e.side && (r("side")[n] = 1));
	return Ue(e, Object.fromEntries([...n].map(([e, t]) => [h + e, {
		data: t,
		size: 1
	}])));
}
function Ue(e, t) {
	let n = {};
	for (let t of f) n[t] = { ...e.attributes[t] };
	return Object.assign(n.face, t), T({
		positions: e.positions,
		faceOffsets: e.faceOffsets,
		cornerVertices: e.cornerVertices,
		edgeVertices: e.edgeVertices,
		cornerEdges: e.cornerEdges,
		attributes: n
	});
}
function We(e, t, n) {
	return Math.abs(e[t * 3] - e[n * 3]) > Oe || Math.abs(e[t * 3 + 1] - e[n * 3 + 1]) > Oe || Math.abs(e[t * 3 + 2] - e[n * 3 + 2]) > Oe;
}
function Ge(e, { weld: t, quads: n = !0, tags: r = "axis" } = {}) {
	let { positions: i, normals: a, indices: o } = e ?? {};
	if (!(i instanceof Float32Array) || i.length % 3 != 0 || i.length === 0) throw TypeError("Geometry needs Float32 positions.");
	if (!(o instanceof Uint32Array) || o.length % 3 != 0 || o.length === 0) throw TypeError("Geometry needs Uint32 triangle indices.");
	let s = i.length / 3;
	for (let e of o) if (e >= s) throw RangeError("Geometry index exceeds the vertex count.");
	if (r !== "axis" && r !== "none") throw RangeError("tags must be \"axis\" or \"none\".");
	let c = t;
	if (c === void 0) {
		let e = te({ positions: i });
		c = Math.hypot(...e.max.map((t, n) => t - e.min[n])) * 1e-6;
	}
	if (!Number.isFinite(c) || c < 0) throw RangeError("weld must be a nonnegative distance.");
	let { weldMap: l, representatives: u } = je(i, c), d = new Float32Array(u.length * 3);
	for (let e = 0; e < u.length; e++) d.set(i.subarray(u[e] * 3, u[e] * 3 + 3), e * 3);
	let f = [];
	for (let e = 0; e < o.length / 3; e++) {
		let t = l[o[e * 3]], n = l[o[e * 3 + 1]], r = l[o[e * 3 + 2]];
		t !== n && n !== r && r !== t && f.push(e);
	}
	if (!f.length) throw RangeError("Every triangle collapses after welding. Reduce weld.");
	let p = f.length, m = new Uint32Array(p + 1), h = new Uint32Array(p * 3), g = new Uint32Array(p * 3);
	for (let e = 0; e < p; e++) {
		m[e + 1] = (e + 1) * 3;
		for (let t = 0; t < 3; t++) {
			let n = o[f[e] * 3 + t];
			g[e * 3 + t] = n, h[e * 3 + t] = l[n];
		}
	}
	let _ = w(u.length, m, h), v = {};
	e.uvs instanceof Float32Array && e.uvs.length === s * 2 && (v.uv = Ne({
		data: e.uvs,
		size: 2
	}, g)), e.colors instanceof Float32Array && e.colors.length === s * 3 && (v.color = Ne({
		data: e.colors,
		size: 3
	}, g));
	let y = {};
	if (a instanceof Float32Array && a.length === i.length) {
		let e = new Uint8Array(_.edgeCount), t = T({
			positions: d,
			faceOffsets: m,
			cornerVertices: h,
			edgeVertices: _.edgeVertices,
			cornerEdges: _.cornerEdges
		}), n = P(t), { nextCorner: r } = ce(t);
		for (let t = 0; t < _.edgeCount; t++) {
			let i = n.edgeOffsets[t];
			if (n.edgeOffsets[t + 1] - i !== 2) continue;
			let o = n.edgeCorners[i], s = n.edgeCorners[i + 1];
			[[o, r[s]], [r[o], s]].some(([e, t]) => We(a, g[e], g[t])) && (e[t] = 1);
		}
		y.sharp = {
			data: e,
			size: 1
		};
	}
	let b = T({
		positions: d,
		faceOffsets: m,
		cornerVertices: h,
		edgeVertices: _.edgeVertices,
		cornerEdges: _.cornerEdges,
		attributes: {
			corner: v,
			edge: y
		}
	});
	return n && (b = Ve(b)), r === "axis" && (b = He(b)), b;
}
// src/mesh-fields.js
var Ke = 4, qe = 1e3, Je = 2147483647, Ye = /^[A-Za-z0-9][A-Za-z0-9._-]{0,47}$/, Xe = Object.freeze({
	scalar: "number",
	vector: "vector"
});
function L(e) {
	return /* @__PURE__ */ TypeError(`Field expression: ${e}`);
}
function Ze(e, t, n, r) {
	let i = Math.imul(e, 668265261) ^ Math.imul(t, 374761393) ^ Math.imul(n, 2246822519) ^ Math.imul(r, 2654435761);
	return i = Math.imul(i ^ i >>> 15, 2246822507), i = Math.imul(i ^ i >>> 13, 3266489909), ((i ^ i >>> 16) >>> 0) / 4294967296;
}
function Qe(e) {
	return e * e * e * (e * (e * 6 - 15) + 10);
}
function R(e, t, n) {
	return e + (t - e) * n;
}
function $e(e, t, n, r) {
	let i = Math.floor(e), a = Math.floor(t), o = Math.floor(n), s = Qe(e - i), c = Qe(t - a), l = Qe(n - o), u = (e, t, n) => Ze(i + e, a + t, o + n, r);
	return R(R(R(u(0, 0, 0), u(1, 0, 0), s), R(u(0, 1, 0), u(1, 1, 0), s), c), R(R(u(0, 0, 1), u(1, 0, 1), s), R(u(0, 1, 1), u(1, 1, 1), s), c), l);
}
function et(e, t, n) {
	return Ze(e, t, 0, n);
}
function tt(e, t, n, r, i) {
	let a = 0, o = 1, s = 0, c = 1;
	for (let l = 0; l < i; l++) a += $e(e * c, t * c, n * c, r + l) * o, s += o, o *= .5, c *= 2;
	return a / s;
}
function z(e, t) {
	if (e.kind !== "vector") throw L(`${t} needs a vector.`);
	return e.parts;
}
function nt(e) {
	return Number.isFinite(e) ? e : 0;
}
function rt([e, t]) {
	let [n, r, a] = z(e, "dot"), [o, s, c] = z(t, "dot");
	return i((e) => n(e) * o(e) + r(e) * s(e) + a(e) * c(e));
}
function it([e, t]) {
	let [n, r, i] = z(e, "cross"), [o, s, c] = z(t, "cross");
	return a((e) => r(e) * c(e) - i(e) * s(e), (e) => i(e) * o(e) - n(e) * c(e), (e) => n(e) * s(e) - r(e) * o(e));
}
function at([e]) {
	let [t, n, r] = z(e, "length");
	return i((e) => Math.hypot(t(e), n(e), r(e)));
}
function ot([e, t]) {
	let [n, r, a] = z(e, "distance"), [o, s, c] = z(t, "distance");
	return i((e) => Math.hypot(n(e) - o(e), r(e) - s(e), a(e) - c(e)));
}
function st([e]) {
	let [t, n, r] = z(e, "normalize"), i = (e) => Math.hypot(t(e), n(e), r(e)), o = (e) => (t) => {
		let n = i(t);
		return n === 0 ? 0 : e(t) / n;
	};
	return a(o(t), o(n), o(r));
}
function ct([e, t, n]) {
	return a(d(e, "vec"), d(t, "vec"), d(n, "vec"));
}
function lt(e) {
	return ([t]) => i(z(t, "a component read")[e]);
}
var B = (e, t, n) => ({
	min: e,
	max: t,
	build: n
}), V = o();
V.set("vec", B(3, 3, ct)), V.set("dot", B(2, 2, rt)), V.set("cross", B(2, 2, it)), V.set("distance", B(2, 2, ot)), V.set("length", B(1, 1, at)), V.set("normalize", B(1, 1, st)), V.set("x", B(1, 1, lt(0))), V.set("y", B(1, 1, lt(1))), V.set("z", B(1, 1, lt(2)));
function ut(e, t) {
	V.set(e, t), mt.push(e);
}
var dt = Object.freeze([
	"attr",
	"noise",
	"random",
	"nearest",
	"raycast"
]), ft = /* @__PURE__ */ new Map();
function pt(e, t) {
	ft.set(e, t);
}
var mt = [...V.keys(), ...dt];
function ht(e, t, n, r) {
	if (!Number.isInteger(e) || e < t || e > n) throw L(`${r} must be an integer from ${t} to ${n}.`);
	return e;
}
function gt(e, t, n) {
	for (let i of Object.keys(e)) if (!t.includes(i)) throw L(`${n} does not take ${r(i)}; fields: ${t.join(", ")}.`);
}
function _t(e, n) {
	if (gt(e, [
		"attr",
		"component",
		"name"
	], "attr"), typeof e.attr != "string" || !t.includes(e.attr)) throw L(`attr must be one of ${t.join(", ")}.`);
	if (e.attr === "index") {
		if (e.component !== void 0 || e.name !== void 0) throw L("index takes no component or name.");
		return i((e) => e);
	}
	if (e.attr === "group") {
		if (typeof e.name != "string" || !Ye.test(e.name) || e.component !== void 0) throw L("group needs the name of a vertex group.");
		let t = n.group(e.name);
		return i((e) => t[e]);
	}
	if (e.attr === "tag") {
		if (typeof e.name != "string" || !Ye.test(e.name) || e.component !== void 0) throw L("tag needs a name of 1 to 48 letters, digits, dots, dashes or underscores.");
		let t = n.tag(e.name);
		return i((e) => t[e]);
	}
	if (e.name !== void 0) throw L(`${e.attr} takes no name.`);
	let r = e.attr === "position" ? n.positions() : n.normals();
	if (e.component === void 0) return a((e) => r[e * 3], (e) => r[e * 3 + 1], (e) => r[e * 3 + 2]);
	if (typeof e.component != "string" || !Object.hasOwn(u, e.component)) throw L("component must be x, y or z.");
	let o = u[e.component];
	return i((e) => r[e * 3 + o]);
}
function vt(e, t, n) {
	let r = e.noise;
	if (!l(r)) throw L("noise takes { scale, seed, octaves, at }.");
	gt(r, [
		"scale",
		"seed",
		"octaves",
		"at"
	], "noise");
	let a = r.scale ?? 1;
	if (typeof a != "number" || !(a > 0) || a > qe) throw L(`noise scale must be above 0 and at most ${qe}.`);
	let o = ht(r.seed ?? 0, 0, Je, "noise seed"), c = ht(r.octaves ?? 1, 1, Ke, "noise octaves"), [u, d, f] = z(r.at === void 0 ? _t({ attr: "position" }, t.context) : s(r.at, t, n + 1), "noise \"at\"");
	return i((e) => tt(u(e) * a, d(e) * a, f(e) * a, o, c));
}
function yt(e) {
	let t = e.random;
	if (!l(t)) throw L("random takes { seed }.");
	gt(t, ["seed"], "random");
	let n = ht(t.seed ?? 0, 0, Je, "random seed");
	return i((e) => et(e, 0, n));
}
function bt(e) {
	if (e.length !== 3 || !e.every(c)) throw L("a vector literal is three finite numbers; build one from expressions with \"vec\".");
	let [t, n, r] = e;
	return a(() => t, () => n, () => r);
}
function xt(e, t, n) {
	if (Array.isArray(e)) return bt(e);
	if (!l(e)) return;
	if (Object.hasOwn(e, "attr")) return _t(e, t.context);
	let r = Object.keys(e);
	if (r.length !== 1) return;
	if (r[0] === "noise") return vt(e, t, n);
	if (r[0] === "random") return yt(e);
	let i = () => _t({ attr: "position" }, t.context), a = ft.get(r[0]);
	if (a) return a(e, t, n, i);
}
var St = Object.freeze({
	name: "field",
	accepts: "a number, a boolean, a vector of three numbers, an attribute, noise, random, nearest, raycast or an operator object",
	maxNodes: 64,
	maxDepth: 12,
	operators: V,
	sourceNames: dt,
	reject: L,
	compileInput: xt
});
function Ct(t, r = null) {
	let i = {
		dialect: St,
		nodeCount: 0,
		context: r ?? Et
	}, a = s(t, i, 0);
	if (r) {
		if (r.count > 25e4) throw RangeError(`Field expression: ${r.count} elements is over the limit of ${n}.`);
		if (r.count * i.nodeCount > 8e6) throw RangeError(`Field expression: ${i.nodeCount} nodes over ${r.count} elements is over the work limit of ${e}.`);
	}
	return {
		...a,
		nodeCount: i.nodeCount
	};
}
function wt(e, { kind: t } = {}) {
	let n = Ct(e);
	if (t && n.kind !== t) throw L(`expected a ${Xe[t]} expression, got a ${Xe[n.kind]}.`);
	return n.kind;
}
var Tt = /* @__PURE__ */ new Float64Array(), Et = Object.freeze({
	count: 0,
	positions: () => Tt,
	normals: () => Tt,
	tag: () => Tt,
	group: () => Tt,
	loadSurface: null
});
function Dt(e, t, n) {
	let r = new Float64Array(t * n);
	for (let t = 0; t < r.length; t++) r[t] = nt(e[t]);
	return r;
}
function Ot(e, t, n) {
	if (t !== "point" && t !== "face") throw L("domain must be point or face.");
	let r = t === "point", i = {};
	return {
		count: r ? e.vertexCount : e.faceCount,
		positions: () => i.positions ??= r ? e.positions : pe(e),
		normals: () => i.normals ??= r ? me(e) : F(e).normals,
		loadSurface: n,
		group: (t) => {
			let n = O(e, t);
			return r ? n : kt(e, n);
		},
		tag: (t) => {
			let n = e.attributes.face[h + t];
			if (!n) throw RangeError(`Unknown tag ${t}. Known tags: ${E(e).join(", ") || "none"}.`);
			return r ? At(e, n.data) : n.data;
		}
	};
}
function kt(e, t) {
	let n = new Float64Array(e.faceCount);
	for (let r = 0; r < e.faceCount; r++) {
		let i = e.faceOffsets[r], a = e.faceOffsets[r + 1], o = 0;
		for (let n = i; n < a; n++) o += t[e.cornerVertices[n]];
		n[r] = o / (a - i);
	}
	return n;
}
function At(e, t) {
	let n = new Float64Array(e.vertexCount), r = new Uint32Array(e.vertexCount);
	for (let i = 0; i < e.faceCount; i++) for (let a = e.faceOffsets[i]; a < e.faceOffsets[i + 1]; a++) {
		let o = e.cornerVertices[a];
		n[o] += t[i], r[o]++;
	}
	for (let t = 0; t < e.vertexCount; t++) n[t] = r[t] ? n[t] / r[t] : 0;
	return n;
}
function jt(e, t, n) {
	return {
		count: e.length / 3,
		positions: () => e,
		normals: () => t,
		loadSurface: n,
		group: (e) => {
			throw RangeError(`Unknown vertex group ${e}. Point sets carry no groups.`);
		},
		tag: (e) => {
			throw RangeError(`Unknown tag ${e}. Point sets carry no tags.`);
		}
	};
}
function Mt(e, t, { kind: n } = {}) {
	let r = Ct(e, t);
	if (n && r.kind !== n) throw L(`expected a ${Xe[n]} expression, got a ${Xe[r.kind]}.`);
	let i = t.count;
	if (r.kind === "scalar") {
		let e = new Float64Array(i);
		for (let t = 0; t < i; t++) e[t] = r.evaluate(t);
		return {
			kind: r.kind,
			values: Dt(e, i, 1),
			nodeCount: r.nodeCount
		};
	}
	let [a, o, s] = r.parts, c = new Float64Array(i * 3);
	for (let e = 0; e < i; e++) c[e * 3] = a(e), c[e * 3 + 1] = o(e), c[e * 3 + 2] = s(e);
	return {
		kind: r.kind,
		values: Dt(c, i, 3),
		nodeCount: r.nodeCount
	};
}
function Nt(e, t) {
	let { values: n } = Mt(t, Ot(e, "face"), { kind: "scalar" }), r = new Uint8Array(e.faceCount);
	for (let t = 0; t < e.faceCount; t++) r[t] = n[t] === 0 ? 0 : 1;
	return r;
}
var Pt = 256, Ft = [
	"all",
	"tag",
	"normal",
	"inside",
	"faces",
	"and",
	"or",
	"not",
	"grow",
	"boundary",
	"field"
];
function H(e) {
	return /* @__PURE__ */ TypeError(`Selection rule: ${e}`);
}
function It(e, t) {
	if (!Array.isArray(e) || e.length !== 3 || !e.every(Number.isFinite)) throw H(`${t} needs three finite numbers.`);
	return e;
}
function Lt(e) {
	let t = P(e), n = N(e), r = Array.from({ length: e.faceCount }, () => []), i = new Uint8Array(e.faceCount);
	for (let a = 0; a < e.edgeCount; a++) {
		let e = t.edgeOffsets[a], o = t.edgeOffsets[a + 1];
		o - e === 1 && (i[n[t.edgeCorners[e]]] = 1);
		for (let i = e; i < o; i++) for (let e = i + 1; e < o; e++) {
			let a = n[t.edgeCorners[i]], o = n[t.edgeCorners[e]];
			r[a].push(o), r[o].push(a);
		}
	}
	return {
		neighbors: r,
		openFaces: i
	};
}
function Rt(e, t) {
	let n = {}, r = 0, i = () => n.normals ??= F(e).normals, a = () => n.centroids ??= pe(e), o = () => n.adjacency ??= Lt(e);
	function s(t, n) {
		if (r++, r > Pt) throw H(`more than ${Pt} rule nodes.`);
		if (n > 16) throw H("nesting deeper than 16.");
		if (!t || typeof t != "object" || Array.isArray(t)) throw H("each rule must be an object.");
		let c = Object.keys(t), l = c.find((e) => Ft.includes(e));
		if (!l) throw H(`use one of ${Ft.join(", ")}; got ${c.join(", ") || "nothing"}.`);
		let u = new Uint8Array(e.faceCount);
		switch (l) {
			case "all":
				if (t.all !== !0 || c.length !== 1) throw H("\"all\" must be true and alone.");
				return u.fill(1), u;
			case "tag": {
				if (typeof t.tag != "string" || c.length !== 1) throw H("\"tag\" needs one tag name.");
				let n = e.attributes.face[h + t.tag];
				if (!n) throw RangeError(`Unknown tag ${t.tag}. Known tags: ${E(e).join(", ") || "none"}.`);
				return u.set(n.data), u;
			}
			case "normal": {
				let n = c.filter((e) => e !== "normal" && e !== "maxAngle");
				if (n.length) throw H(`unknown fields ${n.join(", ")} in a normal rule.`);
				let r = It(t.normal, "normal"), a = Math.hypot(...r);
				if (a === 0) throw H("normal cannot be zero.");
				let o = t.maxAngle ?? 10;
				if (!Number.isFinite(o) || o < 0 || o > 180) throw H("maxAngle is degrees from 0 to 180.");
				let s = Math.cos(o * Math.PI / 180) - 1e-9, l = i();
				for (let t = 0; t < e.faceCount; t++) (l[t * 3] * r[0] + l[t * 3 + 1] * r[1] + l[t * 3 + 2] * r[2]) / a >= s && (u[t] = 1);
				return u;
			}
			case "inside": {
				if (c.length !== 1 || !t.inside || typeof t.inside != "object") throw H("\"inside\" needs { min, max }.");
				let n = It(t.inside.min, "inside.min"), r = It(t.inside.max, "inside.max"), i = a();
				for (let t = 0; t < e.faceCount; t++) {
					let e = !0;
					for (let a = 0; a < 3; a++) {
						let o = i[t * 3 + a];
						(o < n[a] || o > r[a]) && (e = !1);
					}
					e && (u[t] = 1);
				}
				return u;
			}
			case "faces":
				if (c.length !== 1 || !Array.isArray(t.faces) || t.faces.length > e.faceCount) throw H("\"faces\" needs an array of face indices.");
				for (let n of t.faces) {
					if (!Number.isInteger(n) || n < 0 || n >= e.faceCount) throw RangeError(`Face index ${n} is outside 0..${e.faceCount - 1}.`);
					u[n] = 1;
				}
				return u;
			case "and":
			case "or": {
				let r = t[l];
				if (c.length !== 1 || !Array.isArray(r) || r.length === 0) throw H(`"${l}" needs a nonempty array of rules.`);
				l === "and" && u.fill(1);
				for (let t of r) {
					let r = s(t, n + 1);
					for (let t = 0; t < e.faceCount; t++) u[t] = l === "and" ? u[t] & r[t] : u[t] | r[t];
				}
				return u;
			}
			case "not": {
				if (c.length !== 1) throw H("\"not\" takes one rule.");
				let r = s(t.not, n + 1);
				for (let t = 0; t < e.faceCount; t++) u[t] = +!r[t];
				return u;
			}
			case "grow": {
				let r = c.filter((e) => e !== "grow" && e !== "steps");
				if (r.length) throw H(`unknown fields ${r.join(", ")} in a grow rule.`);
				let i = t.steps ?? 1;
				if (!Number.isInteger(i) || i < 1 || i > 64) throw H("grow steps must be an integer from 1 to 64.");
				u.set(s(t.grow, n + 1));
				let { neighbors: a } = o();
				for (let t = 0; t < i; t++) {
					let t = u.slice();
					for (let n = 0; n < e.faceCount; n++) if (t[n]) for (let e of a[n]) u[e] = 1;
				}
				return u;
			}
			case "field":
				if (c.length !== 1) throw H("\"field\" takes one expression.");
				return Nt(e, t.field);
			case "boundary": {
				if (c.length !== 1) throw H("\"boundary\" takes one rule.");
				let r = s(t.boundary, n + 1), { neighbors: i, openFaces: a } = o();
				for (let t = 0; t < e.faceCount; t++) r[t] && (a[t] || i[t].some((e) => !r[e])) && (u[t] = 1);
				return u;
			}
		}
		throw H(`unsupported rule ${l}.`);
	}
	return s(t, 0);
}
function zt(e) {
	let t = 0;
	for (let n = 0; n < e.length; n++) t += e[n];
	return t;
}
// src/mesh-ops.js
function Bt(e, t, n) {
	for (let r of e.attributes.values()) {
		let e = r.size;
		r.data.copyWithin(n * e, t * e, (t + 1) * e);
	}
}
function U(e, t) {
	let n = [];
	for (let r of e.attributes.values()) n.push(r.data.slice(t * r.size, (t + 1) * r.size));
	return n;
}
function W(e, t, n) {
	let r = 0;
	for (let i of e.attributes.values()) i.data.set(n[r], t * i.size), r++;
}
function Vt(e, t) {
	for (let [n, r] of e.faces.attributes) n.startsWith("tag:") && (r.data[t] = 0);
}
function Ht(e, t, n) {
	let r = e.ensureAttribute("face", h + n, Uint8Array, 1);
	for (let e of t) r.data[e] = 1;
}
function Ut(e, t) {
	let n = e.vertices.arrays.position, r = e.loops.arrays, i = e.faces.arrays.loop[t], a = 0, o = 0, s = 0, c = i;
	do {
		let e = r.vertex[c] * 3, t = r.vertex[r.next[c]] * 3;
		a += (n[e + 1] - n[t + 1]) * (n[e + 2] + n[t + 2]), o += (n[e + 2] - n[t + 2]) * (n[e] + n[t]), s += (n[e] - n[t]) * (n[e + 1] + n[t + 1]), c = r.next[c];
	} while (c !== i);
	return [
		a,
		o,
		s
	];
}
function G(e) {
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
function Wt(e, t) {
	return [
		e[1] * t[2] - e[2] * t[1],
		e[2] * t[0] - e[0] * t[2],
		e[0] * t[1] - e[1] * t[0]
	];
}
function K(e, t) {
	let n = [];
	for (let r = 0; r < t.length; r++) t[r] && e.faces.isLive(r) && n.push(r);
	return n;
}
function Gt(e, t) {
	let n = [
		0,
		0,
		0
	];
	for (let r of t) {
		let t = Ut(e, r);
		n[0] += t[0], n[1] += t[1], n[2] += t[2];
	}
	return G(n);
}
function Kt(e, t) {
	let n = new Uint8Array(e.faces.count);
	for (let e of t) n[e] = 1;
	let r = e.loops.arrays, i = [];
	for (let a of t) {
		let t = G(Ut(e, a)), o = e.faces.arrays.loop[a], s = o;
		do {
			let o = !1, c = r.radialNext[s];
			for (; c !== s;) n[r.face[c]] && (o = !0), c = r.radialNext[c];
			o || i.push({
				from: r.vertex[s],
				to: r.vertex[r.next[s]],
				face: a,
				normal: t,
				fromCorner: U(e.loops, s),
				toCorner: U(e.loops, r.next[s]),
				faceAttributes: U(e.faces, a)
			}), s = r.next[s];
		} while (s !== o);
	}
	let a = /* @__PURE__ */ new Map();
	for (let { from: t, to: n } of i) for (let r of [t, n]) {
		if (a.has(r)) continue;
		let t = e.vertexPosition(r), n = e.createVertex(t[0], t[1], t[2]);
		Bt(e.vertices, r, n), a.set(r, n);
	}
	let o = /* @__PURE__ */ new Set();
	for (let n of t) for (let t of e.faceLoops(n)) o.add(r.edge[t]);
	let s = [];
	for (let n of t) {
		let t = e.faceLoops(n), i = t.map((e) => r.vertex[e]), o = t.map((t) => U(e.loops, t)), c = U(e.faces, n);
		e.removeFace(n);
		let l = e.createFace(i.map((e) => a.get(e) ?? e));
		W(e.faces, l, c), e.faceLoops(l).forEach((t, n) => W(e.loops, t, o[n])), s.push(l);
	}
	let c = [];
	for (let t of i) {
		let n = e.createFace([
			t.from,
			t.to,
			a.get(t.to),
			a.get(t.from)
		]);
		W(e.faces, n, t.faceAttributes), Vt(e, n);
		let [r, i, o, s] = e.faceLoops(n);
		W(e.loops, r, t.fromCorner), W(e.loops, s, t.fromCorner), W(e.loops, i, t.toCorner), W(e.loops, o, t.toCorner), c.push(n);
	}
	for (let t of o) e.edges.isLive(t) && e.edgeFaceCount(t) === 0 && e.removeEdge(t);
	return {
		capFaces: s,
		sideFaces: c,
		boundary: i,
		duplicateOf: a
	};
}
function qt(e, t) {
	let n = /* @__PURE__ */ new Set();
	for (let r of t) for (let t of e.faceVertices(r)) n.add(t);
	return n;
}
function Jt(e, t, n) {
	let r = e.vertices.arrays.position;
	for (let e of t) r[e * 3] += n[0], r[e * 3 + 1] += n[1], r[e * 3 + 2] += n[2];
}
function Yt(e, t, { offset: n, direction: r }) {
	if (r !== void 0) {
		let e = G(r);
		if (e.every((e) => e === 0)) throw RangeError("direction cannot be zero.");
		return e.map((e) => e * n);
	}
	let i = Gt(e, t);
	if (i.every((e) => e === 0)) throw RangeError("The selected faces face opposite ways, so their average normal cancels out. For a ring or a curved band use alongNormals: true; otherwise use extrude_individual or inset_individual, select fewer faces, or pass direction.");
	return i.map((e) => e * n);
}
function Xt(e, t) {
	let n = new Set(t), r = /* @__PURE__ */ new Set(), i = [];
	for (let a of t) {
		if (r.has(a)) continue;
		let t = [], o = [a];
		for (r.add(a); o.length;) {
			let i = o.pop();
			t.push(i);
			for (let t of e.faceNeighbors(i)) n.has(t) && !r.has(t) && (r.add(t), o.push(t));
		}
		i.push(t);
	}
	return i;
}
function Zt(e, t, n) {
	let r = [], i = [];
	for (let a of Xt(e, K(e, t))) {
		if (n.alongNormals) {
			let t = Kt(e, a);
			Qt(e, t.capFaces, n.offset), r.push(...t.capFaces), i.push(...t.sideFaces);
			continue;
		}
		let t = Yt(e, a, n), o = Kt(e, a);
		Jt(e, qt(e, o.capFaces), t), r.push(...o.capFaces), i.push(...o.sideFaces);
	}
	return {
		capFaces: r,
		sideFaces: i
	};
}
function Qt(e, t, n) {
	let r = /* @__PURE__ */ new Map(), i = new Map(t.map((t) => [t, G(Ut(e, t))]));
	for (let n of t) for (let t of e.faceVertices(n)) {
		let e = i.get(n), a = r.get(t) ?? {
			sum: [
				0,
				0,
				0
			],
			normals: []
		};
		a.sum = [
			a.sum[0] + e[0],
			a.sum[1] + e[1],
			a.sum[2] + e[2]
		], a.normals.push(e), r.set(t, a);
	}
	let a = e.vertices.arrays.position;
	for (let [e, { sum: t, normals: i }] of r) {
		let r = G(t), o = n / Math.max(.25, Math.min(...i.map((e) => e[0] * r[0] + e[1] * r[1] + e[2] * r[2])));
		a[e * 3] += r[0] * o, a[e * 3 + 1] += r[1] * o, a[e * 3 + 2] += r[2] * o;
	}
}
function $t(e, t, n) {
	let r = [], i = [];
	for (let a of K(e, t)) {
		let t = Yt(e, [a], n), o = Kt(e, [a]);
		Jt(e, qt(e, o.capFaces), t), r.push(...o.capFaces), i.push(...o.sideFaces);
	}
	return {
		capFaces: r,
		sideFaces: i
	};
}
function en(e, t, n) {
	let r = [], i = [];
	for (let a of Xt(e, K(e, t))) {
		let t = nn(e, a, n);
		r.push(...t.capFaces), i.push(...t.sideFaces);
	}
	return {
		capFaces: r,
		sideFaces: i
	};
}
function tn(e, t, n) {
	let r = [], i = [];
	for (let a of K(e, t)) {
		let t = nn(e, [a], n);
		r.push(...t.capFaces), i.push(...t.sideFaces);
	}
	return {
		capFaces: r,
		sideFaces: i
	};
}
function nn(e, t, { thickness: n, depth: r = 0 }) {
	let i = Gt(e, t), { capFaces: a, sideFaces: o, boundary: s, duplicateOf: c } = Kt(e, t), l = /* @__PURE__ */ new Map(), u = /* @__PURE__ */ new Map();
	for (let e of s) u.set(e.from, e), l.set(e.to, e);
	let d = e.vertices.arrays.position, f = (e) => [
		d[e * 3],
		d[e * 3 + 1],
		d[e * 3 + 2]
	], p = (e) => {
		let t = f(e.from), n = f(e.to);
		return G(Wt(e.normal, [
			n[0] - t[0],
			n[1] - t[1],
			n[2] - t[2]
		]));
	};
	for (let [e, t] of c) {
		let r = [l.get(e), u.get(e)].filter(Boolean).map(p), i = G(r.reduce((e, t) => [
			e[0] + t[0],
			e[1] + t[1],
			e[2] + t[2]
		], [
			0,
			0,
			0
		])), a = n / Math.max(.25, ...r.map((e) => e[0] * i[0] + e[1] * i[1] + e[2] * i[2]));
		d[t * 3] += i[0] * a, d[t * 3 + 1] += i[1] * a, d[t * 3 + 2] += i[2] * a;
	}
	return r !== 0 && Jt(e, qt(e, a), i.map((e) => e * r)), {
		capFaces: a,
		sideFaces: o
	};
}
function rn(e, t) {
	let n = K(e, t), r = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Set();
	for (let t of n) for (let n of e.faceLoops(t)) r.add(e.loops.arrays.edge[n]), i.add(e.loops.arrays.vertex[n]);
	for (let t of n) e.removeFace(t);
	for (let t of r) e.edges.isLive(t) && e.edgeFaceCount(t) === 0 && e.removeEdge(t);
	for (let t of i) e.vertices.isLive(t) && e.vertexDegree(t) === 0 && e.removeVertex(t);
	return { deletedFaces: n.length };
}
function an(e, t) {
	let n = [];
	for (let r of K(e, t)) {
		let t = e.faceLoops(r), i = t.map((t) => e.loops.arrays.vertex[t]).reverse(), a = t.map((t) => U(e.loops, t)).reverse(), o = U(e.faces, r);
		e.removeFace(r);
		let s = e.createFace(i);
		W(e.faces, s, o), e.faceLoops(s).forEach((t, n) => W(e.loops, t, a[n])), n.push(s);
	}
	return { flippedFaces: n };
}
var on = Object.freeze({
	smooth: (e) => 3 * (1 - e) ** 2 - 2 * (1 - e) ** 3,
	sphere: (e) => Math.sqrt(Math.max(0, 1 - e * e)),
	root: (e) => Math.sqrt(1 - e),
	sharp: (e) => (1 - e) ** 2,
	linear: (e) => 1 - e,
	constant: () => 1,
	inverseSquare: (e) => 1 - e * e
}), sn = class {
	constructor() {
		this.keys = [], this.values = [];
	}
	push(e, t) {
		let n = this.keys, r = this.values, i = n.length;
		for (n.push(e), r.push(t); i > 0;) {
			let t = i - 1 >> 1;
			if (n[t] <= e) break;
			n[i] = n[t], r[i] = r[t], i = t;
		}
		n[i] = e, r[i] = t;
	}
	pop() {
		let e = this.keys, t = this.values, n = {
			key: e[0],
			value: t[0]
		}, r = e.pop(), i = t.pop();
		if (e.length) {
			let n = 0;
			for (;;) {
				let i = n * 2 + 1;
				if (i >= e.length) break;
				let a = i + 1, o = a < e.length && e[a] < e[i] ? a : i;
				if (e[o] >= r) break;
				e[n] = e[o], t[n] = t[o], n = o;
			}
			e[n] = r, t[n] = i;
		}
		return n;
	}
	get size() {
		return this.keys.length;
	}
};
function cn(e, t, n) {
	let r = /* @__PURE__ */ new Map(), i = new sn();
	for (let e of t) i.push(0, e);
	let a = e.vertices.arrays.position;
	for (; i.size;) {
		let { key: t, value: o } = i.pop();
		if (!r.has(o)) {
			r.set(o, t);
			for (let s of e.vertexEdges(o)) {
				let c = e.edgeOtherVertex(s, o);
				if (r.has(c)) continue;
				let l = Math.hypot(a[c * 3] - a[o * 3], a[c * 3 + 1] - a[o * 3 + 1], a[c * 3 + 2] - a[o * 3 + 2]);
				t + l <= n && i.push(t + l, c);
			}
		}
	}
	return r;
}
function ln(e, t, n, r) {
	let i = [...t], a = e.vertexCount;
	if (i.length * a > r) throw RangeError("Proportional falloff exceeds its distance budget. Use connected: true or a smaller selection.");
	let o = /* @__PURE__ */ new Map(), s = e.vertices.arrays.position;
	for (let t of e.liveIndices("point")) {
		let e = Infinity;
		for (let n of i) {
			let r = Math.hypot(s[t * 3] - s[n * 3], s[t * 3 + 1] - s[n * 3 + 1], s[t * 3 + 2] - s[n * 3 + 2]);
			r < e && (e = r);
		}
		e <= n && o.set(t, e);
	}
	return o;
}
function un(e, t, { offset: n, falloff: r }, { maxFalloffVisits: i = 5e7 } = {}) {
	let a = qt(e, K(e, t));
	if (!r) return Jt(e, a, n), { movedVertices: a.size };
	let o = on[r.curve ?? "smooth"], s = r.connected ? cn(e, a, r.radius) : ln(e, a, r.radius, i), c = e.vertices.arrays.position;
	for (let [e, t] of s) {
		let i = a.has(e) ? 1 : o(t / r.radius);
		c[e * 3] += n[0] * i, c[e * 3 + 1] += n[1] * i, c[e * 3 + 2] += n[2] * i;
	}
	return { movedVertices: s.size };
}
function dn(e, t) {
	let { weldMap: n, representatives: r } = je(e.positions, t), i = [], a = [], o = [0], s = [];
	for (let t = 0; t < e.faceCount; t++) {
		s.length = 0;
		let r = e.faceOffsets[t], c = e.faceOffsets[t + 1];
		for (let t = r; t < c; t++) {
			let r = n[e.cornerVertices[t]];
			s.length && n[e.cornerVertices[s.at(-1)]] === r || s.push(t);
		}
		for (; s.length > 1 && n[e.cornerVertices[s[0]]] === n[e.cornerVertices[s.at(-1)]];) s.pop();
		let l = new Set(s.map((t) => n[e.cornerVertices[t]]));
		s.length < 3 || l.size !== s.length || (i.push(...s), a.push(t), o.push(i.length));
	}
	if (!a.length) throw RangeError("merge_by_distance removed every face. Use a smaller distance.");
	let c = new Int32Array(r.length).fill(-1), l = [];
	for (let t of i) {
		let i = n[e.cornerVertices[t]];
		c[i] === -1 && (c[i] = l.length, l.push(r[i]));
	}
	let u = new Float32Array(l.length * 3);
	l.forEach((t, n) => u.set(e.positions.subarray(t * 3, t * 3 + 3), n * 3));
	let d = Uint32Array.from(i, (t) => c[n[e.cornerVertices[t]]]), p = Uint32Array.from(o), m = w(l.length, p, d), h = (e, t) => {
		let n = new e.data.constructor(t.length * e.size);
		return t.forEach((t, r) => n.set(e.data.subarray(t * e.size, (t + 1) * e.size), r * e.size)), {
			data: n,
			size: e.size
		};
	}, g = new Uint32Array(m.edgeCount);
	for (let t = 0; t < d.length; t++) g[m.cornerEdges[t]] = e.cornerEdges[i[t]];
	let _ = {}, v = {
		point: l,
		edge: g,
		face: a,
		corner: i
	};
	for (let t of f) {
		_[t] = {};
		for (let [n, r] of Object.entries(e.attributes[t])) _[t][n] = h(r, v[t]);
	}
	let y = T({
		positions: u,
		faceOffsets: p,
		cornerVertices: d,
		edgeVertices: m.edgeVertices,
		cornerEdges: m.cornerEdges,
		attributes: _
	});
	return {
		mesh: y,
		removedVertices: e.vertexCount - y.vertexCount,
		removedFaces: e.faceCount - y.faceCount
	};
}
// src/mesh-stack.js
var fn = class {
	constructor(e) {
		this.source = e, this.positions = [], this.faceOffsets = [0], this.cornerVertices = [], this.cornerSources = [], this.cornerEdgeSources = [], this.faceSources = [], this.faceKeepsTags = [], this.faceTags = [], this.faceTagSwaps = [];
	}
	addVertex(e, t, n) {
		return this.positions.push(e, t, n), this.positions.length / 3 - 1;
	}
	addFace(e, { sourceFace: t = -1, sourceCorners: n = null, sourceEdges: r = null, keepTags: i = !0, tags: a = [], tagSwap: o = null } = {}) {
		for (let t = 0; t < e.length; t++) this.cornerVertices.push(e[t]), this.cornerSources.push(n ? n[t] : -1), this.cornerEdgeSources.push(r ? r[t] : -1);
		this.faceOffsets.push(this.cornerVertices.length), this.faceSources.push(t), this.faceKeepsTags.push(i), this.faceTags.push(a), this.faceTagSwaps.push(o);
	}
	build() {
		let e = this.source, t = Uint32Array.from(this.faceOffsets), n = Uint32Array.from(this.cornerVertices), r = w(this.positions.length / 3, t, n), i = this.faceSources.length, a = {
			point: {},
			edge: {},
			face: {},
			corner: {}
		};
		for (let [t, n] of Object.entries(e.attributes.face)) {
			let r = new n.data.constructor(i * n.size), o = t.startsWith(h);
			for (let a = 0; a < i; a++) {
				let i = this.faceSources[a];
				if (i === -1 || !this.faceKeepsTags[a] && o) continue;
				let s = o ? this.faceTagSwaps[a]?.[t.slice(h.length)] : void 0, c = s === void 0 ? n : e.attributes.face[h + s];
				c && r.set(c.data.subarray(i * n.size, (i + 1) * n.size), a * n.size);
			}
			a.face[t] = {
				data: r,
				size: n.size
			};
		}
		for (let e = 0; e < i; e++) for (let t of this.faceTags[e]) {
			let n = h + t;
			a.face[n] ??= {
				data: new Uint8Array(i),
				size: 1
			}, a.face[n].data[e] = 1;
		}
		for (let [t, r] of Object.entries(e.attributes.corner)) {
			let e = new r.data.constructor(n.length * r.size), i = r.data instanceof Float32Array;
			this.cornerSources.forEach((t, n) => {
				if (t === -1) return;
				if (typeof t == "number") {
					e.set(r.data.subarray(t * r.size, (t + 1) * r.size), n * r.size);
					return;
				}
				let { from: a, to: o, t: s } = t;
				for (let t = 0; t < r.size; t++) {
					let c = r.data[a * r.size + t], l = r.data[o * r.size + t];
					e[n * r.size + t] = i ? c + (l - c) * s : s < .5 ? c : l;
				}
			}), a.corner[t] = {
				data: e,
				size: r.size
			};
		}
		for (let [t, n] of Object.entries(e.attributes.edge)) {
			let e = new n.data.constructor(r.edgeCount * n.size);
			this.cornerEdgeSources.forEach((t, i) => {
				if (t !== -1) {
					let a = r.cornerEdges[i];
					e.set(n.data.subarray(t * n.size, (t + 1) * n.size), a * n.size);
				}
			}), a.edge[t] = {
				data: e,
				size: n.size
			};
		}
		return T({
			positions: Float32Array.from(this.positions),
			faceOffsets: t,
			cornerVertices: n,
			edgeVertices: r.edgeVertices,
			cornerEdges: r.cornerEdges,
			attributes: a
		});
	}
};
function pn(e, t) {
	let n = [];
	for (let r = e.faceOffsets[t]; r < e.faceOffsets[t + 1]; r++) n.push(r);
	return n;
}
function mn(e, t, n, r, { reversed: i = !1, keepTags: a = !0, tags: o = [], tagSwap: s = null } = {}) {
	let c = pn(t, n);
	i && c.reverse();
	let l = c.map((e) => r[t.cornerVertices[e]]), u = c.map((e, n) => i ? t.cornerEdges[c[(n + 1) % c.length]] : t.cornerEdges[e]);
	e.addFace(l, {
		sourceFace: n,
		sourceCorners: c,
		sourceEdges: u,
		keepTags: a,
		tags: o,
		tagSwap: s
	});
}
function hn(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n = 0; n < e.faceCount; n++) {
		let r = pn(e, n).map((t) => e.cornerVertices[t]).sort((e, t) => e - t).join(",");
		t.has(r) || t.set(r, []), t.get(r).push(n);
	}
	let n = new Uint8Array(e.faceCount), r = 0;
	for (let e of t.values()) if (!(e.length < 2)) {
		for (let t of e) n[t] = 1;
		r += e.length;
	}
	if (!r) return {
		mesh: e,
		removedFaces: 0
	};
	let i = new Uint8Array(e.vertexCount), a = new fn(e), o = new Int32Array(e.vertexCount).fill(-1);
	for (let t = 0; t < e.faceCount; t++) if (!n[t]) for (let n of pn(e, t)) i[e.cornerVertices[n]] = 1;
	for (let t = 0; t < e.vertexCount; t++) i[t] && (o[t] = a.addVertex(e.positions[t * 3], e.positions[t * 3 + 1], e.positions[t * 3 + 2]));
	for (let t = 0; t < e.faceCount; t++) n[t] || mn(a, e, t, o);
	if (a.faceSources.length === 0) throw RangeError("Removing coincident faces left nothing.");
	return {
		mesh: a.build(),
		removedFaces: r
	};
}
var gn = Object.freeze({
	x: 0,
	y: 1,
	z: 2
}), _n = Object.freeze({
	x: Object.freeze({
		right: "left",
		left: "right"
	}),
	y: Object.freeze({
		top: "bottom",
		bottom: "top"
	}),
	z: Object.freeze({
		front: "back",
		back: "front"
	})
});
function vn(e, { axis: t = "x", merge: n = .001, name: r = "mirror" } = {}) {
	let i = gn[t];
	if (i === void 0) throw RangeError("axis must be x, y or z.");
	let a = new fn(e), o = new Uint32Array(e.vertexCount), s = new Uint32Array(e.vertexCount), c = new Uint8Array(e.vertexCount);
	for (let t = 0; t < e.vertexCount; t++) {
		let r = [
			e.positions[t * 3],
			e.positions[t * 3 + 1],
			e.positions[t * 3 + 2]
		];
		Math.abs(r[i]) <= n && (r[i] = 0, c[t] = 1), o[t] = a.addVertex(r[0], r[1], r[2]);
	}
	for (let t = 0; t < e.vertexCount; t++) {
		if (c[t]) {
			s[t] = o[t];
			continue;
		}
		let n = [
			e.positions[t * 3],
			e.positions[t * 3 + 1],
			e.positions[t * 3 + 2]
		];
		n[i] = -n[i], s[t] = a.addVertex(n[0], n[1], n[2]);
	}
	for (let t = 0; t < e.faceCount; t++) mn(a, e, t, o);
	for (let n = 0; n < e.faceCount; n++) mn(a, e, n, s, {
		reversed: !0,
		tags: [`${r}.mirrored`],
		tagSwap: _n[t]
	});
	return hn(a.build()).mesh;
}
function yn(e, { count: t = 2, offset: n = [
	0,
	0,
	0
], relativeOffset: r = [
	1,
	0,
	0
], merge: i = 0, name: a = "array" } = {}) {
	if (!Number.isInteger(t) || t < 1 || t > 256) throw RangeError("count must be an integer from 1 to 256.");
	let o = te(e), s = [
		0,
		1,
		2
	].map((e) => n[e] + r[e] * (o.max[e] - o.min[e])), c = new fn(e);
	for (let n = 0; n < t; n++) {
		let r = new Uint32Array(e.vertexCount);
		for (let t = 0; t < e.vertexCount; t++) r[t] = c.addVertex(e.positions[t * 3] + s[0] * n, e.positions[t * 3 + 1] + s[1] * n, e.positions[t * 3 + 2] + s[2] * n);
		let i = n === t - 1 && t > 1 ? [`${a}.last`] : [];
		for (let t = 0; t < e.faceCount; t++) mn(c, e, t, r, { tags: i });
	}
	let l = c.build();
	return i > 0 && (l = dn(l, i).mesh, l = hn(l).mesh), l;
}
function bn(e, { thickness: t, offset: n = -1, evenThickness: r = !0, name: i = "solidify" }) {
	let a = me(e), o = t * (n + 1) / 2, s = t * (n - 1) / 2, c = null;
	if (r) {
		let { normals: t } = F(e), n = new Float64Array(e.vertexCount), r = new Uint32Array(e.vertexCount);
		for (let i = 0; i < e.faceCount; i++) for (let o of pn(e, i)) {
			let s = e.cornerVertices[o];
			n[s] += a[s * 3] * t[i * 3] + a[s * 3 + 1] * t[i * 3 + 1] + a[s * 3 + 2] * t[i * 3 + 2], r[s]++;
		}
		c = new Float64Array(e.vertexCount);
		for (let t = 0; t < e.vertexCount; t++) {
			let e = r[t] ? n[t] / r[t] : 1;
			c[t] = 1 / Math.max(.25, e);
		}
	}
	let l = new fn(e), u = new Uint32Array(e.vertexCount), d = new Uint32Array(e.vertexCount);
	for (let [t, n] of [[u, o], [d, s]]) for (let r = 0; r < e.vertexCount; r++) {
		let i = n * (c ? c[r] : 1);
		t[r] = l.addVertex(e.positions[r * 3] + a[r * 3] * i, e.positions[r * 3 + 1] + a[r * 3 + 1] * i, e.positions[r * 3 + 2] + a[r * 3 + 2] * i);
	}
	for (let t = 0; t < e.faceCount; t++) mn(l, e, t, u);
	for (let t = 0; t < e.faceCount; t++) mn(l, e, t, d, {
		reversed: !0,
		keepTags: !1,
		tags: [`${i}.inner`]
	});
	let f = P(e);
	for (let t = 0; t < e.edgeCount; t++) {
		if (f.edgeOffsets[t + 1] - f.edgeOffsets[t] !== 1) continue;
		let n = f.edgeCorners[f.edgeOffsets[t]], r = xn(e, n), a = e.cornerVertices[n], o = e.cornerVertices[n + 1 === e.faceOffsets[r + 1] ? e.faceOffsets[r] : n + 1];
		l.addFace([
			u[o],
			u[a],
			d[a],
			d[o]
		], {
			sourceFace: r,
			keepTags: !1,
			tags: [`${i}.rim`]
		});
	}
	return l.build();
}
function xn(e, t) {
	let n = 0, r = e.faceCount - 1;
	for (; n < r;) {
		let i = n + r + 1 >> 1;
		e.faceOffsets[i] <= t ? n = i : r = i - 1;
	}
	return n;
}
// src/mesh-bevel.js
function Sn(e, t, n) {
	if (!t || typeof t != "object" || Array.isArray(t)) throw TypeError("Edge rule must be an object.");
	let r = Object.keys(t), i = new Uint8Array(e.edgeCount), a = (e) => n.faces[e];
	if (r.length !== 1 && t.along === void 0) throw TypeError("Edge rule takes exactly one of between, angle, boundaryOf, along, open, all.");
	if (t.open !== void 0) return Cn(e, t, n);
	if (t.all === !0) {
		for (let t = 0; t < e.edgeCount; t++) i[t] = +(a(t).length === 2);
		return i;
	}
	if (t.angle !== void 0) {
		if (!Number.isFinite(t.angle) || t.angle < 0 || t.angle > 180) throw RangeError("Edge rule angle is degrees from 0 to 180.");
		let { normals: n } = F(e), r = Math.cos(t.angle * Math.PI / 180) + 1e-9;
		for (let t = 0; t < e.edgeCount; t++) {
			let e = a(t);
			if (e.length !== 2) continue;
			let [o, s] = e;
			n[o * 3] * n[s * 3] + n[o * 3 + 1] * n[s * 3 + 1] + n[o * 3 + 2] * n[s * 3 + 2] <= r && (i[t] = 1);
		}
		return i;
	}
	if (t.along !== void 0) {
		let n = r.filter((e) => e !== "along" && e !== "maxAngle");
		if (n.length) throw TypeError(`Edge rule along does not take ${n.join(", ")}.`);
		if (!Array.isArray(t.along) || t.along.length !== 3 || !t.along.every(Number.isFinite)) throw TypeError("along needs a direction [x, y, z].");
		let a = X(t.along);
		if (On(a) === 0) throw RangeError("along cannot be zero.");
		let o = t.maxAngle ?? 10;
		if (!Number.isFinite(o) || o < 0 || o > 90) throw RangeError("maxAngle is degrees from 0 to 90.");
		let s = Math.cos(o * Math.PI / 180) - 1e-9;
		for (let t = 0; t < e.edgeCount; t++) {
			let n = e.edgeVertices[t * 2] * 3, r = e.edgeVertices[t * 2 + 1] * 3, o = X([
				e.positions[r] - e.positions[n],
				e.positions[r + 1] - e.positions[n + 1],
				e.positions[r + 2] - e.positions[n + 2]
			]);
			Math.abs(En(o, a)) >= s && (i[t] = 1);
		}
		return i;
	}
	if (t.between !== void 0) {
		if (!Array.isArray(t.between) || t.between.length !== 2) throw TypeError("between needs two face rules.");
		let n = Rt(e, t.between[0]), r = Rt(e, t.between[1]);
		for (let t = 0; t < e.edgeCount; t++) {
			let e = a(t);
			if (e.length !== 2) continue;
			let [o, s] = e;
			(n[o] && r[s] || n[s] && r[o]) && (i[t] = 1);
		}
		return i;
	}
	if (t.boundaryOf !== void 0) {
		let n = Rt(e, t.boundaryOf);
		for (let t = 0; t < e.edgeCount; t++) {
			let e = a(t);
			e.length === 2 && n[e[0]] !== n[e[1]] && (i[t] = 1);
		}
		return i;
	}
	throw TypeError("Edge rule takes exactly one of between, angle, boundaryOf, along, open, all.");
}
function Cn(e, t, n) {
	let r = new Uint8Array(e.edgeCount), i = t.open === !0 ? null : t.open?.inside;
	if (!i && t.open !== !0) throw TypeError("Edge rule open is true or { \"inside\": { \"min\": [x, y, z], \"max\": [x, y, z] } }.");
	for (let t = 0; t < e.edgeCount; t++) {
		if (n.faces[t].length !== 1) continue;
		let a = e.edgeVertices[t * 2] * 3, o = e.edgeVertices[t * 2 + 1] * 3, s = !i || [
			0,
			1,
			2
		].every((t) => {
			let n = (e.positions[a + t] + e.positions[o + t]) / 2;
			return n >= i.min[t] - 1e-6 && n <= i.max[t] + 1e-6;
		});
		r[t] = +!!s;
	}
	return r;
}
function wn(e) {
	let t = Array.from({ length: e.edgeCount }, () => []);
	for (let n = 0; n < e.faceCount; n++) for (let r = e.faceOffsets[n]; r < e.faceOffsets[n + 1]; r++) t[e.cornerEdges[r]].push(n);
	return { faces: t };
}
var Tn = .49, q = (e, t) => [
	e[0] - t[0],
	e[1] - t[1],
	e[2] - t[2]
], J = (e, t) => [
	e[0] + t[0],
	e[1] + t[1],
	e[2] + t[2]
], Y = (e, t) => [
	e[0] * t,
	e[1] * t,
	e[2] * t
], En = (e, t) => e[0] * t[0] + e[1] * t[1] + e[2] * t[2], Dn = (e, t) => [
	e[1] * t[2] - e[2] * t[1],
	e[2] * t[0] - e[0] * t[2],
	e[0] * t[1] - e[1] * t[0]
], On = (e) => Math.hypot(e[0], e[1], e[2]), X = (e) => {
	let t = On(e);
	return t === 0 ? [
		0,
		0,
		0
	] : Y(e, 1 / t);
}, kn = .001;
function An(e, t) {
	let n = -2 * Math.log(Math.sqrt(Math.max(e, kn))) / Math.LN2, r = t * Math.PI / 2;
	return [1 - Math.sin(r) ** n, 1 - Math.cos(r) ** n];
}
function jn(e, t, { width: n, segments: r = 1, profile: i = .5, clampOverlap: a = !0, name: o = "bevel" }) {
	let s = Sn(e, t, wn(e)), c = 0;
	for (let t = 0; t < e.edgeCount; t++) c += s[t];
	if (!c) throw RangeError("The edge rule selects no edges with two faces. Check tags with mesh_inspect, or lower angle.");
	let l = ie(e), u = l.loops.arrays, d = (e) => l.vertexPosition(e);
	for (let t = 0; t < e.edgeCount; t++) {
		if (!s[t]) continue;
		let e = l.edgeLoops(t);
		if (e.length !== 2 || u.vertex[e[0]] === u.vertex[e[1]]) throw RangeError(`Edge ${t} needs exactly two consistently wound faces to bevel. Run mesh_inspect and fix non-manifold or flipped faces first.`);
	}
	let { normals: f } = F(e), p = (e) => [
		f[e * 3],
		f[e * 3 + 1],
		f[e * 3 + 2]
	], m = (e, t) => l.edgeOtherVertex(e, t), h = /* @__PURE__ */ new Map(), g = n, _ = [];
	for (let t = 0; t < e.faceCount; t++) for (let e of l.faceLoops(t)) {
		let n = u.vertex[e], r = u.edge[u.prev[e]], i = u.edge[e], o = s[r] === 1, c = s[i] === 1;
		if (_.push({
			face: t,
			loop: e,
			vertex: n,
			incoming: r,
			outgoing: i,
			inBeveled: o,
			outBeveled: c
		}), o === c) continue;
		let l = o ? r : i, f = o ? i : r, p = d(n), v = q(d(m(f, n)), p), y = X(q(d(m(l, n)), p)), b = On(Dn(X(v), y));
		if (b < 1e-6) throw RangeError(`Face ${t} has a beveled edge parallel to its neighbour at vertex ${n}; bevel cannot slide there.`);
		let x = `${n}|${f}`, S = h.get(x) ?? {
			vertex: n,
			slideEdge: f,
			sine: Infinity,
			edgeLength: On(v)
		};
		S.sine = Math.min(S.sine, b), h.set(x, S), a && (g = Math.min(g, Tn * S.edgeLength * b));
	}
	if (a) for (let e of _) {
		if (!e.inBeveled || !e.outBeveled) continue;
		let t = d(e.vertex), n = On(q(d(m(e.incoming, e.vertex)), t)), r = On(q(d(m(e.outgoing, e.vertex)), t));
		g = Math.min(g, Tn * Math.min(n, r));
	}
	let v = g < n, y = new fn(e), b = /* @__PURE__ */ new Map(), x = /* @__PURE__ */ new Map(), S = (e) => {
		if (!b.has(e)) {
			let t = d(e), n = y.addVertex(...t);
			x.set(n, t), b.set(e, n);
		}
		return b.get(e);
	}, C = (e) => {
		let t = y.addVertex(...e);
		return x.set(t, e), t;
	}, w = /* @__PURE__ */ new Map();
	for (let [e, t] of h) {
		let n = d(t.vertex), r = X(q(d(m(t.slideEdge, t.vertex)), n));
		w.set(e, C(J(n, Y(r, g / t.sine))));
	}
	let T = (e, t) => w.get(`${e}|${t}`) ?? S(e), E = /* @__PURE__ */ new Map();
	for (let e of _) {
		let t;
		if (e.inBeveled && e.outBeveled) {
			let n = d(e.vertex), r = p(e.face), i = d(m(e.incoming, e.vertex)), a = d(m(e.outgoing, e.vertex)), o = X(Dn(r, q(n, i))), s = X(J(o, X(Dn(r, q(a, n))))), c = Math.max(.05, En(s, o));
			t = [C(J(n, Y(s, g / c)))];
		} else if (e.inBeveled) t = [w.get(`${e.vertex}|${e.outgoing}`)];
		else if (e.outBeveled) t = [w.get(`${e.vertex}|${e.incoming}`)];
		else {
			let n = T(e.vertex, e.incoming), r = T(e.vertex, e.outgoing);
			t = n === r ? [n] : [n, r];
		}
		E.set(e.loop, t);
	}
	let D = (e) => x.get(e), O = /* @__PURE__ */ new Map(), k = (e, t, n) => {
		let a = `${e}|${Math.min(t, n)}|${Math.max(t, n)}`, o = O.get(a);
		if (!o) {
			let s = Math.min(t, n), c = Math.max(t, n), l = d(e), u = q(D(s), l), f = q(D(c), l);
			o = [s];
			for (let e = 1; e < r; e++) {
				let [t, n] = An(i, e / r);
				o.push(C(J(J(l, Y(u, t)), Y(f, n))));
			}
			o.push(c), O.set(a, o);
		}
		return t === o[0] ? o : [...o].reverse();
	}, ee = (e, t, n) => {
		let r = d(e);
		return J(r, Y(J(q(D(t), r), q(D(n), r)), 1.5 - 2 * Math.sqrt(i)));
	}, te = /* @__PURE__ */ new Set(), A = /* @__PURE__ */ new Map();
	for (let e of _) A.has(e.vertex) || A.set(e.vertex, []), A.get(e.vertex).push(e);
	for (let [e, t] of A) {
		let n = t.filter((e) => !e.inBeveled && !e.outBeveled);
		if (t.length !== 3 || n.length !== 1) continue;
		let [r, i] = E.get(n[0].loop);
		i !== void 0 && (E.set(n[0].loop, k(e, r, i)), te.add(e));
	}
	function j(e, t, n) {
		let [i, a, s] = t, c = i[0], l = a[0], u = s[0], [d, f, p] = [
			c,
			l,
			u
		].map(D), m = ee(e, c, l), h = ee(e, l, u), g = ee(e, u, c), _ = /* @__PURE__ */ new Map(), v = (e, t) => {
			let n = r - e - t, o = `${e},${t}`;
			if (_.has(o)) return _.get(o);
			let c;
			if (n === 0) c = i[t];
			else if (e === 0) c = a[n];
			else if (t === 0) c = s[e];
			else {
				let i = e / r, a = t / r, o = n / r, s = Y(d, i * i);
				s = J(s, Y(f, a * a)), s = J(s, Y(p, o * o)), s = J(s, Y(m, 2 * i * a)), s = J(s, Y(h, 2 * a * o)), s = J(s, Y(g, 2 * o * i)), c = C(s);
			}
			return _.set(o, c), c;
		}, b = 0, x = (e) => {
			y.addFace(n ? [...e].reverse() : e, {
				keepTags: !1,
				tags: [`${o}.corner`]
			}), b++;
		};
		for (let e = 0; e < r; e++) for (let t = 0; e + t < r; t++) x([
			v(e, t),
			v(e + 1, t),
			v(e, t + 1)
		]), e + t < r - 1 && x([
			v(e + 1, t),
			v(e + 1, t + 1),
			v(e, t + 1)
		]);
		return b;
	}
	for (let t = 0; t < e.faceCount; t++) {
		let n = [], r = [];
		for (l.faceLoops(t).forEach((i, a) => {
			for (let o of E.get(i)) n.length && n.at(-1) === o || (n.push(o), r.push(e.faceOffsets[t] + a));
		}); n.length > 1 && n[0] === n.at(-1);) n.pop(), r.pop();
		n.length >= 3 && y.addFace(n, {
			sourceFace: t,
			sourceCorners: r
		});
	}
	let ne = 0;
	for (let t = 0; t < e.edgeCount; t++) {
		if (!s[t]) continue;
		let [e, n] = l.edgeLoops(t), i = u.vertex[e], a = u.vertex[u.next[e]], c = E.get(e).at(-1), d = E.get(u.next[e])[0], f = E.get(n).at(-1), p = E.get(u.next[n])[0], m = k(i, c, p), h = k(a, d, f);
		for (let e = 0; e < r; e++) {
			let t = [
				h[e],
				m[e],
				m[e + 1],
				h[e + 1]
			].filter((e, t, n) => e !== n[(t + n.length - 1) % n.length]);
			t.length < 3 || new Set(t).size !== t.length || (y.addFace(t, {
				keepTags: !1,
				tags: [`${o}.strip`]
			}), ne++);
		}
	}
	let re = /* @__PURE__ */ new Set();
	for (let e = 0; e + 1 < y.faceOffsets.length; e++) {
		let t = y.faceOffsets[e], n = y.faceOffsets[e + 1];
		for (let e = t; e < n; e++) re.add(`${y.cornerVertices[e]},${y.cornerVertices[e + 1 === n ? t : e + 1]}`);
	}
	let M = 0, ae = 0, oe = /* @__PURE__ */ new Set();
	for (let t = 0; t < e.edgeCount; t++) if (s[t]) for (let e of l.edgeVertices(t)) oe.add(e);
	for (let e of oe) {
		if (te.has(e)) continue;
		let t = l.vertices.arrays.edgeSlot[e] >> 1, n = l.edgeLoops(t).map((t) => u.vertex[t] === e ? t : u.next[t])[0], a = [], c = [], f = !0, p = n, m = 0, h = !1;
		do {
			let t = E.get(p);
			t.length !== 1 && (f = !1);
			for (let e of t) a.push(e);
			let n = u.edge[p], r = u.radialNext[p];
			if (r === p) {
				h = !0;
				break;
			}
			let i = u.next[r];
			if (s[n]) {
				let n = k(e, t.at(-1), E.get(i)[0]);
				c.push(n);
				for (let e of n.slice(1, -1)) a.push(e);
			}
			p = i, m++;
		} while (p !== n && m < 1024);
		if (h) continue;
		let g = a.filter((e, t) => e !== a[(t + a.length - 1) % a.length]);
		if (g.length < 3 || new Set(g).size !== g.length) continue;
		let _ = 0, v = 0;
		for (let e = 0; e < g.length; e++) {
			let t = g[e], n = g[(e + 1) % g.length];
			re.has(`${t},${n}`) && _++, re.has(`${n},${t}`) && v++;
		}
		if (_ > v && g.reverse(), ae++, r > 1 && f && c.length === 3 && g.length === 3 * r) {
			M += j(e, c, _ > v);
			continue;
		}
		if (r === 1) {
			y.addFace(g, {
				keepTags: !1,
				tags: [`${o}.corner`]
			}), M++;
			continue;
		}
		let b = [
			0,
			0,
			0
		];
		for (let e of g) b = J(b, D(e));
		b = Y(b, 1 / g.length);
		let x = C(J(b, Y(q(d(e), b), 2 * Math.sqrt(i) - 1)));
		for (let e = 0; e < g.length; e++) y.addFace([
			g[e],
			g[(e + 1) % g.length],
			x
		], {
			keepTags: !1,
			tags: [`${o}.corner`]
		}), M++;
	}
	return {
		mesh: y.build(),
		width: g,
		clamped: v,
		bevelEdges: c,
		stripFaces: ne,
		cornerFaces: M,
		filledCorners: ae
	};
}
// src/mesh-uv.js
var Mn = 8, Nn = 4e3, Z = (e, t) => [
	e[0] - t[0],
	e[1] - t[1],
	e[2] - t[2]
], Pn = (e, t) => e[0] * t[0] + e[1] * t[1] + e[2] * t[2], Fn = (e, t) => [
	e[1] * t[2] - e[2] * t[1],
	e[2] * t[0] - e[0] * t[2],
	e[0] * t[1] - e[1] * t[0]
], Q = (e) => Math.hypot(e[0], e[1], e[2]), In = (e) => {
	let t = Q(e);
	return t === 0 ? [
		0,
		0,
		0
	] : [
		e[0] / t,
		e[1] / t,
		e[2] / t
	];
};
function $(e, t) {
	return [
		e.positions[t * 3],
		e.positions[t * 3 + 1],
		e.positions[t * 3 + 2]
	];
}
function Ln(e, t, n, r, i) {
	let a = new le(e.cornerCount), o = new le(e.faceCount);
	for (let s = 0; s < e.edgeCount; s++) {
		if (t[s] || n.edgeOffsets[s + 1] - n.edgeOffsets[s] !== 2) continue;
		let c = n.edgeCorners[n.edgeOffsets[s]], l = n.edgeCorners[n.edgeOffsets[s] + 1];
		e.cornerVertices[c] !== e.cornerVertices[l] && (a.union(c, r[l]), a.union(r[c], l), o.union(i[c], i[l]));
	}
	let s = /* @__PURE__ */ new Map(), c = [];
	for (let t = 0; t < e.faceCount; t++) {
		let e = o.find(t);
		s.has(e) || (s.set(e, c.length), c.push({ faces: [] })), c[s.get(e)].faces.push(t);
	}
	return {
		corners: a,
		islands: c
	};
}
function Rn(e, t, n, r, i) {
	let a = /* @__PURE__ */ new Map(), o = [], s = /* @__PURE__ */ new Map(), c = /* @__PURE__ */ new Map(), l = /* @__PURE__ */ new Set();
	for (let r of t.faces) for (let t = e.faceOffsets[r]; t < e.faceOffsets[r + 1]; t++) {
		let r = n.find(t);
		a.has(r) || (a.set(r, o.length), o.push(e.cornerVertices[t])), s.set(t, a.get(r));
	}
	for (let n of t.faces) for (let t = e.faceOffsets[n]; t < e.faceOffsets[n + 1]; t++) {
		let n = s.get(t), a = s.get(r[t]), o = n < a ? `${n},${a}` : `${a},${n}`;
		c.set(o, (c.get(o) ?? 0) + 1), i[e.cornerEdges[t]] || l.add(e.cornerEdges[t]);
	}
	let u = /* @__PURE__ */ new Map();
	for (let [e, t] of c) {
		if (t !== 1) continue;
		let [n, r] = e.split(",").map(Number);
		u.has(n) || u.set(n, []), u.has(r) || u.set(r, []), u.get(n).push(r), u.get(r).push(n);
	}
	let d = [], f = /* @__PURE__ */ new Set();
	for (let e of u.keys()) {
		if (f.has(e)) continue;
		let t = [], n = [e];
		for (f.add(e); n.length;) {
			let e = n.pop();
			t.push(e);
			for (let t of u.get(e)) f.has(t) || (f.add(t), n.push(t));
		}
		d.push(t);
	}
	let p = o.length - c.size + t.faces.length;
	return {
		localOf: a,
		vertexOfLocal: o,
		cornerLocal: s,
		interiorEdges: l,
		loops: d,
		euler: p,
		isDisk: d.length === 1 && p === 1
	};
}
var zn = class {
	constructor() {
		this.keys = [], this.items = [];
	}
	get size() {
		return this.keys.length;
	}
	push(e, t) {
		let n = this.keys.length;
		for (this.keys.push(e), this.items.push(t); n > 0;) {
			let t = n - 1 >> 1;
			if (this.keys[t] <= e) break;
			this.swap(n, t), n = t;
		}
	}
	pop() {
		let e = [this.keys[0], this.items[0]], t = this.keys.pop(), n = this.items.pop();
		if (this.keys.length) {
			this.keys[0] = t, this.items[0] = n;
			let e = 0;
			for (;;) {
				let t = e * 2 + 1, n = t + 1, r = e;
				if (t < this.keys.length && this.keys[t] < this.keys[r] && (r = t), n < this.keys.length && this.keys[n] < this.keys[r] && (r = n), r === e) break;
				this.swap(e, r), e = r;
			}
		}
		return e;
	}
	swap(e, t) {
		[this.keys[e], this.keys[t]] = [this.keys[t], this.keys[e]], [this.items[e], this.items[t]] = [this.items[t], this.items[e]];
	}
};
function Bn(e, t, n, r) {
	let i = /* @__PURE__ */ new Map();
	for (let n of t) {
		let t = e.edgeVertices[n * 2], r = e.edgeVertices[n * 2 + 1], a = Q(Z($(e, t), $(e, r)));
		i.has(t) || i.set(t, []), i.has(r) || i.set(r, []), i.get(t).push({
			vertex: r,
			edge: n,
			distance: a
		}), i.get(r).push({
			vertex: t,
			edge: n,
			distance: a
		});
	}
	let a = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map(), s = new zn();
	for (let e of n) a.set(e, 0), s.push(0, e);
	for (; s.size;) {
		let [e, t] = s.pop();
		if (!(e > a.get(t))) {
			if (r.has(t) && !n.has(t)) {
				let e = [], n = t;
				for (; o.has(n);) {
					let t = o.get(n);
					e.push(t.edge), n = t.from;
				}
				return {
					path: e,
					end: t
				};
			}
			for (let n of i.get(t) ?? []) {
				let r = e + n.distance;
				r < (a.get(n.vertex) ?? Infinity) && (a.set(n.vertex, r), o.set(n.vertex, {
					from: t,
					edge: n.edge
				}), s.push(r, n.vertex));
			}
		}
	}
	return null;
}
function Vn(e, t, n) {
	let r = /* @__PURE__ */ new Set();
	for (let n of t) r.add(e.edgeVertices[n * 2]), r.add(e.edgeVertices[n * 2 + 1]);
	let i = n, a = -1;
	for (let t of r) {
		let r = Q(Z($(e, t), $(e, n)));
		r > a && (a = r, i = t);
	}
	return i;
}
function Hn(e, t, n, r, i) {
	let a = 0;
	for (let o = 0; o < Mn; o++) {
		let { corners: o, islands: s } = Ln(e, t, n, r, i), c = !1;
		for (let n of s) {
			let i = Rn(e, n, o, r, t);
			if (i.isDisk || !i.interiorEdges.size) continue;
			let s = null;
			if (i.loops.length >= 2) {
				let t = new Set(i.loops[0].map((e) => i.vertexOfLocal[e])), n = new Set(i.loops.slice(1).flat().map((e) => i.vertexOfLocal[e]));
				s = Bn(e, i.interiorEdges, t, n);
			} else if (i.loops.length === 0) {
				let t = i.vertexOfLocal[0], n = Vn(e, i.interiorEdges, t), r = Vn(e, i.interiorEdges, n);
				s = Bn(e, i.interiorEdges, /* @__PURE__ */ new Set([n]), /* @__PURE__ */ new Set([r]));
			}
			if (s && s.path.length) for (let e of s.path) t[e] || (t[e] = 1, a++, c = !0);
		}
		if (!c) break;
	}
	return a;
}
function Un({ rowOffsets: e, columns: t, values: n }, r, i, a) {
	let o = e.length - 1, s = new Float64Array(r);
	for (let e = 0; e < n.length; e++) s[t[e]] += n[e] * n[e];
	for (let e = 0; e < r; e++) s[e] = s[e] > 0 ? 1 / Math.sqrt(s[e]) : 0;
	let c = new Float64Array(n.length);
	for (let e = 0; e < n.length; e++) c[e] = n[e] * s[t[e]];
	let l = (n, r) => {
		for (let i = 0; i < o; i++) {
			let a = 0;
			for (let r = e[i]; r < e[i + 1]; r++) a += c[r] * n[t[r]];
			r[i] = a;
		}
	}, u = (n, r) => {
		r.fill(0);
		for (let i = 0; i < o; i++) {
			let a = n[i];
			for (let n = e[i]; n < e[i + 1]; n++) r[t[n]] += c[n] * a;
		}
	}, d = (e) => {
		let t = 0;
		for (let n = 0; n < e.length; n++) t += e[n] * e[n];
		return t;
	}, f = new Float64Array(r);
	for (let e = 0; e < r; e++) f[e] = s[e] > 0 ? a[e] / s[e] : 0;
	let p = new Float64Array(o);
	l(f, p);
	for (let e = 0; e < o; e++) p[e] = i[e] - p[e];
	let m = new Float64Array(r);
	u(p, m);
	let h = Float64Array.from(m), g = new Float64Array(o), _ = d(m), v = _ * 1e-16;
	for (let e = 0; e < Nn && _ > v && _ > 0; e++) {
		l(h, g);
		let e = d(g);
		if (e === 0) break;
		let t = _ / e;
		for (let e = 0; e < r; e++) f[e] += t * h[e];
		for (let e = 0; e < o; e++) p[e] -= t * g[e];
		u(p, m);
		let n = d(m), i = n / _;
		for (let e = 0; e < r; e++) h[e] = m[e] + i * h[e];
		_ = n;
	}
	for (let e = 0; e < r; e++) a[e] = f[e] * s[e];
	return a;
}
function Wn(e, t, n, r) {
	let i = In(Fn(Math.abs(r[0]) < .9 ? [
		1,
		0,
		0
	] : [
		0,
		1,
		0
	], r)), a = Fn(r, i);
	return t.vertexOfLocal.map((t) => {
		let n = $(e, t);
		return [Pn(n, i), Pn(n, a)];
	});
}
function Gn(e, t, n, r) {
	let i = Wn(e, t, n, r), a = i.length;
	if (a < 3 || !t.isDisk) return i;
	let o = t.loops[0], s = o[0], c = o[0], l = -1;
	for (let n of o) {
		for (let r of o) {
			let i = Q(Z($(e, t.vertexOfLocal[n]), $(e, t.vertexOfLocal[r])));
			i > l && (l = i, s = n, c = r);
		}
		if (o.length > 400) break;
	}
	let u = new Int32Array(a * 2).fill(-1), d = 0;
	for (let e = 0; e < a; e++) e !== s && e !== c && (u[e * 2] = d++, u[e * 2 + 1] = d++);
	let f = /* @__PURE__ */ new Map([[s, i[s]], [c, i[c]]]), p = [0], m = [], h = [], g = [], _ = (e, t) => {
		for (let [t, n] of e) m.push(t), h.push(n);
		p.push(m.length), g.push(t);
	};
	for (let [r, i, a] of n) {
		let n = $(e, t.vertexOfLocal[r]), o = $(e, t.vertexOfLocal[i]), s = $(e, t.vertexOfLocal[a]), c = Z(o, n), l = Z(s, n), d = Q(c), p = Q(Fn(c, l));
		if (d === 0 || p === 0) continue;
		let m = [
			[0, 0],
			[d, 0],
			[Pn(l, c) / d, p / d]
		], h = 1 / Math.sqrt(p), g = [
			r,
			i,
			a
		], v = [], y = [], b = 0, x = 0;
		for (let e = 0; e < 3; e++) {
			let t = m[(e + 1) % 3], n = m[(e + 2) % 3], r = (n[0] - t[0]) * h, i = (n[1] - t[1]) * h, a = g[e];
			if (f.has(a)) {
				let [e, t] = f.get(a);
				b += r * e - i * t, x += i * e + r * t;
			} else v.push([u[a * 2], r], [u[a * 2 + 1], -i]), y.push([u[a * 2], i], [u[a * 2 + 1], r]);
		}
		_(v, -b), _(y, -x);
	}
	let v = new Float64Array(d);
	for (let e = 0; e < a; e++) u[e * 2] !== -1 && (v[u[e * 2]] = i[e][0], v[u[e * 2 + 1]] = i[e][1]);
	return Un({
		rowOffsets: Int32Array.from(p),
		columns: Int32Array.from(m),
		values: Float64Array.from(h)
	}, d, g, v), i.map((e, t) => f.has(t) ? f.get(t) : [v[u[t * 2]], v[u[t * 2 + 1]]]);
}
function Kn(e) {
	let t = [...e].sort((e, t) => e[0] - t[0] || e[1] - t[1]), n = (e, t, n) => (t[0] - e[0]) * (n[1] - e[1]) - (t[1] - e[1]) * (n[0] - e[0]), r = [];
	for (let e of t) {
		for (; r.length >= 2 && n(r.at(-2), r.at(-1), e) <= 0;) r.pop();
		r.push(e);
	}
	let i = [];
	for (let e of [...t].reverse()) {
		for (; i.length >= 2 && n(i.at(-2), i.at(-1), e) <= 0;) i.pop();
		i.push(e);
	}
	return [...r.slice(0, -1), ...i.slice(0, -1)];
}
function qn(e) {
	let t = Kn(e), n = 0, r = Infinity;
	for (let e = 0; e < t.length; e++) {
		let i = t[(e + 1) % t.length], a = -Math.atan2(i[1] - t[e][1], i[0] - t[e][0]), o = Math.cos(a), s = Math.sin(a), c = Infinity, l = -Infinity, u = Infinity, d = -Infinity;
		for (let [e, n] of t) {
			let t = e * o - n * s, r = e * s + n * o;
			c = Math.min(c, t), l = Math.max(l, t), u = Math.min(u, r), d = Math.max(d, r);
		}
		let f = (l - c) * (d - u);
		f < r && (r = f, n = a);
	}
	let i = Math.cos(n), a = Math.sin(n);
	return e.map(([e, t]) => [e * i - t * a, e * a + t * i]);
}
function Jn(e) {
	let t = Infinity, n = -Infinity, r = Infinity, i = -Infinity;
	for (let [a, o] of e) t = Math.min(t, a), n = Math.max(n, a), r = Math.min(r, o), i = Math.max(i, o);
	return {
		minimumX: t,
		minimumY: r,
		width: n - t,
		height: i - r
	};
}
function Yn(e, t, n) {
	return ((t[0] - e[0]) * (n[1] - e[1]) - (t[1] - e[1]) * (n[0] - e[0])) / 2;
}
function Xn(e, t, [n, r, i]) {
	let a = $(e, t.vertexOfLocal[n]);
	return Q(Fn(Z($(e, t.vertexOfLocal[r]), a), Z($(e, t.vertexOfLocal[i]), a))) / 2;
}
function Zn(e, t, n) {
	let { corners: r, nextCorner: i, seam: a, faceNormal: o, faceArea: s, triangleCorners: c, trianglesOfFace: l } = n, u = Rn(e, t, r, i, a), d = [], f = [
		0,
		0,
		0
	], p = 0;
	for (let e of t.faces) {
		p += s[e];
		for (let t = 0; t < 3; t++) f[t] += o[e * 3 + t] * s[e];
		for (let t of l.get(e) ?? []) d.push([
			0,
			1,
			2
		].map((e) => u.cornerLocal.get(c[t * 3 + e])));
	}
	let m = Gn(e, u, d, In(f)), h = 0;
	for (let [e, t, n] of d) h += Yn(m[e], m[t], m[n]);
	h < 0 && (m = m.map(([e, t]) => [-e, t]), h = -h);
	let g = h > 0 ? Math.sqrt(p / h) : 1;
	m = qn(m.map(([e, t]) => [e * g, t * g]));
	let _ = 0, v = 0;
	for (let t of d) {
		let n = Yn(m[t[0]], m[t[1]], m[t[2]]), r = Xn(e, u, t);
		n < 0 && _++, r > 0 && (v += Math.abs(Math.abs(n) / r - 1) * r);
	}
	return {
		island: t,
		description: u,
		triangles: d,
		points: m,
		area: p,
		flipped: _,
		distortion: p > 0 ? v / p : 0,
		box: Jn(m)
	};
}
function Qn(e, t, n) {
	let r = [], i = 0, a = 0, o = 0, s = 0;
	for (let c of e) i > 0 && i + c.box.width > t && (i = 0, a += o + n, o = 0), r.push([i - c.box.minimumX, a - c.box.minimumY]), i += c.box.width + n, o = Math.max(o, c.box.height), s = Math.max(s, i - n);
	return {
		offsets: r,
		extent: Math.max(s, a + o, 1e-12)
	};
}
function $n(e, t) {
	for (let t of e) t.box.height > t.box.width && (t.points = t.points.map(([e, t]) => [t, -e]), t.box = Jn(t.points));
	e.sort((e, t) => t.box.height - e.box.height || t.box.width - e.box.width);
	let n = e.reduce((e, t) => e + Math.max(t.box.width, 1e-9) * Math.max(t.box.height, 1e-9), 0), r = t * Math.sqrt(n) * 1.2, i = Math.max(...e.map((e) => e.box.width)), a = null;
	for (let t = .6; t <= 3; t += .1) {
		let o = Qn(e, Math.max(i, Math.sqrt(n) * t), r);
		(!a || o.extent < a.extent) && (a = o);
	}
	return e.forEach((e, t) => {
		e.offset = a.offsets[t];
	}), (1 - 2 * t) / a.extent;
}
function er(e, t, n, r, i) {
	let a = (e) => {
		let t = 0;
		for (let n = 1; n < 3; n++) Math.abs(i[e * 3 + n]) > Math.abs(i[e * 3 + t]) && (t = n);
		return t * 2 + +(i[e * 3 + t] < 0);
	}, o = N(e), s = new Uint8Array(e.faceCount);
	for (let e of t) for (let t of e.faces) s[t] = 1;
	let c = 0;
	for (let t = 0; t < e.edgeCount; t++) {
		if (n[t] || r.edgeOffsets[t + 1] - r.edgeOffsets[t] !== 2) continue;
		let e = o[r.edgeCorners[r.edgeOffsets[t]]], i = o[r.edgeCorners[r.edgeOffsets[t] + 1]];
		s[e] && s[i] && a(e) !== a(i) && (n[t] = 1, c++);
	}
	return c;
}
function tr(e, { seams: t = { angle: 60 }, margin: n = .01, maxDistortion: r = .25 } = {}) {
	let i = P(e), { nextCorner: a } = ce(e), o = N(e), s = Sn(e, t, wn(e)), c = 0;
	for (let t = 0; t < e.edgeCount; t++) c += s[t];
	let { normals: l, areas: u } = F(e), d = Ln(e, s, i, a, o), p = d.islands.filter((t) => !Rn(e, t, d.corners, a, s).loops.length), m = p.length ? er(e, p, s, i, l) : 0, h = Hn(e, s, i, a, o), { triangleCorners: g, triangleFaces: _ } = Se(e, l), v = /* @__PURE__ */ new Map();
	for (let e = 0; e < _.length; e++) {
		let t = _[e];
		v.has(t) || v.set(t, []), v.get(t).push(e);
	}
	let y = () => {
		let { corners: t, islands: n } = Ln(e, s, i, a, o), r = {
			corners: t,
			nextCorner: a,
			seam: s,
			faceNormal: l,
			faceArea: u,
			triangleCorners: g,
			trianglesOfFace: v
		};
		return n.map((t) => Zn(e, t, r));
	}, b = y(), x = b.filter((e) => !e.description.isDisk || e.flipped > 0 || e.distortion > r);
	if (x.length) {
		let t = er(e, x.map((e) => e.island), s, i, l);
		m += t, t && (h += Hn(e, s, i, a, o), b = y());
	}
	let S = b.map((e) => e.island), C = b.filter((e) => !e.description.isDisk).length, w = $n(b, n), E = new Float32Array(e.cornerCount * 2), D = 0, O = 0, k = 0, ee = [];
	for (let t of b) {
		let r = t.points.map(([e, r]) => [n + (e + t.offset[0]) * w, n + (r + t.offset[1]) * w]);
		for (let n of t.island.faces) for (let i = e.faceOffsets[n]; i < e.faceOffsets[n + 1]; i++) {
			let [e, n] = r[t.description.cornerLocal.get(i)];
			E[i * 2] = e, E[i * 2 + 1] = n;
		}
		for (let [n, i, a] of t.triangles) {
			let o = Yn(r[n], r[i], r[a]), s = $(e, t.description.vertexOfLocal[n]), c = Q(Fn(Z($(e, t.description.vertexOfLocal[i]), s), Z($(e, t.description.vertexOfLocal[a]), s))) / 2;
			o < 0 && D++, O += Math.abs(o), k += c, ee.push([Math.abs(o), c]);
		}
	}
	let te = k > 0 ? O / k : 1, A = 0;
	for (let [e, t] of ee) t > 0 && (A += Math.abs(e / (t * te) - 1) * t);
	let j = {};
	for (let t of f) j[t] = { ...e.attributes[t] };
	j.corner.uv = {
		data: E,
		size: 2
	};
	let ne = new Uint8Array(s);
	return j.edge.seam = {
		data: ne,
		size: 1
	}, {
		mesh: T({
			positions: e.positions,
			faceOffsets: e.faceOffsets,
			cornerVertices: e.cornerVertices,
			edgeVertices: e.edgeVertices,
			cornerEdges: e.cornerEdges,
			attributes: j
		}),
		islands: S.length,
		seamEdges: c,
		cutEdges: h,
		chartEdges: m,
		flatIslands: C,
		flipped: D,
		areaDistortion: k > 0 ? A / k : 0,
		utilization: O
	};
}
export { p as $, Ve as A, F as B, Mt as C, pt as D, ut as E, Ue as F, P as G, le as H, Ee as I, ie as J, ue as K, De as L, Me as M, He as N, et as O, je as P, m as Q, Se as R, Rt as S, jt as T, ce as U, me as V, N as W, f as X, se as Y, g as Z, en as _, fn as a, E as at, un as b, hn as c, O as ct, Xt as d, h as et, rn as f, tn as g, an as h, Sn as i, te as it, Ge as j, wt as k, bn as l, $t as m, jn as n, w as nt, yn as o, ee as ot, Zt as p, re as q, wn as r, k as rt, vn as s, D as st, tr as t, T as tt, on as u, dn as v, Ot as w, zt as x, Ht as y, fe as z };
