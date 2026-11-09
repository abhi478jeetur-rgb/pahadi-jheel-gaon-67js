/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { n as e, o as t } from "./mat4-BCZClxna.js";
import { d as n, i as r, n as i } from "./quat-Bl7gjwWK.js";
import { c as a, i as o, s, t as c } from "./geometry-C1ukZMAo.js";
import { i as l, o as u, r as d } from "./animation-IxY9GETP.js";
// src/motion.js
var f = 12;
function p(e, t) {
	return Array.from(n(i(), e, t));
}
function m(n, a, o = [
	0,
	0,
	0
]) {
	return t(e(), r(i(), ...o), n, a);
}
function h(e, t, n, r = 0) {
	return {
		tag: r ? "light" : "mechanism",
		color: e,
		metallic: t,
		roughness: n,
		emission: r
	};
}
function g(e, t, n) {
	return d({
		duration: 4,
		tracks: [{
			target: "eye",
			property: "translation",
			interpolation: "SMOOTH",
			keyframes: [{
				time: 0,
				value: e
			}, {
				time: 4,
				value: t
			}]
		}, {
			target: "fov",
			property: "value",
			keyframes: [{
				time: 0,
				value: n
			}]
		}]
	});
}
function _() {
	let e = [], t = [], n = {
		ring: a(.045, 64, 10),
		collar: o(32),
		plate: c(.07, 4),
		bead: s(20, 12),
		bolt: o(8)
	}, r = h([
		.52,
		.29,
		.075
	], .87, .28), i = h([
		.018,
		.029,
		.033
	], .72, .36), f = h([
		.32,
		.4,
		.43
	], .93, .23), _ = h([
		.035,
		.58,
		.37
	], .14, .26, 3.2), v = h([
		.74,
		.16,
		.025
	], .1, .3, 1.7);
	function y(t, r, i, a, o, s) {
		return e.push({
			name: t,
			geometry: n[r],
			matrix: m(i, a, s),
			material: o
		}), t;
	}
	function b(e, n, r = 1, i = 12) {
		t.push({
			target: e,
			property: "rotation",
			keyframes: Array.from({ length: 9 }, (e, t) => ({
				time: i * t / 8,
				value: p(n, t / 8 * Math.PI * 2 * r)
			}))
		});
	}
	y("Reactor housing", "collar", [
		0,
		0,
		0
	], [
		.64,
		1.15,
		.64
	], i);
	for (let e = 0; e < 5; e++) {
		let n = -.52 + e * .26;
		b(y(`Rotor ${e}`, "collar", [
			0,
			n,
			0
		], [
			.75,
			.09,
			.75
		], e % 2 ? f : r), [
			0,
			1,
			0
		], e % 2 ? -1 : 1);
		for (let i = 0; i < 20; i++) {
			let a = i / 20 * Math.PI * 2, o = y(`Rotor ${e} tooth ${i}`, "plate", [
				Math.cos(a) * .73,
				n,
				Math.sin(a) * .73
			], [
				.16,
				.085,
				.13
			], e % 2 ? f : r, [
				0,
				-a * 180 / Math.PI,
				0
			]);
			t.push({
				target: o,
				property: "translation",
				interpolation: "CUBICSPLINE",
				keyframes: Array.from({ length: 17 }, (t, r) => {
					let i = a + r / 16 * Math.PI * 2 * (e % 2 ? -1 : 1), o = Math.PI * 2 / 12 * (e % 2 ? -1 : 1), s = [
						-Math.sin(i) * .73 * o,
						0,
						Math.cos(i) * .73 * o
					];
					return {
						time: r / 16 * 12,
						value: [
							Math.cos(i) * .73,
							n,
							Math.sin(i) * .73
						],
						inTangent: s,
						outTangent: s
					};
				})
			}), t.push({
				target: o,
				property: "rotation",
				keyframes: Array.from({ length: 17 }, (t, n) => ({
					time: n / 16 * 12,
					value: p([
						0,
						1,
						0
					], -a - n / 16 * Math.PI * 2 * (e % 2 ? -1 : 1))
				}))
			});
		}
	}
	y("Core lens", "bead", [
		0,
		.74,
		0
	], [
		.38,
		.38,
		.38
	], _), t.push({
		target: "Core lens",
		property: "emission",
		interpolation: "SMOOTH",
		keyframes: [
			{
				time: 0,
				value: .7
			},
			{
				time: 3,
				value: 3.2
			},
			{
				time: 6,
				value: 5
			},
			{
				time: 9,
				value: 2.5
			},
			{
				time: 12,
				value: .7
			}
		]
	});
	for (let e = 0; e < 3; e++) {
		let t = 1.1 + e * .27;
		b(y(`Gimbal ${e}`, "ring", [
			0,
			.12,
			0
		], [
			t,
			t,
			t
		], e === 1 ? f : r), e === 0 ? [
			1,
			0,
			0
		] : e === 1 ? [
			0,
			1,
			0
		] : [
			0,
			0,
			1
		], e === 1 ? -1 : 1);
	}
	for (let e = 0; e < 8; e++) {
		let n = e / 8 * Math.PI * 2, r = y(`Orbit pod ${e}`, "bead", [
			Math.cos(n) * 1.8,
			.2,
			Math.sin(n) * 1.8
		], [
			.115,
			.115,
			.115
		], e % 2 ? _ : v);
		t.push({
			target: r,
			property: "translation",
			interpolation: "CUBICSPLINE",
			keyframes: Array.from({ length: 25 }, (e, t) => {
				let r = t / 24, i = n + r * Math.PI * 2, a = 1.8 + Math.sin(r * Math.PI * 2) * .2, o = Math.PI * 2 / 12, s = Math.cos(r * Math.PI * 2) * .2 * o, c = [
					Math.cos(i) * s - Math.sin(i) * a * o,
					Math.cos(i * 2) * 1.3 * o,
					Math.sin(i) * s + Math.cos(i) * a * o
				];
				return {
					time: r * 12,
					value: [
						Math.cos(i) * a,
						.25 + Math.sin(i * 2) * .65,
						Math.sin(i) * a
					],
					inTangent: c,
					outTangent: c
				};
			})
		});
	}
	for (let e = 0; e < 16; e++) {
		let t = e / 16 * Math.PI * 2;
		y(`Housing fastener ${e}`, "bolt", [
			Math.cos(t) * .51,
			.61,
			Math.sin(t) * .51
		], [
			.033,
			.1,
			.033
		], f);
	}
	y("Lower spindle", "collar", [
		0,
		-.9,
		0
	], [
		.13,
		.75,
		.13
	], f), y("Spindle tip", "bead", [
		0,
		-1.31,
		0
	], [
		.18,
		.18,
		.18
	], r);
	for (let e = 0; e < 24; e++) {
		let t = e / 24 * Math.PI * 2;
		y(`Cooling rib ${e}`, "plate", [
			Math.cos(t) * .57,
			0,
			Math.sin(t) * .57
		], [
			.035,
			1.05,
			.08
		], f, [
			0,
			-t * 180 / Math.PI,
			0
		]);
	}
	for (let e of [-.66, .66]) y(`Light collar ${e}`, "ring", [
		0,
		e,
		0
	], [
		.67,
		.67,
		.67
	], _, [
		90,
		0,
		0
	]);
	y("Orbital rail", "ring", [
		0,
		-.2,
		0
	], [
		2.2,
		2.2,
		2.2
	], i, [
		90,
		0,
		0
	]);
	for (let e = 0; e < 72; e++) {
		let t = e / 72 * Math.PI * 2;
		y(`Orbital index ${e}`, "plate", [
			Math.cos(t) * 2.2,
			-.2,
			Math.sin(t) * 2.2
		], [
			e % 6 == 0 ? .13 : .05,
			.025,
			.025
		], e % 6 == 0 ? r : f, [
			0,
			-t * 180 / Math.PI,
			0
		]);
	}
	let x = d({
		duration: 12,
		tracks: t
	}), S = l(x, e), C = [
		g([
			4.8,
			2.7,
			7.4
		], [
			3.5,
			1.8,
			6.1
		], 40),
		g([
			3.2,
			.85,
			4.7
		], [
			1.1,
			1.8,
			4.3
		], 38),
		g([
			-4.4,
			2.6,
			7
		], [
			-2.7,
			1.5,
			7.7
		], 42)
	];
	function w(e, t = "landscape") {
		if (!Number.isFinite(e)) throw TypeError("Motion time must be finite.");
		if (![
			"landscape",
			"portrait",
			"square"
		].includes(t)) throw RangeError("Unknown motion aspect.");
		let n = Math.max(0, Math.min(12, e));
		S.apply(n);
		let r = Math.min(2, Math.floor(n / 4)), i = Object.fromEntries(u(C[r], n - r * 4).map((e) => [e.target, e.value])), a = t === "portrait" ? 2.35 : t === "square" ? 1.4 : 1.2;
		return {
			time: n,
			shot: r,
			camera: {
				eye: i.eye.map((e) => e * a),
				target: [
					0,
					.1,
					0
				],
				fov: i.fov
			},
			effects: {
				bloom: {
					strength: .32,
					threshold: .82,
					radius: 1.4
				},
				saturation: .95,
				contrast: 1.07,
				temperature: .06,
				vignette: .17,
				grain: .012
			},
			exposure: 1
		};
	}
	return {
		name: "Clockwork orbit",
		duration: 12,
		parts: e,
		clip: x,
		player: S,
		sample: w
	};
}
export { f as MOTION_DURATION, _ as createMotionScene };
