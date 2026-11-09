/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { t as e } from "./field-error-DPtscRqU.js";
import { t } from "./triangle-bvh-MJBX52tQ.js";
import { i as n } from "./triangle-math-CatOnS0A.js";
import { n as r, t as i } from "./ray-query-CWJhfYYD.js";
import { I as a, j as o, t as s } from "./mesh-uv-YEnc7okb.js";
import { r as c, s as l } from "./material-texture-kit-DIh3eyE-.js";
// src/light-bake.js
var u = Object.freeze({
	maxResolution: {
		minimum: 4,
		maximum: 256,
		fallback: 128
	},
	texelsPerUnit: {
		minimum: .5,
		maximum: 64,
		fallback: 6
	},
	samples: {
		minimum: 1,
		maximum: 512,
		fallback: 128
	},
	bounces: {
		minimum: 1,
		maximum: 8,
		fallback: 3
	},
	maxSeconds: {
		minimum: 1,
		maximum: 600,
		fallback: 60
	}
}), d = 4e8, f = 1e6, p = 2e5, m = 256, h = 1024, g = [
	"cpu",
	"gpu",
	"webgpu",
	"native"
], _ = 16, v = 8, y = 7, b = .98, x = .15, S = [
	"map",
	"normalMap",
	"metallicRoughnessMap",
	"occlusionMap",
	"emissiveMap"
], C = .05, w = 1e-6, T = 2, E = 3, D = 1.5, O = .9, k = 1, A = 2, ee = .75, j = 16, M = 33071, N = 9729;
function te(t, n) {
	let r = u[n], i = t[n] ?? r.fallback;
	if (!Number.isFinite(i) || i < r.minimum || i > r.maximum) throw e(`bake.${n}`, i, `a number from ${r.minimum} to ${r.maximum}, such as ${r.fallback}`);
	return n === "samples" || n === "bounces" || n === "maxResolution" ? Math.floor(i) : i;
}
function P(t = {}) {
	if (typeof t != "object" || !t || Array.isArray(t)) throw TypeError("Light bake options must be an object.");
	let n = {};
	for (let e of Object.keys(u)) n[e] = te(t, e);
	if (n.backend = t.backend ?? "cpu", !g.includes(n.backend)) throw e("bake.backend", n.backend, "one of \"cpu\", \"gpu\", \"webgpu\" or \"native\"", TypeError);
	return n;
}
function F(e, t) {
	return (Array.isArray(e) || ArrayBuffer.isView(e)) && e.length === t && Array.from(e).every(Number.isFinite);
}
function I(e, t) {
	if (!F(e, 3) || Math.hypot(...e) === 0) throw RangeError(`${t} needs a finite, nonzero direction.`);
	let n = Math.hypot(...e);
	return Array.from(e, (e) => e / n);
}
function L(e, t, n) {
	if (!Array.isArray(e) || e.length > t) throw RangeError(`Light bake takes at most ${t} ${n}.`);
}
function R(e, t) {
	if (!F(e.position, 3) || !F(e.color ?? [
		1,
		1,
		1
	], 3) || !Number.isFinite(e.intensity) || e.intensity < 0) throw RangeError(`${t} needs a position, a color and a nonnegative intensity.`);
}
function ne(e) {
	return L(e, v, "spot lights"), e.map((e, t) => {
		let n = `Light bake spot light ${t}`;
		R(e, n);
		let r = e.angle ?? Math.PI / 4, i = e.penumbra ?? x, a = e.range ?? 0, o = e.radius ?? .05;
		if (![
			r,
			i,
			a,
			o
		].every(Number.isFinite) || r <= 0 || r >= Math.PI || i < 0 || a < 0 || o < 0) throw RangeError(`${n} has an invalid angle, penumbra, range or radius.`);
		let s = Math.cos(r);
		return {
			position: Array.from(e.position),
			color: Array.from(e.color ?? [
				1,
				1,
				1
			]),
			intensity: e.intensity,
			range: a,
			radius: o,
			direction: I(e.direction, n),
			cosineHalfAngle: s,
			blend: (1 - s) * i
		};
	});
}
function re(e) {
	return L(e, y, "area lights"), e.map((e, t) => {
		let n = `Light bake area light ${t}`;
		if (R(e, n), !(e.width >= 0) || !(e.height >= 0) || !Number.isFinite(e.width) || !Number.isFinite(e.height)) throw RangeError(`${n} needs a finite width and height.`);
		let r = I(e.direction, n), i = I(e.up ?? [
			0,
			1,
			0
		], n), a = [
			i[1] * r[2] - i[2] * r[1],
			i[2] * r[0] - i[0] * r[2],
			i[0] * r[1] - i[1] * r[0]
		], o = Math.hypot(...a);
		a = o < .001 ? [
			1,
			0,
			0
		] : a.map((e) => e / o);
		let s = [
			r[1] * a[2] - r[2] * a[1],
			r[2] * a[0] - r[0] * a[2],
			r[0] * a[1] - r[1] * a[0]
		];
		return {
			position: Array.from(e.position),
			color: Array.from(e.color ?? [
				1,
				1,
				1
			]),
			intensity: e.intensity,
			width: e.width,
			height: e.height,
			normal: r,
			across: a,
			along: s
		};
	});
}
function z(e, t) {
	return e.map((e, n) => ({
		...e,
		affects: t[n].affects ?? null
	}));
}
function B(e, t) {
	let n = (e) => {
		if (e.affects === null) return null;
		let n = new Set(e.affects);
		return Uint8Array.from(t, (e) => +!!n.has(e.name));
	}, r = (e) => ({
		...e,
		reach: n(e)
	});
	return {
		pointLights: e.pointLights.map(r),
		spotLights: e.spotLights.map(r),
		areaLights: e.areaLights.map(r),
		sun: e.sun && r(e.sun)
	};
}
function V(e, t) {
	return e.reach === null || e.reach[t] === 1;
}
function H(e) {
	if (typeof e != "object" || !e) throw TypeError("Light bake needs a lighting object.");
	let t = e.pointLights ?? [];
	if (!Array.isArray(t) || t.length > _) throw RangeError(`Light bake takes at most ${_} point lights.`);
	let n = t.map((e, t) => {
		let n = e.range ?? 0, r = e.radius ?? .05;
		if (!F(e.position, 3) || !F(e.color ?? [
			1,
			1,
			1
		], 3) || !Number.isFinite(e.intensity) || e.intensity < 0) throw RangeError(`Light bake point light ${t} needs a position, a color and a nonnegative intensity.`);
		if (!Number.isFinite(n) || n < 0 || !Number.isFinite(r) || r < 0) throw RangeError(`Light bake point light ${t} has an invalid range or radius.`);
		return {
			position: Array.from(e.position),
			color: Array.from(e.color ?? [
				1,
				1,
				1
			]),
			intensity: e.intensity,
			range: n,
			radius: r
		};
	}), r = e.spotLights ?? [], i = e.areaLights ?? [], a = z(ne(r), r), o = z(re(i), i), s = e.keyColor ?? [
		0,
		0,
		0
	], c = e.lightDirection ?? [
		0,
		1,
		0
	];
	if (!F(s, 3) || s.some((e) => e < 0) || !F(c, 3)) throw RangeError("Light bake keyColor and lightDirection must be finite vectors.");
	let l = Math.hypot(...c), u = s.some((e) => e > 0) && l > 0, d = u ? c.map((e) => e / l) : [
		0,
		1,
		0
	];
	return {
		pointLights: z(n, t),
		spotLights: a,
		areaLights: o,
		sun: u ? {
			color: Array.from(s),
			direction: d,
			affects: e.keyAffects ?? null
		} : null
	};
}
function U(e, t) {
	let { geometry: n, matrix: r } = e ?? {}, i = `Light bake part ${t}`;
	if (!n || !(n.positions instanceof Float32Array) || n.positions.length === 0 || n.positions.length % 3 != 0) throw TypeError(`${i} needs Float32 positions.`);
	if (!(n.indices instanceof Uint32Array) || n.indices.length === 0 || n.indices.length % 3 != 0) throw TypeError(`${i} needs Uint32 triangle indices.`);
	if (!F(r, 16)) throw RangeError(`${i} needs a finite 4x4 matrix.`);
	let a = n.positions.length / 3;
	for (let e = 0; e < n.positions.length; e++) if (!Number.isFinite(n.positions[e])) throw RangeError(`${i} has a non-finite position.`);
	for (let e = 0; e < n.indices.length; e++) if (n.indices[e] >= a) throw RangeError(`${i} has an index past its last vertex.`);
	let o = e.material?.color;
	if (!F(o, 3)) throw RangeError(`${i} needs a material color.`);
}
function ie(e) {
	let t = e.material;
	return e.generatesGeometry ? `${typeof e.generatesGeometry == "string" ? e.generatesGeometry : "a hair or particle system"} rebuilds its geometry every frame, so it has no fixed surface to bake` : e.skin || e.morph || e.geometry.skinIndices || e.geometry.morphTargets ? "skinned or morphing parts move, so a fixed lightmap would not follow" : (t.tag ?? "surface") === "surface" ? t.opacity !== void 0 && t.opacity < 1 || t.alphaMode && t.alphaMode !== "opaque" ? "it is transparent" : null : `the ${t.tag} material draws its own look`;
}
function ae(e) {
	return S.some((t) => e[t]) || !!(e.pattern || e.layers) || (e.emission ?? 0) > 0;
}
function oe(e) {
	let t = e / 255;
	return t <= .04045 ? t / 12.92 : ((t + .055) / 1.055) ** 2.4;
}
function W(e) {
	let t = e?.image;
	if (!t?.data || !(t.width > 0) || !(t.height > 0)) return [
		1,
		1,
		1
	];
	let n = [
		0,
		0,
		0
	];
	for (let e = 0; e < j; e++) for (let r = 0; r < j; r++) {
		let i = Math.floor((r + .5) / j * t.width), a = Math.floor((e + .5) / j * t.height);
		for (let e = 0; e < 3; e++) n[e] += oe(t.data[(a * t.width + i) * 4 + e]);
	}
	return n.map((e) => e / 256);
}
function G(e) {
	let t = 1 - (e.metallic ?? 0), n = W(e.map);
	return e.color.map((e, r) => Math.max(e, 0) * t * n[r]);
}
function K(e) {
	let t = e.emission ?? 0;
	return t <= 0 ? [
		0,
		0,
		0
	] : (e.emissiveColor ?? e.color).map((e) => e * t);
}
function q(e) {
	let n = 0, r = 0;
	for (let t of e) n += t.geometry.positions.length / 3, r += t.geometry.indices.length;
	if (r / 3 > 2e5) throw RangeError(`Light bake takes at most ${p} triangles in total.`);
	let i = new Float32Array(n * 3), a = new Uint32Array(r), o = new Uint32Array(r / 3), s = 0, c = 0;
	return e.forEach((e, t) => {
		let { matrix: n } = e, r = e.geometry.positions;
		for (let e = 0; e < r.length / 3; e++) {
			let t = r[e * 3], a = r[e * 3 + 1], o = r[e * 3 + 2], c = (s + e) * 3;
			i[c] = n[0] * t + n[4] * a + n[8] * o + n[12], i[c + 1] = n[1] * t + n[5] * a + n[9] * o + n[13], i[c + 2] = n[2] * t + n[6] * a + n[10] * o + n[14];
		}
		for (let t = 0; t < e.geometry.indices.length; t++) a[c * 3 + t] = e.geometry.indices[t] + s;
		o.fill(t, c, c + e.geometry.indices.length / 3), s += r.length / 3, c += e.geometry.indices.length / 3;
	}), {
		positions: i,
		indices: a,
		triangleOwner: o,
		bvh: t(i, a)
	};
}
function J(e) {
	let t = 0;
	for (let n = 0; n < e.length; n++) t = Math.max(t, Math.abs(e[n]));
	return Math.max(t, .001);
}
function Y(e, t, n) {
	let r = Math.imul(e ^ 2654435769, 2246822507) ^ Math.imul(t + 2135587861, 3266489909) ^ Math.imul(n + 374761393, 668265263);
	return r = Math.imul(r ^ r >>> 15, 739982445), r = Math.imul(r ^ r >>> 12, 695872825), r ^= r >>> 15, (r >>> 0) / 4294967296;
}
function X(e) {
	let t = e, n = 0, r = .5;
	for (; t > 0;) t & 1 && (n += r), t >>>= 1, r *= .5;
	return n;
}
function Z(e, t, n, r) {
	let i = Math.sqrt(t), a = 2 * Math.PI * n, o = i * Math.cos(a), s = i * Math.sin(a), c = Math.sqrt(Math.max(0, 1 - t)), l = Math.abs(e[0]) < .9 ? [
		1,
		0,
		0
	] : [
		0,
		1,
		0
	], u = e[1] * l[2] - e[2] * l[1], d = e[2] * l[0] - e[0] * l[2], f = e[0] * l[1] - e[1] * l[0], p = Math.hypot(u, d, f);
	u /= p, d /= p, f /= p;
	let m = e[1] * f - e[2] * d, h = e[2] * u - e[0] * f, g = e[0] * d - e[1] * u;
	r[0] = u * o + m * s + e[0] * c, r[1] = d * o + h * s + e[1] * c, r[2] = f * o + g * s + e[2] * c;
}
function Q(e, t, n, i, a = null) {
	let o = [
		0,
		0,
		0
	], s = i * 1e6;
	function c(t, r, i, a, s) {
		let c = r[0] * i[0] + r[1] * i[1] + r[2] * i[2];
		if (!(c <= 0) && !(e.trace(t[0] + r[0] * n, t[1] + r[1] * n, t[2] + r[2] * n, i[0], i[1], i[2], a, !0).nearestTriangle >= 0)) for (let e = 0; e < 3; e++) o[e] += s[e] * c;
	}
	let l = [
		0,
		0,
		0
	], u = [
		0,
		0,
		0
	], d = [
		0,
		0,
		0
	];
	function f(e, t, n, r) {
		let i = t - e[0], a = n - e[1], o = r - e[2], s = i * i + a * a + o * o;
		if (s < 1e-12) return {
			distance: 0,
			distanceSquared: s
		};
		let c = Math.sqrt(s);
		return l[0] = i / c, l[1] = a / c, l[2] = o / c, {
			distance: c,
			distanceSquared: s
		};
	}
	function p(e, t, i) {
		let { distance: a, distanceSquared: o } = f(e, i.position[0], i.position[1], i.position[2]);
		if (a === 0) return;
		let s = -(i.direction[0] * l[0] + i.direction[1] * l[1] + i.direction[2] * l[2]) - i.cosineHalfAngle;
		if (s <= 0) return;
		let d = i.blend > 0 && s < i.blend ? s / i.blend : 1, p = d * d * (3 - 2 * d), m = i.intensity * r(o, i) * p;
		for (let e = 0; e < 3; e++) u[e] = i.color[e] * m;
		c(e, t, l, a - n, u);
	}
	let m = 0;
	function h(e, t, r, i) {
		m++;
		let a = (Y(m, 17, i) - .5) * r.width, o = (Y(m, 19, i) - .5) * r.height, { distance: s, distanceSquared: d } = f(e, r.position[0] + r.across[0] * a + r.along[0] * o, r.position[1] + r.across[1] * a + r.along[1] * o, r.position[2] + r.across[2] * a + r.along[2] * o);
		if (s === 0) return;
		let p = -(r.normal[0] * l[0] + r.normal[1] * l[1] + r.normal[2] * l[2]);
		if (p <= 0) return;
		let h = r.intensity * p / d;
		for (let e = 0; e < 3; e++) u[e] = r.color[e] * h;
		c(e, t, l, s - n, u);
	}
	return function(e, i, f) {
		o[0] = 0, o[1] = 0, o[2] = 0;
		for (let a of t.pointLights) {
			if (!V(a, f)) continue;
			let t = a.position[0] - e[0], o = a.position[1] - e[1], s = a.position[2] - e[2], d = t * t + o * o + s * s;
			if (d < 1e-12) continue;
			let p = Math.sqrt(d);
			l[0] = t / p, l[1] = o / p, l[2] = s / p;
			let m = a.intensity * r(d, a);
			for (let e = 0; e < 3; e++) u[e] = a.color[e] * m;
			c(e, i, l, p - n, u);
		}
		for (let n of t.spotLights) V(n, f) && p(e, i, n);
		for (let n = 0; n < t.areaLights.length; n++) V(t.areaLights[n], f) && h(e, i, t.areaLights[n], n);
		if (t.sun && V(t.sun, f)) {
			if (!a) c(e, i, t.sun.direction, s, t.sun.color);
			else {
				let n = a(e);
				for (let e = 0; e < 3; e++) d[e] = t.sun.color[e] * n;
				c(e, i, t.sun.direction, s, d);
			}
		}
		return o;
	};
}
function se(e, t, r, i) {
	n(e.positions, e.indices, t, $);
	let a = $[3] - $[0], o = $[4] - $[1], s = $[5] - $[2], c = $[6] - $[0], l = $[7] - $[1], u = $[8] - $[2], d = o * u - s * l, f = s * c - a * u, p = a * l - o * c, m = Math.hypot(d, f, p) || 1;
	d /= m, f /= m, p /= m;
	let h = d * r[0] + f * r[1] + p * r[2] > 0 ? -1 : 1;
	i[0] = d * h, i[1] = f * h, i[2] = p * h;
}
var $ = /* @__PURE__ */ new Float64Array(9);
function ce({ world: e, tracer: t, albedoOfPart: n, emissionOfPart: r, directIrradiance: i, offset: a, samples: o, bounces: s, medium: c = null, fogScatterLimit: l = 8 }) {
	let u = [
		0,
		0,
		0
	], d = [
		0,
		0,
		0
	], f = [
		0,
		0,
		0
	], p = [
		0,
		0,
		0
	], m = [
		0,
		0,
		0
	], h = [
		0,
		0,
		0
	], g = [
		1,
		1,
		1
	];
	return function(_, v, y, b, x = null) {
		b[0] = 0, b[1] = 0, b[2] = 0, u.fill(0), d.fill(0);
		let S = Y(y, 1, 7), C = 0;
		for (let x = 0; x < o; x++) {
			Z(v, (x + .5) / o, (X(x) + S) % 1, f), p[0] = _[0] + v[0] * a, p[1] = _[1] + v[1] * a, p[2] = _[2] + v[2] * a, g[0] = 1, g[1] = 1, g[2] = 1;
			let w = 0, T = 0, E = 0;
			for (; w < s;) {
				let o = t.trace(p[0], p[1], p[2], f[0], f[1], f[2], Infinity, !1), s = o.nearestTriangle, _ = o.nearestDistance;
				if (c && c(p, f, s < 0 ? Infinity : _, g, u, y, x, T++, d)) {
					if (++E >= l) break;
					continue;
				}
				if (s < 0) {
					w === 0 && C++, E > 0 && c.addSky(g, u);
					break;
				}
				for (let e = 0; e < 3; e++) h[e] = p[e] + f[e] * _;
				se(e, s, f, m);
				let v = e.triangleOwner[s], S = n[v], D = r[v], O = i(h, m, v);
				for (let e = 0; e < 3; e++) b[e] += g[e] * (D[e] + S[e] * O[e] / Math.PI), g[e] *= S[e];
				if (g[0] + g[1] + g[2] < 1e-4) break;
				p[0] = h[0] + m[0] * a, p[1] = h[1] + m[1] * a, p[2] = h[2] + m[2] * a, Z(m, Y(y, x, w * 2 + 11), Y(y, x, w * 2 + 12), f), w++;
			}
		}
		for (let e = 0; e < 3; e++) u[e] /= o, b[e] = b[e] / o + u[e], x && (x[e] = d[e] / o);
		return C / o;
	};
}
function le(e) {
	let { positions: t, indices: n } = e.geometry, { matrix: r } = e, i = /* @__PURE__ */ new Float64Array(9), a = 0;
	for (let e = 0; e < n.length / 3; e++) {
		for (let a = 0; a < 3; a++) {
			let o = n[e * 3 + a] * 3, s = t[o], c = t[o + 1], l = t[o + 2];
			i[a * 3] = r[0] * s + r[4] * c + r[8] * l + r[12], i[a * 3 + 1] = r[1] * s + r[5] * c + r[9] * l + r[13], i[a * 3 + 2] = r[2] * s + r[6] * c + r[10] * l + r[14];
		}
		let o = i[3] - i[0], s = i[4] - i[1], c = i[5] - i[2], l = i[6] - i[0], u = i[7] - i[1], d = i[8] - i[2];
		a += Math.hypot(s * d - c * u, c * l - o * d, o * u - s * l) / 2;
	}
	return a;
}
function ue(e) {
	return [
		0,
		1,
		2
	].map((t) => Math.hypot(e[t * 4], e[t * 4 + 1], e[t * 4 + 2])).map((e) => Math.max(e, w));
}
function de(e) {
	return e.map((e) => e.toPrecision(6)).join(",");
}
function fe(e, t) {
	let n = Float32Array.from(e.positions, (e, n) => e * t[n % 3]), r = Float32Array.from(e.normals, (e, n) => e / t[n % 3]);
	return {
		...e,
		positions: n,
		normals: r
	};
}
function pe(e, t) {
	let n = Float32Array.from(e.positions, (e, n) => e / t[n % 3]), r = Float32Array.from(e.normals, (e, n) => e * t[n % 3]);
	for (let e = 0; e < r.length / 3; e++) {
		let t = Math.hypot(r[e * 3], r[e * 3 + 1], r[e * 3 + 2]) || 1;
		for (let n = 0; n < 3; n++) r[e * 3 + n] /= t;
	}
	return {
		...e,
		positions: n,
		normals: r
	};
}
function me(e, t) {
	let { positions: n, normals: r, indices: i } = fe(e, t), c = o({
		positions: n,
		normals: r,
		indices: i
	}, {
		quads: !1,
		tags: "none"
	}), l = s(c), { geometry: u } = a(l.mesh);
	return {
		geometry: pe(u, t),
		utilization: Math.max(l.utilization, C)
	};
}
function he(e, t) {
	let { positions: n, normals: r, indices: i } = fe(e, t), c = n.length / 3, l = new Float32Array(c * 3);
	for (let e = 0; e < c; e++) l[e * 3] = e;
	let u = o({
		positions: n,
		normals: r,
		indices: i,
		colors: l
	}, {
		quads: !1,
		tags: "none"
	}), d = s(u), f = pe(a(d.mesh).geometry, t), p = f.positions.length / 3, m = {
		positions: f.positions,
		normals: f.normals,
		indices: f.indices,
		lightUvs: f.uvs
	}, h = e.uvs ? new Float32Array(p * 2) : null, g = e.colors ? new Float32Array(p * 3) : null, _ = e.skyVisibility ? new Float32Array(p) : null;
	for (let t = 0; t < p; t++) {
		let n = Math.round(f.colors[t * 3]);
		if (h && (h[t * 2] = e.uvs[n * 2], h[t * 2 + 1] = e.uvs[n * 2 + 1]), _ && (_[t] = e.skyVisibility[n]), g) for (let r = 0; r < 3; r++) g[t * 3 + r] = e.colors[n * 3 + r];
	}
	return h && (m.uvs = h), g && (m.colors = g), _ && (m.skyVisibility = _), {
		geometry: m,
		utilization: Math.max(d.utilization, C)
	};
}
function ge(e, t, n) {
	let r = Math.sqrt(e / t) * n.texelsPerUnit, i = Math.ceil(r / 4) * 4;
	return Math.min(Math.max(i, u.maxResolution.minimum), n.maxResolution);
}
function _e(e, t, n) {
	let r = n * n, i = new Float64Array(r * 3), a = new Float64Array(r * 3), o = new Uint8Array(r), s = new Float64Array(r).fill(Infinity), { positions: c, normals: l, indices: u } = e, d = e.lightUvs ?? e.uvs, f = [
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0
	];
	for (let e = 0; e < u.length / 3; e++) {
		let r = [
			u[e * 3],
			u[e * 3 + 1],
			u[e * 3 + 2]
		];
		for (let e = 0; e < 3; e++) {
			let n = c[r[e] * 3], i = c[r[e] * 3 + 1], a = c[r[e] * 3 + 2];
			f[e * 3] = t[0] * n + t[4] * i + t[8] * a + t[12], f[e * 3 + 1] = t[1] * n + t[5] * i + t[9] * a + t[13], f[e * 3 + 2] = t[2] * n + t[6] * i + t[10] * a + t[14];
		}
		let p = ye(f, l, r[0], t), m = r.map((e) => [d[e * 2] * n, d[e * 2 + 1] * n]), [h, g, _] = m, v = (g[1] - _[1]) * (h[0] - _[0]) + (_[0] - g[0]) * (h[1] - _[1]);
		if (Math.abs(v) < 1e-12) continue;
		let y = Math.max(Math.floor(Math.min(h[0], g[0], _[0])) - 1, 0), b = Math.min(Math.ceil(Math.max(h[0], g[0], _[0])) + 1, n - 1), x = Math.max(Math.floor(Math.min(h[1], g[1], _[1])) - 1, 0), S = Math.min(Math.ceil(Math.max(h[1], g[1], _[1])) + 1, n - 1);
		for (let e = x; e <= S; e++) for (let t = y; t <= b; t++) {
			let r = e * n + t, { weights: c, distance: l } = ve(t + .5, e + .5, m, v);
			if (!(l > ee || l >= s[r])) {
				s[r] = l;
				for (let e = 0; e < 3; e++) i[r * 3 + e] = c[0] * f[e] + c[1] * f[3 + e] + c[2] * f[6 + e], a[r * 3 + e] = p[e];
				o[r] = 1;
			}
		}
	}
	return {
		positions: i,
		normals: a,
		covered: o,
		nearestDistance: s
	};
}
function ve(e, t, n, r) {
	let [i, a, o] = n, s = ((a[1] - o[1]) * (e - o[0]) + (o[0] - a[0]) * (t - o[1])) / r, c = ((o[1] - i[1]) * (e - o[0]) + (i[0] - o[0]) * (t - o[1])) / r, l = 1 - s - c;
	if (s >= -1e-9 && c >= -1e-9 && l >= -1e-9) return {
		weights: [
			s,
			c,
			l
		],
		distance: 0
	};
	let u = {
		weights: [
			1,
			0,
			0
		],
		distance: Infinity
	};
	for (let r = 0; r < 3; r++) {
		let i = n[r], a = n[(r + 1) % 3], o = a[0] - i[0], s = a[1] - i[1], c = Math.min(Math.max(((e - i[0]) * o + (t - i[1]) * s) / (o * o + s * s || 1), 0), 1), l = Math.hypot(e - i[0] - c * o, t - i[1] - c * s);
		if (l < u.distance) {
			let e = [
				0,
				0,
				0
			];
			e[r] = 1 - c, e[(r + 1) % 3] = c, u = {
				weights: e,
				distance: l
			};
		}
	}
	return u;
}
function ye(e, t, n, r) {
	let i = e[3] - e[0], a = e[4] - e[1], o = e[5] - e[2], s = e[6] - e[0], c = e[7] - e[1], l = e[8] - e[2], u = a * l - o * c, d = o * s - i * l, f = i * c - a * s, p = Math.hypot(u, d, f) || 1, m = [
		t[n * 3],
		t[n * 3 + 1],
		t[n * 3 + 2]
	], h = r[0] * m[0] + r[4] * m[1] + r[8] * m[2], g = r[1] * m[0] + r[5] * m[1] + r[9] * m[2], _ = r[2] * m[0] + r[6] * m[1] + r[10] * m[2], v = u * h + d * g + f * _ < 0 ? -1 : 1;
	return [
		u / p * v,
		d / p * v,
		f / p * v
	];
}
function be(e, t, n) {
	for (let r = 0; r < A; r++) {
		let r = [];
		for (let i = 0; i < n; i++) for (let a = 0; a < n; a++) {
			if (t[i * n + a]) continue;
			let o = [
				0,
				0,
				0
			], s = 0;
			for (let r = -1; r <= 1; r++) for (let c = -1; c <= 1; c++) {
				let l = i + r, u = a + c;
				if (l < 0 || u < 0 || l >= n || u >= n) continue;
				let d = l * n + u;
				if (t[d]) {
					for (let t = 0; t < 3; t++) o[t] += e[d * 3 + t];
					s++;
				}
			}
			s > 0 && r.push([i * n + a, o.map((e) => e / s)]);
		}
		for (let [n, i] of r) e.set(i, n * 3), t[n] = 1;
	}
}
function xe(e, t, n, r, i, a) {
	let o = E, s = D * D, c = a * k, l = e;
	for (let e = 0; e < T; e++) {
		let e = l.map((e) => new Float32Array(e.length));
		for (let a = 0; a < i; a++) for (let u = 0; u < i; u++) {
			let d = a * i + u;
			if (!t[d]) continue;
			let f = l.map(() => [
				0,
				0,
				0
			]), p = 0;
			for (let e = -3; e <= o; e++) {
				let m = a + e;
				if (!(m < 0 || m >= i)) for (let a = -3; a <= o; a++) {
					let o = u + a;
					if (o < 0 || o >= i) continue;
					let h = m * i + o;
					if (!t[h] || r[d * 3] * r[h * 3] + r[d * 3 + 1] * r[h * 3 + 1] + r[d * 3 + 2] * r[h * 3 + 2] < O) continue;
					let g = (n[h * 3] - n[d * 3]) * r[d * 3] + (n[h * 3 + 1] - n[d * 3 + 1]) * r[d * 3 + 1] + (n[h * 3 + 2] - n[d * 3 + 2]) * r[d * 3 + 2];
					if (Math.abs(g) > c) continue;
					let _ = Math.exp(-(e * e + a * a) / (2 * s));
					p += _, l.forEach((e, t) => {
						for (let n = 0; n < 3; n++) f[t][n] += _ * e[h * 3 + n];
					});
				}
			}
			e.forEach((e, t) => {
				for (let n = 0; n < 3; n++) e[d * 3 + n] = f[t][n] / p;
			});
		}
		l = e;
	}
	return l;
}
function Se(e, t, n) {
	return {
		image: c(e, t, t),
		colorSpace: n,
		wrapS: M,
		wrapT: M,
		minFilter: N,
		magFilter: N
	};
}
function Ce(e, t) {
	let n = new Uint8ClampedArray(t * t * 4).fill(255);
	for (let r = 0; r < t * t; r++) n.fill(Math.round(e[r * 3] * 255), r * 4, r * 4 + 3);
	return Se(n, t, "linear");
}
function we(e, t, n) {
	let r = new Uint8ClampedArray(t * t * 4);
	for (let i = 0; i < t * t; i++) {
		for (let t = 0; t < 3; t++) r[i * 4 + t] = l(e[i * 3 + t] / n);
		r[i * 4 + 3] = 255;
	}
	return Se(r, t, "srgb");
}
function Te(e, t, n, r) {
	return {
		...e,
		geometry: t,
		material: {
			...e.material,
			emission: r,
			emissiveColor: [
				1,
				1,
				1
			],
			emissiveMap: n
		}
	};
}
function Ee(e, t, n, r) {
	return {
		...e,
		geometry: t,
		material: {
			...e.material,
			lightMap: n,
			lightMapScale: r
		}
	};
}
function De(e, t, n, r) {
	return {
		...e,
		geometry: t,
		material: {
			...e.material,
			occlusionMap: r ? {
				...n,
				uvChannel: 1
			} : n,
			occlusionStrength: 1
		}
	};
}
function Oe(e, t, n = {}) {
	let r = je(e, t, n);
	return Re(r, {
		...r.settings,
		skyOnly: n.skyOnly === !0
	});
}
function ke(e, t, n = {}) {
	return Oe(e, t, {
		...n,
		skyOnly: !0
	});
}
function Ae({ tracer: e, offset: t, samples: n }) {
	let r = [
		0,
		0,
		0
	];
	return function(i, a, o, s) {
		s[0] = 0, s[1] = 0, s[2] = 0;
		let c = Y(o, 1, 7), l = 0;
		for (let o = 0; o < n; o++) Z(a, (o + .5) / n, (X(o) + c) % 1, r), e.trace(i[0] + a[0] * t, i[1] + a[1] * t, i[2] + a[2] * t, r[0], r[1], r[2], Infinity, !1).nearestTriangle < 0 && l++;
		return l / n;
	};
}
function je(e, t, n = {}) {
	let r = P(n), i = H(t), a = r.backend === "cpu" ? 256 : h;
	if (!Array.isArray(e) || e.length === 0 || e.length > a) throw RangeError(`Light bake takes from 1 to ${a} parts.`);
	if (e.forEach(U), e.reduce((e, t) => e + t.geometry.indices.length / 3, 0) > 2e5) throw RangeError(`Light bake takes at most ${p} triangles in total.`);
	let o = performance.now(), s = /* @__PURE__ */ new Map(), c = /* @__PURE__ */ new Map(), l = [], u = [];
	return e.forEach((e, t) => {
		let n = ie(e);
		if (n) {
			u.push({
				name: e.name,
				reason: n
			});
			return;
		}
		let r = ae(e.material), i = ue(e.matrix), a = r ? c : s;
		a.has(e.geometry) || a.set(e.geometry, /* @__PURE__ */ new Map());
		let o = a.get(e.geometry), d = de(i);
		o.has(d) || o.set(d, r ? he(e.geometry, i) : me(e.geometry, i)), l.push({
			part: e,
			index: t,
			unwrapped: o.get(d),
			area: le(e),
			slot: r
		});
	}), {
		parts: e,
		lights: i,
		settings: r,
		started: o,
		entries: l,
		skipped: u
	};
}
function Me(e, { samples: t, bounces: n, texelsPerUnit: r }) {
	let i = {
		texelsPerUnit: r,
		maxResolution: e.settings.maxResolution
	}, a = e.entries.reduce((e, { area: t, unwrapped: n }) => {
		let r = ge(t, n.utilization, i);
		return e + r * r;
	}, 0), { lights: o } = e, s = 1 + o.pointLights.length + o.spotLights.length + o.areaLights.length + +!!o.sun;
	return {
		texels: a,
		rayWork: a * t * n * s
	};
}
function Ne(e, t) {
	let { texels: n, rayWork: r } = Me(e, t);
	if (n > 1e6) throw RangeError(`Light bake would use ${n} texels; the limit is ${f}. Lower maxResolution or texelsPerUnit.`);
	if (r > 4e8) throw RangeError(`Light bake would trace about ${r} rays; the limit is ${d}. Lower samples, bounces or texelsPerUnit.`);
	return {
		texels: n,
		rayWork: r
	};
}
function Pe(e, t) {
	if (performance.now() - e.started > t.maxSeconds * 1e3) throw Error(`Light bake passed maxSeconds (${t.maxSeconds}).`);
}
function Fe(e, t) {
	return e.entries.map((e) => {
		let n = ge(e.area, e.unwrapped.utilization, t);
		return {
			entry: e,
			resolution: n,
			..._e(e.unwrapped.geometry, e.part.matrix, n)
		};
	});
}
function Ie(e, t, n) {
	let { parts: r, lights: a } = e, o = q(r), s = J(o.positions), c = s * 1e-4, l = i(o), u = Q(l, B(a, r), c, s), d = r.map((e) => G(e.material)), f = r.map((e) => K(e.material)), p = t.skyOnly ? Ae({
		tracer: l,
		offset: c,
		samples: t.samples
	}) : ce({
		world: o,
		tracer: l,
		albedoOfPart: d,
		emissionOfPart: f,
		directIrradiance: u,
		offset: c,
		samples: t.samples,
		bounces: t.bounces
	}), m = [
		0,
		0,
		0
	], h = [
		0,
		0,
		0
	], g = [
		0,
		0,
		0
	];
	return n.map(({ entry: n, resolution: r, positions: i, normals: a, covered: o }) => {
		let s = new Float32Array(r * r * 3), c = new Float32Array(r * r);
		for (let l = 0; l < r * r; l++) if (o[l]) {
			Pe(e, t);
			for (let e = 0; e < 3; e++) h[e] = i[l * 3 + e], g[e] = a[l * 3 + e];
			c[l] = p(h, g, n.index * 1000003 + l, m), s.set(m, l * 3);
		}
		return {
			light: s,
			escaped: c
		};
	});
}
function Le(e, t, n, r, i) {
	let a = e.parts.slice(), o = [];
	return n.forEach(({ entry: e, resolution: t, positions: n, normals: i, covered: s, nearestDistance: c }, l) => {
		let { part: u, index: d, unwrapped: f, area: p, slot: m } = e, { light: h, escaped: g } = r[l], _ = G(u.material), v = new Float32Array(t * t * 3), y = new Float32Array(t * t * 3), x = 0, S = 0, C = 0;
		for (let e = 0; e < t * t; e++) if (s[e]) {
			y.fill(g[e], e * 3, e * 3 + 3), c[e] === 0 && (x += g[e], S++);
			for (let t = 0; t < 3; t++) v[e * 3 + t] = m ? h[e * 3 + t] : h[e * 3 + t] * _[t], C = Math.max(C, v[e * 3 + t]);
		}
		let w = S > 0 ? x / S : 1;
		o.push({
			name: u.name,
			resolution: t,
			peak: C,
			skyVisibility: w
		});
		let T = w < b && !u.material.occlusionMap;
		if (C <= 0 && !T) return;
		let E = u, D = Math.sqrt(p / Math.max(S, 1)), [O, k] = xe([v, y], s, n, i, t, D);
		T && be(k, s.slice(), t), be(O, s, t);
		let A = O.reduce((e, t) => Math.max(e, t), 0);
		A > 0 && (E = (m ? Ee : Te)(u, f.geometry, we(O, t, A), A)), T && (E = De(E, f.geometry, Ce(k, t), m)), a[d] = E;
	}), {
		parts: a,
		report: {
			parts: o,
			skipped: e.skipped,
			texels: i.texels,
			rayWork: i.rayWork,
			backend: t.backend,
			seconds: (performance.now() - e.started) / 1e3
		}
	};
}
function Re(e, t) {
	let n = {
		...e.settings,
		...t
	};
	if (n.backend !== "cpu") throw TypeError(`Light bake backend "${n.backend}" is asynchronous: use bakeLightmapsAsync from light-bake-gpu.js.`);
	let r = Ne(e, n), i = Fe(e, n);
	return Le(e, n, i, Ie(e, n, i), r);
}
export { u as BAKE_LIMITS, y as MAX_BAKE_AREA_LIGHTS, m as MAX_BAKE_PARTS, _ as MAX_BAKE_POINT_LIGHTS, d as MAX_BAKE_RAY_WORK, v as MAX_BAKE_SPOT_LIGHTS, f as MAX_BAKE_TEXELS, p as MAX_BAKE_TRIANGLES, h as MAX_GPU_BAKE_PARTS, W as averageMapColor, Oe as bakeLightmaps, ke as bakeSkyVisibility, q as buildWorld, Pe as checkBudget, Ne as checkedBakeSize, Z as cosineDirection, Q as createDirectIrradiance, ce as createGatherer, G as diffuseAlbedo, K as emittedRadiance, Me as estimateBake, Le as finishLightmaps, Y as hashUnit, se as hitNormal, P as normalizeBakeOptions, H as normalizeLights, ue as partAxisScale, je as planLightmaps, X as radicalInverse, Fe as rasterizeEntries, J as sceneScale, xe as smoothTexels, Re as traceLightmaps, U as validatePart, B as withReach };
