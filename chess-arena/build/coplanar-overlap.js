/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { n as e, t } from "./depth-layer-DecVVixZ.js";
// src/coplanar-overlap.js
var n = .001, r = 1e-4, i = 1e-6, a = .002, o = 1e6, s = 6e5, c = 12, l = 3e6, u = Math.cos(Math.PI / 180), d = 8, f = /* @__PURE__ */ new WeakMap();
function p(e) {
	let t = f.get(e);
	if (t) return t;
	t = [
		Infinity,
		Infinity,
		Infinity,
		-Infinity,
		-Infinity,
		-Infinity
	];
	let { positions: n } = e;
	for (let e = 0; e < n.length; e += 3) for (let r = 0; r < 3; r++) t[r] = Math.min(t[r], n[e + r]), t[3 + r] = Math.max(t[3 + r], n[e + r]);
	return f.set(e, t), t;
}
function m(e) {
	let t = p(e.geometry), n = e.matrix, r = [
		Infinity,
		Infinity,
		Infinity,
		-Infinity,
		-Infinity,
		-Infinity
	];
	for (let e = 0; e < 8; e++) {
		let i = e & 1 ? t[3] : t[0], a = e & 2 ? t[4] : t[1], o = e & 4 ? t[5] : t[2];
		for (let e = 0; e < 3; e++) {
			let t = n[e] * i + n[4 + e] * a + n[8 + e] * o + n[12 + e];
			r[e] = Math.min(r[e], t), r[3 + e] = Math.max(r[3 + e], t);
		}
	}
	return r;
}
function h(e) {
	return e[0] * (e[5] * e[10] - e[6] * e[9]) - e[4] * (e[1] * e[10] - e[2] * e[9]) + e[8] * (e[1] * e[6] - e[2] * e[5]) < 0 ? -1 : 1;
}
var g = 100, _ = 201, v = 2 ** 27;
function y(e, t, n, r, i, a, o) {
	let s = Math.abs(e), c = Math.abs(t), l = Math.abs(n), u = e;
	c > s && c >= l ? u = t : l > s && l > c && (u = n);
	let d = u < 0 ? -1 : 1, f = Math.round(e * d * g) + g, p = Math.round(t * d * g) + g, m = Math.round(n * d * g) + g, h = (r * e + i * t + a * n) * d, y = Math.floor(h / (2 * o));
	return ((f * _ + p) * _ + m) * v + y + v / 2;
}
var b = /* @__PURE__ */ new Float64Array(9);
function x(e, t) {
	let { positions: n, indices: r } = e.geometry, i = e.matrix, a = h(i), o = b;
	for (let e = 0; e < r.length; e += 3) {
		for (let t = 0; t < 3; t++) {
			let a = r[e + t] * 3, s = n[a], c = n[a + 1], l = n[a + 2];
			o[t * 3] = i[0] * s + i[4] * c + i[8] * l + i[12], o[t * 3 + 1] = i[1] * s + i[5] * c + i[9] * l + i[13], o[t * 3 + 2] = i[2] * s + i[6] * c + i[10] * l + i[14];
		}
		let s = o[3] - o[0], c = o[4] - o[1], l = o[5] - o[2], u = o[6] - o[0], d = o[7] - o[1], f = o[8] - o[2], p = c * f - l * d, m = l * u - s * f, h = s * d - c * u, g = Math.hypot(p, m, h);
		if (!(g > 1e-12)) continue;
		let _ = a / g;
		t(o, p * _, m * _, h * _);
	}
}
function S(e, t, n) {
	let r = /* @__PURE__ */ new Set();
	return x(e, (e, i, a, o) => {
		for (let r = 0; r < 3; r++) {
			let i = Math.min(e[r], e[3 + r], e[6 + r]);
			if (Math.max(e[r], e[3 + r], e[6 + r]) < n[r] - t || i > n[3 + r] + t) return;
		}
		r.add(y(i, a, o, e[0], e[1], e[2], t));
	}), r;
}
function C(e, t) {
	let n = /* @__PURE__ */ new Map();
	x(e, (e, r, i, a) => {
		let o = y(r, i, a, e[0], e[1], e[2], t), s = [
			Math.min(e[0], e[3], e[6]),
			Math.min(e[1], e[4], e[7]),
			Math.min(e[2], e[5], e[8]),
			Math.max(e[0], e[3], e[6]),
			Math.max(e[1], e[4], e[7]),
			Math.max(e[2], e[5], e[8])
		], c = {
			corners: Float64Array.from(e),
			normal: [
				r,
				i,
				a
			],
			box: s
		}, l = n.get(o);
		l ? l.triangles.push(c) : n.set(o, {
			triangles: [c],
			widest: 0
		});
	});
	for (let e of n.values()) {
		e.triangles.sort((e, t) => e.box[0] - t.box[0]);
		for (let { box: t } of e.triangles) e.widest = Math.max(e.widest, t[3] - t[0]);
	}
	return n;
}
function w(e, t, n) {
	let { triangles: r, widest: i } = e, a = 0, o = r.length, s = t[0] - n - i;
	for (; a < o;) {
		let e = a + o >> 1;
		r[e].box[0] < s ? a = e + 1 : o = e;
	}
	let c = [];
	for (let e = a; e < r.length; e++) {
		let { box: i } = r[e];
		if (i[0] > t[3] + n) break;
		i[3] < t[0] - n || i[4] < t[1] - n || i[1] > t[4] + n || i[5] < t[2] - n || i[2] > t[5] + n || c.push(r[e]);
	}
	return c;
}
function T(e, t, n) {
	let r = e.normal;
	return (t.corners[n * 3] - e.corners[0]) * r[0] + (t.corners[n * 3 + 1] - e.corners[1]) * r[1] + (t.corners[n * 3 + 2] - e.corners[2]) * r[2];
}
function E(e, t) {
	let n = e.normal.map(Math.abs), r = n.indexOf(Math.max(...n)), i = [
		0,
		1,
		2
	].filter((e) => e !== r), a = (e, t) => [e.corners[t * 3 + i[0]], e.corners[t * 3 + i[1]]], o = [
		0,
		1,
		2
	].map((e) => a(t, e)), s = [
		0,
		1,
		2
	].map((t) => a(e, t)), c = D(s) >= 0 ? 1 : -1;
	for (let e = 0; e < 3 && o.length > 0; e++) {
		let t = s[e], n = s[(e + 1) % 3], r = (e) => c * ((n[0] - t[0]) * (e[1] - t[1]) - (n[1] - t[1]) * (e[0] - t[0])), i = [];
		for (let e = 0; e < o.length; e++) {
			let t = o[e], n = o[(e + o.length - 1) % o.length], a = r(t), s = r(n);
			if (a >= 0 != s >= 0) {
				let e = s / (s - a);
				i.push([n[0] + (t[0] - n[0]) * e, n[1] + (t[1] - n[1]) * e]);
			}
			a >= 0 && i.push(t);
		}
		o = i;
	}
	return o.length < 3 ? 0 : Math.abs(D(o)) / Math.max(n[r], 1e-12);
}
function D(e) {
	let t = 0;
	for (let n = 0; n < e.length; n++) {
		let r = e[(n + 1) % e.length];
		t += e[n][0] * r[1] - r[0] * e[n][1];
	}
	return t / 2;
}
function O(e, t, n) {
	let r = [
		0,
		0,
		0,
		0,
		0,
		0
	];
	for (let i = 0; i < 3; i++) if (r[i] = Math.max(e[i], t[i]), r[3 + i] = Math.min(e[3 + i], t[3 + i]), r[i] > r[3 + i] + n) return null;
	return r;
}
function k(e) {
	return Math.hypot(e[3] - e[0], e[4] - e[1], e[5] - e[2]);
}
function A(e, n) {
	return t(e) !== t(n);
}
function j(e, t, n) {
	for (let r = 0; r < 3; r++) {
		let i = Math.min(e.corners[r], e.corners[3 + r], e.corners[6 + r]), a = Math.max(e.corners[r], e.corners[3 + r], e.corners[6 + r]), o = Math.min(t.corners[r], t.corners[3 + r], t.corners[6 + r]), s = Math.max(t.corners[r], t.corners[3 + r], t.corners[6 + r]);
		if (a < o - n || s < i - n) return !1;
	}
	return !0;
}
function M(e, t, n, r, i) {
	let a = e.part.material?.doubleSided === !0 || t.part.material?.doubleSided === !0;
	e.planes ??= C(e.part, r), t.planes ??= C(t.part, r);
	let o = 0, s = 0, c = null, l = 0;
	for (let [d, f] of e.planes) for (let e of [
		d - 1,
		d,
		d + 1
	]) {
		let d = t.planes.get(e);
		if (!d) continue;
		i.work += Math.log2(f.triangles.length + d.triangles.length + 2) / 4;
		let p = w(f, n, r), m = w(d, n, r);
		for (let e of p) {
			if (i.work > i.limit) break;
			for (let t of m) {
				if (i.work += 1 / 64, !j(e, t, r)) continue;
				i.work++;
				let n = e.normal[0] * t.normal[0] + e.normal[1] * t.normal[1] + e.normal[2] * t.normal[2];
				if (!(n >= u || a && n <= -u)) continue;
				let d = 0;
				for (let n = 0; n < 3; n++) d = Math.max(d, Math.abs(T(e, t, n)));
				if (d > r) continue;
				let f = E(e, t);
				f <= 0 || (o += f, s = Math.max(s, d), f > l && (l = f, c = e.normal));
			}
		}
	}
	return o >= 1e-4 ? {
		area: o,
		distance: s,
		normal: c
	} : null;
}
function N(e, t) {
	let n = [...e].sort((e, t) => e.bounds[0] - t.bounds[0]);
	for (let e = 0; e < n.length; e++) {
		let r = n[e];
		for (let i = e + 1; i < n.length; i++) {
			let e = n[i];
			if (e.bounds[0] > r.bounds[3] + t) break;
			let a = O(r.bounds, e.bounds, t);
			if (a) for (let t of [r, e]) {
				t.region ||= a.slice();
				for (let e = 0; e < 3; e++) t.region[e] = Math.min(t.region[e], a[e]), t.region[3 + e] = Math.max(t.region[3 + e], a[3 + e]);
			}
		}
	}
}
function P(e, t, n, r) {
	let i = /* @__PURE__ */ new Map();
	N(e, t), e.forEach((e, t) => {
		e.index = t;
	});
	let a = e.filter((e) => e.region).sort((e, t) => e.part.geometry.indices.length - t.part.geometry.indices.length);
	for (let e of a) {
		if (n.triangles <= 0) {
			n.exhausted = !0;
			break;
		}
		n.triangles -= e.part.geometry.indices.length / 3;
		for (let n of S(e.part, t, e.region)) {
			let t = i.get(n);
			t ? t.push(e) : i.set(n, [e]);
		}
	}
	let o = /* @__PURE__ */ new Set();
	for (let [n, a] of i) {
		let s = i.get(n + 1) ?? [];
		if (a.length + s.length < 2) continue;
		let c = [...a.map((e) => ({
			entry: e,
			own: !0
		})), ...s.map((e) => ({
			entry: e,
			own: !1
		}))];
		c.sort((e, t) => e.entry.bounds[0] - t.entry.bounds[0]);
		for (let n = 0; n < c.length; n++) {
			let i = c[n];
			for (let a = n + 1; a < c.length; a++) {
				let n = c[a];
				if (n.entry.bounds[0] > i.entry.bounds[3] + t) break;
				if (!i.own && !n.own || i.entry === n.entry || n.entry.bounds[1] > i.entry.bounds[4] + t || i.entry.bounds[1] > n.entry.bounds[4] + t || n.entry.bounds[2] > i.entry.bounds[5] + t || i.entry.bounds[2] > n.entry.bounds[5] + t) continue;
				let s = Math.min(i.entry.index, n.entry.index), l = Math.max(i.entry.index, n.entry.index), u = s * e.length + l;
				o.has(u) || (o.add(u), r(i.entry, n.entry));
			}
		}
	}
}
function F(e, { tolerance: t = n, workBudget: r = o, triangleBudget: i = s } = {}) {
	let a = [], u = /* @__PURE__ */ new Map();
	for (let t of e) {
		if (t.skin || t.morph || !t.geometry?.indices?.length) continue;
		let e = u.get(t.geometry) ?? /* @__PURE__ */ new Map();
		u.set(t.geometry, e);
		let n = Array.prototype.join.call(t.matrix, ","), r = e.get(n) ?? 0;
		r >= 2 || (e.set(n, r + 1), a.push({
			part: t,
			bounds: m(t)
		}));
	}
	let d = {
		work: 0,
		limit: r
	}, f = {
		triangles: i,
		exhausted: !1
	}, p = [];
	if (a.length < 2) return {
		overlaps: p,
		truncated: !1,
		work: 0
	};
	let h = Array.from({ length: c }, () => []), g = 0;
	P(a, t, f, (e, n) => {
		let r = O(e.bounds, n.bounds, t);
		if (!r || A(e.part, n.part) || g >= l) return;
		let i = [
			r[3] - r[0],
			r[4] - r[1],
			r[5] - r[2]
		].sort((e, t) => e - t), a = i[1] * i[2], o = i[0] <= t ? c / 2 : 0, s = Math.max(0, Math.min(c / 2 - 1, Math.floor(Math.log10(Math.max(a, 1e-6)) + 6)));
		h[11 - (o + s)].push(e, n, r), g++;
	});
	for (let e of h) for (let n = 0; n < e.length && d.work <= d.limit; n += 3) {
		let r = e[n], i = e[n + 1], a = M(r, i, e[n + 2], t, d);
		if (!a) continue;
		let o = k(r.bounds) >= k(i.bounds);
		p.push({
			smaller: (o ? i : r).part,
			larger: (o ? r : i).part,
			...a
		});
	}
	let _ = d.work > r || f.exhausted;
	return p.sort((e, t) => t.area - e.area || String(e.smaller.name).localeCompare(String(t.smaller.name))), {
		overlaps: p,
		truncated: _,
		work: d.work
	};
}
function I(e) {
	return `${Math.round(e * 1e3) / 1e3}`;
}
function L({ overlaps: e, truncated: t }) {
	let n = e.slice(0, d).map(({ smaller: e, larger: t, area: n, distance: r, normal: i }) => ({
		kind: "coplanar-overlap",
		severity: "warning",
		target: e.name,
		parts: [e.name, t.name],
		area: Math.round(n * 1e4) / 1e4,
		message: `${e.name} and ${t.name} draw the same plane (${I(r * 1e3)} mm apart, ${I(n)} m2 overlap) and will flicker (z-fighting).`,
		fix: `Move ${e.name} ${I(a * 1e3)} mm along its normal [${i.map((e) => Math.round(e * 1e3) / 1e3).join(", ")}], or set decal: true on ${e.name}, or set environment.resolveCoplanar to 'offset' to bias it at draw time without moving it.`
	}));
	return (e.length > d || t && e.length) && n.push({
		kind: "coplanar-overlap",
		severity: "warning",
		target: "scene",
		message: t ? `${e.length} coplanar pairs found before the check hit its work budget; more may exist.` : `${e.length - d} more coplanar pairs.`,
		fix: "Set environment.resolveCoplanar to 'offset' to bias every smaller part at draw time."
	}), n;
}
function R(e, { minimumGap: n = 0 } = {}) {
	let r = /* @__PURE__ */ new Map();
	for (let i = 0; i <= 5; i++) {
		let i = !1;
		for (let { smaller: a, larger: o, distance: s } of e) {
			if (s < n || a.decal !== void 0 || a.depthLayer !== void 0) continue;
			let e = (r.get(o) ?? t(o)) + 1;
			e > 4 || e <= (r.get(a) ?? 0) || (r.set(a, e), i = !0);
		}
		if (!i) break;
	}
	return r;
}
function z(e, t = null) {
	let n = null, r = null;
	return e.coplanarDiagnostics = (e) => {
		if (e !== n) {
			n = e;
			let i = F(e.flatMap((e) => e.parts));
			r = L(i), t?.(i.overlaps);
		}
		return r;
	}, e;
}
function B(t, { minimumGap: n = i } = {}) {
	let r = R(F(t).overlaps, { minimumGap: n });
	return e(r), r.size;
}
function V(e) {
	let t = R(F(e).overlaps);
	return t.size === 0 ? e : e.map((e) => t.has(e) ? Object.freeze({
		...e,
		depthLayer: t.get(e)
	}) : e);
}
export { r as COPLANAR_MINIMUM_AREA, n as COPLANAR_TOLERANCE, i as EXACT_FLUSH_DISTANCE, a as SUGGESTED_OFFSET, R as coplanarLayers, L as coplanarOverlapDiagnostics, F as findCoplanarOverlaps, z as installCoplanarDiagnostics, V as resolveCoplanarParts, B as resolveFlushParts };
