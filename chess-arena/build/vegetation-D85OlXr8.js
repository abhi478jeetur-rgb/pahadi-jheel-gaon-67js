/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import "./world-material-shader.js";
import { n as e, o as t } from "./mat4-BCZClxna.js";
import { d as n, n as r } from "./quat-Bl7gjwWK.js";
import { _ as i, a, b as o, c as s, d as c, f as l, g as u, h as d, i as f, l as p, m, n as h, o as g, p as _, r as v, s as y, t as b, u as x, v as S, y as C } from "./vegetation-geometry-9AtPgsCh.js";
import { h as w, o as T } from "./shader-registry-DHYkwAg5.js";
// src/tree-sky.js
var E = 14, D = .3, O = .04, k = 2, A = j();
function j() {
	let e = [[
		0,
		1,
		0
	]];
	for (let [t, n] of [[40, 0], [65, 45]]) {
		let r = Math.sin(t * Math.PI / 180), i = Math.cos(t * Math.PI / 180);
		for (let t = 0; t < 4; t++) {
			let a = (n + t * 90) * Math.PI / 180;
			e.push([
				r * Math.cos(a),
				i,
				r * Math.sin(a)
			]);
		}
	}
	return e;
}
function M(e) {
	let t = [
		Infinity,
		Infinity,
		Infinity
	], n = [
		-Infinity,
		-Infinity,
		-Infinity
	];
	for (let r = 0; r < e.length; r += 3) for (let i = 0; i < 3; i++) t[i] = Math.min(t[i], e[r + i]), n[i] = Math.max(n[i], e[r + i]);
	return {
		minimum: t,
		maximum: n
	};
}
function N(e) {
	let { minimum: t, maximum: n } = M(e), r = Math.max(n[0] - t[0], n[1] - t[1], n[2] - t[2], 1e-6) / E, i = [
		0,
		1,
		2
	].map((e) => Math.floor((n[e] - t[e]) / r) + 1), a = new Float32Array(i[0] * i[1] * i[2]), o = (e, n) => Math.floor((e - t[n]) / r), s = (e, t) => Math.min(i[t] - 1, Math.max(0, o(e, t)));
	for (let t = 0; t < e.length; t += 3) {
		let n = (o(e[t + 2], 2) * i[1] + o(e[t + 1], 1)) * i[0] + o(e[t], 0);
		a[n] += D;
	}
	let c = r / k, l = new Float32Array(a.length).fill(NaN);
	function u(e, n, s) {
		let l = [
			t[0] + (e + .5) * r,
			t[1] + (n + .5) * r,
			t[2] + (s + .5) * r
		], u = 0;
		for (let e of A) {
			let t = 0;
			for (let n = 0;; n += c) {
				let r = o(l[0] + e[0] * n, 0), s = o(l[1] + e[1] * n, 1), c = o(l[2] + e[2] * n, 2);
				if (r < 0 || c < 0 || r >= i[0] || s >= i[1] || c >= i[2]) break;
				t += a[(c * i[1] + s) * i[0] + r] / k;
			}
			u += Math.exp(-t);
		}
		return Math.max(O, u / A.length);
	}
	function d(e) {
		let t = e.length / 3, n = new Float32Array(t);
		for (let r = 0; r < t; r++) {
			let t = s(e[r * 3], 0), a = s(e[r * 3 + 1], 1), o = s(e[r * 3 + 2], 2), c = (o * i[1] + a) * i[0] + t;
			Number.isNaN(l[c]) && (l[c] = u(t, a, o)), n[r] = l[c];
		}
		return n;
	}
	return { visibilityOf: d };
}
function P(e, t) {
	let n = new Float32Array(e.length / 3);
	for (let r = 0; r < t.length; r += 3) {
		let [i, a, o] = [
			t[r],
			t[r + 1],
			t[r + 2]
		], s = [
			e[a * 3] - e[i * 3],
			e[a * 3 + 1] - e[i * 3 + 1],
			e[a * 3 + 2] - e[i * 3 + 2]
		], c = [
			e[o * 3] - e[i * 3],
			e[o * 3 + 1] - e[i * 3 + 1],
			e[o * 3 + 2] - e[i * 3 + 2]
		], l = s[1] * c[2] - s[2] * c[1], u = s[2] * c[0] - s[0] * c[2], d = s[0] * c[1] - s[1] * c[0], f = Math.hypot(l, u, d) / 6;
		n[i] += f, n[a] += f, n[o] += f;
	}
	return n;
}
function F(e, t) {
	let n = 0, r = 0;
	for (let i = 0; i < e.length; i++) n += e[i] * t[i], r += t[i];
	return r > 0 ? n / r : 0;
}
function ee(e, t, n) {
	return I(e, t / F(e, n));
}
function I(e, t) {
	return e.map((e) => Math.min(1, Math.max(O, e * t)));
}
// src/tree-level-gains.js
var L = {
	palm: {
		areaExponent: .6,
		2: {
			color: 2.449,
			sky: 3.373,
			area: .8953
		},
		3: {
			color: 2.492,
			sky: 3.613,
			area: 1.7062
		}
	},
	broadleaf: {
		areaExponent: .45,
		2: {
			color: 1.832,
			sky: 1.644,
			area: .5478
		},
		3: {
			color: 1.835,
			sky: 1.869,
			area: 1.3587
		}
	},
	conifer: {
		areaExponent: .8,
		2: {
			color: 1.121,
			sky: 10.132,
			area: .1494
		},
		3: {
			color: 1.21,
			sky: 11.362,
			area: .9604
		}
	},
	birch: {
		areaExponent: .7,
		2: {
			color: 1.528,
			sky: 2.251,
			area: .7787
		},
		3: {
			color: 1.615,
			sky: 2.49,
			area: 1.5896
		}
	},
	bush: {
		areaExponent: .35,
		2: {
			color: 1.472,
			sky: .978,
			area: -1.4443
		},
		3: {
			color: 1.418,
			sky: 1.47,
			area: -.6334
		}
	}
}, R = [
	[0, 0],
	[.28, .85],
	[.62, .95],
	[1, 0]
], te = {
	broadleaf: {
		label: "Broadleaf (oak-like)",
		height: [8, 11],
		trunkRadiusRatio: .03,
		rootFlare: 1.45,
		bark: {
			texture: "rough",
			tint: [
				.5,
				.4,
				.31
			]
		},
		sides: [
			10,
			7,
			5,
			4
		],
		levels: [
			{
				segments: 8,
				gnarl: .09,
				tropism: .02,
				tipRadius: .4,
				lean: .07,
				lengthScale: .66,
				children: {
					count: [6, 8],
					start: .34,
					end: .97,
					angle: [.7, 1.15],
					lengthRatio: [.42, .58],
					radiusRatio: .52,
					profile: "crown"
				}
			},
			{
				segments: 5,
				gnarl: .16,
				tropism: .1,
				tipRadius: .35,
				children: {
					count: [3, 4],
					start: .3,
					end: .95,
					angle: [.55, .95],
					lengthRatio: [.4, .6],
					radiusRatio: .55
				}
			},
			{
				segments: 3,
				gnarl: .2,
				tropism: .04,
				tipRadius: .4,
				children: {
					count: [2, 4],
					start: .3,
					end: 1,
					angle: [.5, .9],
					lengthRatio: [.35, .55],
					radiusRatio: .6
				}
			},
			{
				segments: 2,
				gnarl: .25,
				tropism: -.02,
				tipRadius: .3
			}
		],
		leaf: {
			texture: "sprig",
			color: [
				64,
				110,
				36
			],
			foliageColor: [
				.085,
				.24,
				.04
			],
			tint: [
				1.05,
				1,
				.85
			],
			sitesPerMeter: 5,
			start: .2,
			upBias: .35,
			meshLength: .62,
			meshWidth: .4,
			meshPerSite: 4,
			meshSpread: .75,
			profile: R,
			droop: .28,
			fold: .14,
			cardSize: [1.05, 1.1],
			cardsPerSite: 2
		}
	},
	birch: {
		label: "Birch",
		height: [9, 12],
		trunkRadiusRatio: .018,
		rootFlare: 1.35,
		bark: {
			texture: "birch",
			tint: [
				.95,
				.94,
				.88
			]
		},
		sides: [
			8,
			6,
			4,
			4
		],
		levels: [
			{
				segments: 10,
				gnarl: .05,
				tropism: .02,
				tipRadius: .3,
				lean: .05,
				lengthScale: .84,
				children: {
					count: [9, 12],
					start: .3,
					end: .98,
					angle: [.42, .8],
					lengthRatio: [.2, .34],
					radiusRatio: .38,
					profile: "crown"
				}
			},
			{
				segments: 5,
				gnarl: .12,
				tropism: .06,
				tipRadius: .35,
				children: {
					count: [3, 4],
					start: .25,
					end: .95,
					angle: [.5, .9],
					lengthRatio: [.4, .55],
					radiusRatio: .55
				}
			},
			{
				segments: 3,
				gnarl: .14,
				tropism: -.12,
				tipRadius: .4,
				children: {
					count: [2, 4],
					start: .3,
					end: 1,
					angle: [.5, .9],
					lengthRatio: [.4, .55],
					radiusRatio: .6
				}
			},
			{
				segments: 3,
				gnarl: .16,
				tropism: -.22,
				tipRadius: .3
			}
		],
		leaf: {
			texture: "sprig",
			color: [
				112,
				150,
				52
			],
			foliageColor: [
				.2,
				.34,
				.06
			],
			tint: [
				1.05,
				1.02,
				.85
			],
			sitesPerMeter: 5,
			start: .15,
			upBias: .1,
			meshLength: .42,
			meshWidth: .26,
			meshPerSite: 3,
			meshSpread: .8,
			profile: R,
			droop: .3,
			fold: .12,
			cardSize: [.8, .85],
			cardsPerSite: 2
		}
	},
	conifer: {
		label: "Conifer (spruce-like)",
		height: [11, 15],
		trunkRadiusRatio: .021,
		rootFlare: 1.5,
		bark: {
			texture: "rough",
			tint: [
				.38,
				.27,
				.2
			]
		},
		sides: [
			10,
			5,
			4,
			3
		],
		levels: [
			{
				segments: 12,
				gnarl: .015,
				tropism: 0,
				tipRadius: .06,
				lean: .02,
				lengthScale: .93,
				children: {
					whorls: 13,
					perWhorl: [4, 6],
					start: .14,
					end: .98,
					angle: [1.3, 1.6],
					lengthRatio: [.27, .33],
					radiusRatio: .34,
					profile: "cone"
				}
			},
			{
				segments: 5,
				gnarl: .05,
				tropism: -.1,
				tipRadius: .3,
				children: {
					count: [6, 8],
					start: .12,
					end: .95,
					angle: [.95, 1.2],
					lengthRatio: [.2, .3],
					radiusRatio: .5,
					profile: "cone"
				}
			},
			{
				segments: 2,
				gnarl: .05,
				tropism: -.08,
				tipRadius: .4
			}
		],
		leaf: {
			texture: "needles",
			color: [
				34,
				78,
				52
			],
			foliageColor: [
				.03,
				.12,
				.07
			],
			tint: [
				.9,
				1,
				.95
			],
			sitesPerMeter: 3,
			start: .1,
			upBias: .15,
			meshLength: .7,
			meshWidth: .36,
			meshPerSite: 1,
			meshSpread: 0,
			profile: [
				[0, 0],
				[.12, .55],
				[.22, .4],
				[.36, .85],
				[.48, .6],
				[.62, 1],
				[.76, .7],
				[.9, .5],
				[1, 0]
			],
			droop: .18,
			fold: .1,
			cardSize: [.95, .95],
			cardsPerSite: 2
		}
	},
	palm: {
		label: "Palm",
		height: [6, 9],
		trunkRadiusRatio: .026,
		rootFlare: 1.4,
		bark: {
			texture: "rough",
			tint: [
				.46,
				.4,
				.33
			]
		},
		sides: [
			10,
			4,
			3,
			3
		],
		levels: [{
			segments: 12,
			gnarl: .015,
			tropism: 0,
			tipRadius: .62,
			lean: .14,
			children: {
				count: [11, 14],
				start: 1,
				end: 1,
				angle: [.2, 1.75],
				lengthRatio: [.36, .46],
				radiusRatio: .1
			}
		}, {
			segments: 8,
			gnarl: .015,
			tropism: -.42,
			tipRadius: .3,
			pairedLeaves: !0
		}],
		leaf: {
			texture: "single",
			color: [
				70,
				118,
				40
			],
			foliageColor: [
				.1,
				.27,
				.04
			],
			tint: [
				1.05,
				1,
				.9
			],
			sitesPerMeter: 7,
			start: .14,
			upBias: 0,
			meshLength: .95,
			meshWidth: .16,
			meshPerSite: 1,
			meshSpread: 0,
			profile: [
				[0, 0],
				[.3, .7],
				[.65, .75],
				[1, 0]
			],
			droop: .35,
			fold: .1,
			cardSize: [.28, 1.1],
			cardsPerSite: 1
		}
	},
	bush: {
		label: "Bush",
		height: [1.1, 1.9],
		trunkRadiusRatio: .018,
		rootFlare: 1.2,
		bark: {
			texture: "rough",
			tint: [
				.4,
				.32,
				.25
			]
		},
		sides: [
			5,
			4,
			3,
			3
		],
		levels: [
			{
				segments: 3,
				gnarl: .05,
				tropism: 0,
				tipRadius: .8,
				lean: 0,
				lengthScale: .28,
				children: {
					count: [7, 10],
					start: .5,
					end: 1,
					angle: [.35, .85],
					lengthRatio: [2, 2.8],
					radiusRatio: .55
				}
			},
			{
				segments: 4,
				gnarl: .18,
				tropism: .1,
				tipRadius: .4,
				children: {
					count: [3, 4],
					start: .3,
					end: 1,
					angle: [.6, 1],
					lengthRatio: [.35, .5],
					radiusRatio: .6
				}
			},
			{
				segments: 2,
				gnarl: .2,
				tropism: .02,
				tipRadius: .4,
				children: {
					count: [2, 3],
					start: .3,
					end: 1,
					angle: [.6, 1],
					lengthRatio: [.45, .65],
					radiusRatio: .6
				}
			},
			{
				segments: 2,
				gnarl: .2,
				tropism: 0,
				tipRadius: .4
			}
		],
		leaf: {
			texture: "sprig",
			color: [
				54,
				104,
				40
			],
			foliageColor: [
				.06,
				.2,
				.045
			],
			tint: [
				1,
				1,
				.9
			],
			sitesPerMeter: 9,
			start: .1,
			upBias: .3,
			meshLength: .22,
			meshWidth: .14,
			meshPerSite: 3,
			meshSpread: .9,
			profile: R,
			droop: .25,
			fold: .12,
			cardSize: [.4, .42],
			cardsPerSite: 2,
			clumpScale: .5,
			clumpCanopyBlend: .3
		}
	}
}, ne = [
	{
		sideScale: 1,
		leafKeep: 1,
		leafScale: 1,
		maximumBranchLevel: Infinity
	},
	{
		sideScale: .6,
		leafKeep: .34,
		leafScale: 1.7,
		maximumBranchLevel: -1
	},
	{
		sideScale: .4,
		leafKeep: 0,
		leafScale: 1,
		maximumBranchLevel: 1
	},
	{
		sideScale: .25,
		leafKeep: 0,
		leafScale: 1,
		maximumBranchLevel: 1,
		pointStride: 3,
		crownScale: 1.5
	}
], re = [
	38,
	95,
	150
], z = 128, B = /* @__PURE__ */ new Map();
function ie(e) {
	let t = /* @__PURE__ */ new Uint8ClampedArray(65536);
	for (let n = 0; n < t.length; n += 4) t[n] = e[0], t[n + 1] = e[1], t[n + 2] = e[2], t[n + 3] = 0;
	return {
		width: z,
		height: z,
		data: t
	};
}
function ae(e, t, n, r, i) {
	let a = (n * e.width + t) * 4, o = e.data[a + 3] / 255, s = i + o * (1 - i);
	if (!(s <= 0)) {
		for (let t = 0; t < 3; t++) {
			let n = (r[t] * i + e.data[a + t] * o * (1 - i)) / s;
			e.data[a + t] = n;
		}
		e.data[a + 3] = s * 255;
	}
}
function V(e, { baseX: t, baseY: n, angle: r, length: i, width: a, color: o, shade: s }) {
	let c = Math.sin(r), l = -Math.cos(r), u = -l, d = c, f = Math.ceil(i + a), p = Math.max(0, Math.floor(n - f)), m = Math.min(e.height - 1, Math.ceil(n + f)), h = Math.max(0, Math.floor(t - f)), g = Math.min(e.width - 1, Math.ceil(t + f));
	for (let r = p; r <= m; r++) for (let f = h; f <= g; f++) {
		let p = f + .5 - t, m = r + .5 - n, h = (p * c + m * l) / i;
		if (h < 0 || h > 1) continue;
		let g = p * u + m * d, _ = a / 2 * Math.sin(Math.PI * h ** .7), v = y(_ - Math.abs(g) + .5, 0, 1);
		if (v <= 0) continue;
		let b = Math.abs(g) / (_ + .001), x = Math.abs(g) < .7 ? .2 : 0, S = (h * 7 + b * .9) % 1 < .1 ? -.1 : 0, C = s * (.82 + .3 * (1 - b) + x + S);
		ae(e, f, r, o.map((e) => e * C), v);
	}
}
function oe(e, t, n, r, i, a) {
	let o = Math.ceil(Math.hypot(r - t, i - n) * 2);
	for (let s = 0; s <= o; s++) {
		let c = s / o, l = Math.round(t + (r - t) * c), u = Math.round(n + (i - n) * c);
		for (let t = 0; t < 2; t++) l + t < e.width && ae(e, l + t, u, a, 1);
	}
}
function se(e, t, n) {
	oe(e, 64, 126, 64, 30, [
		t[0] * .55,
		t[1] * .5,
		t[2] * .4
	]);
	for (let r = 0; r < 6; r++) {
		let i = 106 - r * 13, a = 22 + 10 * Math.sin((r + 1) / 6 * Math.PI);
		for (let r of [-1, 1]) {
			let o = r * (1 + n() * .3);
			V(e, {
				baseX: 64,
				baseY: i - (r > 0 ? 6 : 0),
				angle: o,
				length: a,
				width: a * .55,
				color: t,
				shade: .85 + n() * .3
			});
		}
	}
	V(e, {
		baseX: 64,
		baseY: 44,
		angle: 0,
		length: 40,
		width: 25,
		color: t,
		shade: 1.05
	});
}
function ce(e, t, n) {
	oe(e, 64, 126, 64, 6, [
		t[0] * .7,
		t[1] * .6,
		t[2] * .5
	]);
	for (let r = 0; r < 24; r++) {
		let i = 118 - r * 4.6, a = 30 - r * .45 + n() * 4;
		for (let r of [-1, 1]) V(e, {
			baseX: 64,
			baseY: i,
			angle: r * (1 + n() * .2),
			length: a,
			width: 3.4,
			color: t,
			shade: .85 + n() * .3
		});
	}
}
function le(e, t, n, r, i) {
	for (let a = 0; a < r; a++) {
		let o = r > 1 ? (a / (r - 1) - .5) * .9 : 0, s = 96 + n() * 28;
		V(e, {
			baseX: 64 + o * 40,
			baseY: 127,
			angle: o + (n() - .5) * .12,
			length: s,
			width: i,
			color: t,
			shade: .8 + n() * .4
		});
	}
}
function ue(e, t, n) {
	for (let r = 0; r < 150; r++) {
		let r = n() * b, i = Math.sqrt(n()) * 46;
		V(e, {
			baseX: 64 + Math.cos(r) * i,
			baseY: 64 + Math.sin(r) * i * .8,
			angle: n() * b,
			length: 24 + n() * 12,
			width: 16 + n() * 8,
			color: t,
			shade: .6 + n() * .6
		});
	}
}
function de(e, t) {
	for (let n = 0; n < e.data.length; n += 4) e.data[n + 3] > 0 || (e.data[n] = t[0] * .8, e.data[n + 1] = t[1] * .8, e.data[n + 2] = t[2] * .8);
}
var fe = {
	sprig: se,
	needles: ce,
	single: (e, t, n) => le(e, t, n, 1, 38),
	grass: (e, t, n) => le(e, t, n, 9, 7),
	clump: ue
};
function pe(e, t, n = 1) {
	let r = fe[e];
	if (!r) throw RangeError(`Unknown leaf texture kind: ${e}`);
	let i = ie(t);
	return r(i, t, c(n)), de(i, t), i;
}
var me = {
	rough: {
		base: [
			168,
			142,
			118
		],
		crevice: .28,
		stretch: 2
	},
	birch: {
		base: [
			238,
			235,
			224
		],
		crevice: .12,
		stretch: 2
	}
};
function he(e, t = 1) {
	let n = me[e];
	if (!n) throw RangeError(`Unknown bark texture kind: ${e}`);
	let r = ie(n.base);
	for (let i = 0; i < z; i++) for (let a = 0; a < z; a++) {
		let o = a / z, s = i / z, c = C(o * 8, s * n.stretch, t, 8, n.stretch), l = C(o * 24, s * 12, t + 5, 24, 12), u = 1 - n.crevice + n.crevice * (.65 * c + .35 * l) * 1.6;
		if (e === "birch") {
			let e = C(o * 6, s * 40, t + 9, 6, 40);
			e > .7 && (u *= .28 + (1 - e) * 1.6);
		} else u *= .55 + .9 * c ** 1.4;
		let d = (i * z + a) * 4;
		for (let e = 0; e < 3; e++) r.data[d + e] = y(n.base[e] * u, 0, 255);
		r.data[d + 3] = 255;
	}
	return r;
}
function ge(e, t, { repeat: n }) {
	if (B.has(e)) return B.get(e);
	let r = t(), i = typeof ImageData > "u" ? r : new ImageData(r.data, r.width, r.height), a = n ? 10497 : 33071, o = {
		image: i,
		colorSpace: "srgb",
		wrapS: a,
		wrapT: a,
		minFilter: 9987,
		magFilter: 9729
	};
	return B.set(e, o), o;
}
function H(e, t) {
	return ge(`leaf:${e}:${t.join(",")}`, () => pe(e, t), { repeat: !1 });
}
function _e(e) {
	return ge(`bark:${e}`, () => he(e), { repeat: !0 });
}
var ve = "\n// Hemi-octahedral position of a direction in the tree's own frame, in cells: the upper hemisphere fills the square and a\n// cell's own view sits at its middle, so the four views around the position can be blended in the fragment shader.\nvec2 impostorCellPosition(vec3 localDirection) {\n  vec3 folded = vec3(localDirection.x, max(localDirection.y, 0.0), localDirection.z);\n  folded /= max(abs(folded.x) + folded.y + abs(folded.z), 0.00001);\n  vec2 square = vec2(folded.x + folded.z, folded.x - folded.z) * 0.5 + 0.5;\n  return square * 8.0 - 0.5;\n}\n\n// Returns the world position of this corner, the atlas uv of the first of the four views around the viewing direction\n// and viewBlend: the fractions toward the second view along each axis, then the uv step to it (0 at the atlas edge).\n// clipMatrix is the matrix of the pass (camera or light); the eye is where it projects to w = 0, or for an orthographic\n// pass a direction.\nvec3 impostorCard(vec3 localPosition, vec2 corner, mat4 modelMatrix, mat4 clipMatrix, float seconds, float strength, out vec2 atlasUv, out vec4 viewBlend, out vec3 cardNormal) {\n  vec2 side = vec2(corner.x * 2.0 - 1.0, 1.0 - corner.y * 2.0);\n  float radius = abs(localPosition.x);\n  float centerHeight = localPosition.y - side.y * radius;\n  vec3 center = (modelMatrix * vec4(0.0, centerHeight, 0.0, 1.0)).xyz;\n  vec4 apex = inverse(clipMatrix) * vec4(0.0, 0.0, 1.0, 0.0);\n  vec3 toEye = normalize(abs(apex.w) > 0.000001 ? apex.xyz / apex.w - center : -apex.xyz);\n  vec3 right = cross(vec3(0.0, 1.0, 0.0), toEye);\n  float rightLength = length(right);\n  right = rightLength > 0.001 ? right / rightLength : vec3(1.0, 0.0, 0.0);\n  vec3 cardUp = cross(toEye, right);\n  cardNormal = toEye;\n  float scale = length(modelMatrix[0].xyz);\n  vec3 localDirection = normalize(transpose(mat3(modelMatrix)) * toEye);\n  vec2 cellPosition = impostorCellPosition(localDirection);\n  vec2 firstCell = clamp(floor(cellPosition), 0.0, 7.0);\n  vec2 secondCell = clamp(floor(cellPosition) + 1.0, 0.0, 7.0);\n  atlasUv = (firstCell + corner) / 8.0;\n  viewBlend = vec4(cellPosition - floor(cellPosition), (secondCell - firstCell) / 8.0);\n  float heightFraction = side.y * 0.5 + 0.5;\n  float sway = sin(seconds * 1.2 + center.z * 0.31 + center.x * 0.17) * strength * 0.05 * radius * heightFraction * heightFraction;\n  return center + (right * (side.x * radius + sway) + cardUp * side.y * radius) * scale;\n}\n";
T.impostor = 13;
var ye = "  if (materialOpacity > 1.0) {\n    float biased = materialOpacity - 1.0;\n    bool incoming = biased > 1.0;\n    float coverage = incoming ? biased - 1.0 : biased;\n    float threshold = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));\n    if (textureAlpha < alphaCutoff || (incoming ? coverage < 1.0 - threshold : coverage <= threshold)) discard;\n    return 1.0;\n  }\n", be = "out vec4 cardViewBlend;\n", xe = "  cardViewBlend = vec4(0.0);\n  if (instanceSurface.w == 13.0) {\n    vec2 atlasUv;\n    vec3 cardNormal;\n    world.xyz = impostorCard(position, uv, instanceMatrix, viewProjection, time, wind, atlasUv, cardViewBlend, cardNormal);\n    uv = atlasUv;\n    worldPosition = world.xyz;\n    worldNormal = cardNormal;\n  }\n", Se = "  if (instanceSurface.w == 13.0) {\n    vec3 lightFacing;\n    vec2 atlasUv;\n    vec4 viewBlend;\n    world.xyz = impostorCard(position, uv, instanceMatrix, lightProjection, time, wind, atlasUv, viewBlend, lightFacing);\n    uv = atlasUv + step(0.5, viewBlend.xy) * viewBlend.zw;\n  }\n";
function U(e, t, n) {
	return e.includes(t) ? e.replace(t, () => n + t) : e;
}
var Ce = "in vec4 cardViewBlend;\nvec2 cardUV;\nvec2 pickCardUV() {\n  vec2 fraction = cardViewBlend.xy;\n  float threshold = fract(52.9829189 * fract(dot(gl_FragCoord.xy + 17.0, vec2(0.06711056, 0.00583715))));\n  float afterFirst = (1.0 - fraction.x) * (1.0 - fraction.y);\n  float afterSecond = afterFirst + fraction.x * (1.0 - fraction.y);\n  float afterThird = afterSecond + (1.0 - fraction.x) * fraction.y;\n  vec2 pick = threshold < afterFirst ? vec2(0.0) : threshold < afterSecond ? vec2(1.0, 0.0) : threshold < afterThird ? vec2(0.0, 1.0) : vec2(1.0);\n  return textureUV + pick * cardViewBlend.zw;\n}\n";
function we(e) {
	if (!e.includes("in vec2 textureUV, lightmapUV;") || !e.includes("void main() {")) return e;
	let t = "dFdx(textureUV), dFdy(textureUV)";
	return e.replace("texture(baseMap, textureUV)", () => `textureGrad(baseMap, cardUV, ${t})`).replace(/texture\(normalMap, textureUV([^)]*)\)/, (e, n) => `textureGrad(normalMap, cardUV${n}, ${t})`).replace("in vec2 textureUV, lightmapUV;", () => `in vec2 textureUV, lightmapUV;\n${Ce}`).replace("void main() {", () => "void main() {\n  cardUV = pickCardUV();");
}
function Te(e) {
	if (e.includes("float surfaceAlpha(float textureAlpha) {")) return we(U(e, "  if (alphaMode > 1.5) return alpha;", ye));
	if (!e.includes("uniform float wind;") || !e.includes("void main() {")) return e;
	let t = e.includes("worldNormal = normalize("), n = U(e, "void main() {", (t ? be : "") + ve);
	return t ? U(n, "  // Metres along the object's own axes", xe) : U(n, "  textureUV = uv;\n  gl_Position = lightProjection * world;", Se);
}
w.push(Te);
var Ee = 96, De = 3, Oe = 1e-6, ke = /* @__PURE__ */ new WeakMap();
function Ae(e) {
	let t = e / 255;
	return t <= .04045 ? t / 12.92 : ((t + .055) / 1.055) ** 2.4;
}
function W(e) {
	let t = Math.min(1, Math.max(0, e)), n = t <= .0031308 ? t * 12.92 : 1.055 * t ** (1 / 2.4) - .055;
	return Math.round(n * 255);
}
var G = Float32Array.from({ length: 256 }, (e, t) => Ae(t));
function je(e, t) {
	let n = (e + .5) / 8 * 2 - 1, r = (t + .5) / 8 * 2 - 1, i = (n + r) / 2, a = (n - r) / 2, o = 1 - Math.abs(i) - Math.abs(a), s = Math.hypot(i, o, a);
	return [
		i / s,
		o / s,
		a / s
	];
}
function Me(e) {
	let t = [
		e[2],
		0,
		-e[0]
	], n = Math.hypot(t[0], t[2]);
	t = n > .001 ? [
		t[0] / n,
		0,
		t[2] / n
	] : [
		1,
		0,
		0
	];
	let r = [
		e[1] * t[2] - e[2] * t[1],
		e[2] * t[0] - e[0] * t[2],
		e[0] * t[1] - e[1] * t[0]
	];
	return {
		right: t,
		up: r
	};
}
function Ne(e, t) {
	return e.levels[t].parts.map((e) => {
		let { geometry: t, material: n } = e, r = n.map?.image?.data ? n.map : null;
		return {
			geometry: t,
			map: r,
			wrap: r ? r.wrapS === 10497 : !1,
			baseColor: n.color,
			cutoff: n.alphaMode === "mask" ? n.alphaCutoff ?? .5 : 0
		};
	});
}
function Pe(e, t, n, r, i) {
	let { colorPixels: a, normalPixels: o, depthBuffer: s, offset: c, rowStride: l } = i, { right: u, up: d, toEye: f, center: p } = t, m = r / (2 * n);
	for (let t of e) {
		let { positions: e, normals: n, uvs: i, colors: h, indices: g } = t.geometry, _ = e.length / 3, v = new Float32Array(_), y = new Float32Array(_), b = new Float32Array(_);
		for (let t = 0; t < _; t++) {
			let n = e[t * 3] - p[0], i = e[t * 3 + 1] - p[1], a = e[t * 3 + 2] - p[2];
			v[t] = (n * u[0] + i * u[1] + a * u[2]) * m + r / 2, y[t] = r / 2 - (n * d[0] + i * d[1] + a * d[2]) * m, b[t] = n * f[0] + i * f[1] + a * f[2];
		}
		for (let e = 0; e < g.length; e += 3) {
			let p = g[e], m = g[e + 1], _ = g[e + 2], x = (v[m] - v[p]) * (y[_] - y[p]) - (v[_] - v[p]) * (y[m] - y[p]);
			if (Math.abs(x) < 1e-9) continue;
			let S = Math.max(0, Math.floor(Math.min(v[p], v[m], v[_]))), C = Math.min(r - 1, Math.ceil(Math.max(v[p], v[m], v[_]))), w = Math.max(0, Math.floor(Math.min(y[p], y[m], y[_]))), T = Math.min(r - 1, Math.ceil(Math.max(y[p], y[m], y[_]))), E = 1 / x, D = (y[m] - y[_]) * E, O = (y[_] - y[p]) * E, k = (v[_] - v[m]) * E, A = (v[p] - v[_]) * E, j = S + .5, M = (v[m] * y[_] - v[_] * y[m]) * E, N = (v[_] * y[p] - v[p] * y[_]) * E;
			for (let e = w; e <= T; e++) {
				let g = e + .5, v = M + j * D + g * k - D, y = N + j * O + g * A - O;
				for (let g = S; g <= C; g++) {
					v += D, y += O;
					let x = 1 - v - y;
					if (v < 0 || y < 0 || x < 0) continue;
					let S = v * b[p] + y * b[m] + x * b[_], C = e * r + g;
					if (S <= s[C]) continue;
					let w = t.baseColor[0], T = t.baseColor[1], E = t.baseColor[2];
					if (h && (w *= v * h[p * 3] + y * h[m * 3] + x * h[_ * 3], T *= v * h[p * 3 + 1] + y * h[m * 3 + 1] + x * h[_ * 3 + 1], E *= v * h[p * 3 + 2] + y * h[m * 3 + 2] + x * h[_ * 3 + 2]), t.map) {
						let e = v * i[p * 2] + y * i[m * 2] + x * i[_ * 2], n = v * i[p * 2 + 1] + y * i[m * 2 + 1] + x * i[_ * 2 + 1], r = Fe(t.map, e, n, t.wrap);
						if (r.alpha / 255 < t.cutoff) continue;
						w *= r.red, T *= r.green, E *= r.blue;
					}
					let k = v * n[p * 3] + y * n[m * 3] + x * n[_ * 3], A = v * n[p * 3 + 1] + y * n[m * 3 + 1] + x * n[_ * 3 + 1], j = v * n[p * 3 + 2] + y * n[m * 3 + 2] + x * n[_ * 3 + 2], M = Math.hypot(k, A, j) || 1;
					k /= M, A /= M, j /= M;
					let N = k * f[0] + A * f[1] + j * f[2], P = N < 0 ? -1 : 1, F = (k * u[0] + A * u[1] + j * u[2]) * P, ee = (k * d[0] + A * d[1] + j * d[2]) * P, I = Math.abs(N);
					s[C] = S;
					let L = c + e * l + g * 4;
					a[L] = W(w), a[L + 1] = W(T), a[L + 2] = W(E), a[L + 3] = 255, o[L] = Math.round((F * .5 + .5) * 255), o[L + 1] = Math.round((ee * .5 + .5) * 255), o[L + 2] = Math.round((I * .5 + .5) * 255), o[L + 3] = 255;
				}
			}
		}
	}
}
var K = {
	red: 0,
	green: 0,
	blue: 0,
	alpha: 0
};
function Fe(e, t, n, r) {
	let { width: i, height: a, data: o } = e.image, s = r ? t - Math.floor(t) : Math.min(1, Math.max(0, t)), c = r ? n - Math.floor(n) : Math.min(1, Math.max(0, n)), l = Math.min(i - 1, Math.floor(s * i)), u = (Math.min(a - 1, Math.floor(c * a)) * i + l) * 4;
	return K.red = G[o[u]], K.green = G[o[u + 1]], K.blue = G[o[u + 2]], K.alpha = o[u + 3], K;
}
var Ie = [
	[1, 0],
	[-1, 0],
	[0, 1],
	[0, -1]
], q = /* @__PURE__ */ new Int32Array();
function Le(e, t, n, r, i) {
	let a = i * 4, o = r * t * a + n * t * 4;
	q.length < t * t * 2 && (q = new Int32Array(t * t * 2));
	for (let n = 0; n < 3; n++) {
		let n = 0;
		for (let r = 0; r < t; r++) for (let i = 0; i < t; i++) {
			let s = o + r * a + i * 4;
			if (e[s + 3] === 0) for (let [c, l] of Ie) {
				let u = i + c, d = r + l;
				if (u < 0 || d < 0 || u >= t || d >= t) continue;
				let f = o + d * a + u * 4;
				if (e[f + 3] !== 0) {
					q[n * 2] = s, q[n * 2 + 1] = f, n++;
					break;
				}
			}
		}
		for (let t = 0; t < n; t++) {
			let n = q[t * 2], r = q[t * 2 + 1];
			e[n] = e[r], e[n + 1] = e[r + 1], e[n + 2] = e[r + 2], e[n + 3] = 1;
		}
	}
	for (let n = 0; n < t; n++) for (let r = 0; r < t; r++) {
		let t = o + n * a + r * 4;
		e[t + 3] === 1 && (e[t + 3] = 0);
	}
}
function Re(e, { frameSize: t = Ee, level: n = De } = {}) {
	let r = e.bounds.minimum, i = e.bounds.maximum, a = [
		(r[0] + i[0]) / 2,
		(r[1] + i[1]) / 2,
		(r[2] + i[2]) / 2
	], o = Math.hypot(i[0] - r[0], i[1] - r[1], i[2] - r[2]) / 2 * t / (t - 4), s = t * 8, c = new Uint8ClampedArray(s * s * 4), l = new Uint8ClampedArray(s * s * 4);
	for (let e = 0; e < l.length; e += 4) l[e] = 128, l[e + 1] = 128, l[e + 2] = 255, l[e + 3] = 255;
	let u = Ne(e, n), d = new Float32Array(t * t);
	for (let e = 0; e < 8; e++) for (let n = 0; n < 8; n++) {
		let r = je(n, e), { right: i, up: f } = Me(r);
		d.fill(-Infinity);
		let p = e * t * s * 4 + n * t * 4;
		Pe(u, {
			right: i,
			up: f,
			toEye: r,
			center: a
		}, o, t, {
			colorPixels: c,
			normalPixels: l,
			depthBuffer: d,
			offset: p,
			rowStride: s * 4
		}), Le(c, t, n, e, s);
	}
	return {
		width: s,
		height: s,
		colorPixels: c,
		normalPixels: l,
		radius: o,
		centerHeight: a[1],
		center: a,
		frameSize: t
	};
}
function ze(e, t, n) {
	let r = e;
	return {
		image: typeof ImageData > "u" ? {
			width: t,
			height: t,
			data: r
		} : new ImageData(r, t, t),
		colorSpace: n,
		wrapS: 33071,
		wrapT: 33071,
		minFilter: 9987,
		magFilter: 9729
	};
}
function Be(e, t) {
	return {
		positions: new Float32Array([
			-e,
			t + e,
			0,
			e,
			t + e,
			0,
			e,
			t - e,
			0,
			-e,
			t - e,
			0
		]),
		normals: new Float32Array([
			0,
			0,
			1,
			0,
			0,
			1,
			0,
			0,
			1,
			0,
			0,
			1
		]),
		uvs: new Float32Array([
			0,
			0,
			1,
			0,
			1,
			1,
			0,
			1
		]),
		indices: new Uint32Array([
			0,
			1,
			2,
			0,
			2,
			3
		])
	};
}
function J(e, t = {}) {
	let n = ke.get(e);
	if (n) return n;
	let r = performance.now(), i = Re(e, t), a = {
		geometry: Be(i.radius, i.centerHeight),
		material: {
			tag: "impostor",
			color: [
				1,
				1,
				1
			],
			roughness: .9,
			metallic: 0,
			emission: 0,
			map: ze(i.colorPixels, i.width, "srgb"),
			normalMap: ze(i.normalPixels, i.width, "linear"),
			alphaMode: "mask",
			alphaCutoff: .5,
			doubleSided: !0
		},
		atlasSize: i.width,
		bakeMilliseconds: 0
	};
	return a.bakeMilliseconds = performance.now() - r, ke.set(e, a), a;
}
function Ve(e, t = {}) {
	let n = Array.isArray(e) ? e : Object.values(e).flat(), r = performance.now(), i = 0;
	for (let e of n) e.kind === "tree" && (J(e, t), i++);
	return {
		count: i,
		milliseconds: performance.now() - r
	};
}
function He(e, t, n) {
	for (let r = 0; r < t.length; r++) {
		let i = t[r] * (1 - n), a = t[r] * (1 + n);
		if (e < i || a - i < Oe && e < t[r]) return {
			level: r,
			next: r,
			step: 0
		};
		if (e <= a && a - i >= Oe) {
			let t = Math.round((e - i) / (a - i) * 8);
			return t <= 0 ? {
				level: r,
				next: r,
				step: 0
			} : t >= 8 ? {
				level: r + 1,
				next: r + 1,
				step: 0
			} : {
				level: r,
				next: r + 1,
				step: t
			};
		}
	}
	return {
		level: t.length,
		next: t.length,
		step: 0
	};
}
var Ue = 1080 / (2 * Math.tan(Math.PI / 6)), We = 4;
function Y({ pixels: e = We, height: t = 1080, fov: n = 60 } = {}) {
	return t / (2 * Math.tan(n * Math.PI / 360)) / Ue * We / e;
}
function Ge(e, t, n) {
	return t ? {
		...e,
		color: e.color.map((e, t) => e * n[t])
	} : e;
}
function Ke(e, t, n) {
	return {
		...e,
		alphaMode: "mask",
		alphaCutoff: e.alphaMode === "mask" ? e.alphaCutoff ?? .5 : .5,
		opacityBias: n ? 1 + t : t
	};
}
function qe(e, t, n, r, i) {
	let a = `${n ? "i" : t}|${r ? `${r.opacity}|${r.incoming}` : ""}`;
	if (e.blendParts ??= /* @__PURE__ */ new Map(), e.blendParts.has(a)) return e.blendParts.get(a);
	let o = `${e.species} ${e.index}`, s = (e) => r ? Ke(e, r.opacity, r.incoming) : e, c;
	if (n) {
		let t = J(e.variant, i);
		c = [{
			name: `${o} impostor`,
			geometry: t.geometry,
			matrix: e.matrix,
			material: s(Ge(t.material, !0, e.tint))
		}];
	} else c = e.variant.levels[t].parts.map((t) => ({
		name: `${o} ${t.role}`,
		geometry: t.geometry,
		shadowLods: t.shadowLods,
		matrix: e.matrix,
		material: s(Ge(t.material, t.tintable, e.tint))
	}));
	return e.blendParts.set(a, c), c;
}
function Je(e, t, { distanceScale: n = 1, fade: r = .06, cullDistance: i = Infinity, impostors: a = !1, pixelError: o = null } = {}) {
	let s = o ? Y(o) : 1, c = a && typeof a == "object" ? a : {}, l = a ? c.from ?? 3 : Infinity, u = [], d = [], f = !1, p = 0, m = 0, h = 0, g = 0;
	for (let a of e) {
		let e = Math.hypot(t[0] - a.position[0], t[1] - a.position[1], t[2] - a.position[2]), _ = e > i, v = a.variant.distances.map((e) => e * n * s * (o ? a.scale : 1)), y = _ ? {
			level: -1,
			next: -1,
			step: 0
		} : He(e, v, r), b = (e) => a.variant.kind === "tree" && e >= l, x = y.step > 0 && b(y.level) && b(y.next) ? 0 : y.step, S = `${y.level}:${x > 0 ? y.next : y.level}:${x}`;
		if (S !== a.blendSignature && (f = !0), a.blendSignature = S, a.level = y.level, y.level < 0) {
			p++;
			continue;
		}
		d[y.level] = (d[y.level] ?? 0) + 1;
		let C = (e, t, n) => {
			let r = b(e);
			u.push(...qe(a, e, r, t === 1 ? null : {
				opacity: t,
				incoming: n
			}, c)), m += r ? 2 : a.variant.levels[e].triangles, r && h++;
		};
		x === 0 ? C(y.level, 1, !1) : (g++, C(y.level, 1 - x / 8, !1), C(y.next, x / 8, !0));
	}
	return {
		parts: u,
		changed: f,
		levelCounts: Array.from(d, (e) => e ?? 0),
		culled: p,
		triangles: m,
		impostors: h,
		fading: g
	};
}
// src/vegetation.js
var Ye = .06, Xe = .6, Ze = .8, Qe = ["cards", "mesh"], $e = Math.PI * (3 - Math.sqrt(5)), et = [24], X = [
	.85,
	.95,
	.8
], Z = [
	1.1,
	1.05,
	.9
], tt = [
	1.05,
	1.08,
	1
], nt = {
	broadleaf: 3,
	birch: 1.5,
	conifer: 2,
	bush: 2.5
};
function rt(e, t) {
	let n = Math.cos(t), r = Math.sin(t);
	return [
		e[0] * n + e[2] * r,
		e[1],
		-e[0] * r + e[2] * n
	];
}
function it(e) {
	return [
		e() - .5,
		e() - .5,
		e() - .5
	];
}
function at(e, t) {
	let { points: n, radii: r } = e, i = y(t, 0, 1) * (n.length - 1), a = Math.min(Math.floor(i), n.length - 2), o = i - a;
	return {
		position: m(n[a], n[a + 1], o),
		direction: d(S(n[a + 1], n[a])),
		radius: _(r[a], r[a + 1], o)
	};
}
function ot(e, t) {
	return e === "crown" ? .62 + .38 * Math.sin(Math.PI * y(t * .85 + .1, 0, 1)) : e === "cone" ? 1 - .9 * t : 1;
}
function st(e, t) {
	let n = [];
	if (e.whorls) {
		for (let r = 0; r < e.whorls; r++) {
			let i = _(e.start, e.end, e.whorls > 1 ? r / (e.whorls - 1) : 0), a = Math.round(u(t, e.perWhorl));
			for (let e = 0; e < a; e++) n.push({
				fraction: i,
				azimuth: e / a * b + r * .9 + (t() - .5) * .5
			});
		}
		return n;
	}
	let r = Math.round(u(t, e.count));
	for (let i = 0; i < r; i++) n.push({
		fraction: _(e.start, e.end, (i + t() * .5) / r),
		azimuth: i * 2.399963 + t() * .5
	});
	return n;
}
function ct(e, t, n) {
	let r = e.levels.length - 1, a = [], o = [];
	function c(t) {
		let r = e.leaf, a = e.levels[t.level].pairedLeaves, s = Math.max(2, Math.round(t.length * r.sitesPerMeter));
		for (let e = 0; e < s; e++) {
			let c = at(t, _(r.start, 1, e / (s - 1))), u = d(l(c.direction, h)), f = a ? [-1, 1].map((e) => d(g(i(c.direction, .5), i(u, .85 * e)))) : [d(g(g(c.direction, i(h, r.upBias)), i(it(n), .9)))];
			for (let e of f) o.push({
				position: c.position,
				direction: e,
				scale: .8 + n() * .45,
				roll: (n() - .5) * .8
			});
		}
	}
	function p(e, t) {
		for (let r of st(t, n)) {
			let a = at(e, r.fraction), o = s(a.direction), c = g(i(o.first, Math.cos(r.azimuth)), i(o.second, Math.sin(r.azimuth))), l = u(n, t.angle), f = d(g(i(a.direction, Math.cos(l)), i(c, Math.sin(l)))), p = (r.fraction - t.start) / Math.max(t.end - t.start, 1e-6);
			m({
				origin: a.position,
				direction: f,
				length: e.length * u(n, t.lengthRatio) * ot(t.profile, p),
				radius: a.radius * t.radiusRatio,
				level: e.level + 1
			});
		}
	}
	function m({ origin: t, direction: o, length: s, radius: l, level: u }) {
		let m = e.levels[u], h = [t], v = [l], y = s / m.segments, b = o;
		for (let e = 1; e <= m.segments; e++) {
			let t = i(it(n), m.gnarl * 2);
			b = d(g(g(b, t), [
				0,
				m.tropism,
				0
			])), h.push(f(h[e - 1], b, y)), v.push(l * _(1, m.tipRadius, e / m.segments));
		}
		let x = {
			level: u,
			points: h,
			radii: v,
			length: s
		};
		a.push(x), m.children && p(x, m.children), u === r && c(x);
	}
	let v = e.levels[0], y = n() * b, x = v.lean ?? 0;
	return m({
		origin: [
			0,
			0,
			0
		],
		direction: d([
			Math.cos(y) * x,
			1,
			Math.sin(y) * x
		]),
		length: t * (v.lengthScale ?? 1),
		radius: t * e.trunkRadiusRatio,
		level: 0
	}), {
		branches: a,
		leafSites: o,
		crown: lt(o)
	};
}
function lt(e) {
	let t = i(e.reduce((e, t) => g(e, t.position), [
		0,
		0,
		0
	]), 1 / e.length);
	return {
		center: t,
		radius: Math.max(...e.map((e) => o(S(e.position, t))), .1)
	};
}
function ut(e, t, n) {
	let r = e.map((e, t) => t).filter((t) => t % n === 0 || t === e.length - 1);
	return {
		points: r.map((t) => e[t]),
		radii: r.map((e) => t[e])
	};
}
function Q(e, t, n, r) {
	let i = t.levels.length - 1, o = n.maximumBranchLevel < 0 ? i + n.maximumBranchLevel : n.maximumBranchLevel, s = x();
	for (let i of e.branches) {
		if (i.level > o) continue;
		let e = t.sides[Math.min(i.level, t.sides.length - 1)], c = Math.max(3, Math.round(e * n.sideScale)), { points: l, radii: u } = i;
		if (n.pointStride > 1 && ({points: l, radii: u} = ut(l, u, n.pointStride)), i.level === 0) {
			let e = d(S(l[1], l[0]));
			l = [f(l[0], e, -.3), ...l], u = [u[0] * t.rootFlare, ...u];
		}
		a(s, l, u, c, r.tileSize, [
			1,
			1,
			1
		], { worldScaleUv: r.scanned });
	}
	return s.build();
}
function dt(e, t, n) {
	let r = {
		sideScale: .5,
		maximumBranchLevel: 0
	}, i = Math.max(0, ...e.branches.filter((e) => e.level > 0).map((e) => e.radii[0])), a = e.branches[0].radii[0] * t.rootFlare;
	return {
		geometry: Q(e, t, r, n),
		error: 2 * i + .15 * a
	};
}
var ft = .3;
function pt(e, t, n, r) {
	return {
		geometry: Q(e, t, {
			sideScale: .25,
			maximumBranchLevel: 0,
			pointStride: 3
		}, n),
		error: r.error + ft
	};
}
function $(e) {
	return !!e && typeof e == "object" && !!e.image;
}
function mt(e, t) {
	if (!e) return null;
	let n = $(e.color) ? e : e[t];
	if (!n) return null;
	if (!$(n.color)) throw TypeError(`Bark textures for ${t} need a color texture descriptor.`);
	for (let e of ["normal", "roughness"]) if (n[e] !== void 0 && !$(n[e])) throw TypeError(`Bark ${e} must be a texture descriptor.`);
	return n;
}
function ht(e, t) {
	if (!e) return null;
	let n = $(e.color) ? e : e[t];
	if (!n) return null;
	if (!$(n.color)) throw TypeError(`Leaf textures for ${t} need a color texture descriptor.`);
	for (let e of ["normal", "crown"]) if (n[e] !== void 0 && !$(n[e])) throw TypeError(`Leaf ${e} must be a texture descriptor.`);
	return n;
}
function gt(e, t) {
	let { center: n, radius: r } = e.crown, a = S(t, n), s = y(o(a) / r, 0, 1), c = y(a[1] / r * .5 + .5, 0, 1);
	return {
		brightness: _(.55, 1.1, s ** .8) + .12 * c,
		canopyNormal: d(g(d(a), i(h, .35)))
	};
}
function _t(e, t, n, r, i, a) {
	let { brightness: o, canopyNormal: s } = gt(t, r.position);
	for (let t = 0; t < n.meshPerSite; t++) {
		let c = (t - (n.meshPerSite - 1) / 2) * n.meshSpread, l = d(f(rt(r.direction, c), h, (a() - .5) * .5)), u = n.meshLength * r.scale * i;
		v(e, {
			origin: r.position,
			frame: p(l, r.roll + (a() - .5) * .6),
			length: u,
			width: n.meshWidth * r.scale * i,
			rows: n.profile,
			droop: n.droop,
			fold: n.fold,
			canopyNormal: s,
			canopyBlend: .45,
			colorBase: X,
			colorTip: Z,
			brightness: o * (.9 + a() * .2)
		});
	}
}
function vt(e, t, n, r, i, a) {
	let { brightness: o, canopyNormal: s } = gt(t, r.position), c = (a() - .5) * .6;
	for (let t = 0; t < n.cardsPerSite; t++) v(e, {
		origin: r.position,
		frame: p(r.direction, c + t * (Math.PI / 2 + (a() - .5) * .5)),
		length: n.cardSize[1] * r.scale * i,
		width: n.cardSize[0] * r.scale * i,
		rows: [
			[0, 1],
			[.5, 1],
			[1, 1]
		],
		backFaces: !1,
		droop: .12,
		canopyNormal: s,
		canopyBlend: .55,
		colorBase: X,
		colorTip: Z,
		brightness: o * (.9 + a() * .2)
	});
}
function yt(e, t, n, r) {
	let i = e.vertexCount;
	for (let i = 0; i <= 5; i++) {
		let a = i / 5 * Math.PI;
		for (let o = 0; o <= 8; o++) {
			let s = o % 8 / 8 * b, c = [
				Math.sin(a) * Math.cos(s),
				Math.cos(a),
				Math.sin(a) * Math.sin(s)
			], l = 1 + (C(c[0] * 2 + t[0], c[2] * 2 + t[2], 3) - .5) * .5, u = [
				t[0] + c[0] * n * l,
				t[1] + c[1] * n * .8 * l,
				t[2] + c[2] * n * l
			], d = X.map((e) => e * r.brightness);
			e.addVertex(u, c, o / 8, i / 5, d);
		}
	}
	for (let t = 0; t < 5; t++) for (let n = 0; n < 8; n++) {
		let r = i + t * 9 + n;
		e.addTriangle(r, r + 1, r + 9), e.addTriangle(r + 9, r + 1, r + 9 + 1);
	}
}
function bt(e, t, n, r, a, o = 1) {
	let s = t.crown.radius / 2.1, c = /* @__PURE__ */ new Map();
	for (let e of t.leafSites) {
		let t = e.position.map((e) => Math.floor(e / s)).join(",");
		c.has(t) || c.set(t, []), c.get(t).push(e);
	}
	let l = 0;
	for (let a of c.values()) {
		let c = i(a.reduce((e, t) => g(e, t.position), [
			0,
			0,
			0
		]), 1 / a.length), u = l * $e;
		l++;
		let m = gt(t, c), _ = s * (.55 + .1 * Math.min(a.length, 5)) * o * (n.clumpScale ?? 1);
		if (r === "mesh") yt(e, c, _, m);
		else for (let t = 0; t < 3; t++) {
			let r = t === 2 ? h : [
				Math.cos(t * 1.9 + c[0]),
				.15,
				Math.sin(t * 1.9 + c[2])
			];
			v(e, {
				origin: f(c, d(r), -_),
				frame: p(d(r), t === 2 ? u : 0),
				length: _ * 2,
				width: _ * 2,
				rows: [[0, 1], [1, 1]],
				backFaces: !1,
				canopyNormal: m.canopyNormal,
				canopyBlend: n.clumpCanopyBlend ?? 0,
				colorBase: X,
				colorTip: Z,
				brightness: m.brightness
			});
		}
	}
}
function xt(e, t, n, r, i) {
	let a = x({ withColors: !0 });
	if (r.leafKeep === 0) return bt(a, e, t.leaf, n, i, r.crownScale), a.build();
	let o = Math.round(1 / r.leafKeep);
	return e.leafSites.forEach((s, c) => {
		c % o === 0 && (n === "mesh" ? _t(a, e, t.leaf, s, r.leafScale, i) : vt(a, e, t.leaf, s, r.leafScale, i));
	}), a.build();
}
function St(e, t) {
	if (!t) return {
		color: e.bark.tint,
		roughness: .95,
		metallic: 0,
		emission: 0,
		map: _e(e.bark.texture)
	};
	let n = {
		color: [
			1,
			1,
			1
		],
		roughness: 1,
		metallic: 0,
		emission: 0,
		map: t.color
	};
	return t.normal && (n.normalMap = t.normal), t.roughness && (n.metallicRoughnessMap = t.roughness), n;
}
var Ct = [{
	leafKeep: .34,
	leafScale: 1.7,
	error: 1
}, {
	leafKeep: .125,
	leafScale: 2.8,
	error: 2
}];
function wt(e, t, n, r, i) {
	return Ct.slice(i).map((a, o) => ({
		geometry: xt(e, t, n, a, c(r * 104729 + 50 + i + o)),
		error: a.error
	}));
}
function Tt(e, t, n, r) {
	let i = St(e, n);
	if (t === "mesh") {
		let t = {
			tag: "foliage",
			color: e.leaf.foliageColor,
			roughness: .8,
			metallic: 0,
			emission: 0
		};
		return {
			bark: i,
			foliage: t,
			crown: t
		};
	}
	let a = (t) => ({
		tag: "foliage",
		color: e.leaf.tint,
		roughness: .85,
		metallic: 0,
		emission: 0,
		map: H(t, e.leaf.color),
		alphaMode: "mask",
		alphaCutoff: .5,
		doubleSided: !0
	});
	if (!r) return {
		bark: i,
		foliage: a(e.leaf.texture),
		crown: a("clump")
	};
	let o = (e, t) => ({
		tag: "foliage",
		color: tt,
		roughness: .75,
		metallic: 0,
		emission: 0,
		map: e,
		...t ? {
			normalMap: t,
			normalScale: [.7, .7]
		} : {},
		alphaMode: "mask",
		alphaCutoff: .5,
		doubleSided: !0
	});
	return {
		bark: i,
		foliage: o(r.color, r.normal),
		crown: r.crown ? o(r.crown) : a("clump")
	};
}
function Et(e, t) {
	let n = (e) => e.parts.find((e) => e.role === "foliage").geometry, r = (e) => P(e.positions, e.indices), i = null;
	for (let [a, o] of e.entries()) {
		let s = n(o);
		if (s.positions.length === 0) continue;
		let c = L[t]?.[a];
		if (c) {
			let r = c.color * Dt(s, n(e[0]), c.area, L[t].areaExponent);
			s.colors = s.colors.map((e) => e * r);
		}
		let l = null;
		Object.defineProperty(s, "skyVisibility", {
			enumerable: !0,
			configurable: !0,
			get() {
				if (i ??= N(n(e[0]).positions), !l && (l = i.visibilityOf(s.positions), a > 0)) {
					let t = n(e[0]), i = F(t.skyVisibility, r(t));
					l = ee(l, i, r(s)), c && (l = I(l, c.sky));
				}
				return l;
			}
		});
	}
}
function Dt(e, t, n, r) {
	if (n === void 0 || !r) return 1;
	let i = (e) => P(e.positions, e.indices).reduce((e, t) => e + t, 0);
	return Math.exp(r * (Math.log(i(e) / i(t)) - n));
}
function Ot(e) {
	let t = [
		Infinity,
		Infinity,
		Infinity
	], n = [
		-Infinity,
		-Infinity,
		-Infinity
	];
	for (let r of e) for (let e = 0; e < r.positions.length; e++) {
		let i = e % 3;
		t[i] = Math.min(t[i], r.positions[e]), n[i] = Math.max(n[i], r.positions[e]);
	}
	return {
		minimum: t,
		maximum: n
	};
}
function kt(e) {
	return {
		parts: e,
		triangles: e.reduce((e, t) => e + t.geometry.indices.length / 3, 0)
	};
}
function At(e = "broadleaf", t = 1) {
	let n = typeof e == "string" ? { species: e } : { ...e }, r = te[n.species];
	if (!r) throw RangeError(`Unknown tree species: ${n.species}`);
	let i = n.leaves ?? "cards";
	if (!Qe.includes(i)) throw RangeError(`Leaves must be one of ${Qe.join(", ")}.`);
	if (!Number.isFinite(t)) throw TypeError("Tree seed must be a finite number.");
	let a = c(t * 7919 + 17), o = n.height ?? u(a, r.height), s = ct(r, o, a), l = mt(n.barkTextures, n.species), d = {
		scanned: !!l,
		tileSize: n.barkTileSize ?? (l ? Ze : Xe)
	}, f = Tt(r, i, l, i === "cards" ? ht(n.leafTextures, n.species) : null), p = dt(s, r, d), m = pt(s, r, d, p), h = ne.map((e, n) => {
		let a = c(t * 104729 + n), o = e.leafKeep === 0 ? f.crown : f.foliage, l = Q(s, r, e, d), u = xt(s, r, i, e, a), h = e.leafKeep === 0 ? [] : wt(s, r, i, t, n);
		return kt([{
			role: "bark",
			geometry: l,
			material: f.bark,
			tintable: !1,
			shadowLods: [
				{
					geometry: l,
					error: 0
				},
				p,
				m
			]
		}, {
			role: "foliage",
			geometry: u,
			material: o,
			tintable: !0,
			...h.length ? { shadowLods: [{
				geometry: u,
				error: 0
			}, ...h] } : {}
		}]);
	});
	return Et(h, n.species), {
		kind: "tree",
		species: n.species,
		seed: t,
		height: o,
		leaves: i,
		levels: h,
		materials: f,
		distances: re,
		bounds: Ot(h[0].parts.map((e) => e.geometry))
	};
}
function jt(e, t) {
	return e === "cards" ? {
		tag: "grass",
		color: [
			1,
			1,
			1
		],
		roughness: .9,
		metallic: 0,
		emission: 0,
		map: H("grass", [
			80,
			128,
			40
		]),
		alphaMode: "mask",
		alphaCutoff: .5,
		doubleSided: !0
	} : {
		tag: "grass",
		color: t,
		roughness: .9,
		metallic: 0,
		emission: 0
	};
}
function Mt(e, t, n, r, i) {
	let a = x({ withColors: !0 });
	for (let o = 0; o < t; o++) {
		let t = e() * b, o = Math.sqrt(e()) * r, s = .2 + e() * .4;
		v(a, {
			origin: [
				Math.cos(t) * o,
				0,
				Math.sin(t) * o
			],
			frame: p(d([
				Math.cos(t) * s,
				1,
				Math.sin(t) * s
			]), e() * b),
			length: n * (.6 + e() * .6),
			width: .04 * i * (.8 + e() * .5),
			rows: [
				[0, 1],
				[.35, .85],
				[.7, .5],
				[1, 0]
			],
			droop: .3 + e() * .4,
			canopyNormal: h,
			canopyBlend: .55,
			colorBase: [
				.5,
				.58,
				.45
			],
			colorTip: [
				1.15,
				1.15,
				.9
			]
		});
	}
	return a.build();
}
function Nt(e, t, n) {
	let r = x({ withColors: !0 }), i = e() * Math.PI;
	for (let a = 0; a < 3; a++) {
		let o = i + a * Math.PI / 3, s = [
			Math.cos(o),
			0,
			Math.sin(o)
		];
		v(r, {
			origin: [
				0,
				0,
				0
			],
			frame: {
				forward: h,
				right: s,
				normal: l(s, h)
			},
			length: t * (.9 + e() * .2),
			width: n * 2.4,
			rows: [
				[0, 1],
				[.5, 1],
				[1, 1]
			],
			backFaces: !1,
			droop: .1,
			canopyNormal: h,
			canopyBlend: .6,
			colorBase: [
				.6,
				.65,
				.55
			],
			colorTip: [
				1.1,
				1.1,
				.95
			]
		});
	}
	return r.build();
}
function Pt({ blades: e = 16, height: t = .45, radius: n = .13, style: r = "blades", color: i = [
	.2,
	.34,
	.06
], seed: a = 1 } = {}) {
	if (!["blades", "cards"].includes(r)) throw RangeError("Grass style must be blades or cards.");
	let o = c(a * 6271 + 5), s = jt(r, i), l = r === "cards" ? [Nt(o, t, n), Nt(o, t, n)] : [Mt(o, e, t, n, 1), Mt(o, Math.max(3, Math.round(e / 2)), t, n, 1.7)];
	return {
		kind: "grass",
		species: "grass",
		seed: a,
		height: t,
		levels: l.map((e) => kt([{
			role: "grass",
			geometry: e,
			material: s,
			tintable: !0
		}])),
		materials: { grass: s },
		distances: et,
		bounds: Ot(l)
	};
}
function Ft(e, t, n, r) {
	let o = x({ withColors: !0 }), s = [
		.16,
		.3,
		.07
	];
	for (let c = 0; c < t; c++) {
		let t = e() * b, c = Math.sqrt(e()) * .14, l = [
			Math.cos(t) * c,
			0,
			Math.sin(t) * c
		], u = n * (.7 + e() * .5), _ = [
			(e() - .5) * .12,
			0,
			(e() - .5) * .12
		], y = g(g(l, [
			0,
			u,
			0
		]), _), x = g(m(l, y, .5), i(_, .6));
		a(o, [
			l,
			x,
			y
		], [
			.005,
			.0045,
			.004
		], 3, .3, s);
		for (let e = 0; e < 6; e++) {
			let t = e / 6 * b, n = d([
				Math.cos(t),
				.3,
				Math.sin(t)
			]);
			v(o, {
				origin: y,
				frame: p(n, 0),
				length: .055,
				width: .04,
				rows: [
					[0, .5],
					[.5, 1],
					[1, .5]
				],
				canopyNormal: h,
				canopyBlend: .5,
				colorBase: r,
				colorTip: r
			});
		}
		yt(o, f(y, h, .004), .014, { brightness: 1 });
	}
	return o.build();
}
function It({ flowers: e = 5, height: t = .4, color: n = [
	1,
	.85,
	.3
], seed: r = 1 } = {}) {
	let i = Ft(c(r * 3571 + 11), e, t, n), a = {
		color: [
			1,
			1,
			1
		],
		roughness: .8,
		metallic: 0,
		emission: 0
	};
	return {
		kind: "flowers",
		species: "flowers",
		seed: r,
		height: t,
		levels: [kt([{
			role: "flowers",
			geometry: i,
			material: a,
			tintable: !1
		}])],
		materials: { flowers: a },
		distances: [],
		bounds: Ot([i])
	};
}
var Lt = [
	[
		.95,
		.8,
		.25
	],
	[
		.8,
		.35,
		.55
	],
	[
		.9,
		.9,
		.85
	],
	[
		.45,
		.4,
		.85
	]
];
function Rt(e, t, n, r, i, a) {
	return e === "grass" ? Pt({
		seed: t,
		height: .38 + n % 3 * .12
	}) : e === "flowers" ? It({
		seed: t,
		color: Lt[n % Lt.length]
	}) : At({
		species: e,
		leaves: r,
		barkTextures: i,
		leafTextures: a
	}, t);
}
function zt(e, t, n, r) {
	let i = t / Math.SQRT2, a = Math.ceil((e.maxX - e.minX) / i) + 1, o = Math.ceil((e.maxZ - e.minZ) / i) + 1, s = new Int32Array(a * o).fill(-1), c = [], l = (t) => [Math.floor((t[0] - e.minX) / i), Math.floor((t[1] - e.minZ) / i)], u = (n) => {
		if (n[0] < e.minX || n[0] > e.maxX || n[1] < e.minZ || n[1] > e.maxZ) return !1;
		let [i, u] = l(n);
		for (let e = -2; e <= 2; e++) for (let r = -2; r <= 2; r++) {
			let l = i + r, d = u + e;
			if (l < 0 || d < 0 || l >= a || d >= o) continue;
			let f = s[d * a + l];
			if (f >= 0 && Math.hypot(c[f][0] - n[0], c[f][1] - n[1]) < t) return !1;
		}
		return r(n);
	}, d = (e) => {
		let [t, n] = l(e);
		s[n * a + t] = c.length, c.push(e);
	};
	for (let r = 0; r < 24; r++) {
		let r = [_(e.minX, e.maxX, n()), _(e.minZ, e.maxZ, n())];
		if (!u(r)) continue;
		let i = [c.length];
		for (d(r); i.length;) {
			let e = Math.floor(n() * i.length), r = c[i[e]], a = !1;
			for (let e = 0; e < 24 && !a; e++) {
				let e = n() * b, o = t * (1 + n()), s = [r[0] + Math.cos(e) * o, r[1] + Math.sin(e) * o];
				u(s) && (i.push(c.length), d(s), a = !0);
			}
			a || i.splice(e, 1);
		}
	}
	return c;
}
function Bt(e, t, n) {
	let r = .6, i = (e(t + r, n) - e(t - r, n)) / (2 * r), a = (e(t, n + r) - e(t, n - r)) / (2 * r);
	return Math.atan(Math.hypot(i, a)) * 180 / Math.PI;
}
function Vt(e, t, n, r, i, a) {
	let o = e.map((e, a) => t[e] * (.15 + C(n / 22, r / 22, i + a * 17)) ** 2), s = a() * o.reduce((e, t) => e + t, 0);
	for (let t = 0; t < o.length; t++) if (s -= o[t], s <= 0) return e[t];
	return e[e.length - 1];
}
function Ht(i, a, o) {
	return t(e(), n(r(), h, a), i, [
		o,
		o,
		o
	]);
}
function Ut(e, t, n) {
	return e.partsByLevel[t] || (e.partsByLevel[t] = e.variant.levels[t].parts.map((t) => ({
		name: `${n} ${t.role}`,
		geometry: t.geometry,
		shadowLods: t.shadowLods,
		matrix: e.matrix,
		material: t.tintable ? {
			...t.material,
			color: t.material.color.map((t, n) => t * e.tint[n])
		} : t.material
	}))), e.partsByLevel[t];
}
function Wt({ area: e, density: t = .012, terrainHeight: n = () => 0, slopeLimit: r = 32, exclusion: i = () => !1, seed: a = 1, mix: o = nt, variants: s = 3, leaves: l = "cards", scale: d = [.8, 1.25], spacing: f, barkTextures: p, leafTextures: m } = {}) {
	if (!e || ![
		e.minX,
		e.maxX,
		e.minZ,
		e.maxZ
	].every(Number.isFinite) || e.maxX <= e.minX || e.maxZ <= e.minZ) throw TypeError("Scatter area needs finite minX < maxX and minZ < maxZ.");
	if (!(t > 0)) throw RangeError("Scatter density must be positive.");
	let h = c(a), g = Object.keys(o).filter((e) => o[e] > 0), _ = zt(e, f ?? Math.sqrt(.6 / t), h, ([e, t]) => Bt(n, e, t) <= r && !i(e, t)), v = {}, y = {}, x = _.map(([e, t], r) => {
		let i = Vt(g, o, e, t, a, h);
		v[i] || (v[i] = Array.from({ length: s }, (e, t) => Rt(i, a * 131 + t * 977 + i.length, t, l, p, m)));
		let c = v[i][Math.floor(h() * s)], f = u(h, d), _ = h() * b, x = [
			e,
			n(e, t) - .04,
			t
		];
		return y[i] = (y[i] ?? 0) + 1, {
			index: r,
			species: i,
			variant: c,
			position: x,
			yaw: _,
			scale: f,
			tint: [
				.88 + h() * .24,
				.9 + h() * .2,
				.85 + h() * .25
			],
			matrix: Ht(x, _, f),
			level: 0,
			partsByLevel: []
		};
	});
	return {
		instances: x,
		parts: x.flatMap((e) => Ut(e, 0, `${e.species} ${e.index}`)),
		variants: v,
		counts: y
	};
}
function Gt(e = {}) {
	return Wt({
		density: 2.5,
		mix: {
			grass: 1,
			flowers: .06
		},
		variants: 4,
		slopeLimit: 40,
		scale: [.8, 1.4],
		...e
	});
}
function Kt(e, t, n, r, i) {
	let a = n.length, o = e < 0 ? a : e;
	for (; o < a && t > n[o] * (1 + r);) o++;
	for (; o > 0 && t < n[o - 1] * (1 - r);) o--;
	return t > i * (e < 0 ? 1 - r : 1 + r) ? -1 : o;
}
function qt(e, t, { distanceScale: n = 1, hysteresis: r = .12, cullDistance: i = Infinity, fade: a = 0, impostors: o = !1, pixelError: s = null } = {}) {
	if (a > 0 || o) return Je(e, t, {
		distanceScale: n,
		fade: a || Ye,
		cullDistance: i,
		impostors: o,
		pixelError: s
	});
	let c = [], l = [], u = !1, d = 0, f = 0, p = s ? Y(s) : 1;
	for (let a of e) {
		let e = Math.hypot(t[0] - a.position[0], t[1] - a.position[1], t[2] - a.position[2]), o = a.variant.distances.map((e) => e * n * p * (s ? a.scale : 1)), m = Kt(a.level, e, o, r, i);
		m !== a.level && (u = !0), a.level = m, m < 0 ? d++ : (l[m] = (l[m] ?? 0) + 1, c.push(...Ut(a, m, `${a.species} ${a.index}`)), f += a.variant.levels[m].triangles);
	}
	return {
		parts: c,
		changed: u,
		levelCounts: Array.from(l, (e) => e ?? 0),
		culled: d,
		triangles: f
	};
}
function Jt(e, t, { distanceScale: n = 1, cullDistance: r = Infinity } = {}) {
	return Kt(-1, e, t.distances.map((e) => e * n), 0, r);
}
function Yt(e, t, n = 0, r = e.species) {
	return e.levels[n].parts.map((e) => ({
		name: `${r} ${e.role}`,
		geometry: e.geometry,
		shadowLods: e.shadowLods,
		matrix: t,
		material: e.material
	}));
}
export { te as _, Jt as a, Wt as c, Re as d, He as f, H as g, Ve as h, At as i, qt as l, Y as m, Pt as n, mt as o, J as p, Gt as r, ht as s, It as t, Yt as u };
