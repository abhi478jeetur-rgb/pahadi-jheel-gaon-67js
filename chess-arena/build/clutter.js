/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import "./world-material-shader.js";
import { a as e, d as t, f as n, h as r, m as i, p as a, s as o, t as s, u as c, y as l } from "./vegetation-geometry-9AtPgsCh.js";
import { n as u, r as d, t as f } from "./tile-field-CFW4-60z.js";
// src/clutter.js
var p = .04, m = Object.freeze([
	Object.freeze({
		distance: 12,
		keep: 1,
		detail: 1
	}),
	Object.freeze({
		distance: 30,
		keep: .2,
		detail: 0
	}),
	Object.freeze({
		distance: 70,
		keep: p,
		detail: 0
	})
]), h = Object.freeze({
	meadow: Object.freeze({
		pebbles: .8,
		rocks: .03,
		twigs: .08,
		leaves: .3,
		moss: .4
	}),
	forest: Object.freeze({
		pebbles: .5,
		rocks: .06,
		twigs: 1.2,
		leaves: 16,
		moss: .8
	}),
	riverbed: Object.freeze({
		pebbles: 14,
		rocks: .6,
		twigs: .15,
		leaves: .1,
		moss: .15
	}),
	scree: Object.freeze({
		pebbles: 12,
		rocks: 1.4,
		twigs: 0,
		leaves: 0,
		moss: .05
	})
}), g = Object.freeze({
	pebbleSize: [.012, .05],
	rockSize: [.08, .38],
	stoneColor: [
		.13,
		.125,
		.11
	],
	mossColor: [
		.06,
		.09,
		.025
	],
	soilColor: [
		.07,
		.055,
		.04
	],
	twigColor: [
		.11,
		.075,
		.045
	],
	leafColors: [
		[
			.2,
			.1,
			.035
		],
		[
			.32,
			.19,
			.05
		],
		[
			.1,
			.065,
			.03
		],
		[
			.14,
			.12,
			.04
		]
	],
	clumping: .6
}), _ = Object.freeze([
	"pebbles",
	"rocks",
	"twigs",
	"leaves"
]), v = 2e4, y = Object.freeze([Object.freeze({
	segments: 6,
	rings: 4
}), Object.freeze({
	segments: 12,
	rings: 7
})]), b = Object.freeze([Object.freeze({
	segments: 4,
	rings: 2
}), Object.freeze({
	segments: 6,
	rings: 4
})]);
function x(e, t, n) {
	let r = o((n - e) / (t - e), 0, 1);
	return r * r * (3 - 2 * r);
}
function S(e, t, n) {
	let i = .25, a = e(t + i, n) - e(t - i, n), o = e(t, n + i) - e(t, n - i);
	return r([
		-a,
		2 * i,
		-o
	]);
}
function C(e, t) {
	let i = r(n([
		Math.cos(t),
		0,
		Math.sin(t)
	], e));
	return {
		up: e,
		forward: r(n(e, i)),
		side: i
	};
}
function w(e, t, n) {
	return [
		0,
		1,
		2
	].map((r) => t[r] + e.forward[r] * n[0] + e.up[r] * n[1] + e.side[r] * n[2]);
}
function T(e, t, n, r) {
	let i = x(.3, .75, l(e * .15, t * .15, n.seed + r));
	return a(1, i * 2, n.clumping);
}
function E(e, n) {
	let r = [];
	return _.forEach((i, s) => {
		let c = n[i];
		if (!(c > 0)) return;
		let l = t(u(n.seed + s * 7907, e.column, e.row)), d = Math.min(v, Math.round(c * n.tileSize * n.tileSize * 2));
		for (let t = 0; t < d; t++) {
			let t = e.tileX + l() * n.tileSize, c = e.tileZ + l() * n.tileSize, u = l(), d = l(), f = [
				l(),
				l(),
				l(),
				l(),
				l(),
				l()
			], m = n.mask ? o(n.mask(t, c), 0, 1) : 1;
			if (u * 2 >= T(t, c, n, 131 + s * 17) * m) continue;
			let h = i === "rocks" ? d * p : a(p, 1, d);
			r.push({
				kind: i,
				x: t,
				z: c,
				keepKey: h,
				shapeRolls: f
			});
		}
	}), r;
}
function D(e, t) {
	let [n, r, i] = e, a = t.phases, o = 1 + t.roughness * (Math.sin(n * 2.6 + a[0]) * Math.sin(r * 2.6 + a[1]) + .5 * Math.sin(i * 4.4 + a[2]) * Math.cos(n * 3.4 + a[3]));
	for (let e of t.planes) {
		let t = n * e.normal[0] + r * e.normal[1] + i * e.normal[2];
		t > .05 && (o = Math.min(o, e.distance / t));
	}
	return o;
}
function O(e, t, n, r, o, s) {
	let c = a(.45, 1, x(-.6, .7, e[1])), d = a(.82, 1.12, (u(r.colorSeed, o, 3) & 1023) / 1023), f = l(t[0] * r.grain + t[1] * .7 * r.grain, t[2] * r.grain, r.colorSeed), p = a(.6, 1.25, f), m = r.base.map((e) => e * c * d * p), h = 1 - x(0, r.height * .35, n);
	return i(m, s.soilColor, h * .7);
}
function k(e, i, o, c, l) {
	let d = i.kind === "rocks", { segments: f, rings: p } = (d ? y : b)[l], m = i.shapeRolls, h = d ? c.rockSize : c.pebbleSize, g = a(h[0], h[1], m[0] ** 2.5), _ = t(u(c.seed, Math.floor(i.x * 977), Math.floor(i.z * 977))), v = {
		roughness: d ? .16 : .08,
		phases: [
			_() * s,
			_() * s,
			_() * s,
			_() * s
		],
		planes: [],
		colorSeed: u(c.seed + 17, Math.floor(i.x * 977), Math.floor(i.z * 977)),
		height: g * a(.45, .75, m[1])
	};
	if (d) for (let e = 0; e < 4; e++) {
		let e = _() * s, t = _() * 1.6 - .4;
		v.planes.push({
			normal: r([
				Math.cos(e),
				t,
				Math.sin(e)
			]),
			distance: a(.68, .9, _())
		});
	}
	let x = a(.55, 1.45, m[2]), T = m[3] * 2 - 1;
	v.base = c.stoneColor.map((e, t) => e * x * [
		1 + T * .25,
		1 + T * .04,
		1 - T * .3
	][t]), v.grain = a(2.5, 5, _());
	let E = [
		g * a(.75, 1.1, m[4]),
		v.height,
		g * a(.7, 1, m[5])
	], k = c.terrainHeight(i.x, i.z), A = C(S(c.terrainHeight, i.x, i.z), m[5] * s), j = a(.3, .5, m[1]), M = [
		i.x - o[0],
		k + v.height * (1 - 2 * j),
		i.z - o[1]
	], N = [[
		0,
		1,
		0
	]];
	for (let e = 1; e < p; e++) {
		let t = Math.PI * e / p;
		for (let e = 0; e < f; e++) {
			let n = s * e / f;
			N.push([
				Math.sin(t) * Math.cos(n),
				Math.cos(t),
				Math.sin(t) * Math.sin(n)
			]);
		}
	}
	N.push([
		0,
		-1,
		0
	]);
	let P = N.map((e) => {
		let t = D(e, v);
		return e.map((e, n) => e * t * E[n]);
	}), F = [], I = (e) => 1 + (e - 1) * f, L = N.length - 1;
	for (let e = 0; e < f; e++) {
		let t = (e + 1) % f;
		F.push([
			0,
			I(1) + t,
			I(1) + e
		]);
		for (let n = 1; n < p - 1; n++) {
			let r = I(n), i = I(n + 1);
			F.push([
				r + e,
				r + t,
				i + e
			]), F.push([
				r + t,
				i + t,
				i + e
			]);
		}
		let n = I(p - 1);
		F.push([
			n + e,
			n + t,
			L
		]);
	}
	let R = P.map(() => [
		0,
		0,
		0
	]);
	for (let [e, t, r] of F) {
		let i = [
			0,
			1,
			2
		].map((n) => P[t][n] - P[e][n]), a = [
			0,
			1,
			2
		].map((t) => P[r][t] - P[e][t]), o = n(i, a);
		for (let n of [
			e,
			t,
			r
		]) for (let e = 0; e < 3; e++) R[n][e] += o[e];
	}
	let z = e.vertexCount;
	P.forEach((t, n) => {
		let i = w(A, M, t), a = r(w(A, [
			0,
			0,
			0
		], r(R[n]))), o = O(a, t.map((e, t) => e / E[t]), i[1] - k, v, n, c);
		e.addVertex(i, a, 0, 0, o);
	});
	for (let [t, n, r] of F) e.addTriangle(z + t, z + n, z + r);
}
function A(t, n, r, i, o) {
	let c = n.shapeRolls, l = a(.1, .45, c[0] ** 1.5), u = a(.003, .011, c[1]) * (.6 + l), d = c[2] * s, f = (c[3] - .5) * .6, p = o ? 4 : 2, m = [], h = [];
	for (let e = 0; e < p; e++) {
		let t = e / (p - 1), o = d + f * t, s = (t - .5) * l, c = n.x + Math.cos(o) * s, g = n.z + Math.sin(o) * s, _ = u * a(1, .45, t);
		m.push([
			c - r[0],
			i.terrainHeight(c, g) + _ * .7,
			g - r[1]
		]), h.push(_);
	}
	let g = i.twigColor.map((e) => e * a(.7, 1.3, c[4]));
	e(t, m, h, o ? 5 : 3, 1, g);
}
function j(e, t, n, i, o) {
	let c = t.shapeRolls, l = a(.04, .1, c[0]), u = l * a(.4, .65, c[1]), d = u * a(.05, .45, c[2]), f = i.leafColors, p = f[Math.floor(c[3] * f.length) % f.length].map((e) => e * a(.75, 1.25, c[4])), m = i.terrainHeight(t.x, t.z), h = C(S(i.terrainHeight, t.x, t.z), c[5] * s), g = [
		t.x - n[0],
		m + .004,
		t.z - n[1]
	], _ = o ? 3 : 2, v = [];
	for (let t = 0; t < _; t++) {
		let n = t / (_ - 1), i = u * .5 * Math.sin(Math.PI * a(.08, 1, n)) ** .8, o = [];
		for (let t = -1; t <= 1; t++) {
			let a = d * t * t, s = [
				(n - .5) * l,
				a,
				t * i
			], c = r(w(h, [
				0,
				0,
				0
			], [
				0,
				1,
				-t * d / Math.max(i, 1e-4)
			])), u = t === 0 ? .82 : 1;
			o.push(e.addVertex(w(h, g, s), c, (t + 1) / 2, n, p.map((e) => e * u)));
		}
		v.push(o);
	}
	for (let t = 0; t < _ - 1; t++) for (let n = 0; n < 2; n++) e.addTriangle(v[t][n], v[t][n + 1], v[t + 1][n]), e.addTriangle(v[t][n + 1], v[t + 1][n + 1], v[t + 1][n]);
}
function M(e, t) {
	if (!Array.isArray(e) || e.length !== 2 || !(e[0] > 0) || !(e[1] >= e[0])) throw RangeError(`Clutter ${t} must be [minimum, maximum] in metres.`);
}
function N(e, t) {
	if (!Array.isArray(e) || e.length !== 3 || !e.every(Number.isFinite)) throw TypeError(`Clutter ${t} must be three linear RGB numbers.`);
}
function P(e) {
	let t = h[e.preset ?? "meadow"];
	if (!t) throw RangeError(`Unknown clutter preset: ${e.preset}. Use ${Object.keys(h).join(", ")}.`);
	let n = Object.fromEntries(Object.entries(e).filter(([, e]) => e !== void 0)), r = {
		tileSize: 4,
		seed: 1,
		terrainHeight: () => 0,
		castShadow: !0,
		...g,
		...t,
		...n
	}, { area: i } = r;
	if (!i || ![
		i.minX,
		i.maxX,
		i.minZ,
		i.maxZ
	].every(Number.isFinite) || i.maxX <= i.minX || i.maxZ <= i.minZ) throw TypeError("Clutter area needs finite minX < maxX and minZ < maxZ.");
	for (let e of _) if (!(r[e] >= 0)) throw RangeError(`Clutter ${e} must be a non-negative count per square metre.`);
	for (let e of ["moss", "clumping"]) if (!(r[e] >= 0 && r[e] <= 1)) throw RangeError(`Clutter ${e} must be between 0 and 1.`);
	if (!(r.tileSize > 0)) throw RangeError("Clutter tileSize must be positive.");
	M(r.pebbleSize, "pebbleSize"), M(r.rockSize, "rockSize");
	for (let e of [
		"stoneColor",
		"mossColor",
		"soilColor",
		"twigColor"
	]) N(r[e], e);
	if (!Array.isArray(r.leafColors) || r.leafColors.length === 0) throw TypeError("Clutter leafColors must be a non-empty list of colours.");
	if (r.leafColors.forEach((e, t) => N(e, `leafColors[${t}]`)), typeof r.terrainHeight != "function") throw TypeError("Clutter terrainHeight must be a function (x, z) => y.");
	if (r.mask !== void 0 && typeof r.mask != "function") throw TypeError("Clutter mask must be a function (x, z) => 0..1.");
	return r.levels = r.levels ?? m, r.cullDistance = r.cullDistance ?? r.levels.at(-1).distance, r;
}
function F(e = {}) {
	let t = P(e), n = {
		rock: {
			color: [
				1,
				1,
				1
			],
			roughness: .88,
			metallic: 0,
			emission: 0,
			moss: t.moss,
			mossColor: t.mossColor
		},
		pebble: {
			color: [
				1,
				1,
				1
			],
			roughness: .8,
			metallic: 0,
			emission: 0
		},
		litter: {
			color: [
				1,
				1,
				1
			],
			roughness: .8,
			metallic: 0,
			emission: 0,
			doubleSided: !0
		}
	};
	function r(e, r) {
		let i = t.levels[r];
		e.cache.items ??= E(e, t);
		let a = [e.tileX, e.tileZ], o = c({ withColors: !0 }), s = c({ withColors: !0 }), l = c({ withColors: !0 });
		for (let n of e.cache.items) n.keepKey >= i.keep || (n.kind === "rocks" ? k(o, n, a, t, i.detail) : n.kind === "pebbles" ? k(s, n, a, t, i.detail) : n.kind === "twigs" ? A(l, n, a, t, i.detail) : j(l, n, a, t, i.detail));
		let u = [], f = d(e);
		return o.vertexCount > 0 && u.push({
			name: `Clutter rocks ${e.column},${e.row}`,
			geometry: o.build(),
			matrix: f,
			material: n.rock,
			castShadow: t.castShadow
		}), s.vertexCount > 0 && u.push({
			name: `Clutter pebbles ${e.column},${e.row}`,
			geometry: s.build(),
			matrix: f,
			material: n.pebble,
			castShadow: t.castShadow
		}), l.vertexCount > 0 && u.push({
			name: `Clutter litter ${e.column},${e.row}`,
			geometry: l.build(),
			matrix: f,
			material: n.litter,
			castShadow: !1
		}), u;
	}
	let i = f({
		...t,
		buildParts: r
	});
	return i.update(t.eye ?? [
		(t.area.minX + t.area.maxX) / 2,
		2,
		(t.area.minZ + t.area.maxZ) / 2
	]), {
		get parts() {
			return i.parts;
		},
		update: i.update,
		stats: i.stats,
		materials: n,
		settings: t
	};
}
export { m as CLUTTER_LEVELS, h as CLUTTER_PRESETS, F as createClutter };
