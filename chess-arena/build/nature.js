/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { n as e, o as t } from "./mat4-BCZClxna.js";
import { i as n, n as r } from "./quat-Bl7gjwWK.js";
import { a as i, i as a, s as o, t as s } from "./geometry-C1ukZMAo.js";
import "./world-material-shader.js";
// src/nature.js
var c = Math.PI * 2, l = {
	low: {
		terrain: 48,
		ridge: 32,
		segments: 12,
		rings: 8,
		trees: 135,
		grass: 320,
		flowers: 60,
		rocks: 65
	},
	balanced: {
		terrain: 80,
		ridge: 48,
		segments: 16,
		rings: 10,
		trees: 215,
		grass: 720,
		flowers: 120,
		rocks: 105
	},
	high: {
		terrain: 112,
		ridge: 64,
		segments: 20,
		rings: 12,
		trees: 275,
		grass: 1050,
		flowers: 180,
		rocks: 145
	}
};
function u(e) {
	let t = e >>> 0;
	return () => {
		t += 1831565813;
		let e = Math.imul(t ^ t >>> 15, t | 1);
		return e ^= e + Math.imul(e ^ e >>> 7, e | 61), ((e ^ e >>> 14) >>> 0) / 4294967296;
	};
}
var d = Object.freeze({ radius: .16 }), f = Object.freeze({ radius: .12 }), p = Object.freeze({
	width: 1.2,
	height: .75,
	segments: 12
});
function m(t) {
	let n = i(p.segments);
	for (let e = 0; e < n.positions.length; e += 3) n.positions[e] = t[0] - p.width + (n.positions[e] + .5) * p.width, n.positions[e + 1] = t[1] - (.5 - n.positions[e + 1]) * p.height, n.positions[e + 2] = t[2];
	return {
		name: "Flag",
		geometry: n,
		matrix: e(),
		material: {
			...h("cloth", [
				.64,
				.09,
				.06
			], .78),
			doubleSided: !0
		}
	};
}
function h(e, t, n = .9, r = 0) {
	return {
		tag: e,
		color: t,
		roughness: n,
		metallic: r,
		emission: 0
	};
}
function g(e, t, n) {
	return {
		positions: new Float32Array(e),
		normals: new Float32Array(t),
		indices: new Uint32Array(n)
	};
}
function _(i, a = [
	1,
	1,
	1
], o = [
	0,
	0,
	0
]) {
	let s = n(r(), ...o.map((e) => e * 180 / Math.PI));
	return t(e(), s, i, a);
}
function v(e, t, n, r) {
	let i = o(e, t);
	function a(e, t, i) {
		return 1 + r * (Math.sin(e * n + t * 2) * Math.sin(i * n * .9 + t * n * .7) + .55 * Math.cos(i * n * 1.3 - e * n * .6) * Math.cos(t * n));
	}
	let s = .001;
	for (let e = 0; e < i.positions.length; e += 3) {
		let t = Array.from(i.positions.subarray(e, e + 3)), n = a(...t), r = t.map((e, n) => {
			let r = [...t], i = [...t];
			return r[n] = e - s, i[n] = e + s, (a(...i) - a(...r)) / (2 * s);
		}), o = r.reduce((e, n, r) => e + n * t[r], 0), c = t.map((e, t) => n * e - (r[t] - o * e)), l = Math.hypot(...c);
		for (let r = 0; r < 3; r++) i.positions[e + r] = t[r] * n, i.normals[e + r] = c[r] / l;
	}
	return i;
}
function y(e, t, n, r, i) {
	let a = [], o = [], s = [], c = .04;
	for (let s = 0; s <= t; s++) {
		let l = n[1] + (r[1] - n[1]) * s / t;
		for (let t = 0; t <= e; t++) {
			let s = n[0] + (r[0] - n[0]) * t / e, u = (i(s + c, l) - i(s - c, l)) / (2 * c), d = (i(s, l + c) - i(s, l - c)) / (2 * c), f = Math.hypot(u, 1, d);
			a.push(s, i(s, l), l), o.push(-u / f, 1 / f, -d / f);
		}
	}
	for (let n = 0; n < t; n++) for (let t = 0; t < e; t++) {
		let r = n * (e + 1) + t, i = r + e + 1;
		s.push(r, i, r + 1, r + 1, i, i + 1);
	}
	return g(a, o, s);
}
function b(e, t, n) {
	let r = [], i = [], a = [];
	for (let o = 0; o <= e; o++) {
		let s = -63 + 95 * o / e, c = t(s), l = n(s);
		if (r.push(c - l, .22, s, c + l, .22, s), i.push(0, 1, 0, 0, 1, 0), o < e) {
			let e = o * 2;
			a.push(e, e + 2, e + 1, e + 1, e + 2, e + 3);
		}
	}
	return g(r, i, a);
}
function x(e, t, n = !1) {
	let r = [], i = [], a = [];
	for (let o = 0; o < e; o++) {
		let e = o * 2.399963, s = (n ? 1.8 : .65) * (.72 + .28 * Math.sin(o * 4.3 + 2) ** 2), c = n ? .22 : .38, l = n ? .022 : .043, u = Math.cos(e) * .12, d = Math.sin(e) * .12;
		for (let n of [1, -1]) {
			let o = r.length / 3;
			for (let a = 0; a <= t; a++) {
				let o = a / t, f = l * (1 - o * .94), p = 2 * c * o / s, m = Math.hypot(1, p);
				for (let t of [-1, 1]) r.push(u + Math.cos(e) * c * o ** 2 - Math.sin(e) * f * t, s * o, d + Math.sin(e) * c * o ** 2 + Math.cos(e) * f * t), i.push(n * Math.cos(e) / m, -n * p / m, n * Math.sin(e) / m);
			}
			for (let e = 0; e < t; e++) {
				let t = o + e * 2;
				n > 0 ? a.push(t, t + 2, t + 1, t + 1, t + 2, t + 3) : a.push(t, t + 1, t + 2, t + 1, t + 3, t + 2);
			}
		}
	}
	return g(r, i, a);
}
function S(e) {
	let t = [], n = [], r = [];
	for (let i = 0; i < 6; i++) {
		let a = i * c / 5, o = i === 5 ? [
			.06,
			.035,
			.06
		] : [
			.105,
			.025,
			.055
		], s = _(i === 5 ? [
			0,
			.025,
			0
		] : [
			Math.cos(a) * .085,
			0,
			Math.sin(a) * .085
		], o, [
			0,
			-a,
			0
		]), l = t.length / 3;
		for (let r = 0; r < e.positions.length; r += 3) {
			let i = Array.from(e.positions.subarray(r, r + 3));
			for (let e = 0; e < 3; e++) t.push(s[e] * i[0] + s[e + 4] * i[1] + s[e + 8] * i[2] + s[e + 12]);
			let c = Array.from(e.normals.subarray(r, r + 3)).map((e, t) => e / o[t]), l = [
				Math.cos(a) * c[0] - Math.sin(a) * c[2],
				c[1],
				Math.sin(a) * c[0] + Math.cos(a) * c[2]
			], u = Math.hypot(...l);
			n.push(...l.map((e) => e / u));
		}
		r.push(...Array.from(e.indices, (e) => e + l));
	}
	return g(t, n, r);
}
function ee(e) {
	let t = [
		Infinity,
		Infinity,
		Infinity
	], n = [
		-Infinity,
		-Infinity,
		-Infinity
	];
	for (let r of e) {
		let e = r.geometry.positions, i = r.matrix;
		for (let r = 0; r < e.length; r += 3) for (let a = 0; a < 3; a++) {
			let o = i[a] * e[r] + i[a + 4] * e[r + 1] + i[a + 8] * e[r + 2] + i[a + 12];
			t[a] = Math.min(t[a], o), n[a] = Math.max(n[a], o);
		}
	}
	return {
		minimum: t,
		maximum: n
	};
}
function C({ seed: e = 67, detail: t = "balanced" } = {}) {
	if (!Number.isFinite(e)) throw TypeError("Nature seed must be a finite number.");
	if (!Object.hasOwn(l, t)) throw RangeError(`Unknown nature detail: ${t}`);
	let n = l[t], r = u(e), i = r() * c, p = [], g = [
		h("foliage", [
			.065,
			.19,
			.035
		]),
		h("foliage", [
			.11,
			.27,
			.048
		]),
		h("foliage", [
			.16,
			.32,
			.065
		]),
		h("foliage", [
			.042,
			.13,
			.068
		]),
		h("foliage", [
			.075,
			.22,
			.1
		])
	], C = [
		h("grass", [
			.18,
			.31,
			.045
		]),
		h("grass", [
			.28,
			.39,
			.08
		]),
		h("grass", [
			.11,
			.24,
			.034
		])
	], w = [
		h("rock", [
			.23,
			.26,
			.23
		]),
		h("rock", [
			.32,
			.34,
			.28
		]),
		h("rock", [
			.17,
			.21,
			.2
		])
	], T = h("wood", [
		.12,
		.068,
		.029
	]), E = h("wood", [
		.62,
		.61,
		.5
	]), D = [
		h("foliage", [
			.7,
			.46,
			.07
		]),
		h("foliage", [
			.36,
			.13,
			.45
		]),
		h("foliage", [
			.77,
			.72,
			.53
		])
	], O = v(n.segments, n.rings, 8, .065), k = v(10, 6, 5, .055), A = a(10), j = v(12, 8, 4, .11), M = x(7, t === "low" ? 3 : 5), N = x(5, 5, !0), P = S(o(8, 5));
	function F(e, t, n, r, i, a, o) {
		let s = {
			name: e,
			geometry: t,
			matrix: _(n, r, a),
			material: i
		};
		o && (s.blend = o), p.push(s);
	}
	function I(e) {
		return Math.sin(e * .09 + .7) * 3.7 + Math.sin(e * .034) * 3;
	}
	function L(e) {
		return 2.3 + .6 * Math.sin(e * .07 + 1) + Math.max(0, e) * .028;
	}
	function R(e, t) {
		let n = Math.abs(e - I(t)) - L(t);
		return -.52 + Math.max(0, Math.min(1, n / 1.6)) * (.65 + .28 * Math.sin(e * .23 + i) * Math.cos(t * .16) + .16 * Math.sin(t * .43 + e * .34) + Math.max(0, n - 4) ** 1.6 * .025 + .52);
	}
	F("Wildflower valley", y(n.terrain, n.terrain, [-42, -63], [42, 32], R), [
		0,
		0,
		0
	], [
		1,
		1,
		1
	], h("terrain", [
		.135,
		.23,
		.052
	])), F("Silverwater stream", b(n.terrain * 3, I, L), [
		0,
		0,
		0
	], [
		1,
		1,
		1
	], h("water", [
		.034,
		.18,
		.19
	], .13, .32));
	for (let e = 2; e >= 0; e--) {
		let t = -77 - e * 33, r = i + e * 2.7, a = y(n.ridge * 2, n.ridge, [-115, t - 30], [115, t + 30], (n, i) => {
			let a = (i - t) / 25, o = 13 + e * 4 + 9 * Math.sin(n * .047 + r) ** 2 + 6 * Math.cos(n * .083 - r) ** 4, s = e === 0 ? 1 - .65 * Math.exp(-(((n + 3) / 17) ** 2)) : 1, c = 1.4 * Math.sin(n * .42 + i * .29) + .7 * Math.cos(n * .77 - i * .38);
			return -.6 + Math.exp(-(a ** 2)) * (o * s + c);
		});
		if (F(`Alpine ridge ${e + 1}`, a, [
			0,
			0,
			0
		], [
			1,
			1,
			1
		], h("rock", [
			[
				.11,
				.18,
				.12
			],
			[
				.19,
				.27,
				.27
			],
			[
				.29,
				.36,
				.39
			]
		][e])), e > 0) {
			let t = [], n = 25 + e * 2;
			for (let e = 0; e < a.indices.length; e += 3) {
				let r = Array.from(a.indices.subarray(e, e + 3));
				r.every((e) => a.positions[e * 3 + 1] > n + Math.sin(a.positions[e * 3] * .24) * 1.2) && t.push(...r);
			}
			if (t.length) {
				let n = {
					positions: a.positions,
					normals: a.normals,
					indices: new Uint32Array(t)
				};
				F(`Snowfields ${e + 1}`, n, [
					0,
					.025,
					0
				], [
					1,
					1,
					1
				], h("rock", [
					.77,
					.81,
					.79
				], .76));
			}
		}
	}
	function z(e, t, n, i, a) {
		let o = R(e, t), s = n * (i ? .033 : .047);
		F(`Tree ${a} trunk`, A, [
			e,
			o + n * .44,
			t
		], [
			s,
			n * .88,
			s
		], i ? T : E, [
			.025,
			r() * c,
			.035
		], f);
		let l = t < -29 ? k : O, u = r() * c;
		if (i) for (let i = 0; i < 6; i++) {
			let s = i / 6, c = n * (.25 - s * .17), d = u + i * 2.4;
			F(`Tree ${a} needles ${i}`, l, [
				e + Math.cos(d) * c * .15,
				o + n * (.27 + s * .73),
				t + Math.sin(d) * c * .15
			], [
				c,
				n * .18,
				c * (.8 + r() * .2)
			], g[3 + i % 2], [
				.06,
				d,
				-.07
			]);
		}
		else for (let i = 0; i < 7; i++) {
			let s = u + i * 2.399963, c = n * (.19 + r() * .08), d = i === 6 ? 0 : n * .19;
			F(`Tree ${a} crown ${i}`, l, [
				e + Math.cos(s) * d,
				o + n * (.69 + r() * .22),
				t + Math.sin(s) * d
			], [
				c * (.85 + r() * .3),
				c * (.75 + r() * .3),
				c
			], g[i % 3], [
				r() * .3,
				s,
				r() * .2
			]);
		}
	}
	z(-10, 9, 7.4, !1, "river birch"), z(-14, 5, 8.2, !1, "companion birch"), z(13, -7, 7.7, !0, "sentinel pine");
	let B = 0;
	for (let e = 0; B < n.trees && e < n.trees * 12; e++) {
		let e = -56 + r() * 75, t = -35 + r() * 70;
		Math.abs(t - I(e)) < L(e) + 3 || e > 6 && t > 1 || Math.sin(t * .26 + e * .15 + i) * Math.cos(e * .23) < -.35 && r() < .83 || (z(t, e, 3.2 + r() * 4.2, r() < .62, B), B++);
	}
	let V = 0;
	for (let e = 0; V < n.grass && e < n.grass * 8; e++) {
		let e = -34 + r() * 61, t = -24 + r() * 49, n = Math.abs(t - I(e)) - L(e);
		if (n < .6) continue;
		let i = R(t, e), a = .5 + r() * .8, o = n < 1.5 && r() < .65;
		F(`Meadow tuft ${V}`, o ? N : M, [
			t,
			i - .015,
			e
		], [
			a,
			a,
			a
		], C[V % C.length], [
			0,
			r() * c,
			0
		]), V++;
	}
	for (let e = 0; e < n.rocks; e++) {
		let t = -48 + r() * 77, n = e % 2 ? -1 : 1, i = I(t) + n * (L(t) + r() * 2.4), a = .15 + r() ** 2 * .95, o = R(i, t);
		F(`River stone ${e}`, j, [
			i,
			o + a * .19,
			t
		], [
			a * 1.3,
			a * .64,
			a
		], w[e % w.length], [
			r() * .3,
			r() * c,
			r() * .4
		], d);
	}
	F("Glacial boulder", j, [
		-7.8,
		R(-7.8, 12) + .6,
		12
	], [
		2.3,
		1.25,
		1.65
	], w[1], [
		.1,
		.4,
		.2
	], d), F("Moss on glacial boulder", v(12, 8, 4, .11), [
		-7.85,
		R(-7.8, 12) + 1.56,
		12
	], [
		1.65,
		.25,
		1.14
	], g[0], [
		.1,
		.4,
		.2
	]);
	let H = a(10), U = [
		[-7, 16],
		[8, 4],
		[-11, -3],
		[4, -18]
	];
	for (let e = 0; e < n.flowers; e++) {
		let t = U[e % U.length], n = t[0] + (r() - .5) * 7, i = t[1] + (r() - .5) * 6;
		if (Math.abs(n - I(i)) < L(i) + .7) continue;
		let a = R(n, i), o = .3 + r() * .36;
		F(`Wildflower ${e} stem`, H, [
			n,
			a + o / 2,
			i
		], [
			.013,
			o,
			.013
		], C[2]), F(`Wildflower ${e} blossom`, P, [
			n,
			a + o,
			i
		], [
			1,
			1,
			1
		], D[e % D.length], [
			.1,
			r() * c,
			.12
		]);
	}
	let W = I(-2), G = L(-2) * 2 + 3.4, K = s(.045, 2), te = a(6, 0, 1), q = h("wood", [
		.26,
		.13,
		.045
	], .66), J = h("wood", [
		.34,
		.19,
		.065
	], .72), Y = h("metal", [
		.09,
		.1,
		.095
	], .38, .75);
	for (let e = 0; e < 36; e++) {
		let t = W - G / 2 + (e + .5) * G / 36;
		F(`Footbridge plank ${e}`, K, [
			t,
			1.2,
			-2
		], [
			G / 36 * .93,
			.14,
			1.7
		], e % 3 ? q : J);
		for (let n of [-1, 1]) F(`Footbridge nail ${e} ${n}`, te, [
			t,
			1.277,
			-2 + n * .58
		], [
			.018,
			.018,
			.018
		], Y);
	}
	for (let e of [-1, 1]) {
		F(`Bridge support ${e}`, K, [
			W,
			1.04,
			-2 + e * .6
		], [
			G + .3,
			.26,
			.22
		], q), F(`Bridge handrail ${e}`, K, [
			W,
			2.26,
			-2 + e * .88
		], [
			G + .3,
			.12,
			.13
		], J), F(`Bridge lower rail ${e}`, K, [
			W,
			1.73,
			-2 + e * .88
		], [
			G,
			.08,
			.1
		], q);
		for (let t = 0; t < 7; t++) {
			let n = W - G / 2 + t * G / 6;
			F(`Bridge post ${e} ${t}`, K, [
				n,
				1.15,
				-2 + e * .88
			], [
				.13,
				2.24,
				.13
			], q), F(`Bridge post cap ${e} ${t}`, K, [
				n,
				2.3,
				-2 + e * .88
			], [
				.21,
				.08,
				.21
			], Y);
		}
	}
	let X = W + G / 2, Z = -1.12;
	F("Flagpole", a(10), [
		X,
		3.3,
		Z
	], [
		.06,
		2,
		.06
	], q);
	let Q = m([
		X - .03,
		4.25,
		Z
	]);
	p.push(Q);
	let $ = {
		eye: [
			15,
			8,
			23
		],
		target: [
			-2,
			2,
			-12
		]
	};
	return {
		name: "Silverwater valley",
		description: "A winding alpine stream, sunlit birches, wildflower meadows and distant snowfields.",
		parts: p,
		flag: Q,
		camera: $,
		bounds: ee(p),
		environment: {
			fogColor: [
				.16,
				.23,
				.26
			],
			fogDensity: .0045,
			skyTop: [
				.24,
				.48,
				.7
			],
			skyBottom: [
				.78,
				.86,
				.87
			],
			lightDirection: [
				-.46,
				.77,
				.44
			]
		},
		points: [
			{
				name: "Valley overlook",
				...$
			},
			{
				name: "By the water",
				eye: [
					7,
					2.4,
					14
				],
				target: [
					-3,
					1.5,
					-15
				]
			},
			{
				name: "Birch grove",
				eye: [
					-18,
					4,
					17
				],
				target: [
					-3,
					3,
					-7
				]
			},
			{
				name: "Mountain air",
				eye: [
					23,
					15,
					-4
				],
				target: [
					-5,
					5,
					-50
				]
			},
			{
				name: "Footbridge",
				eye: [
					W + 8,
					3.4,
					9
				],
				target: [
					W,
					1.2,
					-2
				]
			}
		]
	};
}
export { p as FLAG_SIZE, C as createNatureWorld };
