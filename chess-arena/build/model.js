/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { c as e, i as t, s as n, t as r } from "./geometry-C1ukZMAo.js";
import { n as i, o as a } from "./mat4-BCZClxna.js";
import { i as o, n as s } from "./quat-Bl7gjwWK.js";
import { t as c } from "./assembly-CVbal4ya.js";
// src/model.js
var l = Math.PI / 2, u = {
	armor: {
		tag: "armor",
		weathered: !0,
		color: [
			.73,
			.43,
			.065
		],
		metallic: .62,
		roughness: .43,
		emission: 0
	},
	steel: {
		tag: "steel",
		color: [
			.34,
			.37,
			.36
		],
		metallic: .88,
		roughness: .3,
		emission: 0
	},
	silver: {
		tag: "silver",
		color: [
			.59,
			.61,
			.59
		],
		metallic: .85,
		roughness: .24,
		emission: 0
	},
	dark: {
		tag: "dark",
		color: [
			.035,
			.042,
			.041
		],
		metallic: .65,
		roughness: .38,
		emission: 0
	},
	rubber: {
		tag: "rubber",
		color: [
			.019,
			.022,
			.02
		],
		metallic: .05,
		roughness: .74,
		emission: 0
	},
	lens: {
		tag: "lens",
		color: [
			.009,
			.025,
			.036
		],
		metallic: .8,
		roughness: .1,
		emission: 0
	},
	copper: {
		tag: "copper",
		color: [
			.51,
			.19,
			.065
		],
		metallic: .9,
		roughness: .3,
		emission: 0
	},
	board: {
		tag: "board",
		color: [
			.025,
			.15,
			.078
		],
		metallic: .15,
		roughness: .5,
		emission: 0
	},
	red: {
		tag: "red",
		color: [
			.43,
			.045,
			.025
		],
		metallic: .2,
		roughness: .46,
		emission: 0
	},
	light: {
		tag: "light",
		color: [
			.18,
			.55,
			.32
		],
		metallic: .1,
		roughness: .32,
		emission: .5
	}
};
function d(e, t, n) {
	let r = o(s(), ...n.map((e) => e * 180 / Math.PI));
	return a(i(), r, e, t);
}
function f() {
	let i = [], a = {
		plate: r(.07, 3),
		shell: r(.15, 7),
		sphere: n(),
		cylinder: t(),
		bolt: t(6),
		ring: e(.045),
		fineRing: e(.025)
	};
	function o(e, t, n) {
		return {
			layer: e,
			section: t,
			offset: n
		};
	}
	let s = o("interior", "Structural frame", [
		0,
		0,
		0
	]), f = o("interior", "Battery cassette", [
		0,
		-.08,
		.22
	]), p = o("interior", "Control electronics", [
		0,
		.1,
		.3
	]), m = o("interior", "Differential drive", [
		0,
		-.04,
		-.16
	]), h = o("exterior", "Front compactor panel", [
		0,
		0,
		1.7
	]), g = o("exterior", "Rear service panel", [
		0,
		0,
		-1.4
	]), _ = o("exterior", "Roof panel", [
		0,
		1.35,
		0
	]), v = o("interior", "Neck linkage", [
		0,
		.2,
		0
	]);
	function y(e, t, n, r, o, s, c = [
		0,
		0,
		0
	]) {
		i.push({
			name: e,
			geometry: a[t],
			matrix: d(n, r, c),
			material: u[o],
			assembly: s
		});
	}
	function b(e, t, n, r, i, a = [
		0,
		0,
		0
	]) {
		y(e, "plate", t, n, r, i, a);
	}
	function x(e, t, n, r, i, a, o = "z") {
		y(e, "cylinder", t, [
			n,
			r,
			n
		], i, a, o === "x" ? [
			0,
			0,
			l
		] : o === "z" ? [
			l,
			0,
			0
		] : [
			0,
			0,
			0
		]);
	}
	function S(e, t, n, r, i, a = "z", o = !1) {
		y(e, o ? "fineRing" : "ring", t, [
			n,
			n,
			n
		], r, i, a === "x" ? [
			0,
			l,
			0
		] : [
			0,
			0,
			0
		]);
	}
	function C(e, t, n, r = "z", i = .025) {
		y(e, "bolt", t, [
			i,
			.018,
			i
		], "silver", n, r === "x" ? [
			0,
			0,
			l
		] : r === "y" ? [
			0,
			0,
			0
		] : [
			l,
			0,
			0
		]);
	}
	function w(e, t, n, r, i, a) {
		let o = n.map((e, n) => e - t[n]), s = Math.hypot(...o);
		y(e, "cylinder", t.map((e, t) => (e + n[t]) / 2), [
			r,
			s,
			r
		], i, a, [
			Math.acos(o[1] / s),
			Math.atan2(o[0], o[2]),
			0
		]);
	}
	function T(e, t, n, r, i) {
		t.forEach((a, o) => {
			y(`${e} bend`, "sphere", a, [
				n,
				n,
				n
			], r, i), o > 0 && w(e, t[o - 1], a, n, r, i);
		});
	}
	b("Chassis floor", [
		0,
		.72,
		0
	], [
		1.43,
		.09,
		.98
	], "steel", s), b("Compactor front yellow panel", [
		0,
		1.255,
		.536
	], [
		1.42,
		1.04,
		.075
	], "armor", h), b("Front raised door", [
		0,
		1.21,
		.589
	], [
		1.17,
		.73,
		.042
	], "armor", h), b("Front upper dark control strip", [
		0,
		1.68,
		.592
	], [
		1.22,
		.15,
		.033
	], "dark", h), b("Solar charge gauge inset", [
		-.34,
		1.68,
		.614
	], [
		.37,
		.085,
		.015
	], "rubber", h);
	for (let e = 0; e < 5; e++) b("Charge gauge bar", [
		-.48 + e * .068,
		1.68,
		.628
	], [
		.037,
		.04,
		.009
	], e < 3 ? "light" : "steel", h);
	x("Red power switch", [
		.39,
		1.68,
		.628
	], .036, .018, "red", h), b("Front horizontal door recess", [
		0,
		1.06,
		.616
	], [
		.97,
		.018,
		.006
	], "dark", h), b("Identification badge", [
		-.27,
		1.39,
		.621
	], [
		.52,
		.16,
		.014
	], "steel", h);
	for (let [e, t] of [
		[-.465, .22],
		[-.399, -.22],
		[-.333, .22],
		[-.267, -.22]
	]) b("Badge W stroke", [
		e,
		1.39,
		.633
	], [
		.014,
		.084,
		.009
	], "dark", h, [
		0,
		0,
		t
	]);
	b("Badge separator", [
		-.207,
		1.39,
		.633
	], [
		.032,
		.009,
		.009
	], "dark", h), b("Badge E stem", [
		-.16,
		1.39,
		.633
	], [
		.012,
		.082,
		.009
	], "dark", h);
	for (let e of [
		1.355,
		1.39,
		1.425
	]) b("Badge E stroke", [
		-.135,
		e,
		.633
	], [
		.06,
		.012,
		.009
	], "dark", h);
	b("Rear yellow service panel", [
		0,
		1.255,
		-.536
	], [
		1.42,
		1.04,
		.075
	], "armor", g), b("Rear cooling recess", [
		0,
		1.34,
		-.584
	], [
		.86,
		.43,
		.018
	], "dark", g);
	for (let e = 0; e < 8; e++) b("Rear cooling grille", [
		0,
		1.17 + e * .048,
		-.6
	], [
		.75,
		.018,
		.017
	], "steel", g);
	b("Top yellow shell", [
		0,
		1.802,
		0
	], [
		1.43,
		.085,
		1.04
	], "armor", _), b("Roof solar access inset", [
		.31,
		1.85,
		-.06
	], [
		.48,
		.022,
		.56
	], "dark", _);
	for (let e = 0; e < 5; e++) b("Roof access rib", [
		.12 + e * .095,
		1.868,
		-.06
	], [
		.022,
		.016,
		.46
	], "steel", _);
	for (let e of [-1, 1]) {
		let t = o("exterior", e < 0 ? "Left body panel" : "Right body panel", [
			e * 1.15,
			.15,
			0
		]);
		b("Yellow side shell", [
			e * .735,
			1.255,
			0
		], [
			.065,
			1.04,
			1.04
		], "armor", t), b("Side embossed service inset", [
			e * .775,
			1.14,
			-.08
		], [
			.021,
			.4,
			.61
		], "steel", t);
		for (let n of [.83, 1.69]) for (let r of [-.43, .43]) C("Side shell screw", [
			e * .785,
			n,
			r
		], t, "x");
		for (let t of [-.43, .43]) b("Internal frame upright", [
			e * .62,
			1.25,
			t
		], [
			.065,
			.99,
			.065
		], "steel", s), C("Frame fastener", [
			e * .62,
			1.68,
			t + .04
		], s);
		b("Chassis upper longitudinal rail", [
			e * .62,
			1.72,
			0
		], [
			.07,
			.07,
			.91
		], "silver", s);
	}
	for (let e of [-.43, .43]) b("Chassis crossmember", [
		0,
		1.72,
		e
	], [
		1.27,
		.07,
		.07
	], "steel", s);
	for (let e of [-.6, .6]) for (let t of [.83, 1.67]) C("Front panel fastener", [
		e,
		t,
		.623
	], h);
	b("Battery retaining tray", [
		0,
		.9,
		.14
	], [
		1.03,
		.045,
		.57
	], "dark", f);
	for (let e = 0; e < 2; e++) for (let t = 0; t < 6; t++) {
		let n = -.43 + t * .17, r = -.005 + e * .27;
		x("Battery cylindrical cell", [
			n,
			1.05,
			r
		], .07, .27, "copper", f, "y"), x("Battery terminal", [
			n,
			1.194,
			r
		], .04, .016, "silver", f, "y"), b("Cell nickel bridge", [
			n + .065,
			1.205,
			r
		], [
			.12,
			.009,
			.022
		], "silver", f);
	}
	b("Battery restraint", [
		0,
		1.14,
		.13
	], [
		1.05,
		.07,
		.032
	], "dark", f), b("Main controller circuit board", [
		0,
		1.46,
		.09
	], [
		1.06,
		.034,
		.69
	], "board", p), b("Processor package", [
		-.14,
		1.495,
		.04
	], [
		.24,
		.025,
		.23
	], "dark", p);
	for (let e = 0; e < 7; e++) b("Processor cooling fin", [
		-.23 + e * .031,
		1.54,
		.04
	], [
		.014,
		.085,
		.22
	], "silver", p);
	for (let e = 0; e < 5; e++) x("Controller capacitor", [
		.23 + e % 2 * .13,
		1.537,
		-.17 + Math.floor(e / 2) * .13
	], .039, .11, "dark", p, "y"), b("Board gold trace", [
		-.39 + e * .18,
		1.483,
		.27
	], [
		.085,
		.005,
		.009
	], "copper", p), b("Board connector", [
		-.37 + e * .17,
		1.51,
		-.21
	], [
		.11,
		.055,
		.065
	], "rubber", p);
	for (let e = 0; e < 8; e++) b("Memory chip", [
		-.43 + e % 4 * .11,
		1.488,
		.16 + Math.floor(e / 4) * .1
	], [
		.075,
		.015,
		.045
	], "dark", p);
	x("Compactor main motor", [
		0,
		1.1,
		-.31
	], .17, .59, "steel", m, "x");
	for (let e = 0; e < 7; e++) S("Motor cooling collar", [
		-.21 + e * .07,
		1.1,
		-.31
	], .168, "dark", m, "x", !0);
	x("Differential shaft", [
		0,
		.68,
		-.04
	], .075, 1.69, "silver", m, "x"), x("Differential gearbox", [
		0,
		.7,
		-.04
	], .19, .34, "dark", m, "x");
	for (let e of [-1, 1]) {
		x("Drive transmission gear", [
			e * .37,
			.82,
			-.24
		], .15, .075, "copper", m, "x");
		for (let t = 0; t < 18; t++) {
			let n = t / 18 * Math.PI * 2;
			b("Transmission gear tooth", [
				e * .37,
				.82 + Math.sin(n) * .151,
				-.24 + Math.cos(n) * .151
			], [
				.08,
				.036,
				.027
			], "steel", m, [
				n,
				0,
				0
			]);
		}
		let t = [];
		for (let n = 0; n < 12; n++) {
			let r = n / 11;
			t.push([
				e * (.44 + .025 * Math.sin(r * Math.PI)),
				1.12 + r * .47,
				-.15 + Math.sin(r * Math.PI) * .2
			]);
		}
		T("Interior harness copper lead", t, .012, "copper", p), T("Interior harness red lead", t.map((t) => [
			t[0] + e * .028,
			t[1],
			t[2]
		]), .011, "red", p);
	}
	let E = [
		[.095, -.59],
		[.095, .6],
		[.32, .73],
		[.66, .48],
		[.7, -.37],
		[.38, -.73]
	];
	for (let e of [-1, 1]) {
		let t = o("exterior", e < 0 ? "Left track assembly" : "Right track assembly", [
			e * 1.7,
			0,
			0
		]), n = o("exterior", e < 0 ? "Left arm and claw" : "Right arm and claw", [
			e * 1.8,
			.3,
			.25
		]);
		for (let n = 0; n < E.length; n++) {
			let r = E[n], i = E[(n + 1) % E.length], a = i[0] - r[0], o = i[1] - r[1], s = Math.ceil(Math.hypot(a, o) / .115), c = [
				-Math.atan2(a, o),
				0,
				0
			];
			for (let n = 0; n < s; n++) {
				let i = (n + .5) / s, l = [
					e * .99,
					r[0] + a * i,
					r[1] + o * i
				];
				b("Caterpillar steel shoe", l, [
					.39,
					.065,
					.111
				], "steel", t, c), b("Caterpillar rubber traction pad", l, [
					.41,
					.087,
					.075
				], "rubber", t, c);
			}
		}
		for (let [n, r, i] of [
			[
				.36,
				-.43,
				.255
			],
			[
				.41,
				.43,
				.275
			],
			[
				.3,
				0,
				.19
			]
		]) {
			x("Track sprocket drum", [
				e * .99,
				n,
				r
			], i, .31, "dark", t, "x"), x("Track exposed wheel disc", [
				e * 1.165,
				n,
				r
			], i * .79, .035, "steel", t, "x"), S("Track wheel rim", [
				e * 1.19,
				n,
				r
			], i * .77, "silver", t, "x"), x("Track wheel hub", [
				e * 1.205,
				n,
				r
			], i * .27, .038, "dark", t, "x"), C("Track hub retaining bolt", [
				e * 1.232,
				n,
				r
			], t, "x", .032);
			for (let a = 0; a < 6; a++) {
				let o = a / 6 * Math.PI * 2;
				C("Track wheel bolt", [
					e * 1.193,
					n + Math.sin(o) * i * .54,
					r + Math.cos(o) * i * .54
				], t, "x", .013);
			}
		}
		b("Track tension beam", [
			e * 1.185,
			.43,
			0
		], [
			.038,
			.075,
			.66
		], "armor", t), x("Shoulder pivot", [
			e * .8,
			1.55,
			.07
		], .125, .18, "dark", n, "x"), b("Upper arm yellow housing", [
			e * .935,
			1.425,
			.14
		], [
			.14,
			.4,
			.22
		], "armor", n, [
			.1,
			0,
			e * .31
		]), b("Arm exposed piston rail", [
			e * .94,
			1.34,
			.265
		], [
			.08,
			.36,
			.038
		], "silver", n, [
			.1,
			0,
			e * .31
		]), x("Elbow bearing", [
			e * 1.015,
			1.25,
			.22
		], .095, .16, "steel", n, "x"), b("Forearm steel linkage", [
			e * 1.075,
			1.17,
			.39
		], [
			.13,
			.13,
			.39
		], "steel", n, [
			-.28,
			e * -.13,
			0
		]), b("Forearm yellow cuff", [
			e * 1.075,
			1.175,
			.35
		], [
			.16,
			.17,
			.2
		], "armor", n), b("Claw palm", [
			e * 1.065,
			1.13,
			.605
		], [
			.29,
			.105,
			.25
		], "silver", n);
		for (let t of [-1, 1]) b("Claw finger root", [
			e * 1.065 + t * .09,
			1.13,
			.775
		], [
			.073,
			.1,
			.2
		], "steel", n), b("Claw curved fingertip", [
			e * 1.065 + t * .083,
			1.095,
			.886
		], [
			.08,
			.15,
			.064
		], "silver", n, [
			.25,
			0,
			t * -.08
		]), C("Claw finger rivet", [
			e * 1.065 + t * .09,
			1.186,
			.77
		], n, "y", .016);
		C("Elbow pivot screw", [
			e * 1.108,
			1.25,
			.22
		], n, "x", .033);
	}
	x("Neck yaw bearing", [
		0,
		1.86,
		-.04
	], .17, .14, "dark", v, "y"), b("Neck lower yellow hinge", [
		0,
		2.02,
		-.12
	], [
		.25,
		.27,
		.24
	], "armor", v, [
		-.22,
		0,
		0
	]), w("Neck articulated spine", [
		0,
		2.05,
		-.11
	], [
		0,
		2.36,
		.14
	], .065, "steel", v);
	for (let e of [-1, 1]) w("Neck hydraulic piston", [
		e * .11,
		1.91,
		-.05
	], [
		e * .11,
		2.34,
		.13
	], .034, "silver", v);
	x("Head tilt axle", [
		0,
		2.38,
		.12
	], .095, .66, "dark", v, "x"), b("Binocular central bridge", [
		0,
		2.57,
		.13
	], [
		.28,
		.12,
		.2
	], "steel", v);
	for (let e of [-1, 1]) {
		let t = o("exterior", e < 0 ? "Left eye housing" : "Right eye housing", [
			e * .52,
			.82,
			-.12
		]), n = o("interior", e < 0 ? "Left optical mechanism" : "Right optical mechanism", [
			e * .14,
			.3,
			.12
		]), r = o("exterior", e < 0 ? "Left lens assembly" : "Right lens assembly", [
			e * .52,
			.82,
			1.03
		]), i = e * .39, a = e * -.16;
		y("Binocular rear rounded housing", "shell", [
			i,
			2.575,
			.095
		], [
			.72,
			.48,
			.46
		], "steel", t, [
			0,
			0,
			a
		]), y("Binocular upper silver brow", "shell", [
			i,
			2.787,
			.263
		], [
			.69,
			.085,
			.13
		], "silver", t, [
			0,
			0,
			a
		]), y("Binocular lower rim", "shell", [
			i,
			2.359,
			.265
		], [
			.6,
			.06,
			.12
		], "dark", t, [
			0,
			0,
			a
		]), x("Eye optical chassis", [
			i,
			2.56,
			.24
		], .232, .22, "dark", n), S("Eye focusing actuator", [
			i,
			2.56,
			.32
		], .202, "copper", n), b("Eye sensor circuit board", [
			i,
			2.56,
			.095
		], [
			.29,
			.28,
			.027
		], "board", n, [
			0,
			0,
			a
		]), x("Eye lens retaining barrel", [
			i,
			2.56,
			.37
		], .247, .1, "dark", r), S("Eye outer silver rim", [
			i,
			2.56,
			.429
		], .229, "silver", r), y("Eye dark glass", "sphere", [
			i,
			2.56,
			.429
		], [
			.213,
			.213,
			.045
		], "lens", r), x("Eye central pupil", [
			i,
			2.56,
			.473
		], .09, .012, "rubber", r), S("Eye concentric glass reflection ring", [
			i,
			2.56,
			.477
		], .136, "dark", r, "z", !0);
		for (let e = 0; e < 8; e++) {
			let t = e / 8 * Math.PI * 2;
			b("Eye iris blade", [
				i + Math.cos(t) * .162,
				2.56 + Math.sin(t) * .162,
				.463
			], [
				.06,
				.011,
				.006
			], "steel", r, [
				0,
				0,
				t + .45
			]);
		}
		for (let e of [
			.23,
			.28,
			.33
		]) S("Eye internal focus collar", [
			i,
			2.56,
			e
		], .184, "steel", n, "z", !0);
		for (let e of [-.25, .25]) C("Binocular housing fastener", [
			i + e,
			2.55 + e * a,
			.336
		], t, "z", .018);
		T("Head sensor lead", [
			[
				i,
				2.44,
				.02
			],
			[
				i * .8,
				2.37,
				.02
			],
			[
				i * .35,
				2.33,
				.05
			]
		], .015, "copper", n);
	}
	return c(i);
}
export { f as createModel };
