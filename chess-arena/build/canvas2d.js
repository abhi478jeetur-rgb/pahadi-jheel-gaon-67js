/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { n as e, o as t } from "./mat4-BCZClxna.js";
import { i as n, n as r } from "./quat-Bl7gjwWK.js";
// src/canvas2d.js
function i(e, t) {
	let n = [];
	for (let t = 0; t < e.length / 3; t++) n.push(0, 0, 1);
	return {
		positions: new Float32Array(e),
		normals: new Float32Array(n),
		indices: new Uint32Array(t)
	};
}
function a(e = 96, t = 0) {
	let n = [], r = [];
	if (t === 0) {
		n.push(0, 0, 0);
		for (let t = 0; t <= e; t++) {
			let r = t / e * Math.PI * 2;
			n.push(Math.cos(r), Math.sin(r), 0);
		}
		for (let t = 0; t < e; t++) r.push(0, t + 1, t + 2);
	} else {
		for (let r = 0; r <= e; r++) {
			let i = r / e * Math.PI * 2;
			for (let e of [t, 1]) n.push(Math.cos(i) * e, Math.sin(i) * e, 0);
		}
		for (let t = 0; t < e; t++) {
			let e = t * 2;
			r.push(e, e + 1, e + 2, e + 1, e + 3, e + 2);
		}
	}
	return i(n, r);
}
function o(e = .08, t = 12) {
	let n = [
		0,
		0,
		0
	], r = [];
	for (let r = 0; r < 4; r++) {
		let i = r * Math.PI / 2, a = [Math.cos(i + Math.PI / 4) > 0 ? .5 - e : -.5 + e, Math.sin(i + Math.PI / 4) > 0 ? .5 - e : -.5 + e];
		for (let r = 0; r <= t; r++) {
			let o = i + r / t * Math.PI / 2;
			n.push(a[0] + Math.cos(o) * e, a[1] + Math.sin(o) * e, 0);
		}
	}
	let a = n.length / 3 - 1;
	for (let e = 0; e < a; e++) r.push(0, e + 1, (e + 1) % a + 1);
	return i(n, r);
}
function s() {
	let s = {
		rectangle: i([
			-.5,
			-.5,
			0,
			.5,
			-.5,
			0,
			.5,
			.5,
			0,
			-.5,
			.5,
			0
		], [
			0,
			1,
			2,
			0,
			2,
			3
		]),
		rounded: o(),
		disk: a(),
		ring: a(144, .987)
	}, c = {
		paper: [
			.83,
			.85,
			.82
		],
		ink: [
			.022,
			.027,
			.03
		],
		purple: [
			.31,
			.16,
			.57
		],
		acid: [
			.69,
			.91,
			.08
		],
		pale: [
			.52,
			.61,
			.59
		],
		white: [
			.95,
			.96,
			.92
		]
	}, l = [], u = [];
	function d(i, a, o, u, d, f = 0) {
		let p = t(e(), n(r(), 0, 0, f * 180 / Math.PI), o, [
			u[0],
			u[1],
			1
		]), m = {
			name: i,
			geometry: s[a],
			matrix: p,
			material: {
				tag: "unlit",
				color: c[d],
				metallic: 0,
				roughness: 1,
				emission: 0
			}
		};
		return l.push(m), m;
	}
	function f(e, t, n, r, i, a) {
		let o = n.map((e, n) => e - t[n]);
		return d(e, "rectangle", [
			(t[0] + n[0]) / 2,
			(t[1] + n[1]) / 2,
			r
		], [Math.hypot(...o), i], a, Math.atan2(o[1], o[0]));
	}
	d("Poster paper", "rounded", [
		0,
		0,
		0
	], [4, 5], "paper"), d("Purple upper inset", "rounded", [
		0,
		.65,
		.01
	], [3.6, 3.25], "purple"), d("Orbital lime disk", "disk", [
		0,
		.46,
		.02
	], [1.05, 1.05], "acid"), d("Orbital center", "disk", [
		0,
		.46,
		.025
	], [.11, .11], "ink");
	for (let e = 0; e < 3; e++) d("Orbital ellipse", "ring", [
		0,
		.46,
		.03 + e * .002
	], [1.55, .6 + e * .26], "white", e * Math.PI / 3);
	for (let e = 0; e < 48; e++) {
		let t = e / 48 * Math.PI * 2, n = 1.26;
		f("Radial registration mark", [Math.cos(t) * n, .46 + Math.sin(t) * n], [Math.cos(t) * (n + (e % 4 == 0 ? .09 : .035)), .46 + Math.sin(t) * (n + (e % 4 == 0 ? .09 : .035))], .04, .008, "ink");
	}
	for (let e = 0; e < 4; e++) {
		let t = d("Orbiting vector dot", "disk", [
			0,
			0,
			.05
		], [.068, .068], e % 2 ? "acid" : "white");
		u.push({
			part: t,
			index: e
		});
	}
	let p = [
		[
			-.09,
			.12,
			.18,
			.035
		],
		[
			-.09,
			0,
			.18,
			.035
		],
		[
			-.09,
			-.12,
			.18,
			.035
		],
		[
			-.19,
			.06,
			.035,
			.13
		],
		[
			-.19,
			-.06,
			.035,
			.13
		],
		[
			.01,
			.06,
			.035,
			.13
		],
		[
			.01,
			-.06,
			.035,
			.13
		]
	];
	for (let [e, t] of [[-1.25, [
		0,
		1,
		2,
		3,
		4,
		6
	]], [-.94, [
		0,
		5,
		6
	]]]) for (let n of t) {
		let [t, r, i, a] = p[n];
		d("Vector 67 digit", "rectangle", [
			e + t,
			1.98 + r,
			.06
		], [i, a], "white");
	}
	for (let e = 0; e < 3; e++) d("Poster header dot", "disk", [
		1.09 + e * .19,
		1.98,
		.06
	], [.038, .038], "acid");
	d("Waveform strip", "rounded", [
		0,
		-1.58,
		.01
	], [3.6, .88], "ink");
	for (let e = 0; e < 47; e++) {
		let t = -1.58 + e / 47 * 3.16, n = -1.58 + (e + 1) / 47 * 3.16;
		f("Signal waveform", [t, -1.58 + Math.sin(e * .34) * .17], [n, -1.58 + Math.sin((e + 1) * .34) * .17], .02, .022, "acid");
	}
	for (let e = 0; e < 29; e++) d("Vector footer code", "rectangle", [
		-1.65 + e * .037,
		-2.22,
		.01
	], [e % 3 == 0 ? .022 : .01, e % 4 == 0 ? .16 : .11], "ink");
	f("Footer direction shaft", [.97, -2.22], [1.55, -2.22], .02, .024, "ink"), f("Footer arrow upper", [1.4, -2.08], [1.55, -2.22], .02, .024, "ink"), f("Footer arrow lower", [1.4, -2.36], [1.55, -2.22], .02, .024, "ink");
	function m(e) {
		if (!Number.isFinite(e)) throw TypeError("Canvas timeline time must be finite");
		let t = e / 8 * Math.PI * 2;
		for (let { part: e, index: n } of u) {
			let r = t + n * Math.PI / 2, i = n % 3, a = i * Math.PI / 3, o = Math.cos(r) * 1.55, s = Math.sin(r) * (.6 + i * .26);
			e.matrix[12] = Math.cos(a) * o - Math.sin(a) * s, e.matrix[13] = .46 + Math.sin(a) * o + Math.cos(a) * s;
		}
		return u.map((e) => e.part);
	}
	return m(0), {
		parts: l,
		duration: 8,
		animate: m,
		bounds: {
			minimum: [
				-2,
				-2.5,
				0
			],
			maximum: [
				2,
				2.5,
				.06
			]
		},
		camera: {
			eye: [
				0,
				0,
				8
			],
			target: [
				0,
				0,
				0
			],
			up: [
				0,
				1,
				0
			],
			projection: "orthographic",
			orthographicHeight: 5.8
		}
	};
}
export { s as createCanvas2D, a as disk2D, o as roundedRect2D };
