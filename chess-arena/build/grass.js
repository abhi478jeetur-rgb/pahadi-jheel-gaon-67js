/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import "./world-material-shader.js";
import { d as e, f as t, h as n, m as r, n as i, p as a, s as o, t as s, u as c, y as l } from "./vegetation-geometry-9AtPgsCh.js";
import { n as u, r as d, t as f } from "./tile-field-CFW4-60z.js";
// src/grass.js
var p = Object.freeze([
	Object.freeze({
		distance: 10,
		keep: 1,
		segments: 4,
		widthScale: 1
	}),
	Object.freeze({
		distance: 26,
		keep: .35,
		segments: 2,
		widthScale: 2
	}),
	Object.freeze({
		distance: 60,
		keep: .12,
		segments: 1,
		widthScale: 4.5
	})
]), m = Object.freeze({
	meadow: Object.freeze({
		height: [.25, .6],
		width: .022,
		density: 260,
		clumpSize: .55,
		clumpStrength: .55,
		dryness: .25,
		patchiness: .55,
		stalks: .012,
		bend: [.18, .6],
		base: [
			.012,
			.03,
			.006
		],
		tip: [
			.15,
			.27,
			.045
		],
		dry: [
			.36,
			.29,
			.1
		]
	}),
	lawn: Object.freeze({
		height: [.07, .14],
		width: .012,
		density: 900,
		clumpSize: .3,
		clumpStrength: .25,
		dryness: .05,
		patchiness: .2,
		stalks: 0,
		bend: [.05, .25],
		base: [
			.01,
			.035,
			.006
		],
		tip: [
			.11,
			.26,
			.04
		],
		dry: [
			.3,
			.3,
			.09
		]
	}),
	savanna: Object.freeze({
		height: [.45, .95],
		width: .018,
		density: 170,
		clumpSize: .8,
		clumpStrength: .7,
		dryness: .75,
		patchiness: .65,
		stalks: .035,
		bend: [.25, .8],
		base: [
			.04,
			.035,
			.01
		],
		tip: [
			.36,
			.3,
			.1
		],
		dry: [
			.5,
			.39,
			.15
		]
	}),
	wild: Object.freeze({
		height: [.3, .9],
		width: .026,
		density: 200,
		clumpSize: .7,
		clumpStrength: .65,
		dryness: .35,
		patchiness: .75,
		stalks: .025,
		bend: [.25, .75],
		base: [
			.012,
			.028,
			.008
		],
		tip: [
			.14,
			.24,
			.05
		],
		dry: [
			.4,
			.32,
			.12
		]
	})
}), h = 4e4, g = .55, _ = .3, v = .22, y = .7, b = .75;
function x(e, t, n) {
	let r = n.patchiness, i = l(e * .04, t * .04, n.seed + 57), o = l(e * .13, t * .13, n.seed + 83), s = i * .6 + o * .4;
	return {
		height: a(1, a(.45, 1.35, s), r),
		density: a(1, w(.28, .62, s), r * .85),
		lush: a(1, a(.68, 1.2, l(e * .07, t * .07, n.seed + 97)), r)
	};
}
function S(e, t, n, r) {
	return u(n + r * 1013, e, t) / 4294967296;
}
function C(e, t, n, r) {
	let i = Math.floor(e / n), o = Math.floor(t / n), c = null;
	for (let a = -1; a <= 1; a++) for (let s = -1; s <= 1; s++) {
		let l = i + s, u = o + a, d = (l + S(l, u, r, 1)) * n, f = (u + S(l, u, r, 2)) * n, p = Math.hypot(e - d, t - f);
		(!c || p < c.distance) && (c = {
			centerX: d,
			centerZ: f,
			distance: p,
			column: l,
			row: u
		});
	}
	return {
		...c,
		heightScale: a(.72, 1.28, S(c.column, c.row, r, 3)),
		facing: S(c.column, c.row, r, 4) * s,
		shade: a(.82, 1.15, S(c.column, c.row, r, 5)),
		bendScale: a(.7, 1.3, S(c.column, c.row, r, 6))
	};
}
function w(e, t, n) {
	let r = o((n - e) / (t - e), 0, 1);
	return r * r * (3 - 2 * r);
}
function T(t, n, r, i) {
	let { tileSize: c, origin: d, seed: f, terrainHeight: p, mask: m, density: g } = r, _ = e(u(f, t, n)), v = Math.min(h, Math.round(g * c * c)), y = [];
	for (let e = 0; e < v; e++) {
		let e = d[0] + (t + _()) * c, u = d[1] + (n + _()) * c, h = _(), g = _(), v = [
			_(),
			_(),
			_(),
			_(),
			_(),
			_(),
			_(),
			_()
		];
		if (h >= i) continue;
		let b = m ? o(m(e, u), 0, 1) : 1, S = x(e, u, r);
		if (g >= b * S.density) continue;
		let T = C(e, u, r.clumpSize, f), E = r.clumpStrength * .35;
		e = a(e, T.centerX, E), u = a(u, T.centerZ, E);
		let D = e - T.centerX, O = u - T.centerZ, k = Math.hypot(D, O) || 1, A = v[0] * s, j = a(Math.cos(A), D / k, r.clumpStrength), M = a(Math.sin(A), O / k, r.clumpStrength), N = Math.hypot(j, M) || 1, P = v[7] < r.stalks, F = !P && v[7] > .94, I = a(r.height[0], r.height[1], v[1]) * T.heightScale * S.height, L = Math.min(I * a(1.3, 1.6, v[3]), r.height[1] * 1.5), R = (P ? L : I) * b ** .35, z = w(.45, .8, l(e * .09, u * .09, f + 31)) * r.dryness, B = a(r.bend[0], r.bend[1], v[3]) * T.bendScale;
		y.push({
			x: e,
			z: u,
			y: p(e, u),
			keepKey: h,
			height: R,
			stalk: P,
			yaw: a(v[2] * s, T.facing, r.clumpStrength * .6),
			leanX: j / N,
			leanZ: M / N,
			bend: P ? B * .35 : F ? Math.min(1.6, B * 2.4 + .5) : B,
			shade: T.shade * S.lush * a(.85, 1.12, v[4]),
			hue: v[6] * 2 - 1,
			dryness: o(z + (v[5] < r.dryness * .25 ? .6 : 0), 0, 1)
		});
	}
	return y;
}
function E(e, t) {
	let r = e.height * (1 - e.bend * .45), i = e.height * e.bend, a = [
		0,
		e.height * .75,
		0
	], o = [
		e.leanX * i,
		r,
		e.leanZ * i
	], s = 1 - t;
	return {
		point: [
			0,
			1,
			2
		].map((e) => 2 * s * t * a[e] + t * t * o[e]),
		tangent: n([
			0,
			1,
			2
		].map((e) => 2 * s * a[e] + 2 * t * (o[e] - a[e])))
	};
}
function D(e, t, n) {
	if (e.stalk) {
		let i = r(n.base, r(n.tip, n.dry, .35), t ** .6), o = n.dry.map((e) => e * .5);
		return r(i, o, w(.62, .75, t)).map((n) => n * e.shade * a(.4, 1, w(0, .3, t)));
	}
	let i = r(n.base, n.tip, t ** .75), o = r(n.base.map((e) => e * 1.6), n.dry, t ** .6), s = r(i, o, e.dryness), c = a(.3, 1, w(0, .45, t)), l = [
		1 + e.hue * .14,
		1,
		1 - e.hue * .2
	];
	return s.map((t, n) => t * c * e.shade * l[n]);
}
function O(e) {
	return e <= y ? v : v + b * Math.sin(Math.PI * (e - y) / .30000000000000004);
}
function k(e, r, a, o, s, c) {
	let l = [
		Math.cos(r.yaw),
		0,
		Math.sin(r.yaw)
	], u = c.width * s.widthScale * (.7 + .6 * r.height / c.height[1]), d = [
		r.x - a,
		r.y,
		r.z - o
	], f = [];
	for (let a = 0; a <= s.segments; a++) {
		let o = a / s.segments, { point: p, tangent: m } = E(r, o), h = [
			d[0] + p[0],
			d[1] + p[1],
			d[2] + p[2]
		], v = n(t(l, m)), y = u * .5 * (r.stalk ? O(o) : 1 - o ** 1.7), b = D(r, o, c), x = (t) => {
			let r = n(v.map((e, n) => e + l[n] * t * g)), a = n(r.map((e, t) => e * .7 + i[t] * _)), s = h.map((e, n) => e + l[n] * t * y);
			return e.addVertex(s, a, (t + 1) / 2, 1 - o, b);
		};
		if (a === s.segments) {
			let t = n(v.map((e, t) => e * .7 + i[t] * _));
			f.push([e.addVertex(h, t, .5, 0, b)]);
		} else f.push([x(-1), x(1)]);
	}
	for (let t = 0; t < s.segments; t++) {
		let [n, r] = f[t], i = f[t + 1];
		i.length === 1 ? e.addTriangle(n, r, i[0]) : (e.addTriangle(n, r, i[0]), e.addTriangle(r, i[1], i[0]));
	}
}
function A(e) {
	let t = m[e.preset ?? "meadow"];
	if (!t) throw RangeError(`Unknown grass preset: ${e.preset}. Use ${Object.keys(m).join(", ")}.`);
	let n = {
		...t,
		...Object.fromEntries(Object.entries(e).filter(([, e]) => e !== void 0))
	}, { area: r } = n;
	if (!r || ![
		r.minX,
		r.maxX,
		r.minZ,
		r.maxZ
	].every(Number.isFinite) || r.maxX <= r.minX || r.maxZ <= r.minZ) throw TypeError("Grass area needs finite minX < maxX and minZ < maxZ.");
	if (!(n.density > 0)) throw RangeError("Grass density must be a positive number of blades per square metre.");
	if (!(n.tileSize > 0)) throw RangeError("Grass tileSize must be positive.");
	if (!Array.isArray(n.height) || !(n.height[0] > 0) || !(n.height[1] >= n.height[0])) throw RangeError("Grass height must be [minimum, maximum] in metres.");
	if (!(n.width > 0)) throw RangeError("Grass width must be positive.");
	for (let e of [
		"patchiness",
		"stalks",
		"dryness"
	]) if (!(n[e] >= 0 && n[e] <= 1)) throw RangeError(`Grass ${e} must be between 0 and 1.`);
	if (n.mask !== void 0 && typeof n.mask != "function") throw TypeError("Grass mask must be a function (x, z) => 0..1.");
	if (typeof n.terrainHeight != "function") throw TypeError("Grass terrainHeight must be a function (x, z) => y.");
	for (let e of [
		"base",
		"tip",
		"dry"
	]) if (!Array.isArray(n[e]) || n[e].length !== 3 || !n[e].every(Number.isFinite)) throw TypeError(`Grass ${e} colour must be three linear RGB numbers.`);
	return n.levels = n.levels ?? p, n.cullDistance = n.cullDistance ?? n.levels.at(-1).distance, n.origin = [r.minX, r.minZ], n;
}
function j(e = {}) {
	let t = A({
		tileSize: 4,
		seed: 1,
		terrainHeight: () => 0,
		castShadow: !1,
		...e
	}), n = {
		tag: "grass",
		color: [
			1,
			1,
			1
		],
		roughness: .8,
		metallic: 0,
		emission: 0,
		doubleSided: !0
	};
	function i(e, r) {
		let i = t.levels[r];
		(!e.cache.blades || e.cache.plannedKeep < i.keep) && (e.cache.blades = T(e.column, e.row, t, i.keep), e.cache.plannedKeep = i.keep);
		let a = c({ withColors: !0 });
		for (let n of e.cache.blades) n.keepKey < i.keep && k(a, n, e.tileX, e.tileZ, i, t);
		return a.vertexCount === 0 ? [] : [{
			name: `Grass tile ${e.column},${e.row}`,
			geometry: a.build(),
			matrix: d(e),
			material: n,
			castShadow: t.castShadow
		}];
	}
	let a = f({
		...t,
		buildParts: i
	});
	a.update(t.eye ?? [
		(t.area.minX + t.area.maxX) / 2,
		2,
		(t.area.minZ + t.area.maxZ) / 2
	]);
	let o = r(t.base, t.tip, .3);
	return {
		get parts() {
			return a.parts;
		},
		update: a.update,
		material: n,
		stats: a.stats,
		settings: t,
		groundColor: o
	};
}
export { p as GRASS_LEVELS, m as GRASS_PRESETS, j as createGrass };
