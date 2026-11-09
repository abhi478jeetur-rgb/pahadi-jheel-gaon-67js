/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { t as e } from "./geometry-normals-DRzK4L7V.js";
import { n as t, r as n, t as r } from "./sculpt-strokes-DssfwB0s.js";
// src/sculpt.js
function i(e, t, n) {
	if (!Number.isSafeInteger(e) || e < 1 || e > t) throw RangeError(`${n} must be an integer from 1 to ${t}.`);
}
function a(e, n, r) {
	let { positions: i, normals: a, indices: o } = e ?? {};
	if (!(i instanceof Float32Array) || i.length < 9 || i.length % 3 || !(a instanceof Float32Array) || a.length !== i.length || !(o instanceof Uint32Array) || !o.length || o.length % 3) throw TypeError("Sculpting requires indexed Float32 positions and normals with Uint32 triangles.");
	let s = i.length / 3;
	if (s > n || o.length / 3 > r) throw RangeError("Sculpt geometry exceeds maxVertices or maxTriangles.");
	if (e.morphTargets || e.skinIndices || e.skinWeights) throw TypeError("Sculpting requires static geometry without morph or skin channels.");
	for (let e of i) t(e, "position");
	for (let e = 0; e < a.length; e += 3) if (!a.subarray(e, e + 3).every(Number.isFinite) || Math.abs(Math.hypot(...a.subarray(e, e + 3)) - 1) > .001) throw TypeError("Sculpt normals must be finite unit vectors.");
	for (let e of o) if (e >= s) throw RangeError("Sculpt triangle index is out of bounds.");
	for (let [t, n] of [["uvs", 2], ["colors", 3]]) if (e[t] !== void 0 && (!(e[t] instanceof Float32Array) || e[t].length !== s * n || !e[t].every(Number.isFinite))) throw TypeError(`Sculpt ${t} must match the vertex count and contain finite floats.`);
	return s;
}
function o(e, t, n) {
	let r = /* @__PURE__ */ new Map(), i = [], a = new Uint32Array(t);
	for (let o = 0; o < t; o++) {
		let t = o * 3, s = Array.from(e.positions.subarray(t, t + 3)), c = s.join(","), l = r.get(c);
		l === void 0 && (l = i.length, r.set(c, l), i.push({
			point: s,
			normal: [
				0,
				0,
				0
			],
			neighbors: n ? /* @__PURE__ */ new Set() : null
		})), a[o] = l;
		for (let n = 0; n < 3; n++) i[l].normal[n] += e.normals[t + n];
	}
	for (let e of i) {
		let t = Math.hypot(...e.normal);
		if (!t) throw RangeError("Coincident vertices have cancelling normals; separate the overlapping surfaces.");
		e.normal = e.normal.map((e) => e / t);
	}
	if (n) for (let t = 0; t < e.indices.length; t += 3) {
		let n = Array.from(e.indices.subarray(t, t + 3), (e) => a[e]);
		for (let e = 0; e < 3; e++) {
			let t = n[e], r = n[(e + 1) % 3];
			t !== r && (i[t].neighbors.add(r), i[r].neighbors.add(t));
		}
	}
	return {
		groups: i,
		groupIds: a
	};
}
function s(e, t, n) {
	let r = t[n] * 3, i = t[n + 1] * 3, a = t[n + 2] * 3, o = [
		0,
		1,
		2
	].map((t) => e[i + t] - e[r + t]), s = [
		0,
		1,
		2
	].map((t) => e[a + t] - e[r + t]);
	return Math.hypot(o[1] * s[2] - o[2] * s[1], o[2] * s[0] - o[0] * s[2], o[0] * s[1] - o[1] * s[0]);
}
function c(e, t) {
	let n = !1;
	for (let r = 0; r < t.indices.length; r += 3) {
		let i = s(t.positions, t.indices, r);
		if (i > 0 && (n = !0), !i && s(e.positions, e.indices, r) > 0) throw RangeError("Sculpt stroke collapsed a triangle at Float32 precision. Reduce strength.");
	}
	if (!n) throw RangeError("Sculpt geometry has no drawable triangles.");
}
function l(t, s, { maxVertices: l = 25e4, maxTriangles: u = 5e5, maxStrokes: d = 256, maxVertexVisits: f = 2e7 } = {}) {
	i(l, 1e6, "maxVertices"), i(u, 2e6, "maxTriangles"), i(d, 4096, "maxStrokes"), i(f, 1e8, "maxVertexVisits");
	let p = a(t, l, u);
	if (!Array.isArray(s) || s.length > d) throw RangeError("Strokes exceed maxStrokes or are not an array.");
	if (p * s.length > f) throw RangeError("Sculpting exceeds maxVertexVisits; split or reduce the strokes.");
	let m = n(s), h = {
		positions: new Float32Array(t.positions),
		normals: new Float32Array(t.normals),
		indices: new Uint32Array(t.indices)
	};
	for (let e of ["uvs", "colors"]) t[e] && (h[e] = new Float32Array(t[e]));
	if (!m.some((e) => e.strength !== 0)) return c(t, h), h;
	let { groups: g, groupIds: _ } = o(t, p, m.some((e) => e.type === "smooth"));
	for (let e of m) r(g, e);
	for (let e = 0; e < p; e++) h.positions.set(g[_[e]].point, e * 3);
	return c(t, h), h.normals = e(t, h.positions), h;
}
export { l as sculptGeometry };
