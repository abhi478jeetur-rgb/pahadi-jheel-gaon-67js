/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
// src/shadow-light.js
var e = [
	-3,
	6,
	4
], t = {
	world: {
		distance: 75,
		target: [
			0,
			2,
			-10
		],
		extent: 65,
		near: 1,
		far: 220
	},
	studio: {
		distance: 7.2,
		target: [
			0,
			1,
			0
		],
		extent: 3.5,
		near: .1,
		far: 15
	}
};
function n(n, r, i = {}) {
	let { distance: a, ...o } = t[n ? "world" : "studio"], s = i.target ?? o.target, c = r ?? e, l = Math.hypot(c[0], c[1], c[2]) > 1e-6 ? c : e, u = Math.hypot(l[0], l[1], l[2]), d = s.map((e, t) => e + l[t] / u * a);
	return {
		...o,
		eye: d,
		...i,
		target: s
	};
}
var r = 3.5;
function i(e, t) {
	return e.extent * 2 / t * r / (e.far - e.near);
}
export { i as n, n as t };
